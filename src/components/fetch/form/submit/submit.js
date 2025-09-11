import './submit.scss'

export function close(event) {
   const btn = event.target.closest('[data-remove-submit]');
   if(btn) {
      const submitMenu = event.target.closest('[data-name-submit="contact-form-submit"]');
      if(submitMenu) {
         submitMenu.remove();
      }
   }
}

document.addEventListener('click', (event) => {
   close(event);
});