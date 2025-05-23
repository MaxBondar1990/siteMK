import './header.scss'

export function searchView(event) {
   const searchPanel = event.target.closest('[data-fetch-html="search__result"]');
   if (!searchPanel) return;

   const containerName = searchPanel.dataset.containerName;
   if (!containerName) return;

   const searchResult = document.querySelector(`[data-container='${containerName}']`);
   if (searchResult) {
      searchResult.classList.add('_active');
   }
}
