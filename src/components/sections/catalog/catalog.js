
import './catalog.scss'

// Prefer new API; keep legacy as fallback
const SEL = {
   root: '[data-component="catalog"][data-part="root"]',
   colorList: '[data-part="color-list"], [data-name="view-color-items"]',
   colorItem: '.goods-card__color-item',
   card: '.goods-card',
   img: '.goods-card__img img',
   price: ".goods-card__price [itemprop='price']",
};

// Toggle open/close of color list, and open when picking a color
export function viewColorItems(event, rootEl) {
   const colorList = event.target.closest(SEL.colorList);
   const colorItem = event.target.closest(SEL.colorItem);

   // Click on UL (open/close list)
   if (colorList && !colorItem) {
      // Close other lists within this component root only
      rootEl.querySelectorAll(SEL.colorList).forEach(list => {
         if (list !== colorList) list.classList.remove('_action');
      });
      colorList.classList.toggle('_action');
      return;
   }

   // Click on LI (change image + ensure list is open)
   if (colorItem) {
      const ownList = colorItem.closest(SEL.colorList);
      if (ownList) {
         rootEl.querySelectorAll(SEL.colorList).forEach(list => {
            if (list !== ownList) list.classList.remove('_action');
         });
         ownList.classList.add('_action');
      }

      const card = colorItem.closest(SEL.card);
      const img = card?.querySelector(SEL.img);
      const newSrc = colorItem.getAttribute('data-srcImg') || colorItem.getAttribute('data-srcimg');
      if (img && newSrc) img.src = newSrc;

      // Keep price & active state in applyColorAndPriceChange
      event.stopPropagation();
   }
}

// colorPriceUpdater.js — apply price and active state on color pick
export function applyColorAndPriceChange(event, rootEl) {
   const colorItem = event.target.closest(SEL.colorItem);
   if (!colorItem || !rootEl.contains(colorItem)) return;

   const card = colorItem.closest(SEL.card);
   if (!card) return;

   const priceElement = card.querySelector(SEL.price);
   const productImg = card.querySelector(SEL.img);

   // Price update (UA formatting)
   if (priceElement && colorItem.dataset.price) {
      const rawPrice = (colorItem.dataset.price + '').replace(',', '.');
      const numberPrice = parseFloat(rawPrice);
      if (!Number.isNaN(numberPrice)) {
         const formatted = numberPrice.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
         priceElement.textContent = formatted;
      } else {
         priceElement.textContent = colorItem.dataset.price; // fallback
      }
   }

   // Image update fallback (if not handled above)
   if (productImg && colorItem.dataset.srcimg && !productImg.src.endsWith(colorItem.dataset.srcimg)) {
      productImg.src = colorItem.dataset.srcimg;
   }

   // Active class for chosen color
   const colorItems = card.querySelectorAll(SEL.colorItem);
   colorItems.forEach(el => el.classList.remove('active'));
   colorItem.classList.add('active');
}

// Mount catalog component locally (event delegation)
export function mountCatalog(rootEl) {
   if (!rootEl) return () => { };
   const ac = new AbortController();
   const { signal } = ac;

   rootEl.addEventListener('click', (e) => {
      // visual/open behavior
      viewColorItems(e, rootEl);
      // data & active state
      applyColorAndPriceChange(e, rootEl);
   }, { signal });

   return () => ac.abort();
}

// Auto-mount (new API root)
const catalogRoot = document.querySelector(SEL.root);
if (catalogRoot) {
   const cleanup = mountCatalog(catalogRoot);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}

