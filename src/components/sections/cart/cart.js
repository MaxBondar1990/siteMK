import './cart.scss'
import { loadContent, isRequiredInput } from '../../globalBlokcs/fetch/fetch.js'
import { modalMessage } from '../modal_message/modal_message.js'
//console.log('dv');
// ===== Guest-only cart (localStorage as source of truth) =====
const CART_KEY = 'mk_cart_v1'
const CART_STATE_KEY = 'mk_cart_modal_state' // 'open' | 'closed'

// --- State load/save ---
function loadCart() {
   try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] }
}
// Normalize cart state (e.g., strip service-only fields from products)
function normalizeCartState(raw) {
   if (!Array.isArray(raw)) return []
   return raw
      .map((it) => {
         if (!it || typeof it !== 'object') return null
         const copy = { ...it }
         // name and tierPrice мають бути тільки в сервісів (друк)
         if (copy.type !== 'service') {
            delete copy.name
            delete copy.tierPrice
            delete copy.tierQty
            delete copy.tierCode
         }
         return copy
      })
      .filter(Boolean)
}
function saveCart(state) {
   try {
      const normalized = normalizeCartState(Array.isArray(state) ? state : [])
      localStorage.setItem(CART_KEY, JSON.stringify(normalized))
   } catch { }
}
function loadCartState() {
   try { return localStorage.getItem(CART_STATE_KEY) === 'open' ? 'open' : 'closed' } catch { return 'closed' }
}
function saveCartState(v) { try { localStorage.setItem(CART_STATE_KEY, v) } catch { } }

let cart = normalizeCartState(loadCart());
let lastOpener = null;

// Centralized selectors for the cart component
const SELECTORS_CART = {
   root: '[data-component="cart"][data-part="root"]',
   modal: '[data-component="cart-modal"][data-part="root"]',
   results: '[data-part="results"]',
   footer: '[data-part="footer"]',
   totalValue: '[data-part="cart-total"]',
   clearBtn: '[data-action="cart-clear"]',
   item: '[data-cart-item]',
   qtyInput: 'input[data-target="cart-qty"]',
   price: '[data-part="price"]',
   badge: '[data-cart-count]',
   btnOpen: '[data-action="open-modal"][data-target="cart-modal"]',
   btnClose: '[data-action="close-modal"][data-part="close"]',
   btnInc: '[data-action="cart-inc"]',
   btnDec: '[data-action="cart-dec"]',
   btnRemove: '[data-action="cart-remove"]',
   btnCheckoutToggle: '[data-action="cart-checkout-toggle"]',
   btnHideForm: '[data-action="cart-close"]',
   form: '#cart-order-form',
   cartJsonInput: 'input[name="cart"][data-cart-json]',
   floatingOpenBtn: '.cart__floating-btn[data-action="open-modal"][data-target="cart-modal"]',
}

// Small helpers
function qs(sel, parent = document) { return parent.querySelector(sel) }
function qsa(sel, parent = document) { return Array.from(parent.querySelectorAll(sel)) }

// Scoped getters (kept same names to minimize changes below)
function getRootCart() { return qs(SELECTORS_CART.root) }
function getModal() { const root = getRootCart(); return root ? qs(SELECTORS_CART.modal, root) : null }
function getResultsEl() { const m = getModal(); return m ? qs(SELECTORS_CART.results, m) : null }
function getFooterEl() { const m = getModal(); return m ? qs(SELECTORS_CART.footer, m) : null }

// --- Utils ---
function cartCount() { return cart.reduce((s, i) => s + (Number(i.qty) || 0), 0) }
function updateBadges() {
   document.querySelectorAll(SELECTORS_CART.badge).forEach(el => {
      el.textContent = String(cartCount())
   })
}
function calcTotal() { return cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0) }
function toggleClearButton() {
   const footerEl = getFooterEl();
   if (!footerEl) return

   const clearBtn = footerEl.querySelector(SELECTORS_CART.clearBtn)
   const checkoutBtn = footerEl.querySelector(SELECTORS_CART.btnCheckoutToggle)
   const hideFormBtn = footerEl.querySelector(SELECTORS_CART.btnHideForm)
   const form = qs(SELECTORS_CART.form)

   const hasItems = cart.length > 0
   const formVisible = !!(form && form.classList.contains('_visible') && !form.hasAttribute('hidden'))

   // 1) Якщо корзина порожня — ховаємо всі три кнопки і форму
   if (!hasItems) {
      ;[clearBtn, checkoutBtn, hideFormBtn].forEach(btn => {
         if (!btn) return
         btn.classList.add('_hidden')
      })
      if (form) {
         form.classList.remove('_visible')
         if (!form.hasAttribute('hidden')) form.setAttribute('hidden', '')
      }
      return
   }

   // 2) Є товари, форма закрита: "Оформити" + "Очистити" видимі, "Сховати форму" схована
   if (!formVisible) {
      if (clearBtn) clearBtn.classList.remove('_hidden')
      if (checkoutBtn) checkoutBtn.classList.remove('_hidden')
      if (hideFormBtn) hideFormBtn.classList.add('_hidden')
   } else {
      // 3) Форма відкрита: "Очистити" і "Оформити" ховаємо, показуємо "Сховати форму"
      if (clearBtn) clearBtn.classList.add('_hidden')
      if (checkoutBtn) checkoutBtn.classList.add('_hidden')
      if (hideFormBtn) hideFormBtn.classList.remove('_hidden')
   }
}
function renderFooterFromCart() {
   const footerEl = getFooterEl();
   if (!footerEl) return
   const totalEl = footerEl.querySelector(SELECTORS_CART.totalValue)
   if (totalEl) totalEl.textContent = `${calcTotal().toLocaleString('uk-UA')} грн`
   toggleClearButton()
}
function findItemIndex(id, color) {
   const c = color ?? null
   for (let i = 0; i < cart.length; i++) {
      const it = cart[i]
      if (it && it.id === id && (it.color ?? null) === c) return i
   }
   return -1
}
function findItem(id, color) {
   const c = color ?? null
   return cart.find(i => i.id === id && (i.color ?? null) === c)
}
function getPriceFromLi(li) {
   if (!li) return 0
   const attr = li.getAttribute('data-price')
   if (attr != null && attr !== '') {
      const n = Number(String(attr).replace(/[^\d.,-]/g, '').replace(',', '.'))
      return Number.isFinite(n) ? n : 0
   }
   //const pEl = li.querySelector(SELECTORS_CART.price)
   //if (pEl) {
   //   const m = pEl.textContent.match(/([\d\s]+(?:[.,]\d+)?)/)
   //   if (m) {
   //      const n = Number(m[1].replace(/\s+/g, '').replace(',', '.'))
   //      return Number.isFinite(n) ? n : 0
   //   }
   //}
   return 0
}

// Helper to update the row price based on unit price and qty
function updateRowPrice(holder, rec) {
   if (!holder || !rec) return

   // Спочатку шукаємо універсальний data-part="price",
   // якщо немає — пробуємо блок для друку
   const priceEl =
      holder.querySelector(SELECTORS_CART.price) ||
      holder.querySelector('.cart__result-card-price._printing') ||
      holder.querySelector('.cart__result-card-price')

   if (!priceEl) return

   const unit = Number(rec.price) || 0
   const qty = Number(rec.qty) || 0
   const total = unit * qty

   const isPrinting = !!holder.querySelector('.cart__result-card-article._printing')

   priceEl.textContent = isPrinting
      ? `Вартість друку: ${total.toLocaleString('uk-UA')} грн`
      : `Вартість: ${total.toLocaleString('uk-UA')} грн`
}

// --- Core actions ---
async function appendItemFromServer({ id, type = 'product', color, qty, price, name, tierPrice }) {
   const resultsEl = getResultsEl();
   if (!resultsEl) return

   const fd = new FormData()

   // Базові поля для всіх типів
   fd.append('formName', 'cartItem')
   fd.append('id', id)
   fd.append('type', type)
   if (color != null) fd.append('color', color)
   fd.append('qty', String(qty))

   // Для сервісів (друк) — передаємо ціну за одиницю та загальну суму
   if (type === 'service') {
      let unit = Number(price)
      if (!Number.isFinite(unit) || unit < 0) {
         // якщо раптом price не передали — шукаємо в state
         const rec = findItem(id, color)
         if (rec && Number.isFinite(Number(rec.price))) {
            unit = Number(rec.price)
         }
      }

      let quantity = Number(qty)
      if (!Number.isFinite(quantity) || quantity <= 0) {
         const rec = findItem(id, color)
         if (rec && Number.isFinite(Number(rec.qty))) {
            quantity = Number(rec.qty)
         } else {
            quantity = 1
         }
      }

      const total = unit * quantity

      if (Number.isFinite(unit) && unit > 0) {
         fd.append('unitPrice', String(unit))
      }
      if (Number.isFinite(total) && total > 0) {
         fd.append('totalPrice', String(total))
      }
      if (name) {
         fd.append('name', name);
      }
      // Add tierPrice if provided and valid (use passed-in tierPrice)
      const tp = Number(tierPrice)
      if (Number.isFinite(tp) && tp > 0) {
         fd.append('tierPrice', String(tp))
      }
   }
   try {
      const res = await loadContent('cart__item', fd, undefined, 'html')
      if (res && res.status === 'success' && typeof res.html === 'string' && res.html.trim()) {
         const t = document.createElement('template')
         t.innerHTML = res.html.trim()
         // 🔒 Remove any scripts injected by dev tooling (e.g., Vite /@vite/client)
         t.content.querySelectorAll('script').forEach(s => s.remove())
         // Append only intended cart item
         const li = t.content.querySelector(SELECTORS_CART.item)
         if (li) {
            // annotate li with item-type if we know it
            if (type) li.setAttribute('data-item-type', type)
            resultsEl.appendChild(li)

            const rec = findItem(id, color)
            if (rec) {
               if (type !== 'service') {
                  // For products: sync price and qty from DOM if server is authoritative
                  const domPrice = getPriceFromLi(li)
                  if (domPrice > 0) {
                     rec.price = domPrice
                  }

                  const authority = (li.getAttribute('data-authority') || '').toLowerCase()
                  const qtyAuthority = (li.getAttribute('data-qty-authority') || '').toLowerCase()
                  const serverControlsQty = qtyAuthority === 'server' || authority.includes('qty')

                  if (serverControlsQty) {
                     let normalizedQty = qty
                     const attrQty = li.getAttribute('data-qty')
                     if (attrQty != null && attrQty !== '') {
                        const n = Number(String(attrQty).replace(/[^\d.-]/g, ''))
                        if (Number.isFinite(n) && n > 0) normalizedQty = n
                     } else {
                        const inputEl = li.querySelector(SELECTORS_CART.qtyInput)
                        if (inputEl && inputEl.value !== '') {
                           const n = Number(String(inputEl.value).replace(/[^\d.-]/g, ''))
                           if (Number.isFinite(n) && n > 0) normalizedQty = n
                        }
                     }
                     rec.qty = normalizedQty
                  }
               }
               // For services we fully trust the state (price, qty) that came from addToCart
               updateRowPrice(li, rec)
            }
            saveCart(cart)
            renderFooterFromCart()
         } else {
            console.warn('cart__item response did not contain <li data-cart-item>')
         }
      }
   } catch (e) {
      console.warn('appendItemFromServer error', e)
   }
}

function addToCart({
   id,
   type = 'product',
   color = null,
   qty = 1,
   price = null,
   name = null,
   tierPrice = null,
   tierQty = null,
   tierCode = null,
}) {
   if (!id) return

   const quantity = Number.parseInt(qty, 10) > 0 ? Number.parseInt(qty, 10) : 1
   const itemType = type || 'product'

   // normalize tierPrice only for possible use with services
   const tq = Number(tierQty)
   const normalizedTierQty = Number.isFinite(tq) && tq > 0 ? tq : null
   const tp = Number(tierPrice)
   const normalizedTierPrice = Number.isFinite(tp) && tp >= 0 ? tp : null

   const existing = findItem(id, color)

   if (itemType === 'product' && existing) {
      // Update locally & DOM only for products
      existing.qty += quantity
      saveCart(cart)

      const resultsEl = getResultsEl();
      if (resultsEl) {
         const sel = `[data-cart-item][data-id="${CSS.escape(String(id))}"][data-color="${CSS.escape(String(color ?? ''))}"]`
         const li = resultsEl.querySelector(sel)
         if (li) {
            const inputEl = li.querySelector('input[data-target="cart-qty"]')
            if (inputEl) inputEl.value = String(existing.qty)
            if (!existing.price) {
               const p = getPriceFromLi(li)
               if (p > 0) {
                  existing.price = p
                  saveCart(cart)
               }
            }
         }
      }

      updateBadges()
      renderFooterFromCart()
      return
   }

   // --- New item (product or service) ---
   // Початкова ціна з payload, якщо передана і валідна, інакше 0
   let normalizedPrice = 0
   const p = Number(price)
   if (Number.isFinite(p) && p >= 0) {
      normalizedPrice = p
   }

   // Для product ми принципово НЕ зберігаємо ні name, ні tierPrice
   // Для service зберігаємо name та tierPrice (якщо є)
   const isService = itemType === 'service'
   const item = {
      id,
      type: itemType,
      color: color ?? null,
      qty: quantity,
      price: normalizedPrice,
   }

   if (isService) {
      item.name = name ?? null

      if (normalizedTierPrice !== null) {
         item.tierPrice = normalizedTierPrice
      }

      if (normalizedTierQty !== null) {
         item.tierQty = normalizedTierQty
      }

      if (tierCode != null && tierCode !== '') {
         item.tierCode = String(tierCode)
      }
   }

   cart.push(item)
   saveCart(cart)

   // Ask backend to render a single <li> and append
   appendItemFromServer({
      id: item.id,
      type: item.type,
      color: item.color,
      qty: item.qty,
      price: item.price,
      name: isService ? (item.name ?? null) : null,
      tierPrice: isService ? (item.tierPrice ?? null) : null,
   })

   updateBadges()
   renderFooterFromCart()
}

function removeItemDomAndState(holder) {
   const id = holder.getAttribute('data-id')
   const color = holder.getAttribute('data-color') || null
   // If we know type from DOM, use it; otherwise infer from state
   const holderType = holder.getAttribute('data-item-type') || null

   if (holderType === 'service') {
      const idx = findItemIndex(id, color)
      if (idx >= 0) { cart.splice(idx, 1); saveCart(cart) }
   } else {
      // products expected to be unique by id+color
      const idx = findItemIndex(id, color)
      if (idx >= 0) { cart.splice(idx, 1); saveCart(cart) }
   }
   holder.remove()
   updateBadges(); renderFooterFromCart()
}

function clearCart() {
   const resultsEl = getResultsEl();
   if (resultsEl) resultsEl.innerHTML = ''
   cart = []; saveCart(cart)
   updateBadges(); renderFooterFromCart()
}

// --- Modal helpers ---
function isModalOpen() {
   const modal = getModal();
   return !!(modal && (modal.classList.contains('_view') || modal.dataset.state === 'open'))
}
function isInside(node, root) { return !!(node && root && root.contains(node)) }
async function openCartModal() {
   const modal = getModal();
   const resultsEl = getResultsEl();
   if (!modal) return
   modal.removeAttribute('aria-hidden')
   modal.inert = false
   modal.classList.remove('_hide')
   modal.classList.add('_view')
   modal.dataset.state = 'open'
   saveCartState('open')
   const focusTarget = modal.querySelector('[data-part="close"], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
   if (focusTarget) { try { focusTarget.focus({ preventScroll: true }) } catch { } }

   // Якщо в localStorage є товари — при відкритті завжди просимо повний список у бека,
   // щоб DOM повністю відповідав поточному стану кошика (навіть після переходу між сторінками)
   if (resultsEl && cart.length) {
      const fd = new FormData()
      fd.append('formName', 'cartView')
      fd.append('cart', JSON.stringify(cart))
      try {
         const res = await loadContent('cart__view', fd, undefined, 'html')
         if (res && res.status === 'success' && typeof res.html === 'string') {
            const t = document.createElement('template')
            t.innerHTML = res.html
            // 🔒 Remove any scripts injected by dev tooling
            t.content.querySelectorAll('script').forEach(s => s.remove())
            // Clear current list and append only cart items
            resultsEl.innerHTML = ''
            t.content.querySelectorAll(SELECTORS_CART.item).forEach((row) => {
               resultsEl.appendChild(row)
            })
            // sync prices; qty only if server declares authority
            resultsEl.querySelectorAll(SELECTORS_CART.item).forEach(li => {
               const rId = li.getAttribute('data-id')
               const rColor = li.getAttribute('data-color') ?? null
               const rec = findItem(rId, rColor)
               if (rec) {
                  if (rec.type !== 'service') {
                     const p = getPriceFromLi(li)
                     if (p > 0) rec.price = p

                     const authority = (li.getAttribute('data-authority') || '').toLowerCase()
                     const qtyAuthority = (li.getAttribute('data-qty-authority') || '').toLowerCase()
                     const serverControlsQty = qtyAuthority === 'server' || authority.includes('qty')
                     if (serverControlsQty) {
                        const attrQty = li.getAttribute('data-qty')
                        if (attrQty != null && attrQty !== '') {
                           const n = Number(String(attrQty).replace(/[^\d.-]/g, ''))
                           if (Number.isFinite(n) && n > 0) rec.qty = n
                        } else {
                           const inputEl = li.querySelector(SELECTORS_CART.qtyInput)
                           if (inputEl && inputEl.value !== '') {
                              const n = Number(String(inputEl.value).replace(/[^\d.-]/g, ''))
                              if (Number.isFinite(n) && n > 0) rec.qty = n
                           }
                        }
                     }
                  }

                  // Для сервісів повністю довіряємо state (price/qty),
                  // просто оновлюємо текст в картці
                  updateRowPrice(li, rec)
               }
            })
            // sync DOM annotation for type where available in state
            resultsEl.querySelectorAll(SELECTORS_CART.item).forEach(li => {
               const rId = li.getAttribute('data-id')
               const rColor = li.getAttribute('data-color') ?? null
               const rec = findItem(rId, rColor)
               if (rec && rec.type) li.setAttribute('data-item-type', rec.type)
            })
            saveCart(cart)
         }
      } catch (e) { console.warn('initial guest fill failed', e) }
   }
   renderFooterFromCart()
}
function closeCartModal() {
   const modal = getModal();
   if (!modal) return
   const active = document.activeElement; if (isInside(active, modal)) { try { active.blur() } catch { } }
   modal.classList.remove('_view')
   modal.classList.add('_hide')
   modal.dataset.state = 'closed'
   modal.setAttribute('aria-hidden', 'true')
   modal.inert = true
   saveCartState('closed')
   if (lastOpener && document.contains(lastOpener)) { try { lastOpener.focus({ preventScroll: true }) } catch { } }
}
function toggleCartModal() { isModalOpen() ? closeCartModal() : openCartModal() }

// --- Mount (component-local delegation) ---
function mountCart(rootEl) {
   if (!rootEl) return
   const ac = new AbortController(); const { signal } = ac

   rootEl.addEventListener('click', (e) => {
      const t = e.target

      // open/close modal
      const btnOpen = t.closest(SELECTORS_CART.btnOpen)
      if (btnOpen && rootEl.contains(btnOpen)) { lastOpener = btnOpen; openCartModal(); return }
      const btnClose = t.closest(SELECTORS_CART.btnClose)
      if (btnClose && btnClose.closest(SELECTORS_CART.modal)) { closeCartModal(); return }

      // quantity / remove (inside list)
      const holder = t.closest(SELECTORS_CART.item)
      if (holder && rootEl.contains(holder)) {
         const holderType = holder.getAttribute('data-item-type') || null
         const incBtn = t.closest(SELECTORS_CART.btnInc)
         if (incBtn) {
            if (holderType === 'service') return // quantity changes are disabled for services

            const qtyInput = holder.querySelector(SELECTORS_CART.qtyInput)

            const id = holder.getAttribute('data-id')
            const color = holder.getAttribute('data-color') || null
            const rec = findItem(id, color)
            if (rec) {
               const current = Number(rec.qty) || 0
               rec.qty = current + 1
               saveCart(cart)

               if (qtyInput) qtyInput.value = String(rec.qty)

               updateRowPrice(holder, rec)
               renderFooterFromCart()
               updateBadges()
            }
            return
         }
         const decBtn = t.closest(SELECTORS_CART.btnDec)
         if (decBtn) {
            if (holderType === 'service') return // quantity changes are disabled for services

            const qtyInput = holder.querySelector(SELECTORS_CART.qtyInput)

            const id = holder.getAttribute('data-id')
            const color = holder.getAttribute('data-color') || null
            const rec = findItem(id, color)
            if (rec) {
               const current = Number(rec.qty) || 0
               const next = Math.max(0, current - 1)
               rec.qty = next

               if (next === 0) {
                  removeItemDomAndState(holder)
               } else {
                  saveCart(cart)
                  if (qtyInput) qtyInput.value = String(rec.qty)
                  updateRowPrice(holder, rec)
                  renderFooterFromCart()
                  updateBadges()
               }
            }
            return
         }
         const rmBtn = t.closest(SELECTORS_CART.btnRemove)
         if (rmBtn) { removeItemDomAndState(holder); return }
      }

      // clear cart
      const clearBtn = t.closest(SELECTORS_CART.clearBtn)
      if (clearBtn && rootEl.contains(clearBtn)) { clearCart(); return }

      // checkout toggle (show form once)
      const checkoutToggle = t.closest(SELECTORS_CART.btnCheckoutToggle)
      if (checkoutToggle && rootEl.contains(checkoutToggle)) {
         const form = qs(SELECTORS_CART.form); if (!form) return
         const isVisible = form.classList.contains('_visible')
         if (!isVisible) {
            // перший клік — просто відкриваємо форму
            form.classList.add('_visible')
            if (form.hasAttribute('hidden')) form.removeAttribute('hidden')
            checkoutToggle.setAttribute('aria-expanded', 'true')
            toggleClearButton() // покажемо/сховаємо потрібні кнопки
         } else {
            // другий клік (якщо залишиш цю гілку) — відправка форми
            let cartInput = form.querySelector(SELECTORS_CART.cartJsonInput)
            if (!cartInput) {
               cartInput = document.createElement('input')
               cartInput.type = 'hidden'
               cartInput.name = 'cart'
               cartInput.setAttribute('data-cart-json', '')
               form.appendChild(cartInput)
            }
            cartInput.value = JSON.stringify(cart)
            if (typeof form.requestSubmit === 'function') form.requestSubmit()
            else form.submit()
         }
         return
      }
      const hideFormBtn = t.closest(SELECTORS_CART.btnHideForm)
      if (hideFormBtn && rootEl.contains(hideFormBtn)) {
         const form = qs(SELECTORS_CART.form); if (!form) return
         form.classList.remove('_visible')
         if (!form.hasAttribute('hidden')) form.setAttribute('hidden', '')
         const checkoutBtn = qs(SELECTORS_CART.btnCheckoutToggle)
         if (checkoutBtn) checkoutBtn.setAttribute('aria-expanded', 'false')
         toggleClearButton() // переключаємо кнопки назад: показати "Оформити" + "Очистити"
         return
      }
   }, { signal })

   // Qty change via direct input (data-target="cart-qty")
   rootEl.addEventListener('change', (e) => {
      const input = e.target.closest(SELECTORS_CART.qtyInput)
      if (!input || !rootEl.contains(input)) return

      const holder = input.closest(SELECTORS_CART.item)
      if (!holder) return

      const holderType = holder.getAttribute('data-item-type') || null
      if (holderType === 'service') return // services qty is not editable via input

      const id = holder.getAttribute('data-id')
      const color = holder.getAttribute('data-color') || null
      const rec = findItem(id, color)
      if (!rec) return

      let next = Number(String(input.value).replace(/[^\d.-]/g, ''))
      if (!Number.isFinite(next) || next < 0) {
         // fallback to previous value if invalid
         next = Number(rec.qty) || 1
      }

      if (next === 0) {
         removeItemDomAndState(holder)
      } else {
         rec.qty = next
         saveCart(cart)
         input.value = String(rec.qty)
         updateRowPrice(holder, rec)
         renderFooterFromCart()
         updateBadges()
      }
   }, { signal })

   return () => ac.abort()
}

// Floating open button (outside root)
const floatingOpenBtn = document.querySelector(SELECTORS_CART.floatingOpenBtn)
if (floatingOpenBtn) { floatingOpenBtn.addEventListener('click', (e) => { e.preventDefault(); lastOpener = e.currentTarget; openCartModal() }) }

// Global add-to-cart for buttons outside the cart root
// --- Hydrate cart state from static DOM ---
function hydrateCartFromDom() {
   const resultsEl = getResultsEl()
   if (!resultsEl) return

   resultsEl.querySelectorAll(SELECTORS_CART.item).forEach((li) => {
      const id = li.getAttribute('data-id')
      if (!id) return
      const colorAttr = li.getAttribute('data-color')
      const color = colorAttr === '' ? null : (colorAttr ?? null)
      const existing = findItem(id, color)
      // determine type; default to 'product'
      const typeAttr = li.getAttribute('data-item-type')
      const itemType = typeAttr || 'product'

      // read qty from input[data-target="cart-qty"], fallback to 1
      let qty = 1
      const inputEl = li.querySelector(SELECTORS_CART.qtyInput)
      if (inputEl && inputEl.value !== '') {
         const n = Number(String(inputEl.value).replace(/[^\d.-]/g, ''))
         if (Number.isFinite(n) && n > 0) qty = n
      }

      const price = getPriceFromLi(li)

      if (!existing) {
         cart.push({ id, type: itemType, color, qty, price: price || 0 })
      } else {
         // merge: prefer existing.qty, but fill missing price
         if (!existing.price && price) existing.price = price
      }

      const rec = findItem(id, color)
      if (rec) updateRowPrice(li, rec)
   })

   saveCart(cart)
   renderFooterFromCart()
   updateBadges()
}

const rootCart = getRootCart()
let unmountCart = null
if (rootCart) {
   // Sync any hardcoded DOM items into state before mounting listeners
   hydrateCartFromDom()
   unmountCart = mountCart(rootCart)
   if (import.meta.hot && unmountCart) { import.meta.hot.dispose(unmountCart) }
}

// NOTE: Components (article, tariff, etc.) are responsible for calling window.cartAPI.addToCart({...})
// with a normalized payload: { id, type: 'product' | 'service', color, qty, price? }.
// This file no longer listens globally for [data-action="add-to-cart"] clicks.

// Debug API
window.cartAPI = { addToCart, clearCart, loadCart: () => loadCart(), getCart: () => cart }

// Init
updateBadges()
{ // modal init within component root
   const modal = getModal();
   if (modal) {
      const saved = loadCartState()
      if (saved === 'open') { modal.removeAttribute('aria-hidden'); modal.inert = false; openCartModal() }
      else { modal.classList.remove('_view'); modal.dataset.state = 'closed'; modal.setAttribute('aria-hidden', 'true'); modal.inert = true }
   }
}

// Sync cart JSON into order form on submit + send via fetch to /html/create-cart-order/
; (function attachCartFormSync() {
   const form = qs(SELECTORS_CART.form)
   if (!form) return

   form.addEventListener('submit', async (e) => {
      e.preventDefault()
      // Показуємо модалку “дякую” з прелоадером, доки чекаємо відповідь
      modalMessage.showLoading({ title: 'Відправляємо…' })
      // 1) Гарантуємо наявність hidden-поля cart і записуємо туди поточну корзину
      let cartInput = form.querySelector(SELECTORS_CART.cartJsonInput)
      if (!cartInput) {
         cartInput = document.createElement('input')
         cartInput.type = 'hidden'
         cartInput.name = 'cart'
         cartInput.setAttribute('data-cart-json', '')
         form.appendChild(cartInput)
      }
      cartInput.value = JSON.stringify(cart)

      // 2) Кастомна валідація обовʼязкових полів + HTML5 як fallback
      if (typeof isRequiredInput === 'function') {
         const ok = isRequiredInput(form)
         if (ok === false) return
      } else if (!form.checkValidity()) {
         // Дасть стандартні браузерні підказки по required полях
         form.reportValidity()
         return
      }

      if (!cart || !Array.isArray(cart) || cart.length === 0) {
         // Якщо хочеш — заміниш на більш красивий UI
         alert('Будь ласка, додайте товари до корзини перед оформленням замовлення.')
         return
      }

      const fd = new FormData(form)
      fd.append('formName', 'cartOrder')
      if (!fd.has('page')) {
         try {
            fd.append('page', window.location.href || '')
         } catch {
            fd.append('page', '')
         }
      }

      try {
         const res = await loadContent('create-cart-order', fd, undefined, 'html')
         // Small delay to let the preloader play
         await new Promise(resolve => setTimeout(resolve, 4000))

         // Expected response: { status: 'ok'|'error'|'success', title?: string, html?: string }
         if (res && typeof res === 'object') {
            const status = String(res.status || '').toLowerCase()
            const title = typeof res.title === 'string' ? res.title : ''
            const html = typeof res.html === 'string' ? res.html : ''

            if (status === 'ok' || status === 'success') {
               modalMessage.showSuccess({
                  title: title || 'Дякуємо!',
                  message: html || '',
               })

               // GTM / GA4 / Ads event: cart order success
               const total = calcTotal()
               const itemsCount = cartCount()

               window.dataLayer = window.dataLayer || []
               window.dataLayer.push({
                  event: 'cart_order_success',
                  source: 'cart',
                  value: total,
                  currency: 'UAH',
                  items_count: itemsCount,
               })

               clearCart()
               try { form.reset() } catch { }

               const checkoutBtn = document.querySelector(SELECTORS_CART.btnCheckoutToggle)
               if (checkoutBtn) {
                  checkoutBtn.classList.remove('_hidden')
                  checkoutBtn.setAttribute('aria-expanded', 'false')
               }

               const hideFormBtn = document.querySelector(SELECTORS_CART.btnHideForm)
               if (hideFormBtn) hideFormBtn.classList.add('_hidden')

               const formContainer = qs(SELECTORS_CART.form)
               if (formContainer) {
                  formContainer.classList.remove('_visible')
                  if (!formContainer.hasAttribute('hidden')) formContainer.setAttribute('hidden', '')
               }

               toggleClearButton()
               closeCartModal()
            } else {
               modalMessage.showError({
                  title: title || 'Помилка',
                  message: html || 'Спробуйте ще раз трохи пізніше.',
               })
            }
         }
      } catch (err) {
         console.warn('cart order submit error', err)
         modalMessage.showError({
            title: 'Помилка',
            message: 'Не вдалося відправити запит. Спробуйте ще раз.',
         })
      }
   })
})()
