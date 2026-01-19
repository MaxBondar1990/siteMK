import './auth.scss'
import { isRequiredInput } from '../../globalBlokcs/fetch/fetch.js';

function clearFormErrors(form) {
   if (!form) return;
   form.querySelectorAll('.auth__field-error').forEach(el => el.remove());
   form.querySelectorAll('._error').forEach(el => el.classList.remove('_error'));
}

function setFieldError(form, fieldName, message) {
   if (!form || !fieldName || !message) return;

   let input = form.querySelector(`[name="${CSS.escape(fieldName)}"]`);
   if (!input && fieldName === 'confirm_password') {
      input = form.querySelector('[name="confirm-password"]');
   }
   if (!input) return;

   input.classList.add('_error');
   const label = input.closest('.auth__label');
   if (label) label.classList.add('_error');

   const err = document.createElement('div');
   err.className = 'auth__field-error';
   err.textContent = String(message);
   input.insertAdjacentElement('afterend', err);
}

function applyBackendErrors(form, fields) {
   if (!form || !fields || typeof fields !== 'object') return;
   for (const [k, v] of Object.entries(fields)) {
      if (!v) continue;
      setFieldError(form, k, v);
   }
}

function handleAuthResponse(rootEl, res) {
   const ok = !!(res && (res.ok === true || res.status === 'ok'));

   if (ok) {
      const authModal = rootEl.querySelector('[data-part="modal"][data-name="login"]');
      if (authModal) authModal.classList.remove('_view');

      document.dispatchEvent(new CustomEvent('auth:success', {
         detail: { user: res.user || null }
      }));

      location.reload();
      return;
   }

   const loginForm = rootEl.querySelector('[data-part="auth-form-login"]');
   const registerForm = rootEl.querySelector('[data-part="auth-form-register"]');

   clearFormErrors(loginForm);
   clearFormErrors(registerForm);

   const activeForm = (registerForm && registerForm.hidden === false) ? registerForm : loginForm;

   if (res && res.fields && typeof res.fields === 'object') {
      applyBackendErrors(activeForm, res.fields);
   }

   console.warn('Auth error response:', res);
   document.dispatchEvent(new CustomEvent('auth:error', {
      detail: { reason: (res && (res.error || res.reason)) || 'unknown' }
   }));
}

function mountAuth(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   rootEl.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl || !rootEl.contains(actionEl)) return;
      const action = actionEl.getAttribute('data-action');

      switch (action) {
         case 'auth-login':
         case 'auth-register': {
            const form = actionEl.closest('form');
            if (form) {
               e.preventDefault();
               if (typeof form.requestSubmit === 'function') form.requestSubmit();
               else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
            return;
         }

         case 'toggle-register': {
            const loginForm = rootEl.querySelector('[data-part="auth-form-login"]');
            const registerForm = rootEl.querySelector('[data-part="auth-form-register"]');
            if (loginForm && registerForm) {
               clearFormErrors(loginForm);
               clearFormErrors(registerForm);
               loginForm.hidden = true;
               registerForm.hidden = false;
            }
            return;
         }

         case 'toggle-login': {
            const loginForm = rootEl.querySelector('[data-part="auth-form-login"]');
            const registerForm = rootEl.querySelector('[data-part="auth-form-register"]');
            if (loginForm && registerForm) {
               clearFormErrors(loginForm);
               clearFormErrors(registerForm);
               loginForm.hidden = false;
               registerForm.hidden = true;
            }
            return;
         }

         case 'auth-logout': {
            e.preventDefault();
            fetch('/api/auth/logout/', {
               method: 'POST',
               headers: { 'Accept': 'application/json' },
               credentials: 'same-origin'
            })
               .then(r => r.json())
               .then(res => {
                  if (res && res.ok) location.reload();
                  else console.warn('Logout failed:', res);
               })
               .catch(err => console.error('Logout request failed:', err));
            return;
         }

         default:
            return;
      }
   }, { signal });

   rootEl.addEventListener('submit', async (e) => {
      const form = e.target.closest('[data-part="auth-form-login"], [data-part="auth-form-register"]');
      if (!form || !rootEl.contains(form)) return;
      e.preventDefault();

      clearFormErrors(form);

      if (typeof isRequiredInput === 'function') {
         const ok = isRequiredInput(form);
         if (ok === false) return;
      }

      const formData = new FormData(form);
      const url = form.getAttribute('action') || '';

      const submitBtn = form.querySelector('[type="submit"]');
      const prevDisabled = submitBtn ? submitBtn.disabled : false;
      if (submitBtn) submitBtn.disabled = true;

      try {
         const payload = Object.fromEntries(formData.entries());

         const resp = await fetch(url, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Accept': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
         });

         let res = {};
         try {
            res = await resp.json();
         } catch (e) {
            res = { ok: false, error: 'invalid_json_response' };
         }

         if (!resp.ok && res && typeof res === 'object') {
            res.ok = false;
         }

         handleAuthResponse(rootEl, res || {});
      } catch (err) {
         console.error('Auth request failed:', err);
         handleAuthResponse(rootEl, { ok: false, error: 'network_error' });
      } finally {
         if (submitBtn) submitBtn.disabled = prevDisabled;
      }
   }, { signal, capture: true });

   return () => ac.abort();
}

const rootAuth = document.querySelector('[data-component="auth"][data-part="root"]');
if (rootAuth) {
   const cleanup = mountAuth(rootAuth);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}