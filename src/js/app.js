import { fetchHTML, closeModal, removeModal } from '../components/custom/featch/featch.js'
import { sendForm } from '../components/custom/sendform/sendform.js'

import { openFuleContentSection, closeFuleContentSection } from '../components/custom/showtextbtn/showtextbtn.js'



document.addEventListener('click', (event) => {
   fetchHTML(event);
   closeModal(event);
   removeModal(event);

   sendForm(event);

   openFuleContentSection(event);
   closeFuleContentSection(event);

});
