import { fetchHTML, closeModal, removeModal } from '../components/custom/featch/featch.js'

document.addEventListener('click', (event) => {
   fetchHTML(event);
   closeModal(event);
   removeModal(event);
});