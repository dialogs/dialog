import functionsSwitch from '../modules/functions-switch/';
import offerModal from '../modules/offer-modal';
import form from '../components/form';

const main = () => {
  //region modal
  const openModalButton1 = document.querySelector('.js-open-modal-hero');
  const openModalButton2 = document.querySelector('.js-open-modal-install');
  const formElem = document.querySelector('#form-offer-modal');

  if (openModalButton1) {
    offerModal({openButton: openModalButton1});
  }

  if (openModalButton2) {
    offerModal({openButton: openModalButton2});
  }

  if (formElem) {
    form(formElem);
  }

  functionsSwitch();
  let videos = document.getElementsByTagName("video");
  let tabsDesktop = document.querySelectorAll(".tabs__controls .tabs__control");
  let tabsMobile = document.querySelectorAll(".tabs__controls--mobile .tabs__wrapper .tabs__control");
  if (tabsDesktop.length) {
    for (let i = 0; i < 5; i++) {
      tabsDesktop[i].addEventListener('click', function () {
        if (videos[i].paused === true) {
          for (let g = 0; g < 5; g++) {
            if (g !== i) {
              videos[g].pause();
            }
          }
          videos[i].play();
        }
      });
      videos[i].addEventListener('click', function () {
        if (this.paused === true) {
          this.play();
        } else {
          this.pause();
        }
      });
    }
    for (let j = 0; j < 5; j++) {
      tabsMobile[j].addEventListener('click', function () {
        videos[j].play();
      });
    }
  }
  //endregion
  //region popper
  if (document.querySelector('.popover--chat-1')) {
    const popperChat1 = document.querySelector('.popover--chat-1');
    const tooltipChat1 = document.querySelector('.tooltip--chat-1');
    const popperChanel1 = document.querySelector('.popover--chanel-1');
    const tooltipChanel1 = document.querySelector('.tooltip--chanel-1');
    const popperChatbot1 = document.querySelector('.popover--chatbot-1');
    const tooltipChatbot1 = document.querySelector('.tooltip--chatbot-1');
    const popperChat2 = document.querySelector('.popover--chat-2');
    const tooltipChat2 = document.querySelector('.tooltip--chat-2');
    const popperChanel2 = document.querySelector('.popover--chanel-2');
    const tooltipChanel2 = document.querySelector('.tooltip--chanel-2');
    const popperChatbot2 = document.querySelector('.popover--chatbot-2');
    const tooltipChatbot2 = document.querySelector('.tooltip--chatbot-2');
    const popperChat3 = document.querySelector('.popover--chat-3');
    const tooltipChat3 = document.querySelector('.tooltip--chat-3');
    const popperChanel3 = document.querySelector('.popover--chanel-3');
    const tooltipChanel3 = document.querySelector('.tooltip--chanel-3');
    const popperChatbot3 = document.querySelector('.popover--chatbot-3');
    const tooltipChatbot3 = document.querySelector('.tooltip--chatbot-3');

    const createInstance = function (popper, tooltip) {
      let popperInstance = null;

      function create() {
        popperInstance = Popper.createPopper(popper, tooltip, {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ],
        });
      }

      function destroy() {
        if (popperInstance) {
          popperInstance.destroy();
          popperInstance = null;
        }
      }

      function show() {
        tooltip.setAttribute('data-show', '');
        create();
      }

      function hide() {
        tooltip.removeAttribute('data-show');
        destroy();
      }

      const showEvents = ['mouseenter', 'focus'];
      const hideEvents = ['mouseleave', 'blur'];

      showEvents.forEach(event => {
        popper.addEventListener(event, show);
      });

      hideEvents.forEach(event => {
        popper.addEventListener(event, hide);
      });
    };
    if(popperChat1){
      createInstance(popperChat1, tooltipChat1);
    }
    if(popperChanel1){
      createInstance(popperChanel1, tooltipChanel1);
    }
    if(popperChatbot1){
      createInstance(popperChatbot1, tooltipChatbot1);
    }

    if(popperChat2){
      createInstance(popperChat2, tooltipChat2);
    }
    if(popperChanel2){
      createInstance(popperChanel2, tooltipChanel2);
    }
    if(popperChatbot2){
      createInstance(popperChatbot2, tooltipChatbot2);
    }

    if(popperChat3){
      createInstance(popperChat3, tooltipChat3);
    }
    if(popperChanel3){
      createInstance(popperChanel3, tooltipChanel3);
    }
    if(popperChatbot3){
      createInstance(popperChatbot3, tooltipChatbot3);
    }


  }
  //endregion
};
export default main;
