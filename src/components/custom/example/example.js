import './auth.scss'

function mountAuth(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування КЛІКІВ в межах компонента
   rootEl.addEventListener('click', (e) => {
      //some script
   }, { signal });

   return () => ac.abort();
}

// Приклад автозапуску, якщо компонент одиничний і вже в DOM:
const rootCover = document.querySelector('[data-component="auth"][data-part="root"]');
if (rootAuth) {
   const cleanup = mountAuth(rootAuth);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}