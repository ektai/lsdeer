// import deerBg from '../img/deer.svg';
const deerBg = process.env.PUBLIC_URL + '/deer.svg';

const defaultTheme = {
  colors: {
    appColor: '#FFFFFF',
    appTitleColor: '#FFFFFF',
  },
  bg: {
    appBg: 'rgba(64, 64, 64, 0.5)',
    appBarBg: '#8B8B8B',
    appBarActiveItemBg: '#404040',
    appBarXBtnHover: '#cc0000',
    tabBg: '#707070',
    activeTabBg: '#404040',
    scrollbarBg: '#808080',
    accentBg: 'rgba(62, 152, 199, 0.8)',
    elementsBg: '#ffffff',
    selectedBg: 'rgba(0, 51, 102, 0.7)',
    secondaryBg: '#707070',
    settingsBg: 'rgba(64, 64, 64, 1)',
    contextMenuBg: 'rgba(64, 64, 64, 1)',
    appBgImage: deerBg,
    appBgSize: 'cover',
  },
  font: {
    appFontSize: 16,
    appFontFamily: 'Roboto, sans-serif',
    pathBarFontSize: '1.2rem',
    appBarFontSize: '1rem',
    appBarMenuFontSize: '0.8rem',
    appSearchFontSize: '1.2rem',
  },
  sizes: {
    navHeight: '35px',
    focusOutlineWidth: '2px',
    rowHeight: 150,
    colWidth: 150,
    fileIconSize: 96,
    favPageSize: 50,
  },
  shadows: {
    menuShadowColor: 'rgba(0,0,0,0.5)',
    navShadowColor: 'rgba(0,0,0,0.5)',
    menuShadowOffsetX: 1,
    menuShadowOffsetY: 2,
    menuShadowBlur: 2,
    menuShadowSpread: 2,
    navShadowOffsetX: 0,
    navShadowOffsetY: 2,
    navShadowBlur: 5,
    navShadowSpread: 2,
    menuShadow: '1px 2px 2px 2px rgba(0,0,0,0.5)',
    navShadow: '0 2px 5px 2px rgba(0,0,0,0.3)',
  },
};

export default defaultTheme;
