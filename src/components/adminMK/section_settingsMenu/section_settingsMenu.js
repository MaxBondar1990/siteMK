import './section_settingsMenu.scss'

function actionSettingsItem(event) {
   //Перевіряємо чи був click on section-moderation-menu
   if (event.target.closest('[data-name="section-settings-menu"]')) {
      //Збираю потрібні елементи
      const sectionSettingsMenu = event.target.closest('[data-name="section-settings-menu"]');
      const groupsOfParams = event.target.closest('[data-name="groups-of-params"]');
      const groupsOfBlocks = event.target.closest('[data-name="groups-of-blocks"]');
      console.log(groupsOfBlocks);
      //Функція згортання всіх елементів та розгортання того по якому клікнули
      function actionParamItems() {
         //Отримую список всіх параметрів
         const paramItems = sectionSettingsMenu.querySelectorAll('[data-name="param-item"]');
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
         groupsOfParams.nextElementSibling.classList.remove('_active');
         groupsOfParams.nextElementSibling.classList.add('_pacive');
         //Розготраю потрібний
         actionParamItems();
      }
      //Розгортаю панель з блоками
      if (groupsOfBlocks) {
         //розгортаю блоки
         groupsOfBlocks.classList.remove('_pacive');
         groupsOfBlocks.classList.add('_active');
         //згортаю параметри
         groupsOfBlocks.previousElementSibling.classList.remove('_active');
         groupsOfBlocks.previousElementSibling.classList.add('_pacive');
         //Розгортаю потрібний
         actionParamItems()
      }
   }
}
// додаємо слухач на клік по документу
document.addEventListener('click', actionSettingsItem);