import './leftSideBar.scss';
import { viewNavigation, closeNavigation } from '../navigation/navigation.js';
import { view } from '../../custom/modal/modal.js'

// Примітка: авторизаційна логіка винесена в окремий компонент; тут лише відкриття/перемикання модалок.
function mountLeftSideBar(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування кліків у межах компонента за новою розміткою (data-action / data-target)
   rootEl.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl || !rootEl.contains(actionEl)) return;

      const action = actionEl.getAttribute('data-action');
      const target = actionEl.getAttribute('data-target');

      switch (action) {
         case 'toggle-nav': {
            // Кнопка бургера (data-part="burger")
            const isActive = actionEl.classList.contains('_action');
            if (isActive) {
               actionEl.classList.remove('_action');
               closeNavigation();
            } else if (viewNavigation()) {
               actionEl.classList.add('_action');
            }
            return;
         }

         case 'toggle-modal': {
            // Перемикання модалок контактів за data-target
            const modals = rootEl.querySelectorAll('[data-part="modal"][data-name]');
            modals.forEach((modal) => {
               const name = modal.getAttribute('data-name');
               if (name === target) {
                  modal.classList.toggle('_view');
               } else {
                  modal.classList.remove('_view');
               }
            });
            return;
         }

         case 'toggle-auth-modal': {
            view('auth-form-menu');
            // Для посилань типу Viber/Telegram. Якщо href="#", не заважаємо — 
            // можна додати data-href пізніше і відкрити window.open(actionEl.dataset.href)
            return;
         }

         case 'open-link': {
            // Для посилань типу Viber/Telegram. Якщо href="#", не заважаємо — 
            // можна додати data-href пізніше і відкрити window.open(actionEl.dataset.href)
            return;
         }

         default:
            return;
      }
   }, { signal });

   return () => ac.abort();
}

// Автоматичне підключення, якщо компонент є в DOM
const rootLeft = document.querySelector('[data-component="leftSideBar"][data-part="root"]') || document.querySelector('.left-side-bar');
if (rootLeft) {
   const cleanup = mountLeftSideBar(rootLeft);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}
