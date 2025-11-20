import './sectionEditMenu.scss'

export function view(event) {
   if (
      event.target.closest('.management__button')
      && event.target.closest(".management__button").name == 'view-section-edit-menu'
   ) {
      fetchUrl.loadContent("section_editMenu");
   }

   // if (
   //    event.target.closest('.management__button')
   //    && event.target.closest(".management__button").name == 'view-section-edit-menu'
   // ) {
   //    const CONTROL_PANEL = event.target.closest('[data-name="section-control-panel"]');
   //    if (CONTROL_PANEL) {
   //       const EDIT_MENU = CONTROL_PANEL.querySelector('[data-name="section-edit-menu"]');
   //       if(EDIT_MENU) {
   //             fetchUrl.loadContent("section_editMenu");
   //          // EDIT_MENU.classList.toggle('_view');
   //       } else {
   //          alert('section-edit-menu не знайдено!');
   //       }
   //    } else {
   //       alert('section-control-panel не знайдено!');
   //    }
   // }

   if (event.target.closest('[data-name="section-select-menu__close"]')) {
      const EDIT_MENU = event.target.closest('[data-name="section-edit-menu"]');
      if (EDIT_MENU) {
         setTimeout(() => {
            EDIT_MENU.remove();
        }, 200);
      } else {
         alert('section-edit-menu не знайдено!');
      }

   }

   // if (event.target.closest('[data-name="section-select-menu__close"]') || event.target.closest('[name="section_block-menu-container__confirm-btn"]')) {
   //    const CONTROL_PANEL = event.target.closest('[data-name="section-control-panel"]');
   //    if (CONTROL_PANEL) {

   //       const EDIT_MENU = CONTROL_PANEL.querySelector('[data-name="section-edit-menu"]');
   //       if(EDIT_MENU) {
   //       setTimeout(() => {
   //          document.querySelector(EDIT_MENU)?.remove();
   //      }, 2000);
   //          // EDIT_MENU.classList.remove('_view');
   //       } else {
   //          alert('section-edit-menu не знайдено!');
   //       }
   //    } else {
   //       alert('section-control-panel не знайдено!');
   //    }
   // }
}
// додаємо слухач на клік по документу
document.addEventListener('click', view);