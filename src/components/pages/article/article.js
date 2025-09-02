import { viewArticleOrderForm, closeArticleOrderForm, setProductColorAndImage, updatePriceByQuantity } from '../../layout/articleContent/articleContent.js'

document.addEventListener('click', (event) => {
   viewArticleOrderForm(event);
   closeArticleOrderForm(event);
   setProductColorAndImage(event);
   updatePriceByQuantity();

});