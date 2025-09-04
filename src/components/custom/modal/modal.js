// Закриття модалки
export function closeModal(event) {
   if (event.target.closest("[data-close-modal]")) {
      const modalName = event.target.getAttribute("data-close-modal");
      const modalWindow = event.target.closest(`[data-name="${modalName}"]`);
      if (modalWindow) {
         modalWindow.classList.remove('_view');
         return;
      }
   }
}