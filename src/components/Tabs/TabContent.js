import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import NewTabContent from './NewTabContent';

const StyledTabContent = styled.div`
  background-color: ${({ theme }) => theme.bg.tabBg};
  z-index: ${({ active }) => (active ? 100 : 50)};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.bg.appBg};
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

const TabContent = ({ id, name, content, createNew = false }) => {
  const activeTab = useSelector((state) => state.activeTab);

  const dispatch = useDispatch();

  const renderContent = () => {
    return content.map((item, i) => <div key={`${item} ${i}`}>{item}</div>);
  };

  return (
    <StyledTabContent active={id === activeTab}>
      {createNew ? <NewTabContent /> : renderContent()}
    </StyledTabContent>
  );
};

export default TabContent;
