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

function syncUnitPriceFromVisible() {
   if (!totalElement) return;
   const qty = quantityInput ? (parseInt(quantityInput.value, 10) || 1) : 1;
   const priceElement = document.querySelector(SELECTORS.price);
   let unitPrice = priceElement ? parseNumber(priceElement.textContent) : 0;
   if (!unitPrice) {
      const totalVisible = parseNumber(totalElement.textContent);
      if (totalVisible && qty > 0) unitPrice = totalVisible / qty;
   }
   if (unitPrice) {
      totalElement.setAttribute('data-unit-price', numberFmt.format(unitPrice).replace(/\s/g, '').replace(',', '.'));
   }
}

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

   // Observe VISIBLE changes of total or unit price to keep data-unit-price in sync
   try {
      const mo = new MutationObserver(() => syncUnitPriceFromVisible());
      if (totalElement) mo.observe(totalElement, { characterData: true, childList: true, subtree: true });
      const priceEl = document.querySelector(SELECTORS.price);
      if (priceEl) mo.observe(priceEl, { characterData: true, childList: true, subtree: true });
   } catch (_) { }

   // Also recalc on generic changes inside the form (e.g., variant selects)
   root.addEventListener('change', () => calcTotalCost());
}

// Public: update chosen color text + class
export function setColor(color) {
   // lazy resolve if not yet cached
   if (!colorElement) {
      colorElement = (root || document).querySelector(SELECTORS.color);
      if (!colorElement) return;
   }

   colorElement.textContent = color;
   colorElement.setAttribute('data-article-color', String(color));

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

   // Current quantity from visible input
   const qty = quantityInput ? (parseInt(quantityInput.value, 10) || 1) : 1;

   // 1) Prefer VISIBLE unit price element, if exists
   const priceElement = document.querySelector(SELECTORS.price);
   let unitPrice = priceElement ? parseNumber(priceElement.textContent) : 0;

   // 2) If not found, derive from VISIBLE total text (amount / qty)
   if (!unitPrice) {
      const totalVisible = parseNumber(totalElement.textContent);
      if (totalVisible && qty > 0) {
         unitPrice = totalVisible / qty;
      }
   }

   // 3) Legacy fallback: cached data-unit-price (root)
   if (!unitPrice && root && root.dataset.unitPrice) {
      unitPrice = parseNumber(root.dataset.unitPrice);
   }

   // 4) Legacy fallback: data-unit-price on the total element
   if (!unitPrice && totalElement?.dataset?.unitPrice) {
      unitPrice = parseNumber(totalElement.dataset.unitPrice);
   }

   if (!unitPrice) return; // nothing to calculate

   const total = unitPrice * qty;
   setTotalCost(total);

   // Keep data-unit-price in sync with the visible/derived unit price
   syncUnitPriceFromVisible();
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

      // Collect visible meta from DOM and append to FormData (prefer VISIBLE text)
      const titleEl = rootEl.querySelector('[data-article-title]');
      const subtitleEl = rootEl.querySelector('[data-article-subtitle]');
      const idEl = rootEl.querySelector('[data-article-id]');
      const colorEl = rootEl.querySelector('[data-article-color]');
      const totalEl = rootEl.querySelector('[data-name="total-cost"]');

      const articleTitle = (titleEl?.textContent || titleEl?.dataset.articleTitle || '').trim();
      const articleSubtitle = (subtitleEl?.textContent || subtitleEl?.dataset.articleSubtitle || '').trim();
      const articleId = (idEl?.textContent || idEl?.dataset.articleId || '').trim();
      const articleColor = (colorEl?.textContent || colorEl?.dataset.articleColor || '').trim();

      if (articleTitle) formData.set('article_title', articleTitle);
      if (articleSubtitle) formData.set('article_subtitle', articleSubtitle);
      if (articleId) formData.set('article_id', articleId);
      if (articleColor) formData.set('color', articleColor);
      if (totalEl) formData.set('total', totalEl.textContent.trim());

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