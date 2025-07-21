import './leftSideBar.scss';

import { viewNavigation, closeNavigation } from '../../layout/navigation/navigation.js';

export function burgerClick(event) {
   const burger = event.target.closest('[data-name="view-nav-menu"]');
   if (burger) {
      const isActive = burger.classList.contains('_action');
      if (!isActive) {
         burger.classList.add('_action');
         viewNavigation();
      } else {
         burger.classList.remove('_action');
         closeNavigation(); // ВИКЛИК з іншого файлу
      }
   }
};

const contactBtns = document.querySelectorAll('.left-side-bar__link[data-name]');
const contactBars = document.querySelectorAll('.left-side-bar__modal[data-name]');

contactBtns.forEach(btn => {
   btn.addEventListener('click', () => {
      const btnName = btn.getAttribute('data-name');

      contactBars.forEach(modal => {
         const contactName = modal.getAttribute('data-name');

         if (contactName === btnName) {
            modal.classList.toggle('_view'); // показати/сховати активну
         } else {
            modal.classList.remove('_view'); // сховати всі інші
         }
      });
   });
});
