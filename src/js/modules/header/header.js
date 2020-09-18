import headerDropdown from './_header-dropdown';
import headerAccordion from './_header-accordion';
import menuPopup from './_header-menu-popup';
import breakpointChecker from '../../components/breakpoint-checker';
import setHeaderHeightSize from '../../utils/setElemHeightInCSSProps';

import offerModal from '../offer-modal';

import constants from '../../utils/consts';

const CSS_CUSTOM_PROPS_HEADER_HEIGHT = '--header-height';
const {
  breakpoints: { midMax },
} = constants;

const getMenuPopupOptions = (header) => {
  return {
    modal: header.querySelector('.header__content-box'),
    openButton: header.querySelector('.header__burger-button'),
    closeButton: header.querySelector('.header__close-button'),
    modalOpenClassName: 'header__content-box--open',
    modalCloseClassName: 'header__content-box--close',
  };
};

const getDropdownOptions = (header) => {
  return {
    menu: header.querySelector('.main-nav'),
    topLevelBlocks: header.querySelectorAll('.main-nav__top-block'),
    middleLevelBlocks: header.querySelectorAll('.main-nav__middle-block'),
  };
};

const getAccordionsOptions = (header) => {
  return {
    top: {
      accordionBlocks: header.querySelectorAll('.main-nav__top-block'),
      accordionProps: {
        triggerClassName: 'main-nav__button',
        detailsClassName: 'main-nav__dropdown',
        triggerExpandedClassName: 'main-nav__button--expanded',
      },
    },
    middle: {
      accordionBlocks: header.querySelectorAll('.main-nav__middle-block'),
      accordionProps: {
        triggerClassName: 'main-nav__included-button',
        detailsClassName: 'main-nav__middle-dropdown',
        triggerExpandedClassName: 'main-nav__included-button--expanded',
      },
    },
  };
};

const onOfferModalButtonClick = () => {
  const isMenuShow = menuPopup.hasShowState();

  if(isMenuShow) {
    menuPopup.hide();
  }
};

const getOfferModalProps = (header) => {
  return {
    openButton: header.querySelector('.js-open-modal'),
    onOpenButtonClick: onOfferModalButtonClick,
  };
};

const onDesktopViewPort = () => {
  headerDropdown.launch();
  headerAccordion.destroy();
  menuPopup.clear();
};

const onNoDesktopViewport = () => {
  headerDropdown.destroy();
  headerAccordion.launch();
};

const init = () => {
  const header = document.querySelector('.js-header');

  if (!header) return;

  const menuPopupOptions = getMenuPopupOptions(header);
  const menuDropdownOptions = getDropdownOptions(header);
  const menuAccordionsOptions = getAccordionsOptions(header);
  const offerModalProps = getOfferModalProps(header);

  setHeaderHeightSize(header, CSS_CUSTOM_PROPS_HEADER_HEIGHT);
  menuPopup.init(menuPopupOptions);
  headerDropdown.init(menuDropdownOptions);
  headerAccordion.init(menuAccordionsOptions);
  offerModal(offerModalProps);
  breakpointChecker(midMax, onNoDesktopViewport, onDesktopViewPort);
};

export default init;
