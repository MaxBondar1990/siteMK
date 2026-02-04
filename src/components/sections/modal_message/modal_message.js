import './modal_message.scss'

const SELECTORS = {
   root: 'data-component="modal_message" data-part="root"',
};

function mountCover(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування КЛІКІВ в межах компонента
   rootEl.addEventListener('click', (e) => {

   }, { signal });

   return () => ac.abort();
}

// Приклад автозапуску, якщо компонент одиничний і вже в DOM:
const rootmodalMessage = document.querySelector(SELECTORS.root);
if (rootmodalMessage) {
   const cleanup = mountCover(rootmodalMessage);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}