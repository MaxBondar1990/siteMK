import { fetchHTML, closeModal, removeModal } from '../../custom/featch/featch.js'
import { searchView, searchClean } from '../../layout/header/header.js'
import { viewColorItems } from '../../layout/goods/goods.js'
import { handleArticleOrderForm, handleArticleColor } from '../../layout/articleContent/articleContent.js'
import { handleMainMenuClick } from '../../layout/leftSideBar/leftSideBar.js'


// document.addEventListener('DOMContentLoaded', () => {
//    addAction(); // ✅ один раз при завантаженні сторінки

//    document.addEventListener('click', (event) => {
//       fetchHTML(event);
//       close(event);
//       searchView(event);
//    });
// });

document.addEventListener('click', (event) => {

   fetchHTML(event);
   closeModal(event);
   removeModal(event);

   searchView(event);
   searchClean(event);

   viewColorItems(event);

   handleArticleOrderForm(event);
   handleArticleColor(event);

   handleMainMenuClick(event);
})

