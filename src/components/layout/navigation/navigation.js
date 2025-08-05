import './navigation.scss'

export function viewNavigation() {

   const navigation = document.querySelector('[data-name="nav-bar-menu"]');
   if (navigation) {
      navigation.classList.add('_active');
   }
}

export function closeNavigation() {

   const navigation = document.querySelector('[data-name="nav-bar-menu"]');
   if (navigation) {
      navigation.classList.remove('_active');
   }
}

// export function handleMainMenuClick (event) {
//       const target = event.target;

//    const navItems = document.querySelectorAll('.nav-items .group-wrapper');

//    // Клік по пункту головного меню
//    const menuItem = target.closest('.main-menu__items');
//    if (menuItem) {
//       const clickedName = menuItem.dataset.name;

//       navItems.forEach((item) => {
//          const itemName = item.dataset.name;

//          if (itemName === clickedName) {
//             item.classList.add('_show');
//          } else {
//             item.classList.remove('_show');
//          }
//       });
//    }

//    // Клік поза меню — закриваємо підменю
//    if (!target.closest('.main-menu')) {
//       navItems.forEach((item) => item.classList.remove('_show'));
//    }
// }

export function handleMainMenuClick(event) {
   const target = event.target;

   // Всі блоки підменю
   const navItems = document.querySelectorAll('.group-wrapper');

   // Шукаємо пункт меню, по якому клікнули
   const menuItem = target.closest('.main-menu__item');

   if (menuItem) {
      const clickedName = menuItem.dataset.name;

      navItems.forEach((item) => {
         const itemName = item.dataset.name;

         // Тільки один відкритий
         if (itemName === clickedName) {
            item.classList.toggle('_show');
         } else {
            item.classList.remove('_show');
         }
      });

      return; // Вихід — бо це був клік по меню
   }

   // Якщо клік поза меню та поза групами — закриваємо все
   const isOutsideMenu = !target.closest('.main-menu');
   const isOutsideNavBlock = !target.closest('.group-wrapper');

   if (isOutsideMenu && isOutsideNavBlock) {
      navItems.forEach((item) => item.classList.remove('_show'));
   }
}
