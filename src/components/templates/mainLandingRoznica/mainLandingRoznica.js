// import { fetchHTML, close } from '../../custom/featch/featch.js'

import { 
   viewSettings, 
   getOrderForm, 
   getPrints, 
   setPrint, 
   setChengingSettings, 
   viewPhoneNomber, 
   clickOnClassADDClassName, 
   modal, 
   isWebp 
} from '../../layout/landingRoznica/landingRoznica.js'





document.addEventListener('click', (event) => {
   viewSettings(event);
   getOrderForm(event);
   getPrints(event);
   setPrint(event);
   setChengingSettings(event);
   viewPhoneNomber(event);

   clickOnClassADDClassName();
   modal();
   isWebp();
});
