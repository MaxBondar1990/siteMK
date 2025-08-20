import './cover.scss'

export function viewGlobalContactFormModal(event) {
   const button = event.target.closest('[data-name="view-contact-form"]');
   if (button) {
      const form = document.querySelector('[data-name="contact-form-modal"]');
      if (form) {
         form.classList.add('_view');
      }
   }
}

export function closeGlobalContactFormModal(event) {
   const button = event.target.closest('[data-name="close-contact-form"]');
   if (button) {
      const form = event.target.closest('[data-name="contact-form-modal"]');
      if (form) {
         form.classList.remove('_view');
      }
   }
}