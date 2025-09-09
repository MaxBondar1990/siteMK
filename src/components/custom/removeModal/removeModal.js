import "./removeModal.scss"

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
