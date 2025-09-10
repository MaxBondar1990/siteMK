import './articleContent.scss'

import { view } from '../../custom/modal/modal.js'
import { setColor, calcTotalCost } from '../../custom/orderform/orderform.js'

// Centralized selectors
const SELECTORS = {
   colorItem: '[data-name="color-items"]',
   productCost: '[data-name="product-cost"]',
   mainImg: '[data-name="mine-img"] img',
   orderBtn: '[data-btn="view-order-form"]',
};

// Cached refs (lazy-resolved when first used)
let costEl, imgEl;

function getCostEl() {
   if (!costEl) costEl = document.querySelector(SELECTORS.productCost);
   return costEl;
}
function getImgEl() {
   if (!imgEl) imgEl = document.querySelector(SELECTORS.mainImg);
   return imgEl;
}

function onDocumentClick(event) {
   // 1) Handle color selection
   const colorNode = event.target.closest(SELECTORS.colorItem);
   if (colorNode) {
      applyColorSelection(colorNode);
      return; // avoid extra work if it's a color click
   }

   // 2) Handle open-order modal button
   const btn = event.target.closest(SELECTORS.orderBtn);
   if (btn) {
      view('order-form');
   }
}

function applyColorSelection(node) {
   // dataset values
   const imgSrc = node.dataset.imgSrc;
   const cost = node.dataset.cost;
   const colorText = node.textContent.trim();

   // Update main image (if present)
   const img = getImgEl();
   if (img && imgSrc) img.src = imgSrc;

   // Update product cost text (if present)
   const costElement = getCostEl();
   if (costElement && cost) costElement.textContent = cost;

   // Sync color into order form UI and classes
   setColor(colorText);

   // Recalculate total (uses current price * qty inside order form)
   calcTotalCost();
}

// Single delegated listener instead of two separate calls per click
// (less work on each event, clearer branching)
document.addEventListener('click', onDocumentClick);
