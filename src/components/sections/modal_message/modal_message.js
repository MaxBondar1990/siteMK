import './modal_message.scss'
import { setMenuHeaderTitle } from '../../custom/menu_header/menu_header'

/**
 * modal_message (simple)
 *
 * Rules:
 * - show() => show modal root
 * - showLoading() => show modal + preloader
 * - showSuccess()/showError() => hide preloader, show container, show prepared block
 * - If message is empty => keep prepared text from HTML
 * - If html is provided => insert into container as-is (optional future use)
 */

const SELECTORS = {
   root: '[data-component="modal_message"][data-part="root"]',
   title: '[data-part="title"]',
   preloader: '[data-part="preloader"]',
   container: '[data-part="container"]',

   success: '[data-part="success"]',
   error: '[data-part="error"]',
   successText: '[data-part="text-success"]',
   errorText: '[data-part="text-error"]',
}

function qs(rootEl, sel) {
   return rootEl ? rootEl.querySelector(sel) : null
}

function setText(el, text) {
   if (!el) return
   if (typeof text !== 'string') return
   el.textContent = text
}

function setHtml(el, html) {
   if (!el) return
   if (typeof html !== 'string') return
   el.innerHTML = html
}

function showEl(el) {
   if (!el) return
   el.hidden = false
   el.setAttribute('aria-hidden', 'false')
}

function hideEl(el) {
   if (!el) return
   el.hidden = true
   el.setAttribute('aria-hidden', 'true')
}

function openModal(rootEl) {
   if (!rootEl) return

   // Minimal compatibility with your current modal styles
   rootEl.hidden = false
   rootEl.removeAttribute('hidden')
   rootEl.removeAttribute('inert')
   rootEl.setAttribute('aria-hidden', 'false')

   if (rootEl.classList) {
      rootEl.classList.remove('_hide')
      rootEl.classList.add('_view')
   }
}

function buildController(rootEl) {
   const titleEl = qs(rootEl, SELECTORS.title)
   const preloaderEl = qs(rootEl, SELECTORS.preloader)
   const containerEl = qs(rootEl, SELECTORS.container)

   const successEl = qs(rootEl, SELECTORS.success)
   const errorEl = qs(rootEl, SELECTORS.error)
   const successTextEl = qs(rootEl, SELECTORS.successText)
   const errorTextEl = qs(rootEl, SELECTORS.errorText)

   function setBusy(isBusy) {
      rootEl.setAttribute('aria-busy', String(Boolean(isBusy)))
   }

   function setErrorState() {
      if (!rootEl?.classList) return
      rootEl.classList.add('_error')
   }

   function clearErrorState() {
      if (!rootEl?.classList) return
      rootEl.classList.remove('_error')
   }

   function showPreparedSuccess(message) {
      // Show container + success block
      hideEl(errorEl)
      showEl(successEl)

      // Override prepared text only if message is provided
      if (typeof message === 'string' && message.trim()) {
         setText(successTextEl, message)
      }
   }

   function showPreparedError(message) {
      hideEl(successEl)
      showEl(errorEl)

      if (typeof message === 'string' && message.trim()) {
         setText(errorTextEl, message)
      }
   }

   return {
      show(payload = {}) {
         const { title = '' } = payload
         openModal(rootEl)
         setBusy(false)
         setMenuHeaderTitle(rootEl, title)
      },

      showLoading(payload = {}) {
         const { title = '' } = payload
         openModal(rootEl)
         clearErrorState()
         setBusy(true)
         setMenuHeaderTitle(rootEl, title)

         showEl(preloaderEl)
         hideEl(containerEl)
      },

      /**
       * Success:
       * - If html provided => insert into container and show it.
       * - Else use prepared success block. If message provided => override text.
       */
      showSuccess(payload = {}) {
         const { title = '', message = '', html = '' } = payload
         openModal(rootEl)
         clearErrorState()
         setBusy(false)
         setMenuHeaderTitle(rootEl, title)

         hideEl(preloaderEl)
         showEl(containerEl)

         if (typeof html === 'string' && html.trim()) {
            setHtml(containerEl, html)
            return
         }

         showPreparedSuccess(message)
      },

      /**
       * Error:
       * - If html provided => insert into container and show it.
       * - Else use prepared error block. If message provided => override text.
       */
      showError(payload = {}) {
         const { title = '', message = '', html = '' } = payload
         openModal(rootEl)
         setErrorState()
         setBusy(false)
         setMenuHeaderTitle(rootEl, title)

         hideEl(preloaderEl)
         showEl(containerEl)

         if (typeof html === 'string' && html.trim()) {
            setHtml(containerEl, html)
            return
         }

         showPreparedError(message)
      },
   }
}

let controller = null

export const modalMessage = {
   ensure() {
      if (controller) return controller
      const rootEl = document.querySelector(SELECTORS.root)
      if (!rootEl) return null
      controller = buildController(rootEl)
      return controller
   },

   show(payload) {
      return this.ensure()?.show(payload)
   },

   showLoading(payload) {
      return this.ensure()?.showLoading(payload)
   },

   showSuccess(payload) {
      return this.ensure()?.showSuccess(payload)
   },

   showError(payload) {
      return this.ensure()?.showError(payload)
   },
}

// Auto-mount
const rootEl = document.querySelector(SELECTORS.root)
if (rootEl) {
   modalMessage.ensure()
}