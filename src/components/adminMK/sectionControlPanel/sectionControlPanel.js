import './sectionControlPanel.scss'

//show button && title on section control panel
// export function show(event) {
//    //if target action button
//    if (event.target.closest('.section-control-panel__btn')) {
//       //get section control panel
//       const SECTION_CONTROL_PANEL = event.target.closest(".section-control-panel__btns-wrapper");
//       //if isset section control panel, togle button block && title
//       if (SECTION_CONTROL_PANEL) {
//          //get button block && title
//          const BUTTON_BLOCK = SECTION_CONTROL_PANEL.querySelector('.management-block');
//          const TITLE = SECTION_CONTROL_PANEL.querySelector('.section-control-panel__name');
//          //if isset button block, togle button block
//          if (BUTTON_BLOCK) {
//             //togle button block
//             BUTTON_BLOCK.classList.toggle('_view');
//          }
//          //if isset title, togle title
//          if (TITLE) {
//             //togle title
//             TITLE.classList.toggle('_view');
//          }
//       }
//    }
// }

function show(event) {
   // шукаємо найближчу кнопку
   const btn = event.target.closest('.section-control-panel__btn');
   if (!btn) return;

   // шукаємо контейнер кнопок
   const wrapper = btn.closest('.section-control-panel__btns-wrapper');
   if (!wrapper) return;

   // знаходимо блок управління і заголовок
   const buttonBlock = wrapper.querySelector('.management-block');
   const title = wrapper.querySelector('.section-control-panel__name');

   // перемикаємо класи _view
   if (buttonBlock) buttonBlock.classList.toggle('_view');
   if (title) title.classList.toggle('_view');
}

// додаємо слухач на клік по документу
document.addEventListener('click', show);
