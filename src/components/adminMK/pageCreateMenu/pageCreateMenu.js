import './pageCreateMenu.scss'

//Виклик вікна вибору або додавання секції
export function viewPageCreateMenu(event) {
   const BUTTON = event.target.closest('[name="btn-view-teamplate-select-menu"]');
   if (BUTTON) {
      fetchUrl.loadContent("page_createMenu");
   }
}

// export function viewPageCreateMenu(event) {
//    const BUTTON = event.target.closest('[name="btn-view-teamplate-select-menu"]');
//    if (BUTTON) {
//       const MENU = document.querySelector('[data-name="page-create-menu"]');
//       if (MENU) {
//          fetchUrl.loadContent("page_createMenu");
//          // MENU.classList.add('_view');
//       } else {
//          alert('Меню створення сторінки (page-create-menu) не знайдено');
//       }
//    }
// }

export function closePageCreateMenu(event) {
   const BUTTON = event.target.closest('[data-name="btn-close-page-create-menu"]');
   if(BUTTON) {
      const MENU = event.target.closest('[data-name="page-create-menu"]');
      if(MENU) {
         setTimeout(() => {
            MENU.remove();
        }, 200);
         // MENU.classList.remove('_view');
      } else {
         alert('Меню створення сторінки (page-create-menu) не знайдено');
      }
   }
}
// export function Max (event) {
//    const INPUT = event.target.closest('[data-name="input-create-page-url"]');
//    if (INPUT) {
//       let inputValue = INPUT.value;

//       if (inputValue.charAt(0) !== '/') {
//          inputValue = '/' + inputValue;
//       }
//       // if (inputValue.charAt(-1) !== '/') {
//       //    inputValue = inputValue + '/';
//       // }

//       console.log(window.location.href);
//       INPUT.value = inputValue;
//    }



//    // const MENU = event.target.closest('[data-name="page-create-menu"]');
//    // if(MENU) {
//    //    const INPUT = document.querySelector('input');
//    //    if (INPUT) {
//    //       INPUT.classList.add('/');
//    //    }
//    // }
   
// }

// export function viewTeamplateCreateMenu(event) {

//    if (event.target.closest('[data-name="btn-view-teamplate-create-menu"]')) {
//       controllerModal.view(document.querySelector('[data-name="teamplate-create-menu"]'));
//    }

//    if (event.target.closest('[data-name="btn-close-teamplate-create-menu"]')) {
//       controllerModal.close(document.querySelector('[data-name="teamplate-create-menu"]'));
//    }
// }

// export function viewCreateTeamplateMenu(event) {
//   if (event.target.closest('.select-teamplate-menu__tile-add-btn')) {
//      controllerModal.view(document.querySelector('.create-teamplate-menu'));
//   }

//   if (event.target.closest(".create-teamplate-menu__close")) {
//      controllerModal.close(document.querySelector(".create-teamplate-menu"));
//   }
// }
// додаємо слухач на клік по документу
document.addEventListener('click', closePageCreateMenu);