import './navigation.scss'

export function viewNavigation() {

   const navigation = document.querySelector('[data-name="nav-bar-menu"]');
   if (!navigation) {
      console.log('navigation is undefined')
      return false;
   }
   if (navigation) {
      navigation.classList.add('_active');
      return true;
   }
}

export function closeNavigation() {
   const navigation = document.querySelector('[data-name="nav-bar-menu"]');
   if (!navigation) {
      console.log('navigation is undefined')
      return false;
   }
   if (navigation) {
      navigation.classList.remove('_active');
      return true;

   }
}

function viewNavModalGroupMenu(event) {
   const target = event.target;

   // Всі блоки підменю
   const navItems = document.querySelectorAll('.navigate-group-wrapper');

   // Шукаємо пункт меню, по якому клікнули
   const menuItem = target.closest('.navigate__item');

   if (menuItem) {
      const clickedName = menuItem.dataset.name;

      navItems.forEach((item) => {
         const itemName = item.dataset.name;

         // Тільки один відкритий
         if (itemName === clickedName) {
            item.classList.add('_view');
         } else {
            item.classList.remove('_view');
         }
      });

      return; // Вихід — бо це був клік по меню
   }
}

function closeNavModalGroupMenu(event) {
   const closeButton = event.target.closest('[data-name="navigate-group-wrapper-close-button"]');
   if (!closeButton) return;

   const wrapper = closeButton.closest('.navigate-group-wrapper');
   if (wrapper) {
      wrapper.classList.remove('_view');
   }
}

document.addEventListener('click', (event) => {
   viewNavModalGroupMenu(event)
   closeNavModalGroupMenu(event)
});