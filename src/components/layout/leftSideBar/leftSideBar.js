import './leftSideBar.scss';

const contactBtns = document.querySelectorAll('.left-side-bar__link[data-name]');
const contactBars = document.querySelectorAll('.left-side-bar__contacts[data-name]');

function handleMainMenuClick(event) {
   const target = event.target;

   const burger = document.querySelector('.burger-menu');
   const navigation = document.querySelector('.main-menu');
   const navItems = document.querySelectorAll('.nav-items .group-wrapper');

   // Чітке керування станом бургер-меню
   if (target.closest('.burger-menu')) {
      const isActive = burger.classList.contains('_action');

      if (isActive) {
         burger.classList.remove('_action');
         navigation.classList.remove('_active');
      } else {
         burger.classList.add('_action');
         navigation.classList.add('_active');
      }
   }

   // Клік по пункту головного меню
   const menuItem = target.closest('.main-menu__items');
   if (menuItem) {
      const clickedName = menuItem.dataset.name;

      navItems.forEach((item) => {
         const itemName = item.dataset.name;

         if (itemName === clickedName) {
            item.classList.add('_show');
         } else {
            item.classList.remove('_show');
         }
      });
   }

   // Клік поза меню — закриваємо підменю
   if (!target.closest('.main-menu')) {
      navItems.forEach((item) => item.classList.remove('_show'));
   }
}

document.addEventListener('click', (event) => {
   handleMainMenuClick(event)
});


// Обробка кнопок у лівій бічній панелі
contactBtns.forEach(btn => {
   btn.addEventListener('click', () => {
      const btnName = btn.getAttribute('data-name');
      contactBars.forEach(contact => {
         const contactName = contact.getAttribute('data-name');
         if (contactName === btnName) {
            contact.classList.contains('_contacts')
               ? contact.classList.remove('_contacts')
               : contact.classList.add('_contacts');
         } else {
            contact.classList.remove('_contacts');
         }
      });
   });
});
