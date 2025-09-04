import "./contactform.scss"

import { closeModal } from '../../custom/modal/modal.js'
   console.log(closeModal)

document.addEventListener('click', (event) => {
   closeModal(event);

});