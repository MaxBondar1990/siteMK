import './cover.scss'

function viewModal(event) {
   const button = event.target.closest('[data-name="view-contact-form"]');
   if (button) {
      const form = document.querySelector('[data-name="contact-form"]');
      if (form) {
         console.log(form)

         form.classList.add('_view');
      }
   }
}
document.addEventListener('click', (event) => {
   viewModal(event);
});