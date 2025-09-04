
export function viewModal(event) {
   const button = event.target.closest('[data-name="view-contact-form"]');
   if (button) {
      const form = document.querySelector('[data-name="contact-form-modal"]');
      if (form) {
         console.log(form)

         form.classList.add('_view');
      }
   }
}

// export function closeModal(event) {
//    const button = event.target.closest('[data-name="close-contact-form"]');
//    if (button) {
//       const form = event.target.closest('[data-name="contact-form-modal"]');
//       if (form) {
//          form.classList.remove('_view');
//       }
//    }
// }

//// Закриття модалки
//export function closeModal(event) {
//   if (event.target.closest("[data-close-modal]")) {
//      const modalName = event.target.getAttribute("data-close-modal");
//      const modalWindow = event.target.closest(`[data-name="${modalName}"]`);
//      if (modalWindow) {
//         modalWindow.classList.remove('_view');
//         return;
//      }
//   }
//}

// Remove модалки
export function removeModal(event) {
   if (event.target.closest("[data-remove-modal]")) {
      const modalName = event.target.getAttribute("data-remove-modal");
      const modalWindow = event.target.closest(`[data-name="${modalName}"]`);
      if (modalWindow) {
         setTimeout(() => {
            modalWindow.remove();
         }, 200);
         return;
      }
   }
}