import './leftSideBar.scss';
import { viewNavigation, closeNavigation } from '../navigation/navigation.js';
import { loadContent, isRequiredInput } from '../../globalBlokcs/fetch/fetch.js';

// ——— Auth portal & response handling ———
function ensureAuthPortal() {
   let portal = document.querySelector('#app-portal[data-portal="auth"]');
   if (!portal) {
      portal = document.createElement('div');
      portal.id = 'app-portal';
      portal.setAttribute('data-portal', 'auth');
      portal.setAttribute('aria-live', 'polite');
      document.body.appendChild(portal);
   }
   return portal;
}

function renderAuthHtml(html) {
   const portal = ensureAuthPortal();
   portal.innerHTML = html || '';
   return portal;
}

function handleAuthResponse(rootEl, res) {
   // Якщо прийшов html — вставляємо його лише у разі помилки або якщо статус не "ok"
   if (res && typeof res.html === 'string' && res.status !== 'ok') {
      renderAuthHtml(res.html);
   }

   if (res && res.status === 'ok') {
      // Закриваємо модалку логіну/реєстрації
      const authModal = rootEl.querySelector('[data-part="modal"][data-name="login"]');
      if (authModal) authModal.classList.remove('_view');

      // Сповіщаємо застосунок
      document.dispatchEvent(new CustomEvent('auth:success', {
         detail: { redirect: res.redirect || null }
      }));

      // Якщо є redirect → переходимо, якщо ні — просто перезавантажуємо
      if (res.redirect) {
         location.href = res.redirect;
      } else {
         location.reload();
      }
      return;
   }

   // Помилка: модалку не закриваємо, показуємо html (вище вставили), й сповіщаємо інших
   document.dispatchEvent(new CustomEvent('auth:error', {
      detail: { reason: (res && res.reason) || (res && res.meta && res.meta.reason) || 'unknown' }
   }));
}
// ——— end auth helpers ———

function mountLeftSideBar(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування кліків у межах компонента за новою розміткою (data-action / data-target)
   rootEl.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl || !rootEl.contains(actionEl)) return;

      const action = actionEl.getAttribute('data-action');
      const target = actionEl.getAttribute('data-target');

      switch (action) {
         case 'toggle-nav': {
            // Кнопка бургера (data-part="burger")
            const isActive = actionEl.classList.contains('_action');
            if (isActive) {
               actionEl.classList.remove('_action');
               closeNavigation();
            } else if (viewNavigation()) {
               actionEl.classList.add('_action');
            }
            return;
         }

         case 'toggle-modal': {
            // Перемикання модалок контактів за data-target
            const modals = rootEl.querySelectorAll('[data-part="modal"][data-name]');
            modals.forEach((modal) => {
               const name = modal.getAttribute('data-name');
               if (name === target) {
                  modal.classList.toggle('_view');
               } else {
                  modal.classList.remove('_view');
               }
            });
            return;
         }

         case 'open-link': {
            // Для посилань типу Viber/Telegram. Якщо href="#", не заважаємо — 
            // можна додати data-href пізніше і відкрити window.open(actionEl.dataset.href)
            return;
         }

         case 'auth-login':
         case 'auth-register': {
            // Fallback: у Safari/Chrome інколи submit блокується HTML5-валідацією або сторонніми скриптами
            // Використаємо requestSubmit() і свій submit-делегат забере керування
            const form = actionEl.closest('form');
            if (form) {
               e.preventDefault();
               if (typeof form.requestSubmit === 'function') form.requestSubmit();
               else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
            return;
         }

         case 'toggle-register': {
            // Показати форму реєстрації, сховати форму логіну
            const loginForm = rootEl.querySelector('[data-part="auth-form-login"]');
            const registerForm = rootEl.querySelector('[data-part="auth-form-register"]');
            if (loginForm && registerForm) {
               loginForm.hidden = true;
               registerForm.hidden = false;
            }
            return;
         }

         case 'toggle-login': {
            // Показати форму логіну, сховати форму реєстрації
            const loginForm = rootEl.querySelector('[data-part="auth-form-login"]');
            const registerForm = rootEl.querySelector('[data-part="auth-form-register"]');
            if (loginForm && registerForm) {
               loginForm.hidden = false;
               registerForm.hidden = true;
            }
            return;
         }

         default:
            return;
      }
   }, { signal });

   // Делегування submit для auth-форм через fetch (мінімальний контракт: {status, html, redirect?})
   rootEl.addEventListener('submit', async (e) => {
      const form = e.target.closest('[data-part="auth-form-login"], [data-part="auth-form-register"]');
      if (!form || !rootEl.contains(form)) return;
      e.preventDefault();

      if (typeof isRequiredInput === 'function') {
         const ok = isRequiredInput(form);
         if (ok === false) return;
      }

      const formData = new FormData(form);
      const fileName = form.getAttribute('data-fetch-file') || (form.matches('[data-part="auth-form-login"]') ? 'userLogin' : 'userregistration');

      // Disable submit while request is in-flight
      const submitBtn = form.querySelector('[type="submit"]');
      const prevDisabled = submitBtn ? submitBtn.disabled : false;
      if (submitBtn) submitBtn.disabled = true;

      try {
         const res = await loadContent(fileName, formData, undefined, 'json');
         console.log(res);
         handleAuthResponse(rootEl, res || {});
      } catch (err) {
         console.error('Auth request failed:', err);
         handleAuthResponse(rootEl, { status: 'error', html: '<div data-auth-view="login-error">Сталася помилка. Спробуйте пізніше.</div>' });
      } finally {
         if (submitBtn) submitBtn.disabled = prevDisabled;
      }
   }, { signal, capture: true });

   return () => ac.abort();
}

// Автоматичне підключення, якщо компонент є в DOM
const rootLeft = document.querySelector('[data-component="leftSideBar"][data-part="root"]') || document.querySelector('.left-side-bar');
if (rootLeft) {
   const cleanup = mountLeftSideBar(rootLeft);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}
