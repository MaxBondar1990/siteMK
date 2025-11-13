import './pricing_landing.scss'
import { view } from '../../custom/modal/modal.js'

function mountPricing(rootEl) {
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
const rootPricing = document.querySelector('[data-component="pricing_T-shirts"][data-part="root"]');
if (rootPricing) {
   const cleanup = mountPricing(rootPricing);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}