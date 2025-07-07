import './header.scss'

export function searchView(event) {
   event.preventDefault();
   const searchPanel = event.target.closest('[data-fetch-html="search__panel"]');
   if (!searchPanel) return;

   const searchForm = searchPanel.querySelector('form');
   if (!searchForm) return;

   const searchInput = searchForm.querySelector('input[type="search"]');
   if (!searchInput) return;

   const containerName = searchPanel.dataset.containerName;
   if (!containerName) return;

   searchInput.addEventListener('input', () => {
      const input = searchInput.value;
      if (input.length < 3) {
         loadContent('search', input, containerName);
      }
   });

   const searchResult = document.querySelector(`[data-container='${containerName}']`);
   if (searchResult) {
      searchResult.classList.add('_active');
   }
}

//Застосунок для фетчу
//Варіант 1
//Вставка в кінець боді
// Якщо клікнули по фетч елементу. Відправка запиту і отримане повернули в кінець боді

//Варіант 2
//TODO Вставка в контейнер
//Клік по фетч
//Відправити фетч
//Якщо є відповідь
//знайти контейнер
//Вставити в контенер
