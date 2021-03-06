import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { Icon } from '@fluentui/react/lib/Icon';

import { toggleNewFileFolder } from '../actions/newFileFolderActions';
import { clearSelectedFiles } from '../actions/selectFilesActions';

import Button from './Button';
import Heading from './Heading';
import NumInp from './Inputs/NumInp';

const { ipcRenderer, remote } = window.require('electron');
const nodePath = remote.require('path');

const StyledModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.bg.appBg};
  font-size: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
`;

const StyledModalContent = styled.div`
  position: relative;
  flex: 0 1 15rem;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.bg.secondaryBg};
  box-shadow: ${({ theme }) =>
    `${theme.shadows.menuShadowOffsetX}px ${theme.shadows.menuShadowOffsetY}px ${theme.shadows.menuShadowBlur}px ${theme.shadows.menuShadowSpread}px ${theme.shadows.menuShadowColor}`};
  & > * + * {
    margin-top: 1rem;
  }
`;

const StyledChooseBtns = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  & > * + * {
    margin-left: 5px;
  }
  & > * {
    flex: 0 1 0%;
  }
`;

const StyledChooseBtn = styled(Button)`
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.bg.selectedBg : theme.bg.accentBg};
`;

const StyledMainControls = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  & > *:first-child {
    margin-right: 5px;
  }
  & > * {
    flex: 0 1 0%;
  }
`;

const StyledCloseBtn = styled(Icon)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: white;
  &:hover {
    color: ${({ theme }) => theme.bg.appBarXBtnHover};
    cursor: pointer;
  }
`;

const StyledHeading = styled(Heading)`
  font-size: 2rem;
  margin: 0;
`;

const StyledInp = styled.input`
  font-size: 1.2rem;
  flex: 1 1 0%;
  padding: 5px;
`;

const StyledListOfMany = styled.ul`
  list-style-type: none;
  max-height: 40vh;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: center;
  & > * + * {
    margin-top: 5px;
  }
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

const StyledOneOfMany = styled.li`
  background-color: ${({ theme }) => theme.bg.accentBg};
  width: 100%;
  padding: 5px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  word-break: break-word;
  & > * + * {
    margin-left: 5px;
  }
  & > span {
    flex-grow: 1;
  }
`;

const StyledManyControls = styled.div`
  & > * + * {
    margin-left: 5px;
  }
`;

const StyledNumInputsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
  & > * + * {
    margin-left: 7.5px;
  }
`;

const StyledSpoiler = styled.details`
  width: 100%;
`;

const StyledSpoilerSummary = styled.summary`
  cursor: pointer;
  &:focus {
    outline: 1px solid ${({ theme }) => theme.bg.selectedBg};
  }
`;
const StyledSpoilerContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  & > * + * {
    margin-top: 5px;
  }
`;

const CreateNewModal = () => {
  const [createType, setCreateType] = useState('folder');
  const [name, setName] = useState('');
  const [oneOfManyNames, setOneOfMany] = useState('');
  const [many, setMany] = useState([]);
  const [pattern, setPattern] = useState('');
  const [numPattern, setNumPattern] = useState(1);
  const [patternStartingNum, setPatternStartingNum] = useState(1);
  const [numPatternIsFile, setNumPatternIsFile] = useState(false);

  const folderInpRef = useRef(null);
  const fileInpRef = useRef(null);
  const manyInpRef = useRef(null);
  const patternInpRef = useRef(null);

  const tabs = useSelector((state) => state.tabs);
  const activeTab = useSelector((state) => state.activeTab);
  const dispatch = useDispatch();

  const activeTabObject = tabs.find((item) => item.id === activeTab);
  const activeTabPath =
    activeTabObject.path.length <= 2
      ? activeTabObject.path
      : nodePath.normalize(activeTabObject.path);

  const handleCreateFolder = () => {
    setCreateType('folder');
  };

  const handleCreateFile = () => {
    setCreateType('file');
  };

  const handleCreateMany = () => {
    setCreateType('many');
  };

  const handleCreatePattern = () => {
    setCreateType('pattern');
  };

  const handleConfirm = (e) => {
    dispatch(clearSelectedFiles());
    if (!activeTab) return;

    if (createType === 'folder') {
      if (!name) return;
      ipcRenderer.send('new-folder', activeTabObject.path, name);
    } else if (createType === 'file') {
      if (!name) return;
      ipcRenderer.send('new-file', activeTabObject.path, name);
    } else if (createType === 'many') {
      if (many.length === 0) return;
      ipcRenderer.send('new-many', activeTabObject.path, many);
    } else if (createType === 'pattern') {
      if (!pattern) return;
      if (!pattern.includes('[num]')) {
        return;
      }
      ipcRenderer.send(
        'new-pattern',
        activeTabObject.path,
        pattern,
        numPattern,
        patternStartingNum,
        numPatternIsFile
      );
    }
    dispatch(toggleNewFileFolder());
  };

  const handleAddToOthers = (isFile) => {
    if (!oneOfManyNames) return;
    const nameExists = many.filter((item) => item.name === oneOfManyNames);
    if (nameExists && nameExists.length > 0) return;
    setMany([...many, { name: oneOfManyNames, isFile }]);
  };

  const handleCancel = () => {
    dispatch(toggleNewFileFolder());
  };

  const handleDeleteFromMany = (itemName) => {
    const newMany = many.filter((item) => item.name !== itemName);
    setMany(newMany);
  };

  const handleNameChange = (e) => {
    let newVal = e.target.value;
    newVal = newVal.replace(/(\\|\/|\:|\*|\?|\"|\<|\>|\|)/g, '');
    setName(newVal);
  };

  const handleNameOneOfMany = (e) => {
    let newVal = e.target.value;
    newVal = newVal.replace(/(\\|\/|\:|\*|\?|\"|\<|\>|\|)/g, '');
    setOneOfMany(newVal);
  };

  const handlePatternString = (e) => {
    let newVal = e.target.value;
    newVal = newVal.replace(/(\\|\/|\:|\*|\?|\"|\<|\>|\|)/g, '');
    setPattern(newVal);
  };

  const renderCreationType = () => {
    switch (createType) {
      case 'folder': {
        return (
          <StyledInp
            ref={folderInpRef}
            autoFocus
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder={`Enter ${createType}\'s name here`}
          />
        );
      }
      case 'file': {
        return (
          <StyledInp
            ref={fileInpRef}
            autoFocus
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder={`Enter ${createType}\'s name here`}
          />
        );
      }
      case 'many': {
        return (
          <>
            <StyledListOfMany>{renderMany()}</StyledListOfMany>
            <StyledInp
              ref={manyInpRef}
              autoFocus
              type="text"
              value={oneOfManyNames}
              onChange={handleNameOneOfMany}
              placeholder={`Enter item name here`}
            />
            <StyledManyControls>
              <Button onClick={() => handleAddToOthers(false)}>
                Add Folder
              </Button>
              <Button onClick={() => handleAddToOthers(true)}>Add File</Button>
            </StyledManyControls>
          </>
        );
      }
      case 'pattern': {
        return (
          <>
            <StyledSpoiler>
              <StyledSpoilerSummary>Help</StyledSpoilerSummary>
              <StyledSpoilerContent>
                <span>[num] - add number</span>
                <span>[date] - add current date</span>
                <span>Example: [num]-test-[date]</span>
              </StyledSpoilerContent>
            </StyledSpoiler>
            <StyledInp
              ref={patternInpRef}
              type="text"
              value={pattern}
              onChange={handlePatternString}
              placeholder={`Enter pattern here`}
            />
            <StyledChooseBtns>
              <StyledChooseBtn
                onClick={() => setNumPatternIsFile(false)}
                isSelected={!numPatternIsFile}
              >
                Folder
              </StyledChooseBtn>
              <StyledChooseBtn
                onClick={() => setNumPatternIsFile(true)}
                isSelected={numPatternIsFile}
              >
                File
              </StyledChooseBtn>
            </StyledChooseBtns>
            <StyledNumInputsWrapper>
              <div>
                <span>Items</span>
                <NumInp
                  min={1}
                  max={10000}
                  step={1}
                  disabled={false}
                  value={numPattern}
                  handleSetProp={setNumPattern}
                />
              </div>
              <div>
                <span>Starting</span>
                <NumInp
                  min={1}
                  max={10000}
                  step={1}
                  disabled={false}
                  value={patternStartingNum}
                  handleSetProp={setPatternStartingNum}
                />
              </div>
            </StyledNumInputsWrapper>
          </>
        );
      }
    }
  };

  const renderMany = () => {
    return many.map((item, i) => (
      <StyledOneOfMany key={item.name}>
        {item.isFile ? (
          <Icon iconName="FileCode" />
        ) : (
          <Icon iconName="FabricFolder" />
        )}
        <span>{item.name}</span>
        <Icon
          iconName="Delete"
          onClick={() => handleDeleteFromMany(item.name)}
        />
      </StyledOneOfMany>
    ));
  };

  const handleReturn = (e) => {
    if (e.which === 13) {
      // Return pressed
      handleConfirm();
    } else {
      return;
    }
  };

  useEffect(() => {
    try {
      if (createType === 'folder') {
        folderInpRef.current.focus();
      } else if (createType === 'file') {
        fileInpRef.current.focus();
      } else if (createType === 'many') {
        manyInpRef.current.focus();
      } else if (createType === 'pattern') {
        patternInpRef.current.focus();
      }
    } catch (err) {
      console.log('Cannot focus createNew modal input');
    }
  }, [createType]);

  return (
    <StyledModal onKeyPress={handleReturn}>
      <StyledModalContent>
        <StyledCloseBtn iconName="ChromeClose" onClick={handleCancel} />
        <StyledHeading>
          Create {createType === 'many' ? 'many' : 'new ' + createType}
        </StyledHeading>
        <StyledChooseBtns>
          <StyledChooseBtn
            onClick={handleCreateFolder}
            isSelected={createType === 'folder'}
          >
            Folder
          </StyledChooseBtn>
          <StyledChooseBtn
            onClick={handleCreateFile}
            isSelected={createType === 'file'}
          >
            File
          </StyledChooseBtn>
          <StyledChooseBtn
            onClick={handleCreateMany}
            isSelected={createType === 'many'}
          >
            Many
          </StyledChooseBtn>
          <StyledChooseBtn
            onClick={handleCreatePattern}
            isSelected={createType === 'pattern'}
          >
            Pattern
          </StyledChooseBtn>
        </StyledChooseBtns>
        <StyledInp disabled type="text" defaultValue={activeTabPath} />
        {renderCreationType()}
        <StyledMainControls>
          <Button onClick={handleConfirm}>Ok</Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </StyledMainControls>
      </StyledModalContent>
    </StyledModal>
  );
};

export default CreateNewModal;
