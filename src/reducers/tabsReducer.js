import {
  SET_TABS,
  CLOSE_ALL_TABS,
  ADD_TAB,
  CLOSE_TAB,
  OPEN_DIR,
  TEST_ACTION,
  LOCK_TAB,
  UNLOCK_TAB,
  SET_PROPERTY,
  OPEN_DIRECTORY,
} from '../actions/types';

const tabsReducer = function (state = [], action) {
  switch (action.type) {
    case SET_TABS:
      return action.payload;
    case ADD_TAB:
      return [...state, action.payload];
    case CLOSE_TAB:
      return state.filter((item) => item.id !== action.payload);
    case SET_PROPERTY:
      return state.map((item) => {
        if (item.id !== action.payload.id) {
          return item;
        } else {
          item[action.payload.propname] = action.payload.propval;
          return item;
        }
      });
    case LOCK_TAB:
      return state.map((item) => {
        if (item.id !== action.payload) {
          return item;
        } else {
          item.isLocked = true;
          return item;
        }
      });
    case UNLOCK_TAB:
      return state.map((item) => {
        if (item.id !== action.payload) {
          return item;
        } else {
          item.isLocked = false;
          return item;
        }
      });
    case CLOSE_ALL_TABS:
      return state.filter((item) => item.isLocked === true);
    case OPEN_DIR: {
      const { id, newPath, newContent, name } = action.payload;
      return state.map((tab) => {
        if (tab.id === id) {
          const newName =
            name ||
            newPath
              .split('/')
              .filter((i) => i)
              .pop();
          tab.name = newName;
          tab.path = newPath;
          tab.content = newContent;
          delete tab.createNew;
        }
        return tab;
      });
    }
    case OPEN_DIRECTORY: {
      const { id, newPath, newContent } = action.payload;
      return state.map((tab) => {
        if (tab.id === id) {
          const newName = newPath
            .split('/')
            .filter((i) => i)
            .pop();
          tab.name = newName;
          tab.path = newPath;
          tab.content = newContent;
          delete tab.createNew;
        }
        return tab;
      });
    }
    case TEST_ACTION:
      return state;
    default:
      return state;
  }
};

export default tabsReducer;
