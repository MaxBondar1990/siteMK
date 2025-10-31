import './SEO-txt_t-shirts.scss'

import { view } from '../../custom/modal/modal.js'

function mountSeoTxt(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування КЛІКІВ в межах компонента
   rootEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="open-modal"]');
      if (!btn || !rootEl.contains(btn)) return;
      const target = btn.dataset.target || 'contact-form';
      view(target);
   }, { signal });

   //// Приклад прямого слухача для input (якщо є)
   //const qtyInput = rootEl.querySelector('input[name="quantity"]');
   //if (qtyInput) {
   //   qtyInput.addEventListener('input', () => {
   //      // calcTotalCost();
   //   }, { signal, passive: true });
   //}

   return () => ac.abort();
}

// Приклад автозапуску, якщо компонент одиничний і вже в DOM:
const rootSeoTxt = document.querySelector('[data-component="SEO-txt_t-shirts"][data-part="root"]');
if (rootSeoTxt) {
   const cleanup = mountSeoTxt(rootSeoTxt);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}