import './footer.scss'

import { sendForm } from '../../globalBlokcs/sendform/sendform.js';

document.addEventListener('click', (event) => {
   sendForm(event);
});