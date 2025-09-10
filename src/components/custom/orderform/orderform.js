import "./orderform.scss";

// Centralized selectors
const SELECTORS = {
   modal: '[data-modal-name="order-form"]',
   qty: 'input[name="quantity"]',
   total: '[data-name="total-cost"]',
   color: '[data-order-form-color]',
   price: '[data-name="product-cost"]', // price label on the product page
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
   // Price may live outside modal (e.g., on product page), so we read from document
   const priceElement = document.querySelector(SELECTORS.price);
   if (!priceElement) return;

   // Ensure total element exists
   if (!totalElement) {
      totalElement = (root || document).querySelector(SELECTORS.total);
      if (!totalElement) return;
   }

   const basePrice = parseNumber(priceElement.textContent);
   const qty = quantityInput ? parseInt(quantityInput.value, 10) || 1 : 1;

   const total = basePrice * qty;
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
