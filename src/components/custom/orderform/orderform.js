import "./orderform.scss";
import '../../fetch/submitContactForm/submitContactForm.js';

import { loadContent, isRequiredInput } from '../../globalBlokcs/fetch/fetch.js'
import { close } from '../../custom/modal/modal.js';

// Centralized selectors
const SELECTORS = {
   modal: '.order-form', // match your provided HTML root
   qty: 'input[name="quantity"]',
   total: '[data-name="total-cost"]',
   color: '[data-order-form-color]',
   price: '[data-name="product-cost"]', // optional explicit unit price
   unitPriceAttr: 'data-unit-price',      // optional fallback on the root
};

// Cached refs
let root, quantityInput, totalElement, colorElement;

// Reuse a single number formatter
const numberFmt = new Intl.NumberFormat("uk-UA", {
   minimumFractionDigits: 2,
   maximumFractionDigits: 2,
});

// Public: initialize module (safe if modal not present yet)
export function initOrderForm(rootNode = document.querySelector(SELECTORS.modal)) {
   root = rootNode;
   if (!root) return;

   quantityInput = root.querySelector(SELECTORS.qty);
   totalElement = root.querySelector(SELECTORS.total);
   colorElement = root.querySelector(SELECTORS.color);

   // Cache a unit price if provided via attribute (data-unit-price)
   if (root.hasAttribute(SELECTORS.unitPriceAttr)) {
      const raw = root.getAttribute(SELECTORS.unitPriceAttr);
      const val = parseNumber(raw);
      if (val > 0) root.dataset.unitPrice = String(val);
   }

   if (quantityInput) {
      quantityInput.addEventListener("input", calcTotalCost);
   }

   // Initial calculation (in case there is a default qty)
   calcTotalCost();
}

// Public: update chosen color text + class
export function setColor(color) {
   // lazy resolve if not yet cached
   if (!colorElement) {
      colorElement = (root || document).querySelector(SELECTORS.color);
      if (!colorElement) return;
   }

   colorElement.textContent = color;

   // Remove previous classes starting with "col"
   for (const cls of [...colorElement.classList]) {
      if (cls.startsWith("col")) {
         colorElement.classList.remove(cls);
      }
   }
   // Add new class like col016
   colorElement.classList.add(`col${color}`);
}

// Public: recalc total price
export function calcTotalCost() {
   // Ensure total element exists
   if (!totalElement) {
      totalElement = (root || document).querySelector(SELECTORS.total);
      if (!totalElement) return;
   }

   // 1) Prefer explicit unit price element
   const priceElement = document.querySelector(SELECTORS.price);
   let unitPrice = priceElement ? parseNumber(priceElement.textContent) : 0;

   // 2) Fallback to cached data-unit-price on the root
   if (!unitPrice && root && root.dataset.unitPrice) {
      unitPrice = parseNumber(root.dataset.unitPrice);
   }

   // 3) Fallback to deriving from current total when qty is 1
   const qty = quantityInput ? (parseInt(quantityInput.value, 10) || 1) : 1;
   if (!unitPrice && qty === 1) {
      unitPrice = parseNumber(totalElement.textContent);
   }

   if (!unitPrice) return; // nothing to calculate

   const total = unitPrice * qty;
   setTotalCost(total);
}

// Format and write total (UAH)
function setTotalCost(cost) {
   // lazy resolve in case init wasn't called yet
   if (!totalElement) {
      totalElement = (root || document).querySelector(SELECTORS.total);
      if (!totalElement) return;
   }
   totalElement.textContent = `${numberFmt.format(cost)} грн.`;
}

// Helpers
function parseNumber(text) {
   // Normalize spaces and decimal separators (supports "2 170", "2,170.50", "2 170,50")
   const normalized = String(text).replace(/\s/g, "").replace(",", ".");
   const n = parseFloat(normalized);
   return Number.isFinite(n) ? n : 0;
}

// Auto-init when DOM is ready (safe to include on any page)
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", () => initOrderForm());
} else {
   initOrderForm();
}
// -------------------------------------------------------------------------

function mountCover(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування КЛІКІВ в межах компонента
   rootEl.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-send-order-form]');
      if (!btn || !rootEl.contains(btn) || (btn.type && btn.type !== 'submit')) return;

      e.preventDefault();
      const form = btn.form || e.target.form;
      if (!form) return;

      if (!isRequiredInput(form)) return;

      const formData = new FormData(form);
      // todo add title, color, etc
      const formName = form.getAttribute('name');
      if (formName) formData.append('formName', formName);

      try {
         const res = await loadContent('submitOrderForm', formData, undefined, 'json');
         if (res && res.status === 'success') {
            if (res.html) {
               document.body.insertAdjacentHTML('beforeend', res.html);
            }
            // Close the surrounding modal (if order form is inside a modal)
            const modalRoot = rootEl.closest('[data-component="modal"][data-part="root"]');
            if (modalRoot && typeof close === 'function') {
               try { close(modalRoot); } catch (_) { const target = modalRoot.getAttribute('data-target'); if (target) try { close(target); } catch (_) { } }
            }
            // Emit event for external listeners (analytics, etc.)
            rootEl.dispatchEvent(new CustomEvent('orderform:success', { bubbles: true, detail: res }));
         } else {
            // On error/timeout we do not close the form/modal; you can optionally show a fallback message here
            rootEl.dispatchEvent(new CustomEvent('orderform:error', { bubbles: true, detail: res }));
         }
      } catch (err) {
         // Network or unexpected error — leave form open
         rootEl.dispatchEvent(new CustomEvent('orderform:error', { bubbles: true, detail: { message: String(err) } }));
      }
   }, { signal });

   return () => ac.abort();
}

// Приклад автозапуску, якщо компонент одиничний і вже в DOM:
const rootOrderForm = document.querySelector(SELECTORS.modal);
if (rootOrderForm) {
   initOrderForm(rootOrderForm);
   const cleanup = mountCover(rootOrderForm);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}