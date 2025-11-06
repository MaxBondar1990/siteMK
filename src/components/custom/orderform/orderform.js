import "./orderform.scss";
import '../../fetch/submitContactForm/submitContactForm.js';

import { loadContent, isRequiredInput } from '../../globalBlokcs/fetch/fetch.js'
import { close } from '../../custom/modal/modal.js';

// Centralized selectors (component-first)
const SELECTORS = {
   root: '[data-component="order-form"][data-part="root"]',
   form: '[data-part="form"]',
   qty: 'input[name="quantity"]',
   total: '[data-name="total-cost"]',
   color: '[data-order-form-color]',
   price: '[data-name="product-cost"]', // optional explicit unit price
};

function getArticleRoot(node) {
   return node?.closest('section.article, [itemscope][itemtype="https://schema.org/Product"]') || null;
}

// Cached refs (per mount)
let root, quantityInput, totalElement, colorElement;

// Reuse a single number formatter
const numberFmt = new Intl.NumberFormat("uk-UA", {
   minimumFractionDigits: 2,
   maximumFractionDigits: 2,
});

// ---------------- Logic helpers ----------------
function parseNumber(text) {
   const normalized = String(text).replace(/\s/g, "").replace(",", ".");
   const n = parseFloat(normalized);
   return Number.isFinite(n) ? n : 0;
}

function setTotalCost(cost) {
   if (!totalElement) return;
   totalElement.textContent = `${numberFmt.format(cost)} грн.`;
}

function syncUnitPriceFromVisible() {
   if (!totalElement) return;
   const qty = quantityInput ? (parseInt(quantityInput.value, 10) || 1) : 1;
   const article = getArticleRoot(root);
   const priceElement = article ? article.querySelector(SELECTORS.price) : (root ? root.querySelector(SELECTORS.price) : null);
   let unitPrice = priceElement ? parseNumber(priceElement.textContent) : 0;
   if (!unitPrice) {
      const totalVisible = parseNumber(totalElement.textContent);
      if (totalVisible && qty > 0) unitPrice = totalVisible / qty;
   }
   if (unitPrice) {
      totalElement.setAttribute('data-unit-price', String(unitPrice));
   }
}

export function calcTotalCost() {
   if (!totalElement) return;
   const qty = quantityInput ? (parseInt(quantityInput.value, 10) || 1) : 1;

   const article = getArticleRoot(root);
   const priceElement = article ? article.querySelector(SELECTORS.price) : (root ? root.querySelector(SELECTORS.price) : null);
   let unitPrice = priceElement ? parseNumber(priceElement.textContent) : 0;

   if (!unitPrice) {
      const totalVisible = parseNumber(totalElement.textContent);
      if (totalVisible && qty > 0) unitPrice = totalVisible / qty;
   }

   if (!unitPrice && totalElement?.dataset?.unitPrice) {
      unitPrice = parseNumber(totalElement.dataset.unitPrice);
   }

   if (!unitPrice) return;
   setTotalCost(unitPrice * qty);
   syncUnitPriceFromVisible();
}

export function setColor(color) {
   if (!colorElement) return;
   colorElement.textContent = color;
   colorElement.setAttribute('data-article-color', String(color));

   for (const cls of [...colorElement.classList]) {
      if (cls.startsWith('col')) colorElement.classList.remove(cls);
   }
   colorElement.classList.add(`col${color}`);
}

export function initOrderForm(rootNode = document.querySelector(SELECTORS.root)) {
   root = rootNode;
   if (!root) return;

   quantityInput = root.querySelector(SELECTORS.qty);
   totalElement = root.querySelector(SELECTORS.total);
   colorElement = root.querySelector(SELECTORS.color);

   if (quantityInput) {
      quantityInput.addEventListener('input', calcTotalCost);
   }
   if (totalElement) calcTotalCost();

   try {
      const mo = new MutationObserver(() => syncUnitPriceFromVisible());
      if (totalElement) mo.observe(totalElement, { characterData: true, childList: true, subtree: true });
      const article = getArticleRoot(root);
      const priceEl = article ? article.querySelector(SELECTORS.price) : (root ? root.querySelector(SELECTORS.price) : null);
      if (priceEl) mo.observe(priceEl, { characterData: true, childList: true, subtree: true });
   } catch (_) { }
}

function populateHiddenMeta(form) {
   const hiddens = form.querySelectorAll('input[type="hidden"][data-source]');
   hiddens.forEach((input) => {
      const srcSel = input.getAttribute('data-source');
      const attr = input.getAttribute('data-attr');
      const useText = input.hasAttribute('data-text');
      const srcEl = form.closest(SELECTORS.root)?.querySelector(srcSel) || form.querySelector(srcSel);
      if (!srcEl) return;
      let val = '';
      if (attr) val = srcEl.getAttribute(attr) || '';
      else if (useText) val = (srcEl.textContent || '').trim();
      else val = (srcEl.value || srcEl.textContent || '').trim();
      if (val !== '') input.value = val;
   });
}

function mountOrderForm(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   rootEl.addEventListener('click', (e) => {
      const submitEl = e.target.closest('[data-action="submit-order"]');
      if (!submitEl || !rootEl.contains(submitEl)) return;
      const form = submitEl.form || rootEl.querySelector(SELECTORS.form) || submitEl.closest('form');
      if (!form) return;
      e.preventDefault();
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
   }, { signal });

   rootEl.addEventListener('submit', async (e) => {
      const form = e.target.closest(SELECTORS.form) || e.target.closest('form');
      if (!form || !rootEl.contains(form)) return;
      e.preventDefault();

      if (typeof isRequiredInput === 'function' && isRequiredInput(form) === false) return;
      try { populateHiddenMeta(form); } catch (_) { }
      const formData = new FormData();
      const formName = form.getAttribute('name');
      if (formName) formData.append('formName', formName);

      const articleIdInput = form.querySelector('input[name="article_id"]');
      let articleId = articleIdInput ? (articleIdInput.value || '').trim() : '';
      if (!articleId) articleId = (rootEl.getAttribute('data-article-id') || '').trim();
      if (!articleId) {
         const src = rootEl.querySelector('[data-article-id]');
         if (src) articleId = (src.getAttribute('data-article-id') || src.textContent || '').trim();
      }
      if (articleId) formData.append('article_id', articleId);

      const qty = quantityInput ? (parseInt(quantityInput.value, 10) || 1) : 1;
      formData.append('quantity', String(qty));

      const colorInput = form.querySelector('input[name="color_code"]');
      const sizeInput = form.querySelector('input[name="size"]');
      const colorVal = colorInput ? (colorInput.value || '').trim() : (colorElement?.dataset?.articleColor || '').trim();
      const sizeVal = sizeInput ? (sizeInput.value || '').trim() : '';
      if (colorVal) formData.append('color_code', colorVal);
      if (sizeVal) formData.append('size', sizeVal);

      const nameInput = form.querySelector('input[name="name"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      const emailInput = form.querySelector('input[name="email"]');
      if (nameInput) formData.append('name', (nameInput.value || '').trim());
      if (phoneInput) formData.append('phone', (phoneInput.value || '').trim());
      if (emailInput) formData.append('email', (emailInput.value || '').trim());

      try {
         const res = await loadContent('submitOrderForm', formData, undefined, 'json');
         if (res && res.status === 'ok') {
            const modalRoot = rootEl.closest('[data-component="modal"][data-part="root"]');
            if (modalRoot && typeof close === 'function') {
               try {
                  close(modalRoot);
               } catch (_) { }
            }

            if (res && typeof res.html === 'string' && res.html.trim()) {
               setTimeout(() => {
                  document.body.insertAdjacentHTML('beforeend', res.html);
               }, 600);
            }
            rootEl.dispatchEvent(new CustomEvent('orderform:success', { bubbles: true, detail: res }));
         } else {
            if (res && typeof res.html === 'string' && res.html.trim()) {
               document.body.insertAdjacentHTML('beforeend', res.html);
            }
            rootEl.dispatchEvent(new CustomEvent('orderform:error', { bubbles: true, detail: res }));
         }
      } catch (err) {
         rootEl.dispatchEvent(new CustomEvent('orderform:error', { bubbles: true, detail: { message: String(err) } }));
      }
   }, { signal, capture: true });

   return () => ac.abort();
}

const rootOrderForm = document.querySelector(SELECTORS.root);
if (rootOrderForm) {
   initOrderForm(rootOrderForm);
   const cleanup = mountOrderForm(rootOrderForm);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}