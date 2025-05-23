import './leftSideBar.scss';

const burger = document.querySelector('.burger-menu');
const navigation = document.querySelector('.main-menu');
const navItems = document.querySelectorAll('.nav-items .group-wrapper');
// const contactBtns = document.querySelectorAll('.left-side-bar__items button');
// const contactBars = document.querySelectorAll('.left-side-bar__contacts');

document.addEventListener('click', (event) => {

   const target = event.target;

   // Чітке керування станом бургер-меню
   if (target.closest('.burger-menu')) {
      const isActive = burger.classList.contains('_action');

      if (isActive) {
         burger.classList.add('_action');
         navigation.classList.add('_active');
      } else {
         burger.classList.remove('_action');
         navigation.classList.remove('_active');

      }
   }

   // Клік по пункту головного меню
document.addEventListener('click', (event) => {
  const menuItem = event.target.closest('.main-menu__items');
  if (!menuItem) return;

  const clickedName = menuItem.dataset.name;

  navItems.forEach(item => {
    const itemName = item.dataset.name;

    if (itemName === clickedName) {
      item.classList.add('_show'); // Відкриваємо лише натиснутий
    } else {
      item.classList.remove('_show'); // Закриваємо всі інші
    }
  });
});


   // Клік поза меню — закриваємо підменю
   if (!target.closest('.main-menu')) {
      navItems.forEach(item => item.classList.remove('_show'));
   }
});

// Обробка кнопок у лівій бічній панелі
// contactBtns.forEach(btn => {
//    btn.addEventListener('click', () => {
//       const btnName = btn.getAttribute('data-name');
//       contactBars.forEach(contact => {
//          const contactName = contact.getAttribute('data-name');
//          if (contactName === btnName) {
//             contact.classList.contains('_contacts')
//                ? contact.classList.remove('_contacts')
//                : contact.classList.add('_contacts');
//          } else {
//             contact.classList.remove('_contacts');
//          }
//       });
//    });
// });
