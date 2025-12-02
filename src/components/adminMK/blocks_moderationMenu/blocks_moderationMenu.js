import './blocks_moderationMenu.scss'

// import * as controllerModal from "./controllerModal.js";
// import * as fetchUrl from "./fetchUrl.js";
// import * as blockUploadFilesMenu from "./blockUploadFilesMenu.js";


export function viewParamCreateForm(event) {

   if (event.target.closest('[data-button-name="param-create-form"]')) {
      if (event.target.closest('[data-button-name="param-create-form"]').parentElement.classList.contains("_view")) {
         return;
      }

      event.preventDefault();

      if (event.target.closest('[data-button-name="param-create-form"]').parentElement.dataset.name == 'param-create-form') {
         controllerModal.view(event.target.closest('[data-button-name="param-create-form"]').parentElement);
      }
   }
}
//Розгортання блоку налаштувань в модерейшн меню
export function activeSettingsGroup(event) {
   //Перевіряємо чи був click on block-moderation-menu
   if (event.target.closest('[data-name="block-moderation-menu"]')) {
      //console.log(event.target);
      //Збираю потрібні елементи
      const moderationMenu = event.target.closest('[data-name="block-moderation-menu"]');
      const groupsOfParams = event.target.closest('[data-name="groups-of-params"]');
      const groupsOfBlocks = event.target.closest('[data-name="groups-of-blocks"]');
      //Функція згортання всіх елементів та розгортання того по якому клікнули
      function actionParamItems() {
         //Отримую список всіх параметрів
         const paramItems = moderationMenu.querySelectorAll('[data-name="param-item"]');
         //Перевіряю чи є параметри в списку
         if (paramItems.length > 0) {
            //Запускаю цикл прозодження по параметру
            paramItems.forEach(element => {
               //встановлюю або видаляю елементам потрібні класи
               element.classList.remove('_view')
               element.querySelector('[data-name="copy-key"]').classList.add('_view')
               element.querySelector('[data-name="btn-block"]').classList.remove('_view')
            })
         }
         if (event.target.closest('[data-name="param-item"]')) {
            const paramItem = event.target.closest('[data-name="param-item"]');
            const copyKey = paramItem.querySelector('[data-name="copy-key"]');
            const buttonBlock = paramItem.querySelector('[data-name="btn-block"]');
            //встановлюю класи вибраному параметру
            controllerModal.view(paramItem);
            copyKey.classList.remove('_view');
            buttonBlock.classList.add('_view');
         }
      }
      //Розгортаю панель з параметрами
      if (groupsOfParams) {
         //розгортаю параметри
         groupsOfParams.classList.remove('_pacive');
         groupsOfParams.classList.add('_active');
         //Згортаю блоки
         if (groupsOfParams.nextElementSibling) {
            groupsOfParams.nextElementSibling.classList.remove('_active');
            groupsOfParams.nextElementSibling.classList.add('_pacive');
         }

         //Розготраю потрібний
         actionParamItems();
      }
      //Розгортаю панель з блоками
      if (groupsOfBlocks) {
         //розгортаю блоки
         groupsOfBlocks.classList.remove('_pacive');
         groupsOfBlocks.classList.add('_active');
         //згортаю параметри
         if (groupsOfBlocks.previousElementSibling) {
            groupsOfBlocks.previousElementSibling.classList.remove('_active');
            groupsOfBlocks.previousElementSibling.classList.add('_pacive');
         }

         //Розгортаю потрібний
         actionParamItems()
      }
   }
}

export function view_block_update_files_menu(event) {
   if (event.target.name == 'view-block-upd-param-menu') {
      const block_id = event.target.dataset.blockId;
      const block_update_files_menu = document.querySelector('[data-name="block-update-files-menu"]');
      block_update_files_menu.querySelector('input[name="block_id"]').value = block_id;
      console.log(block_update_files_menu);
      controllerModal.view(block_update_files_menu);
   }

   if (event.target.closest('.block-update-files-menu__close')) {
      controllerModal.close(document.querySelector('[data-name="block-update-files-menu"]'));
   }
}

export function close(event) {
   const buttonClose = event.target.closest('[data-name="block_moderation_menu__close"]');

   if (buttonClose) {
      controllerModal.close(event.target.closest('[data-name="block-moderation-menu"]'));
   }
}

//export function viewBlockModerationMenu(id) {
//   const url = '/setup/block/view-moderation-menu/';
//   const data = { 'block_id': id };
//   // Вызываем функцию
//   fetchUrl.getUrlJSON(url, data)
//      .then((data) => {
//         //console.log(document.body);
//         document.body.innerHTML += data;
//         //console.log(data); // JSON data parsed by `response.json()` call
//         // console.log(myModal)
//         //myModal.innerHTML = data; // JSON data parsed by `response.json()` call
//      });
//}

//export function viewBlockModerationMenu1(event) {
//   const buttonView = event.target.closest('[data-button-name="view-block-moderation-menu"]');

//   if (buttonView) {
//      const section_id = buttonView.dataset.id;
//      const url = buttonView.dataset.url;
//      const data = { 'section_id': section_id };
//      // Вызываем функцию
//      fetchUrl.getUrlJSON(url, data)
//         .then((data) => {
//            //console.log(document.body);
//            document.body.innerHTML += data;
//            //console.log(data); // JSON data parsed by `response.json()` call
//            // console.log(myModal)
//            //myModal.innerHTML = data; // JSON data parsed by `response.json()` call
//         });
//   }
//}

export function viewBlockUploadFilesMenu(event) {
   const button = event.target.closest('[name="view-block-files-upload-menu"]');
   if (button) {
      const block_id = button.dataset.blockId;
      blockUploadFilesMenu.setBlockId(block_id);
      blockUploadFilesMenu.viewUploadFilesMenu();
   }
}
