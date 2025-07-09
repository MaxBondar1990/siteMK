import './header.scss'
import { onInputFetchHTML } from '../../custom/featch/featch.js'


export function searchView(event) {
   const searchPanel = event.target.closest('[data-search-panel]');
   const searchResultName = 'search-results';
   if (!searchPanel) return;

   const searchInput = searchPanel.querySelector('input[type="search"]');
   if (!searchInput) return;

   const searchResult = document.querySelector(`[data-container='${searchResultName}']`);
   if (searchResult) {
      search(searchInput);
      searchResult.classList.add('_active');
   }
}
function search(searchInput) {
   searchInput.addEventListener('input', (event) => {
      const inputValue = searchInput.value;
      const containerName = 'search-results';
      const auchnostName = 'search__result';


      if (inputValue.length >= 3) {
         onInputFetchHTML(auchnostName, containerName, inputValue);
         //loadContent('search', input, containerName);
      }
   });
}
