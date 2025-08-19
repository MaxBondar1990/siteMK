const LOCAL_API_URL_1111 = "http://localhost:1111";
const LOCAL_API_URL_8888 = "http://localhost:8888";
const SERVER_API_URL = "https://megakompromis.com.ua";

const hostname = window.location.hostname;
const port = window.location.port;

let CONFIG;

if (hostname === "localhost" && port === "1111") {
   CONFIG = {
      apiUrl: LOCAL_API_URL_1111,
      getPath: (fileName, fetchType = 'html') => `/files/${fileName}.html`
   };
} else if (hostname === "localhost" && port === "8888") {
   CONFIG = {
      apiUrl: LOCAL_API_URL_8888,
      getPath: (fileName, fetchType = 'html') => `/${fetchType}/${fileName}/`
   };
} else {
   CONFIG = {
      apiUrl: SERVER_API_URL,
      getPath: (fileName, fetchType = 'html') => `/${fetchType}/${fileName}/`
   };
}

export function loadContent(fileName, postData = null, containerSelector = "body", fetchType = 'html') {

   const url = CONFIG.apiUrl + CONFIG.getPath(fileName, fetchType);
   const options = {
      method: "POST",
      body: postData
   };

   fetch(url, options)
      .then(response => {
         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
         return response.text();
      })
      .then(html => {
         const container = document.querySelector(containerSelector);
         if (container) {
            if (containerSelector == "body") {
               container.insertAdjacentHTML("beforeend", html);
            } else {
               container.innerHTML = html;
            }
         } else {
            console.error(`Контейнер "${containerSelector}" не знайдено`);
         }
      })
      .catch(error => console.error(`Помилка завантаження ${fileName}:`, error));

}

// Відкриття модалки
export function fetchHTML(event) {


   const fetchEl = event.target.closest('[data-fetch-html]');

   // Перевіряємо, чи натиснуто елемент з атрибутом data-fetch-html
   if (fetchEl) {
      // Отримуємо значення data-fetch-HTML
      const modalName = fetchEl.getAttribute("data-fetch-html");
      const fetchType = fetchEl.getAttribute("data-fetch-type") || "html";

      // Створюємо параметри для fetch за допомогою createFetchParam
      const fetchParam = createFetchParam(fetchEl);
      const featchContainer = getContainer(fetchEl);
      // Функція для створення FormData
      function createFetchParam(eventTarget) {
         let result = new FormData(); // Використовуємо FormData для створення іменованого масиву

         // Якщо є атрибут data-section-id, додаємо його до fetchParam
         if (eventTarget.matches('[data-section-id]')) {
            const sectionId = eventTarget.getAttribute('data-section-id');
            result.append("sectionId", sectionId); // Додаємо значення в форму
         }
         // Якщо є атрибут type = search, додаємо його до fetchParam
         if (eventTarget.matches('[type="search"]')) {
            const searchValue = eventTarget.value;
            result.append("searchValue", searchValue); // Додаємо значення в форму
         }
         return result;
      }

      function getContainer(eventTarget) {
         const containerName = eventTarget.getAttribute('data-container-name');
         return containerName;
      }

      if (featchContainer) {
         // Викликаємо метод для завантаження вмісту модального вікна з передачею параметрів
         loadContent(modalName, fetchParam, `[data-container='${featchContainer}']`, fetchType);
      } else {
         // Викликаємо метод для завантаження вмісту модального вікна з передачею параметрів
         loadContent(modalName, fetchParam, undefined, fetchType);
      }


      // Якщо потрібно, можна логувати fetchParam для перевірки
      // console.log([...fetchParam]); // Це виведе масив з FormData у консоль
   }
}

export function onInputFetchHTML(fileName, containerName, data) {
   // Перевіряємо, чи натиснуто елемент з атрибутом data-fetch-html
   if (containerName) {
      // Викликаємо метод для завантаження вмісту модального вікна з передачею параметрів
      loadContent(fileName, data, `[data-container='${containerName}']`);
   } else {
      // Викликаємо метод для завантаження вмісту модального вікна з передачею параметрів
      loadContent(fileName, data);
   }
}

// Закриття модалки
export function closeModal(event) {
   if (event.target.closest("[data-close-modal]")) {
      const modalName = event.target.getAttribute("data-close-modal");
      console.log(modalName)
      const modalWindow = event.target.closest(`[data-name="${modalName}"]`);
      if (modalWindow) {
         modalWindow.classList.remove('_view');
         return;
      }
   }
}

// Remove модалки
export function removeModal(event) {
   if (event.target.closest("[data-remove-modal]")) {
      const modalName = event.target.getAttribute("data-remove-modal");
      const modalWindow = event.target.closest(`[data-name="${modalName}"]`);
      if (modalWindow) {
         setTimeout(() => {
            modalWindow.remove();
         }, 200);
         return;
      }
   }
}
