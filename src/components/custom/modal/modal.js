import "./modal.scss"
export function view (modalName) {
   const modal = document.querySelector(`[data-modal-name="${modalName}"]`);
      if (modal) {
         modal.classList.add('_view');
         return;
      }
}
// Закриття модалки
export function close(event) {
   if (event.target.closest('[data-modal-close]')) {
      const modalName = event.target.getAttribute("data-modal-close");
      const modal = event.target.closest(`[data-modal-name="${modalName}"]`);
      if (modal) {
         modal.classList.remove('_view');
         return;
      }
   }
}

// Видалення модалки
export function remove (event) {
   if (event.target.closest('[data-modal-remove]')) {
      const modalName = event.target.getAttribute("data-modal-remove");
      const modal = event.target.closest(`[data-modal-name="${modalName}"]`);
      if (modal) {
         modal.remove();
         return;
      }
   }
}

document.addEventListener('click', (event) => {
   close(event);
   remove(event);
});

