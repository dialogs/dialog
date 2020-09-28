import accordion from './accordion';

class AccordionGroup {
  constructor({accordionBlocks, accordionProps, firstExpanded = false}) {
    this.accordionBlocks = accordionBlocks;
    this.accordionProps = accordionProps;
    this.firstExpanded = firstExpanded;
    this.accordions = [];

    this.onExpand = this.onExpand.bind(this);
    this.remove = this.remove.bind(this);
  }

  static init(options) {
    const accordionGroup = new AccordionGroup(options);
    accordionGroup.setStartState();

    return accordionGroup;
  }

  setStartState() {

    this.accordionBlocks.forEach((accordionBlock, index) => {
      const accordionInstance = accordion(accordionBlock, {
        onExpand: this.onExpand,
        isDefaultExpanded: this.firstExpanded && index === 0,
        ...this.accordionProps,
      });

      this.accordions.push(accordionInstance);
    });
  }

  onExpand(expandedAccordion) {

    this.accordions.forEach((accordionInstance) => {
      if (
        accordionInstance !== expandedAccordion &&
        accordionInstance.isExpanded
      ) {
        accordionInstance.reduce();
      }
    });
  }

  remove() {
    this.accordions.forEach((accordion) => {
      accordion.remove();
      accordion = null;
    });

    this.accordions = [];
  }
}

export default AccordionGroup.init;
