// import { fetchHTML, close } from '../../custom/featch/featch.js'

import { searchClean, searchView, search } from '../../layout/header/header.js'
import { viewNavModalGroupMenu, closeNavModalGroupMenu } from '../../layout/navigation/navigation.js'
import { burgerClick } from '../../layout/leftSideBar/leftSideBar.js'
import { viewGlobalContactFormModal, closeGlobalContactFormModal } from '../../layout/cover/cover.js'
import { viewColorItems, applyColorAndPriceChange } from '../../layout/goods/goods.js'



document.addEventListener('click', (event) => {
   searchClean(event)
   searchView(event)

   burgerClick(event);

   viewGlobalContactFormModal(event);
   closeGlobalContactFormModal(event);

   viewNavModalGroupMenu(event);
   closeNavModalGroupMenu(event);

   viewColorItems(event);
   applyColorAndPriceChange(event);

});

document.addEventListener('input', (event) => {
   search(event)
});
