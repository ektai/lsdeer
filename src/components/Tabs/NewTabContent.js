import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HardDrive from '../HardDrive';
import styled from 'styled-components';
import { hexToRgba } from 'hex-and-rgba';
import { Icon } from '@fluentui/react/lib/Icon';
import FavoriteItem from './FavoriteItem';

const { remote, ipcRenderer } = window.require('electron');

const StyledContent = styled.div`
  background-color: ${({ theme }) =>
    hexToRgba(theme.bg.appBg + 'cc').toString()};
  overflow-y: auto;
  min-height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(${({ theme }) => theme.sizes.colWidth}px, 1fr)
  );
  grid-auto-rows: ${({ theme }) => theme.sizes.rowHeight}px;
  grid-gap: 1rem;
  justify-content: start;
  align-content: start;
  justify-items: start;
  align-items: start;
  &::-webkit-scrollbar {
    width: 1rem;
    background-color: ${({ theme }) => theme.bg.activeTabBg};
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.bg.tabBg};
    border-left: 2px solid ${({ theme }) => theme.bg.activeTabBg};
    border-right: 2px solid ${({ theme }) => theme.bg.activeTabBg};
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.bg.scrollbarBg};
  }
`;

const StyledHeading = styled.h1`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-content: center;
  margin: 3rem 0;
  font-size: 3rem;
  font-weight: 100;
`;

const StyledPagination = styled.div`
  grid-column: 1 / -1;
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
`;

const StyledPageButton = styled.button`
  flex: 0 1 50px;
  color: ${({ theme }) => theme.colors.appColor};
  background-color: ${({ theme }) => theme.bg.secondaryBg};
  padding: 10px;
`;

const StyledClearfix = styled.div`
  grid-column: 1 / -1;
  height: 100px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg.appBarBg};
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  & > i {
    font-size: 2rem;
  }
`;

const NewTabContent = () => {
  const activeTab = useSelector((state) => state.activeTab);
  const tabs = useSelector((state) => state.tabs);
  const drives = useSelector((state) => state.drives);
  const favorites = useSelector((state) => state.favorites);
  const dispatch = useDispatch();

  const pageSize = 10;
  const [favPage, setFavPage] = useState([0, pageSize]);

  const contentRef = useRef(null);

  const handleOpenDirectory = (newPath, name) => {
    ipcRenderer.send('open-directory', activeTab, newPath);
  };

  const handleScrollTop = () => {
    contentRef.current.scrollTop = 0;
  };

  const handleSetFavPage = (num) => {
    const skippedCount = num * pageSize;
    setFavPage([skippedCount, skippedCount + pageSize]);
  };

  const renderFavorites = () => {
    // Show folders first
    const sortedFav = favorites.sort((a, b) =>
      a.isFile && !b.isFile ? 1 : -1
    );

    const pageFav = sortedFav.slice(favPage[0], favPage[1]);

    return pageFav.map((item) => <FavoriteItem key={item.id} {...item} />);
  };

  const renderPagination = () => {
    const countOfPages = Math.ceil(favorites.length / pageSize);

    return Array(countOfPages)
      .fill('')
      .map((item, idx) => (
        <StyledPageButton key={idx} onClick={() => handleSetFavPage(idx)}>
          {idx + 1}
        </StyledPageButton>
      ));
  };

  useEffect(() => {
    ipcRenderer.send('get-drives');
  }, []);

  // TODO: favorites don't display on page correctly, change css
  // Add function to remove from favorites
  // Add function to set icon to fav dir
  // Add fucntion to save/load favorites from json file

  return (
    <StyledContent ref={contentRef}>
      <StyledHeading>Your Hard Drives</StyledHeading>

      {drives.map((item, i) => (
        <HardDrive
          key={item.filesystem}
          {...item}
          handleOpenDirectory={() =>
            handleOpenDirectory(item.mounted + '/', item.mounted + '/')
          }
        />
      ))}
      <StyledHeading>Favorites</StyledHeading>

      {favorites.length > 0 ? (
        renderFavorites()
      ) : (
        <h2>You have not added favorites yet...</h2>
      )}

      {favorites.length > pageSize ? (
        <StyledPagination>{renderPagination()}</StyledPagination>
      ) : null}

      <StyledClearfix onClick={handleScrollTop}>
        <Icon iconName='ChevronUpMed' ariaLabel='go up' />
      </StyledClearfix>
    </StyledContent>
  );
};

export default NewTabContent;
