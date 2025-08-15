import { fetchHTML, closeModal, removeModal } from '../components/custom/featch/featch.js'
import { sendForm, isRequired } from '../components/custom/sendform/sendform.js'


document.addEventListener('click', (event) => {
   fetchHTML(event);
   closeModal(event);
   removeModal(event);

   sendForm(event);
   isRequired(form);


});
