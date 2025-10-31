import './T-shirtPrintingTechnologies.scss'

import { view } from '../../custom/modal/modal.js'

function mountPrintingTechnologies(rootEl) {
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
const rootPrintingTechnologies = document.querySelector('[data-component="T-shirtPrintingTechnologies"][data-part="root"]');
if (rootPrintingTechnologies) {
   const cleanup = mountPrintingTechnologies(rootPrintingTechnologies);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}