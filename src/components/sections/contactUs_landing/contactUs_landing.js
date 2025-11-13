import './contactUs_landing.scss'

import '../../fetch/submitContactForm/submitContactForm.js';

import { loadContent, isRequiredInput } from '../../globalBlokcs/fetch/fetch.js'

function mountContactUs(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування КЛІКІВ в межах компонента
   rootEl.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-send-contactUs-form]');
      if (!btn || !rootEl.contains(btn) || (btn.type && btn.type !== 'submit')) return;

      e.preventDefault();
      const form = btn.form || e.target.form;
      if (!form) return;

      if (!isRequiredInput(form)) return;

      const formData = new FormData(form);
      const formName = form.getAttribute('name');
      if (formName) formData.append('formName', formName);

      try {
         const res = await loadContent('submitContactForm', formData, undefined, 'json');
         if (res && res.status === 'success' && res.html) {
            document.body.insertAdjacentHTML('beforeend', res.html);
         }
         // On error/timeout: do nothing here (footer form is not modal and should remain open)
      } catch (_) {
         // Network or unexpected error: leave form as-is
      }
   }, { signal });

   return () => ac.abort();
}

// Приклад автозапуску, якщо компонент одиничний і вже в DOM:
const rootcontactUs = document.querySelector('.contact-us');
if (rootcontactUs) {
   const cleanup = mountContactUs(rootcontactUs);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}
