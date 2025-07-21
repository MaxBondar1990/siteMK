// import { fetchHTML, close } from '../../custom/featch/featch.js'

import { burgerClick } from '../../layout/leftSideBar/leftSideBar.js'
import { handleMainMenuClick } from '../../layout/navigation/navigation.js'



document.addEventListener('click', (event) => {
   burgerClick(event);

   handleMainMenuClick(event);
});
