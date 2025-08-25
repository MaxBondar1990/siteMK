import "./sendform.scss"
import { loadContent } from '../featch/featch.js'



export function sendForm(event) {
   if (event.target.type == 'submit' && event.target.closest('[data-featch-form]')) {

      event.preventDefault();
      const form = event.target.form;

      if (form) {
         if (isRequired(form)) {
            const formData = new FormData(form);

            if (form.getAttribute("name")) {
               formData.append('formName', form.getAttribute("name"));
            }

            loadContent('submit', formData, "body", 'form');

         }
      }
   }
}

export function isRequired(form) {
   const requiredInputs = form.querySelectorAll('[required]');
   let result = null;

   if (requiredInputs.length > 0) {
      requiredInputs.forEach(requiredInput => {
         requiredInput.addEventListener('focus', (event) => {
            const focusInput = event.target
            //Знімаємо виділення не правильно введених данних
            focusInput.classList.remove('wrongValue');
            focusInput.style.backgroundColor = null;
         });

         requiredInput.addEventListener('blur', (event) => {
            const blurInput = event.target
            if (!blurInput.value) {

               //Відмічаємо інпути з помилками
               blurInput.classList.add('wrongValue');
               blurInput.style.backgroundColor = '#F7931E';
               //return result = false;
            }
         });

         if (requiredInput.value && result == false) {
            return result = false;
         }
         if (requiredInput.value) {
            return result = true;
         }
         if (!requiredInput.value) {
            requiredInput.classList.add('wrongValue');
            requiredInput.style.backgroundColor = '#F7931E';
            return result = false;
         }
      });
   }

   // --- Закриття форми після успішної перевірки ---
   if (result === true) {
      const modal = document.querySelector('.contact-form-modal[data-name="contact-form-modal"]');
      if (modal) {
         modal.classList.remove('_view');
      }
      form.reset();
   }

   return result;
}
