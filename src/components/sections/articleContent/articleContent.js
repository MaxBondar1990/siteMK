import './articleContent.scss'

import { view } from '../../custom/modal/modal.js'
import { setColor, calcTotalCost } from '../../custom/orderform/orderform.js'

// Centralized selectors (component-first, всі селектори відносні до root)
const SELECTORS = {
   // загальні елементи
   colorItem: '[data-name="color-items"]',
   productCost: '[data-name="product-cost"]',
   mainImg: '[data-name="mine-img"] img',
   orderBtn: '[data-btn="view-order-form"]',

   // кількість товару на сторінці
   qtyInput: '.article__quantity-input',

   // корзина: кнопка додавання з артикла
   addToCartBtn: '[data-action="article-add-to-cart"]',

   // постачальники (модалки)
   suppliersModal: '[data-name="suppliers-modal"]',
   supplierModal: '[data-name="supplier-modal"]',
   suppliersOpenBtn: '[data-button="view-suppliers-modal"]',
   supplierOpenBtn: '[data-button="view-supplier-modal"]',
   closeBtn: '[data-action="close-modal"]',
}

// допоміжні функції для пошуку елементів всередині root
function getCostEl(rootEl) {
   return rootEl.querySelector(SELECTORS.productCost)
}
function getImgEl(rootEl) {
   return rootEl.querySelector(SELECTORS.mainImg)
}

// застосувати вибір кольору (оновлення картинки, ціни, ордер-форми)
function applyColorSelection(rootEl, node) {
   if (!rootEl || !node) return

   // Перемикаємо клас _active між елементами кольорів
   const allColorNodes = rootEl.querySelectorAll(SELECTORS.colorItem)
   allColorNodes.forEach((el) => el.classList.remove('_active'))
   node.classList.add('_active')

   const imgSrc = node.dataset.imgSrc
   const cost = node.dataset.cost

   // Колір беремо з data-color, якщо є, інакше з тексту елемента
   const rawColor =
      (typeof node.dataset.color === 'string' && node.dataset.color) ||
      (typeof node.textContent === 'string' && node.textContent) ||
      ''
   const colorText = rawColor.trim()

   // Update main image (if present)
   const img = getImgEl(rootEl)
   if (img && imgSrc) img.src = imgSrc

   // Update product cost text (if present)
   const costElement = getCostEl(rootEl)
   if (costElement && cost) costElement.textContent = cost

   // Sync color into order form UI and classes
   setColor(colorText)

   // Recalculate total (uses current price * qty inside order form)
   calcTotalCost()
}

// логіка відкриття/закриття модалки з усіма постачальниками
function handleSuppliersModal(rootEl, event) {
   const modalSuppliers = rootEl.querySelector(SELECTORS.suppliersModal)
   if (!modalSuppliers) return

   const target = event.target

   // ВІДКРИТТЯ — кнопка всередині компонента
   const openBtn = target.closest(SELECTORS.suppliersOpenBtn)
   if (openBtn && rootEl.contains(openBtn)) {
      modalSuppliers.classList.add('_show')
      return
   }

   // ЗАКРИТТЯ — по кнопці закриття всередині самої модалки
   if (modalSuppliers.contains(target)) {
      const closeBtn = target.closest(SELECTORS.closeBtn)
      if (closeBtn && modalSuppliers.contains(closeBtn)) {
         modalSuppliers.classList.remove('_show')
      }
   }
}

// логіка модалки одного постачальника
function handleSupplierModal(rootEl, event) {
   const modalSupplier = rootEl.querySelector(SELECTORS.supplierModal)
   if (!modalSupplier) return

   const target = event.target

   // ВІДКРИТТЯ
   const openBtn = target.closest(SELECTORS.supplierOpenBtn)
   if (openBtn && rootEl.contains(openBtn)) {
      modalSupplier.classList.add('_show')
      return
   }

   // ЗАКРИТТЯ
   if (modalSupplier.contains(target)) {
      const closeBtn = target.closest(SELECTORS.closeBtn)
      if (closeBtn && modalSupplier.contains(closeBtn)) {
         modalSupplier.classList.remove('_show')
      }
   }
}

// додавання товару в корзину з артикла
function handleAddToCart(rootEl, btn) {
   if (!rootEl || !btn) return
   if (!window.cartAPI || typeof window.cartAPI.addToCart !== 'function') return

   const id = btn.dataset.id
   if (!id) return

   const type = btn.dataset.type || 'product'

   // Колір завжди беремо з активного елемента (або з першого, якщо активного немає)
   let color = null

   let colorNode =
      rootEl.querySelector(`${SELECTORS.colorItem}._active`) ||
      rootEl.querySelector(SELECTORS.colorItem)

   if (colorNode) {
      // Синхронізуємо стан (картинка, ціна, класи) з вибраним кольором
      applyColorSelection(rootEl, colorNode)

      const rawColor =
         (typeof colorNode.dataset.color === 'string' && colorNode.dataset.color) ||
         (typeof colorNode.textContent === 'string' && colorNode.textContent) ||
         ''
      color = rawColor.trim() || null
   }

   // кількість беремо з інпута на сторінці артикла
   let qty = 1
   const qtyInput = rootEl.querySelector(SELECTORS.qtyInput)
   if (qtyInput) {
      const n = Number(qtyInput.value)
      if (Number.isFinite(n) && n > 0) qty = n
   }

   window.cartAPI.addToCart({
      id,
      type,
      color,
      qty,
   })
}

// основний монтувальний метод компонента
function mountArticleContent(rootEl) {
   if (!rootEl) return

   const ac = new AbortController()
   const { signal } = ac

   rootEl.addEventListener(
      'click',
      (event) => {
         const t = event.target

         // 1) Вибір кольору
         const colorNode = t.closest(SELECTORS.colorItem)
         if (colorNode && rootEl.contains(colorNode)) {
            applyColorSelection(rootEl, colorNode)
            return
         }

         // 2) Кнопка відкриття модалки ордер-форми (стара логіка, якщо вона лишається)
         const btnOrder = t.closest(SELECTORS.orderBtn)
         if (btnOrder && rootEl.contains(btnOrder)) {
            view('order-form')
            return
         }

         // 3) Модалка постачальників (усі)
         handleSuppliersModal(rootEl, event)

         // 4) Модалка одного постачальника
         handleSupplierModal(rootEl, event)

         // 5) Додавання товару в корзину з артикла
         const addBtn = t.closest(SELECTORS.addToCartBtn)
         if (addBtn && rootEl.contains(addBtn)) {
            //console.log(rootEl, addBtn)
            handleAddToCart(rootEl, addBtn)
            return
         }
      },
      { signal }
   )

   // Ініціалізація дефолтного кольору при завантаженні:
   // 1) спочатку шукаємо елемент із класом _active
   // 2) якщо немає — беремо перший елемент зі списку кольорів
   const activeColorNode =
      rootEl.querySelector(`${SELECTORS.colorItem}._active`) ||
      rootEl.querySelector(SELECTORS.colorItem)

   if (activeColorNode) {
      applyColorSelection(rootEl, activeColorNode)
   }

   // cleanup для HMR
   return () => ac.abort()
}

// Автозапуск компонента (локалізація root)
// Основний варіант — data-component="article-content" data-part="root"
// Залишаємо fallback на старий [data-name="article-component"], щоб нічого не зламати прямо зараз
const rootArticle = document.querySelector('[data-component="article-content"][data-part="root"]');

if (rootArticle) {
   const cleanup = mountArticleContent(rootArticle)
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup)
   }
}
