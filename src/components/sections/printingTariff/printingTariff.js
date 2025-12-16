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

      // try to get a machine row key (e.g., "3+0") from dataset
      let rowKey = tr.getAttribute('data-row')
         || tr.children[0]?.getAttribute?.('data-row')
         || null;
      if (!rowKey) {
         // fallback: attempt to normalize from label like "3+0 кольори"
         const m = colorsLabel.match(/(CMYK\s*\+\s*білий|CMYK|\d+\s*\+\s*\d+)/i);
         rowKey = m ? m[1].replace(/\s+/g, '').toUpperCase() : null;
      }

      // price from td (prefer data-price)
      let price = td.getAttribute('data-price');
      if (!price) price = td.textContent.trim();

      // Skip placeholders like '-' or empty cells
      if (!price || /^[-–—]$/.test(price.trim())) return null;

      return { table, tr, headerRow, td, qty, colorsLabel, rowKey, price };
   }

   function clearSelections(context) {
      const { table, headerRow } = context;
      table.querySelectorAll('._selected, ._selected').forEach(el => el.classList.remove('_selected'));
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

   function getHeaderRow(table) {
      const rows = Array.from(table.querySelectorAll('tr'));
      return rows.find(r => r.matches('.tariff__head, thead tr')) || rows[0] || null;
   }

   function parseQtyFromHeaderCell(cell) {
      if (!cell) return null;
      const raw = cell.getAttribute('data-qty') || cell.textContent || '';
      const n = Number.parseInt(String(raw).replace(/\D/g, ''), 10);
      return Number.isFinite(n) ? n : null;
   }

   function getBreakpointsFromHeader(headerRow) {
      const out = [];
      if (!headerRow) return out;
      Array.from(headerRow.children).forEach((cell) => {
         const q = parseQtyFromHeaderCell(cell);
         if (Number.isFinite(q)) out.push(q);
      });
      return out.sort((a, b) => a - b);
   }

   function findBestQtyColumnIndex(table, desiredQty) {
      const header = getHeaderRow(table);
      if (!header) return null;
      const cells = Array.from(header.children);

      // Collect numeric breakpoints with their indices
      const bps = [];
      for (let i = 0; i < cells.length; i++) {
         const q = parseQtyFromHeaderCell(cells[i]);
         if (Number.isFinite(q)) bps.push({ q, i });
      }
      if (!bps.length) return null;

      // Sort ASC by quantity
      bps.sort((a, b) => a.q - b.q);

      // FLOOR logic: pick the largest breakpoint <= desiredQty
      let candidate = null;
      for (const bp of bps) {
         if (bp.q <= desiredQty) candidate = bp; else break;
      }

      if (candidate) return candidate.i; // largest <= desired

      // If desired is below the minimum, return the smallest breakpoint (charge minimum lot)
      return bps[0].i;
   }

   function getRowForSelection(table, fallbackColIndex) {
      // Prefer currently selected row; otherwise first row with a valid price in the column
      const selectedCell = table.querySelector('td._selected, td[data-price]._selected, td[data-tariff="price"]._selected');
      if (selectedCell) return selectedCell.closest('tr');
      const rows = Array.from(table.querySelectorAll('tbody tr, tr')).filter(r => !r.matches('.tariff__head, thead tr'));
      for (const r of rows) {
         const td = r.children[fallbackColIndex];
         if (!td) continue;
         const val = (td.getAttribute('data-price') || td.textContent || '').trim();
         if (val && !/^[-–—]$/.test(val)) return r;
      }
      return rows[0] || null;
   }

   function getCurrentSelectionContext() {
      const table = pickActiveTable();
      if (!table) return null;
      const td = table.querySelector('td._selected, td[data-price]._selected, td[data-tariff="price"]._selected');
      return td ? getCellContext(td) : null;
   }

   function updateNote(context) {
      const note = rootEl.querySelector('[data-name="tariff-note"], .tariff__note');
      if (!note) return;

      // Derive quantity: during preview enforce context -> input; after preview prefer user's input
      let qtyNum = null;
      const qtyEl = note.querySelector('[data-note="qty"]');
      const ctxQtyParsed = Number.parseInt(String(context.qty ?? '').replace(/\D/g, ''), 10);

      if (!previewStopped) {
         // Auto-presentation: always sync from context to input + number
         if (Number.isFinite(ctxQtyParsed) && ctxQtyParsed > 0) {
            qtyNum = ctxQtyParsed;
            if (qtyEl) {
               const tag = qtyEl.tagName?.toLowerCase();
               if (tag === 'input' || tag === 'textarea' || tag === 'select') qtyEl.value = String(qtyNum);
               else qtyEl.textContent = String(qtyNum);
            }
         }
      } else {
         // User control: prefer input value first
         if (qtyEl && (qtyEl.tagName?.toLowerCase() === 'input' || qtyEl.tagName?.toLowerCase() === 'textarea')) {
            const raw = qtyEl.value;
            const parsed = Number.parseInt(String(raw).replace(/\D/g, ''), 10);
            if (Number.isFinite(parsed) && parsed > 0) qtyNum = parsed;
         }
         if (!Number.isFinite(qtyNum)) qtyNum = ctxQtyParsed;
      }

      const baseUnitPrice = parseNumber(context.price);
      const colorsLabel = context.colorsLabel || '';
      if (!Number.isFinite(qtyNum) || !Number.isFinite(baseUnitPrice)) return;

      // Billable qty: if entered qty is below the smallest tier, charge the minimum lot
      let billableQty = qtyNum;
      const breakpoints = getBreakpointsFromHeader(context.headerRow);
      if (breakpoints.length) {
         const minBp = breakpoints[0];
         if (qtyNum < minBp) billableQty = minBp;
      }

      // Total за прайсовою логікою
      const total = billableQty * baseUnitPrice;

      // Ефективна ціна за 1 нанесення для фактичної кількості
      // (щоб у нотатці 38 × ефективна_ціна = 3250, а не 50 × 65)
      let effectiveUnitPrice = baseUnitPrice;
      if (qtyNum > 0) {
         effectiveUnitPrice = total / qtyNum;
      }

      const setInner = (sel, value) => {
         const el = note.querySelector(sel);
         if (el) el.textContent = value;
      };

      const set = (sel, value) => {
         const el = note.querySelector(sel);
         if (!el) return;
         const tag = el.tagName?.toLowerCase();
         if (tag === 'input' || tag === 'textarea' || tag === 'select') {
            el.value = String(value);
         } else {
            el.textContent = String(value);
         }
      };

      set('[data-note="qty"]', qtyNum);
      set('[data-note="colors-label"]', colorsLabel);
      set('[data-note="unit-qty"]', '1');
      set('[data-note="unit-price"]', effectiveUnitPrice.toFixed(2));
      set('[data-note="calc-qty"]', formatNumberUA(qtyNum));
      set('[data-note="calc-price"]', effectiveUnitPrice.toFixed(2));
      set('[data-note="calc-sum"]', formatNumberUA(total.toFixed(2)));
      set('[data-note="total-sum"]', formatNumberUA(total.toFixed(0)));
      set('[data-note="total-qty"]', formatNumberUA(qtyNum));
      set('[data-note="total-colors"]', colorsLabel);
   }


   function handleTariffPriceClick(event) {
      const cell = event.target.closest('[data-tariff="price"], td[data-price], td[data-tariff]');
      if (!cell || !rootEl.contains(cell)) return;
      const ctx = getCellContext(cell);
      if (!ctx) return;
      clearSelections(ctx);
      applySelections(ctx);

      // First sync qty input with the selected column (e.g., "від 20", "від 50")
      const note = rootEl.querySelector('[data-name="tariff-note"], .tariff__note');
      const qtyEl = note?.querySelector('[data-note="qty"]');
      let qtyForSync = null;
      if (qtyEl && ctx.qty) {
         const parsedQty = Number.parseInt(String(ctx.qty).replace(/\D/g, ''), 10);
         if (Number.isFinite(parsedQty) && parsedQty > 0) {
            const tag = qtyEl.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') {
               qtyEl.value = String(parsedQty);
            } else {
               qtyEl.textContent = String(parsedQty);
            }
            qtyForSync = parsedQty;
         }
      }

      // Recalculate note using the updated qty
      updateNote(ctx);
   }

   // Делегування кліків у межах компонента
   rootEl.addEventListener(
      'click',
      (e) => {
         // Stop demo on first user interaction
         if (!previewStopped) stopAutoPreview();

         const t = e.target;

         // 1) Додати друк до корзини
         const addBtn = t.closest('[data-action="tariff-add-to-cart"]');
         if (addBtn && rootEl.contains(addBtn)) {
            handlePrintingAddToCart(rootEl, addBtn);
            return;
         }

         // 2) Перемикання табів тарифів
         switchTariffTab(e);

         // 3) Клік по клітинці з ціною
         handleTariffPriceClick(e);
      },
      { signal }
   );

   const note = rootEl.querySelector('[data-name="tariff-note"], .tariff__note');
   const qtyInput = note?.querySelector('[data-note="qty"]');
   if (qtyInput) {
      qtyInput.addEventListener('input', () => {
         // Any manual input should stop the auto presentation
         if (!previewStopped) stopAutoPreview();

         const raw = qtyInput.value;
         const typedQty = Number.parseInt(String(raw).replace(/\D/g, ''), 10);
         if (!Number.isFinite(typedQty) || typedQty <= 0) return;

         const table = pickActiveTable();
         if (!table) return;

         const colIndex = findBestQtyColumnIndex(table, typedQty);
         if (colIndex == null) return;

         const header = getHeaderRow(table);
         if (!header) return;

         // Pick row: current selection if any, otherwise first valid row in that column
         const row = getRowForSelection(table, colIndex);
         if (!row) return;

         const td = row.children[colIndex];
         if (!td) return;

         const ctx = getCellContext(td);
         if (!ctx) return;

         clearSelections(ctx);
         applySelections(ctx);
         updateNote(ctx);
      }, { signal });
   }


   // Додавання друку в корзину як сервіс
   function handlePrintingAddToCart(rootEl, btn) {
      if (!rootEl || !btn) return;
      if (!window.cartAPI || typeof window.cartAPI.addToCart !== 'function') return;

      // Активна вкладка (таба)
      const activeTabBtn = rootEl.querySelector('[data-btn="tariff-tab"]._active');

      // Поточний вибраний тариф (контекст клітинки таблиці)
      let ctx = getCurrentSelectionContext();
      const table = ctx?.table || pickActiveTable();
      // If no ctx but table is present, reconstruct a context from qty input
      if (!ctx && table) {
         const note = rootEl.querySelector('[data-name="tariff-note"], .tariff__note');
         const qtyInput = note?.querySelector('[data-note="qty"]');
         let desiredQty = null;
         if (qtyInput) {
            const raw = qtyInput.value || qtyInput.textContent || '';
            const n = Number.parseInt(String(raw).replace(/\D/g, ''), 10);
            if (Number.isFinite(n) && n > 0) desiredQty = n;
         }
         // fallback to min breakpoint if not parsed
         const headerRow = getHeaderRow(table);
         // If headerRow is missing, abort
         if (headerRow) {
            // findBestQtyColumnIndex expects a number (use 1 if not set)
            const colIndex = findBestQtyColumnIndex(table, desiredQty || 1);
            if (colIndex != null) {
               const row = getRowForSelection(table, colIndex);
               if (row && row.children && row.children[colIndex]) {
                  ctx = getCellContext(row.children[colIndex]);
               }
            }
         }
      }

      // Технологія друку (decal / sublimation / і т.д.) з таблиці, кнопки або rootEl (також перевіряємо data-tech)
      const tech =
         (table &&
            (
               table.getAttribute('data-print-tech') ||
               table.dataset.printTech ||
               table.getAttribute('data-tech') ||
               table.dataset.tech
            )) ||
         (activeTabBtn &&
            (
               activeTabBtn.getAttribute('data-print-tech') ||
               activeTabBtn.dataset.printTech ||
               activeTabBtn.getAttribute('data-tech') ||
               activeTabBtn.dataset.tech
            )) ||
         (rootEl.getAttribute('data-print-tech') ||
            rootEl.dataset.printTech ||
            rootEl.getAttribute('data-tech') ||
            rootEl.dataset.tech) ||
         null;

      // Розмір (std / a5 / a4 / ...) з таблиці, кнопки або rootEl (також перевіряємо data-size)
      const size =
         (table &&
            (
               table.getAttribute('data-print-size') ||
               table.dataset.printSize ||
               table.getAttribute('data-size') ||
               table.dataset.size
            )) ||
         (activeTabBtn &&
            (
               activeTabBtn.getAttribute('data-print-size') ||
               activeTabBtn.dataset.printSize ||
               activeTabBtn.getAttribute('data-size') ||
               activeTabBtn.dataset.size
            )) ||
         (rootEl.getAttribute('data-print-size') ||
            rootEl.dataset.printSize ||
            rootEl.getAttribute('data-size') ||
            rootEl.dataset.size) ||
         null;

      // Кількість у прайсовій колонці (50 / 100 / 200 / ...)
      let tierQty = null;
      if (ctx && ctx.headerRow && ctx.td) {
         const headerCell = ctx.headerRow.children[ctx.td.cellIndex];
         tierQty = parseQtyFromHeaderCell(headerCell);
      }

      // Код рядка (1+0 / 2+0 / CMYK / ...)
      const rowKey =
         (ctx && ctx.rowKey) ||
         (ctx && ctx.colorsLabel ? ctx.colorsLabel.trim() : null);

      // Прайс‑модифікація для CRM, наприклад: "100_1+0"
      let tierCode = null;
      if (Number.isFinite(tierQty) && tierQty > 0 && rowKey) {
         const safeRowKey = String(rowKey).replace(/\s+/g, '');
         tierCode = `${tierQty}_${safeRowKey}`;
      }

      // Базовий id друку (товару в CRM): тех + розмір (наприклад, "decal_std").
      // Якщо з якихось причин tech/size немає, тоді вже падаємо у data-* / секцію.
      let baseId = null;

      if (tech && size) {
         // Основний, канонічний варіант: "decal_std", "sublimation_a4" і т.д.
         baseId = `${tech}_${size}`;
      } else {
         // Fallback: спробувати взяти з data-print-sku на таблиці / кнопці, або з секції
         baseId =
            (table && (table.getAttribute('data-print-sku') || table.dataset.printSku)) ||
            (activeTabBtn && (activeTabBtn.getAttribute('data-print-sku') || activeTabBtn.dataset.printSku)) ||
            rootEl.getAttribute('data-printing-sku') ||
            rootEl.getAttribute('data-sku') ||
            'printing-service';
      }

      const id = baseId;
      const type = 'service';

      // Кількість нанесень із інпута "Кількість нанесень"
      let qty = 1;
      const note = rootEl.querySelector('[data-name="tariff-note"], .tariff__note');
      const qtyInput = note?.querySelector('[data-note="qty"]');
      if (qtyInput) {
         const raw = qtyInput.value || qtyInput.textContent || '';
         const n = Number.parseInt(String(raw).replace(/\D/g, ''), 10);
         if (Number.isFinite(n) && n > 0) qty = n;
      }

      // Загальна вартість з поля "Всього" (для контролю / можливих розрахунків)
      let totalPrice = 0;
      const totalSumEl = note?.querySelector('[data-note="total-sum"]');
      if (totalSumEl) {
         const raw = (totalSumEl.textContent || '').trim();
         const num = parseNumber(raw); // parseNumber вже є у файлі вище
         if (Number.isFinite(num) && num >= 0) totalPrice = num;
      }

      // Ціна за 1 нанесення:
      //  1) основний варіант — totalPrice / qty (щоб CRM завжди множив "фактичну кількість × ефективну ціну"),
      //  2) якщо totalPrice або qty відсутні — fallback до unit-price з нотатки.
      let unitPrice = 0;

      if (Number.isFinite(totalPrice) && totalPrice > 0 && qty > 0) {
         unitPrice = totalPrice / qty;
      } else {
         const unitPriceEl = note?.querySelector('[data-note="unit-price"]');
         if (unitPriceEl) {
            const raw = (unitPriceEl.textContent || unitPriceEl.value || '').trim();
            const num = parseNumber(raw);
            if (Number.isFinite(num) && num >= 0) unitPrice = num;
         }
      }

      // Опис/варіант друку — з поля total-colors (людське читабельне значення)
      let color = null;
      const colorsEl = note?.querySelector('[data-note="total-colors"]');
      if (colorsEl) {
         const text = colorsEl.textContent.trim();
         if (text) color = text;
      }

      // Назва послуги друку — беремо з активної вкладки (labels.tab[ua] => текст кнопки)
      let serviceName = 'Друк';
      if (activeTabBtn) {
         const txt = activeTabBtn.textContent?.trim();
         if (txt) serviceName = txt;
      }

      // Детальний заголовок тарифу (title.ua з JSON) — очікуємо у data-print-title активної вкладки (якщо є)
      let serviceTitle = null;
      if (activeTabBtn && activeTabBtn.dataset.printTitle) {
         const t = activeTabBtn.dataset.printTitle.trim();
         if (t) serviceTitle = t;
      }

      // Прайсова ціна за 1 нанесення в обраній колонці (з таблиці)
      let tierPrice = null;
      if (ctx && ctx.price != null) {
         const base = parseNumber(ctx.price);
         if (Number.isFinite(base) && base >= 0) {
            tierPrice = base;
         }
      }

      // У корзину передаємо:
      //  - price: ціну за одиницю (як у товарах),
      //  - name: людську назву послуги (Деколь / Сублімація / ...),
      //  - title: повний опис тарифу (може бути null, якщо не заданий у розмітці)
      window.cartAPI.addToCart({
         id,
         type,
         color,
         qty,
         price: unitPrice,   // ефективна ціна
         name: serviceName,
         title: serviceTitle,
         tierPrice,          // прайсовий тариф за 1 шт (для базового тиражу)
         tierQty,            // базовий тираж (50 / 100 / ...)
         tierCode,           // модифікація для CRM, наприклад "100_1+0"
      });
   }

   // kick off demo until user clicks
   startAutoPreview(800);

   return () => {
      ac.abort();
      if (previewTimer) window.clearTimeout(previewTimer);
   };
}

// Автозапуск: підтримка кількох однакових компонентів на сторінці
const printingTariffRoots = document.querySelectorAll(
   '[data-component="printing-tariff"][data-part="root"]'
);

const printingTariffCleanups = [];

printingTariffRoots.forEach((rootEl) => {
   if (!rootEl) return;

   // Захист від подвійного маунта (на випадок повторного імпорту / HMR)
   if (rootEl.dataset.mounted === '1') return;
   rootEl.dataset.mounted = '1';

   const cleanup = mountPrintingTariff(rootEl);
   if (typeof cleanup === 'function') {
      printingTariffCleanups.push(() => {
         try {
            cleanup();
         } finally {
            delete rootEl.dataset.mounted;
         }
      });
   }
});

// HMR: чистимо всі інстанси
if (import.meta.hot) {
   import.meta.hot.dispose(() => {
      while (printingTariffCleanups.length) {
         const fn = printingTariffCleanups.pop();
         try {
            fn && fn();
         } catch (_) {
            // ignore
         }
      }
   });
}