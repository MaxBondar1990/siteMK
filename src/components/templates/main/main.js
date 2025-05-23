import { fetchHTML, close } from '../../custom/featch/featch.js'
import { searchView } from '../../layout/header/header.js'


document.addEventListener('click', (event) => {

   fetchHTML(event);
   close(event);

   searchView(event);
})