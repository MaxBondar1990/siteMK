import './cover.scss'
import { view } from '../../custom/modal/modal.js'

function mountCover(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування КЛІКІВ в межах компонента
   rootEl.addEventListener('click', (e) => {
      const contactBtn = e.target.closest('[data-name="view-contact-form"]');
      if (contactBtn && rootEl.contains(contactBtn)) {
         view('contact-form');
      }
   }, { signal });

   // Приклад прямого слухача для input (якщо є)
   const qtyInput = rootEl.querySelector('input[name="quantity"]');
   if (qtyInput) {
      qtyInput.addEventListener('input', () => {
         // calcTotalCost();
      }, { signal, passive: true });
   }

   return () => ac.abort();
}

// Приклад автозапуску, якщо компонент одиничний і вже в DOM:
const rootCover = document.querySelector('.cover');
if (rootCover) {
   const cleanup = mountCover(rootCover);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}