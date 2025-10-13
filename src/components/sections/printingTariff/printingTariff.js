import './printingTariff.scss'

function mountPrintingTariff(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // === Auto-preview (demo) state ===
   let previewTimer = null;
   let previewStopped = false; // becomes true after first user click

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

   // === Tariff selection & calculation ===
   function formatNumberUA(n) {
      try {
         return new Intl.NumberFormat('uk-UA').format(Number(n));
      } catch (_) {
         return String(n);
      }
   }

   function parseNumber(str) {
      // Accept prices like "50.68", "50,68", with spaces in thousands
      const cleaned = String(str).replace(/\s/g, '').replace(',', '.');
      const num = Number.parseFloat(cleaned);
      return Number.isFinite(num) ? num : null;
   }

   function pickActiveTable() {
      return (
         rootEl.querySelector('[data-name="tariff-table"]._active') ||
         rootEl.querySelector('[data-name="tariff-table"]')
      );
   }

   function pickRandomPriceCell(table) {
      if (!table) return null;
      const cells = Array.from(
         table.querySelectorAll('td[data-tariff="price"], td[data-price]')
      ).filter(td => {
         const val = (td.getAttribute('data-price') || td.textContent || '').trim();
         return val && !/^[-–—]$/.test(val);
      });
      if (!cells.length) return null;
      const idx = Math.floor(Math.random() * cells.length);
      return cells[idx];
   }

   function runOnePreviewStep() {
      if (previewStopped) return;
      const table = pickActiveTable();
      const cell = pickRandomPriceCell(table);
      if (!cell) return;
      const ctx = getCellContext(cell);
      if (!ctx) return;
      clearSelections(ctx);
      applySelections(ctx);
      updateNote(ctx);
   }

   function scheduleNextPreview(delayMs) {
      if (previewStopped) return;
      const ms = typeof delayMs === 'number' ? delayMs : 2000 + Math.floor(Math.random() * 1200);
      previewTimer = window.setTimeout(() => {
         runOnePreviewStep();
         scheduleNextPreview();
      }, ms);
   }

   function startAutoPreview(initialDelay = 5000) {
      if (previewStopped) return;
      if (previewTimer) window.clearTimeout(previewTimer);
      scheduleNextPreview(initialDelay);
   }

   function stopAutoPreview() {
      previewStopped = true;
      if (previewTimer) {
         window.clearTimeout(previewTimer);
         previewTimer = null;
      }
   }

   function getCellContext(td) {
      // td is a TD inside [data-name="tariff-table"].
      // Determine column (quantity) and row (colors) from the table structure.
      const tr = td.closest('tr');
      const table = td.closest('[data-name="tariff-table"]');
      if (!tr || !table) return null;

      const colIndex = td.cellIndex; // index among visible cells in the row
      const allRows = Array.from(table.querySelectorAll('tr'));
      const headerRow = allRows.find(r => r.matches('.tariff__head, thead tr')) || allRows[0];
      if (!headerRow) return null;

      // quantity from header cell at same column
      let qty = null;
      const headerCells = Array.from(headerRow.children);
      if (headerCells[colIndex]) {
         const hc = headerCells[colIndex];
         qty = hc.getAttribute('data-qty') || hc.textContent.trim();
      }

      // label for row (for highlighting + echo in note only; not used in calc)
      const colorsLabel = (tr.children[0]?.textContent || '').trim();

      // price from td (prefer data-price)
      let price = td.getAttribute('data-price');
      if (!price) price = td.textContent.trim();

      // Skip placeholders like '-' or empty cells
      if (!price || /^[-–—]$/.test(price.trim())) return null;

      return { table, tr, headerRow, td, qty, colorsLabel, price };
   }

   function clearSelections(context) {
      const { table, headerRow } = context;
      table.querySelectorAll('._selected').forEach(el => el.classList.remove('._selected'));
      // Also remove plain class if some CSS expects without dot-escape
      table.querySelectorAll('._selected').forEach(el => el.classList.remove('_selected'));
      headerRow.querySelectorAll('._selected').forEach(el => el.classList.remove('_selected'));
   }

   function applySelections(context) {
      const { td, tr, headerRow } = context;
      // Price cell
      td.classList.add('_selected');
      // Row label (colors) — usually first cell in row
      if (tr.children[0]) tr.children[0].classList.add('_selected');
      // Column header (quantity)
      if (headerRow.children[td.cellIndex]) headerRow.children[td.cellIndex].classList.add('_selected');
   }

   function updateNote(context) {
      const note = rootEl.querySelector('[data-name="tariff-note"], .tariff__note');
      if (!note) return;

      const qtyNum = parseInt(context.qty?.toString().replace(/\D/g, ''), 10);
      const unitPrice = parseNumber(context.price);
      const colorsLabel = context.colorsLabel || '';

      if (!Number.isFinite(qtyNum) || !Number.isFinite(unitPrice)) {
         // Fallback: just show raw values
         note.textContent = `Кількість футболок ${context.qty || '?'}\nКількість кольорів друку ${context.colorsLabel || '?'}\nВартість одиниці ${context.price || '?'}\n`;
         return;
      }

      const total = qtyNum * unitPrice;
      const qtyFmt = formatNumberUA(qtyNum);
      const unitFmt = unitPrice.toFixed(2);
      const totalFmt = formatNumberUA(total.toFixed(0));

      const lines = [
         // `Кількість нанесень ${qtyFmt}`,
         // `Кількість кольорів друку ${colorsLabel}`,
         // `Вартість нанесення за 1 шт. = ${unitFmt}`,
         // `${qtyFmt} шт. х ${unitFmt} грн. = ${formatNumberUA(total.toFixed(2))} грн.`,
         // `Всього: ${totalFmt} грн. за ${qtyFmt} комплектів в ${colorsLabel}.`

         `<p class="tariff__note-text">Розрахунок вартості нанесення без урахування вартості продукції:</p>`,
         `<p>Кількість нанесень - ${qtyFmt}</p>`,
         `<p>Кількість кольорів друку - ${colorsLabel}</p>`,
         `<p>Вартість нанесення за 1 шт. = ${unitFmt} грн.</p>`,
         `<p>${qtyFmt} шт. х ${unitFmt} грн. = ${formatNumberUA(total.toFixed(2))} грн.</p>`,
         `<p>Всього: ${totalFmt} грн. за ${qtyFmt} комплектів в ${colorsLabel}.</p>`,
         `<br>`,

         // `<p >Розрахунок вартості нанесення з урахування вартості продукції:</p>`,
         // `<p>Вартість продукції ${qtyFmt} грн.</p>`,
         // `<p>${qtyFmt} шт. х (${unitFmt} грн. + ${unitFmt} грн.) = ${formatNumberUA(total.toFixed(2))} грн.</p>`,
         // `<p>Всього: ${totalFmt} грн. за ${qtyFmt} комплектів в ${colorsLabel}.</p>`,
      ];

      // Highlight numeric fragments (quantities, prices, sums)
      const highlighted = lines.map(line =>
         line.replace(/(\d+[\d\s.,]*)/g, '<strong>$1</strong>')
      );
      note.innerHTML = highlighted.join('');
   }

   function handleTariffPriceClick(event) {
      const cell = event.target.closest('[data-tariff="price"], td[data-price], td[data-tariff]');
      if (!cell || !rootEl.contains(cell)) return;
      const ctx = getCellContext(cell);
      if (!ctx) return;
      clearSelections(ctx);
      applySelections(ctx);
      updateNote(ctx);
   }

   // Делегування кліків у межах компонента
   rootEl.addEventListener('click', (e) => {
      // Stop demo on first user interaction
      if (!previewStopped) stopAutoPreview();
      switchTariffTab(e);
      handleTariffPriceClick(e);
   }, { signal });

   // kick off demo until user clicks
   startAutoPreview(800);

   return () => {
      ac.abort();
      if (previewTimer) window.clearTimeout(previewTimer);
   };
}

// Автозапуск, якщо компонент є у DOM
const rootPrintingTariff = document.querySelector('[data-component="printing-tariff"][data-part="root"]');
if (rootPrintingTariff) {
   const cleanup = mountPrintingTariff(rootPrintingTariff);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}