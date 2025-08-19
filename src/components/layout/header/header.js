import './header.scss'
import { onInputFetchHTML } from '../../custom/featch/featch.js'

export function searchClean(event) {
   const searchInputClean = event.target.closest('[data-name="search__input-clean"]');
   if (searchInputClean) {
      const searchInput = document.querySelector('[data-sait-search]');
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
      searchModal.classList.add('_view');
   }
}
export function search(event) {
   const search = event.target.closest('[data-sait-search]')
   if (search) {
      const formData = new FormData();
      const value = search.value;
      const containerName = 'search-results';
      const fileName = 'search__result';

      formData.append('formName', 'search');
      formData.append('searchValue', value);

      if (value.length >= 1) {
         if (event.target.closest('[data-sait-search]')) {
            const inputClean = document.querySelector('[data-name="search__input-clean"]');
            if (!inputClean) return;
            inputClean.classList.add('_view');
         }
      } else {
         if (event.target.closest('[data-sait-search]')) {
            const inputClean = document.querySelector('[data-name="search__input-clean"]');
            if (!inputClean) return;
            inputClean.classList.remove('_view');
         }
      }

      if (value.length >= 3) {
         onInputFetchHTML(fileName, containerName, formData);
         //loadContent('search', input, containerName);
      }
   }
}