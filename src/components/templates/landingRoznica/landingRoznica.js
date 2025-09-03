import { sendForm } from '../../custom/sendform/sendform.js'

import { 
   viewSettings,
   getOrderForm,
   getPrints,
   setPrint,
   setChengingSettings,
   viewPhoneNomber,
} from '../../layout/landingRoznica/landingRoznica.js'


document.addEventListener('click', (event) => {
   sendForm(event);

   viewSettings(event);
   getOrderForm(event);
   getPrints(event);
   setPrint(event);
   setChengingSettings(event);
   viewPhoneNomber(event);

});
