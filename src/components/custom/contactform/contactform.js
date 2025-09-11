import "./contactform.scss"

import { loadContent, isRequiredInput } from '../../globalBlokcs/fetch/fetch.js'
import { close } from '../../fetch/form/submit/submit.js';

function mountCover(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування КЛІКІВ в межах компонента
   rootEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-send-contact-form]');
      if (btn && rootEl.contains(btn) && btn.type == "submit") {
         e.preventDefault();
            const form = e.target.form;
            if (form) {
               if (isRequiredInput(form)) {
                  const formData = new FormData(form);
                  if (form.getAttribute("name")) {
                     formData.append("formName", form.getAttribute("name"));
                  }
                  loadContent("submit", formData, "body", "form");
               }
            }
      }


   }, { signal });

   return () => ac.abort();
}

// Приклад автозапуску, якщо компонент одиничний і вже в DOM:
const rootContactForm = document.querySelector('.contact-form');
if (rootContactForm) {
   const cleanup = mountCover(rootContactForm);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}