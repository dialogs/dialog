import accordionGroup from '../../components/accordions-group';

let props = {
  top: {
    accordionBlocks: '',
    accordionProps: '',
  },
  middle: {
    accordionBlocks: '',
    accordionProps: '',
  },
};
let state = {
  topLevelAccordions: null,
  middleLevelAccordions: null,
};
let isLaunched = false;

const setAccordions = () => {
  const {top, middle} = props;
  state.topLevelAccordions = accordionGroup(top);
  state.middleLevelAccordions = accordionGroup(middle);
};

const destroy = () => {
  const {topLevelAccordions, middleLevelAccordions} = state;

  if (isLaunched) {
    topLevelAccordions.remove();
    middleLevelAccordions.remove();
  }

  isLaunched = false;
};


const launch = () => {

  state = {
    topLevelAccordions: null,
    middleLevelAccordions: null,
  };

  setAccordions();

  isLaunched = true;
};

const init = (options) => {
  props = options;
};

export default {
  init,
  launch,
  destroy,
};
