class Accordion {
  constructor(accordionBlock, options) {
    const {
      triggerClassName = 'js-accordion-trigger',
      detailsClassName = 'js-accordion-details',
      triggerExpandedClassName = 'is-expanded',
      detailsHideClassName = 'is-hide',
      isDefaultExpanded = false,
      onExpand,
    } = options;

    this.trigger = accordionBlock.querySelector(`.${triggerClassName}`);
    this.details = accordionBlock.querySelector(`.${detailsClassName}`);
    this.triggerExpandedClassName = triggerExpandedClassName;
    this.detailsHideClassName = detailsHideClassName;
    this.isDefaultExpanded = isDefaultExpanded;
    this.onExpand = onExpand;
    this.isExpanded = false;

    this.setStartState = this.setStartState.bind(this);
    this.addHandler = this.addHandler.bind(this);
    this.removeHandler = this.removeHandler.bind(this);
    this.handlerClick = this.handlerClick.bind(this);
    this.toggleState = this.toggleState.bind(this);
    this.expand = this.expand.bind(this);
    this.reduce = this.reduce.bind(this);
  }

  static init(accordionBlock, options = {}) {
    const accordion = new Accordion(accordionBlock, options);
    accordion.setStartState();
    accordion.addHandler();

    return accordion;
  }

  setStartState() {
    const maxHeight = this.details.clientHeight;
    this.details.style.maxHeight = `${maxHeight}px`;

    if (this.isDefaultExpanded) {
      this.expand();
    } else {
      this.reduce();
    }
  }

  expand() {
    this.trigger.setAttribute('aria-expanded', 'true');
    this.details.setAttribute('aria-hidden', 'false');
    this.trigger.classList.add(this.triggerExpandedClassName);
    this.details.classList.remove(this.detailsHideClassName);

    this.isExpanded = true;

    this.onExpand(this);
  }

  reduce() {
    this.trigger.setAttribute('aria-expanded', 'false');
    this.details.setAttribute('aria-hidden', 'true');
    this.trigger.classList.remove(this.triggerExpandedClassName);
    this.details.classList.add(this.detailsHideClassName);

    this.isExpanded = false;
  }

  remove() {
    this.trigger.removeAttribute('aria-expanded');
    this.details.removeAttribute('aria-hidden');
    this.trigger.classList.remove(this.triggerExpandedClassName);
    this.details.classList.remove(this.detailsHideClassName);
    this.details.style.maxHeight = '';

    this.removeHandler();
  }

  toggleState(isExpanded) {
    if (isExpanded) {
      this.reduce();

      return;
    }

    this.expand();
  }

  handlerClick(evt) {
    // evt.preventDefault();

    const isExpanded = this.trigger.getAttribute('aria-expanded') === 'true';

    this.toggleState(isExpanded);
  }

  removeHandler() {
    this.trigger.removeEventListener('click', this.handlerClick);
  }

  addHandler() {
    this.trigger.addEventListener('click', this.handlerClick);
  }
}

export default Accordion.init;
