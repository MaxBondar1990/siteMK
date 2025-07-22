// import { fetchHTML, close } from '../../custom/featch/featch.js'

import { searchClean, searchView, search } from '../../layout/header/header.js'
import { handleMainMenuClick } from '../../layout/navigation/navigation.js'
import { burgerClick } from '../../layout/leftSideBar/leftSideBar.js'

document.addEventListener('click', (event) => {
   searchClean(event)
   searchView(event)

   burgerClick(event);

   handleMainMenuClick(event);
});

document.addEventListener('input', (event) => {
   search(event)
});
