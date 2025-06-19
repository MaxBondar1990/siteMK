const LOCAL_API_URL = "http://localhost:1111/files/";
const SERVER_API_URL = "https://yourserver.com";

const isLocal = window.location.hostname === "localhost";
const CONFIG = {
   apiUrl: isLocal ? LOCAL_API_URL : SERVER_API_URL,
   getPath: (section) => isLocal ? `${section}.html` : `/adminModule/${section}/`
};

   function loadContent(section, postData = null, containerSelector = "body") {

   const url = CONFIG.apiUrl + CONFIG.getPath(section);
   const options = isLocal ? {} : {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData)
   };

   fetch(url, options)
      .then(response => {
         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
         return response.text();
      })
      .then(html => {
         const container = document.querySelector(containerSelector);
         if (container) {
            container.insertAdjacentHTML("beforeend", html);
         } else {
            console.error(`Контейнер "${containerSelector}" не знайдено`);
         }
      })
      .catch(error => console.error(`Помилка завантаження ${section}:`, error));

}


// Функція для створення FormData
function createFetchParam(eventTarget) {
   let result = new FormData(); // Використовуємо FormData для створення іменованого масиву

   // Якщо є атрибут data-section-id, додаємо його до fetchParam
   if (eventTarget.matches('[data-section-id]')) {
      const sectionId = eventTarget.getAttribute('data-section-id');
      result.append("sectionId", sectionId); // Додаємо значення в форму
   }
   return result;
}

function getContainer (eventTarget) {
      const containerName = eventTarget.getAttribute('data-container-name');
      return containerName;
}

// Відкриття модалки
   export function fetchHTML(event) {
      const fetchEl = event.target.closest('[data-fetch-html]');

   // Перевіряємо, чи натиснуто елемент з атрибутом data-fetch-html
   if (fetchEl) {

      // Отримуємо значення data-fetch-HTML
      const modalName = fetchEl.getAttribute("data-fetch-html");

      // Створюємо параметри для fetch за допомогою createFetchParam
      const fetchParam = createFetchParam(fetchEl);
      const featchContainer = getContainer(fetchEl);

      if (featchContainer) {
            // Викликаємо метод для завантаження вмісту модального вікна з передачею параметрів
            loadContent(modalName, fetchParam, `[data-container='${featchContainer}']`);

      } else {
         // Викликаємо метод для завантаження вмісту модального вікна з передачею параметрів
         loadContent(modalName, fetchParam);
      }


      // Якщо потрібно, можна логувати fetchParam для перевірки
      // console.log([...fetchParam]); // Це виведе масив з FormData у консоль
   }
}

// Закриття модалки
   export function close(event) {
   if (event.target.matches("[data-close-modal]")) {
      const modalName = event.target.getAttribute("data-close-modal");
      const modalWindow = event.target.closest(`[data-name="${modalName}"]`);
      if (modalWindow) {
         setTimeout(() => {
            modalWindow.remove();
         }, 200);
         return;
      }
   }
}