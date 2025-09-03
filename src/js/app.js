import { fetchHTML } from '../components/globalBlokcs/fetch/fetch.js'
import { viewModal, closeModal, removeModal } from '../components/globalBlokcs/modalManager/modalManager.js'

import { sendForm } from '../components/globalBlokcs/sendform/sendform.js'

import { actionFuleContentSection } from '../components/globalBlokcs/showtextbtn/showtextbtn.js'



document.addEventListener('click', (event) => {
   fetchHTML(event);
   viewModal(event);
   closeModal(event);
   removeModal(event);

   sendForm(event);
   actionFuleContentSection(event);
});
