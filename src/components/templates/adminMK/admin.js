import { fetchHTML, close } from '../../custom/featch/featch.js'
import { handleMainMenuClick } from '../../layout/leftSideBar/leftSideBar.js'


document.addEventListener('click', (event) => {

   fetchHTML(event);
   close(event);

   handleMainMenuClick(event);
})