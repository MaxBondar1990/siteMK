import './header.scss'
import { onInputFetchHTML } from '../../custom/featch/featch.js'

export function searchClean(event) {
   const searchInputClean = event.target.closest('[data-name="search__input-clean"]');
   if (searchInputClean) {
      const searchInput = document.querySelector('[data-search-value]');
      if (!searchInput) return;
      searchInput.value = '';
      searchInputClean.classList.remove('_view');
      }
}

export function searchView(event) {
   const searchPanel = event.target.closest('[data-search-panel]');
   const searchModal = document.querySelector('[data-name="search-modal"]');

   if (!searchPanel) return;

   const searchInput = searchPanel.querySelector('input[type="search"]');
   if (!searchInput) return;

   // const searchResult = document.querySelector(`[data-container='${searchResultName}']`);
   if (searchModal) {
      search(searchInput);
      searchModal.classList.add('_view');
   }
}
function search(searchInput) {
   searchInput.addEventListener('input', (event) => {
      const inputValue = searchInput.value;
      const containerName = 'search-results';
      const fileName = 'search__result';

      if (inputValue.length >= 1) {
         if (event.target.closest('[data-search-value]')) {
            const inputClean = document.querySelector('[data-name="search__input-clean"]');
            if (!inputClean) return;
            inputClean.classList.add('_view');
         } 
      } else {
         if (event.target.closest('[data-search-value]')) {
            const inputClean = document.querySelector('[data-name="search__input-clean"]');
            if (!inputClean) return;
            inputClean.classList.remove('_view');
         } 
      }

      if (inputValue.length >= 3) {
         onInputFetchHTML(fileName, containerName, inputValue);
         //loadContent('search', input, containerName);
      }
   });
}
