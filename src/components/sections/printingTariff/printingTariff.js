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

      const unitPrice = parseNumber(context.price);
      const colorsLabel = context.colorsLabel || '';
      if (!Number.isFinite(qtyNum) || !Number.isFinite(unitPrice)) return;

      // Billable qty: if entered qty is below the smallest tier, charge the minimum lot
      let billableQty = qtyNum;
      const breakpoints = getBreakpointsFromHeader(context.headerRow);
      if (breakpoints.length) {
         const minBp = breakpoints[0];
         if (qtyNum < minBp) billableQty = minBp;
      }

      const total = billableQty * unitPrice;

      const setInner = (sel, value) => {
         const el = note.querySelector(sel);
         if (el) el.textContent = value;
      };

      const set = (sel, value) => {
         const el = note.querySelector(sel);
         if (!el) return;
         // If target is a form control, write to .value; otherwise to textContent
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
      set('[data-note="unit-price"]', unitPrice.toFixed(2));
      set('[data-note="calc-qty"]', formatNumberUA(qtyNum));
      set('[data-note="calc-price"]', unitPrice.toFixed(2));
      set('[data-note="calc-sum"]', formatNumberUA(total.toFixed(2)));
      set('[data-note="total-sum"]', formatNumberUA(total.toFixed(0)));
      set('[data-note="total-qty"]', formatNumberUA(qtyNum));
      set('[data-note="total-colors"]', colorsLabel);

      // Keep the Add-to-cart button in sync with current selection
      syncAddButton(context, qtyNum);
   }

   function syncAddButton(context, qtyNum) {
      const addBtn = rootEl.querySelector('.tariff__printing-order-btn');
      if (!addBtn) return;

      // Ensure it is wired for cart component
      addBtn.setAttribute('data-action', 'add-to-cart');

      const sku = rootEl.getAttribute('data-printing-sku') || rootEl.getAttribute('data-sku') || '';
      if (sku) addBtn.setAttribute('data-id', sku);

      // Mark as service item
      addBtn.setAttribute('data-type', 'service');

      // Row key and qty
      const rowKey = context.rowKey || '';
      if (rowKey) addBtn.setAttribute('data-color', rowKey);

      const q = Number.isFinite(qtyNum) && qtyNum > 0 ? qtyNum : 1;
      addBtn.setAttribute('data-qty', String(q));

      // Optional: pass unit price for convenience (backend is the source of truth)
      const unitPrice = parseNumber(context.price);
      if (Number.isFinite(unitPrice)) addBtn.setAttribute('data-price', String(unitPrice.toFixed(2)));
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

      const finalQty = qtyForSync ?? (Number.parseInt((qtyEl?.value || '1').replace(/\D/g, ''), 10) || 1);
      syncAddButton(ctx, finalQty);
   }

   // Делегування кліків у межах компонента
   rootEl.addEventListener('click', (e) => {
      // Stop demo on first user interaction
      if (!previewStopped) stopAutoPreview();
      switchTariffTab(e);
      handleTariffPriceClick(e);
   }, { signal });

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

   // Prepare Add-to-cart button with action hook
   (function initAddBtn() {
      const addBtn = rootEl.querySelector('.tariff__printing-order-btn');
      if (addBtn) addBtn.setAttribute('data-action', 'add-to-cart');
   })();

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