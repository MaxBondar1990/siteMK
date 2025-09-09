import './printingTariff.scss'

function switchTariffTab (event) {
  const btn = event.target.closest('[data-btn="tariff-tab"]');
  if (!btn) return;

  const tabs = document.querySelectorAll('[data-btn="tariff-tab"]');
  const tables = document.querySelectorAll('[data-name="tariff-table"]');

  const index = Array.from(tabs).indexOf(btn);

  tabs.forEach(t => t.classList.remove("_active"));
  tables.forEach(table => table.classList.remove("_active"));

  btn.classList.add("_active");
  tables[index].classList.add("_active");
}

document.addEventListener('click', (event) => {
   switchTariffTab(event);

});