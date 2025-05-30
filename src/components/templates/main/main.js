import { fetchHTML, close } from '../../custom/featch/featch.js'
import { searchView } from '../../layout/header/header.js'
import { addAction } from '../../layout/goods/goods.js'

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
   close(event);

   searchView(event);

   addAction(event);
})

