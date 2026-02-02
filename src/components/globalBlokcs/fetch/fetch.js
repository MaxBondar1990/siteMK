const LOCAL_API_URL_1111 = "http://localhost:1111";
const LOCAL_API_URL_8888 = "http://localhost:8888";
const SERVER_API_URL = "https://megakompromis.com.ua";

const hostname = window.location.hostname;
const port = window.location.port;

let CONFIG;

if (hostname === "localhost" && port === "1111") {
   CONFIG = {
      apiUrl: LOCAL_API_URL_1111,
      getPath: (fileName, fetchType = 'html') => fetchType === 'json' ? `/components/fetch/${fileName}/${fileName}.json` : `/components/fetch/${fileName}/${fileName}.html`
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

/**
 * loadContent: JSON-first fetch helper
 * - Does NOT insert into the DOM.
 * - Returns a structured object: { status, html?, message?, ... }.
 * - Default fetchType is 'json'. For local mocks (1111) we resolve to /components/fetch/json/<file>/<file>.json.
 * - Callers are responsible for rendering/inserting html and reacting to status.
 */
export function loadContent(fileName, postData = null, _containerSelector = undefined, fetchType = 'json') {
   // Allow direct endpoints: if fileName is an absolute path or full URL,
   // don't prepend CONFIG.getPath() (which would add /json or /html).
   const isFullUrl = typeof fileName === 'string' && /^https?:\/\//i.test(fileName);
   const isAbsPath = typeof fileName === 'string' && fileName.startsWith('/');

   const url = isFullUrl
      ? fileName
      : (isAbsPath
         ? (CONFIG.apiUrl + fileName)
         : (CONFIG.apiUrl + CONFIG.getPath(fileName, fetchType)));
   const options = { method: 'POST', body: postData };

   // Timeout/abort setup
   const ac = new AbortController();
   const { signal } = ac;
   options.signal = signal;
   const TIMEOUT_MS = 10000;
   const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);

   // Helper: parse JSON if possible
   const tryParseJSON = async (response) => {
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
         try { return await response.json(); } catch (_) { }
      }
      return null;
   };

   return fetch(url, options)
      .then(async (response) => {
         clearTimeout(timer);
         if (!response.ok) {
            // Try to extract JSON error shape, otherwise text
            const maybeJSON = await tryParseJSON(response);
            if (maybeJSON) return { status: maybeJSON.status || 'error', ...maybeJSON };
            const text = await response.text().catch(() => '');
            return { status: 'error', message: text || `HTTP ${response.status}` };
         }

         // Prefer JSON protocol: { status, html, message, ... }
         const maybeJSON = await tryParseJSON(response);
         if (maybeJSON) {
            // Always return as-is, caller decides what to do (render/close/etc.)
            return { status: maybeJSON.status || 'success', ...maybeJSON };
         }

         // Legacy/HTML path: return raw HTML string without inserting into DOM
         const html = await response.text();
         return { status: 'success', html };
      })
      .catch((error) => {
         clearTimeout(timer);
         document.body.dispatchEvent(new CustomEvent('fetch:error', { bubbles: true, detail: { fileName, error } }));
         if (error && (error.name === 'AbortError' || String(error).includes('AbortError'))) {
            return { status: 'timeout', message: 'Request timed out' };
         }
         console.error(`Помилка завантаження ${fileName}:`, error);
         return { status: 'error', message: String(error) };
      });
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

export function isRequiredInput(form) {
   //console.log('ddv');
   const requiredInputs = form.querySelectorAll("[required]");

   let result = null;
   if (requiredInputs.length > 0) {
      requiredInputs.forEach((requiredInput) => {

         requiredInput.addEventListener("focus", (event) => {
            const focusInput = event.target;
            focusInput.classList.remove("wrongValue");
            focusInput.style.backgroundColor = null;
         });
         requiredInput.addEventListener("blur", (event) => {
            const blurInput = event.target;
            if (!blurInput.value) {
               blurInput.classList.add("wrongValue");
               blurInput.style.backgroundColor = "#F7931E";
            }
         });
         if (requiredInput.value && result == false) {
            return result = false;
         }
         if (requiredInput.value) {
            return result = true;
         }
         if (!requiredInput.value) {
            requiredInput.classList.add("wrongValue");
            requiredInput.style.backgroundColor = "#F7931E";

            return result = false;
         }
      });
   }
   return result;
}