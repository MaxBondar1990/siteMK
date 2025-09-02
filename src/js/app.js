import { fetchHTML } from '../components/custom/fetch/fetch.js'
import { viewModal, closeModal, removeModal } from '../components/custom/modalManager/modalManager.js'

import { sendForm } from '../components/custom/sendform/sendform.js'

import { actionFuleContentSection } from '../components/custom/showtextbtn/showtextbtn.js'



document.addEventListener('click', (event) => {
   fetchHTML(event);
   viewModal(event);
   closeModal(event);
   removeModal(event);

   sendForm(event);
   actionFuleContentSection(event);
});
