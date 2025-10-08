import './printingTariff.scss'

function mountPrintingTariff(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   function switchTariffTab(event) {
      const btn = event.target.closest('[data-btn="tariff-tab"]');
      if (!btn || !rootEl.contains(btn)) return;

      const tabs = rootEl.querySelectorAll('[data-btn="tariff-tab"]');
      const tables = rootEl.querySelectorAll('[data-name="tariff-table"]');

      const index = Array.from(tabs).indexOf(btn);

      tabs.forEach(t => t.classList.remove('_active'));
      tables.forEach(table => table.classList.remove('_active'));

      btn.classList.add('_active');
      if (tables[index]) tables[index].classList.add('_active');
   }

   // Делегування кліків у межах компонента
   rootEl.addEventListener('click', (e) => {
      switchTariffTab(e);
   }, { signal });

   return () => ac.abort();
}

// Автозапуск, якщо компонент є у DOM
const rootPrintingTariff = document.querySelector('[data-component="printing-tariff"][data-part="root"]');
if (rootPrintingTariff) {
   const cleanup = mountPrintingTariff(rootPrintingTariff);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}