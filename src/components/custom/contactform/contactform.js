import "./contactform.scss";
import '../../fetch/submitContactForm/submitContactForm.js';

import { loadContent, isRequiredInput } from '../../globalBlokcs/fetch/fetch.js';


function collectFormData(form) {
   const fd = new FormData(form);
   const formName = form.getAttribute('name');
   if (formName) fd.append('formName', formName);
   return fd;
}

async function submitContactForm(form, rootEl) {
   if (form.dataset.loading === '1') return; // prevent double submit
   form.dataset.loading = '1';

   // build payload
   const formData = collectFormData(form);

   // UI helpers
   const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], [data-action="send-contact-form"]');

   // lock UI
   const prevDisabled = submitBtn ? submitBtn.disabled : undefined;
   if (submitBtn) submitBtn.disabled = true;

   try {
      const res = await loadContent('submitContactForm', formData, undefined, 'json');

      // Expect backend to always return HTML for all statuses.
      const html = res && typeof res.html === 'string' ? res.html : '';
      if (html) {
         document.body.insertAdjacentHTML('beforeend', html);
      } else {
         console.warn('[contactform] response without HTML', res);
      }

      const isSuccess = !!(res && (res.status === 'success' || res.status === 'ok'));

      if (isSuccess) {
         // Analytics hook: expose source for GTM/GA4/Ads
         const source = form.dataset.formSource || 'unknown';
         window.dataLayer = window.dataLayer || [];
         window.dataLayer.push({
            event: 'contact_form_success',
            source,
            formName: form.getAttribute('name') || 'unknown'
         });

         // Only now signal success (modal will close itself on this event)
         rootEl.dispatchEvent(new CustomEvent('contactform:success', { bubbles: true, detail: res }));
      } else if (res && res.status === 'timeout') {
         rootEl.dispatchEvent(new CustomEvent('contactform:timeout', { bubbles: true, detail: res }));
      } else {
         rootEl.dispatchEvent(new CustomEvent('contactform:error', { bubbles: true, detail: res }));
      }
   } catch (err) {
      console.error('[contactform] submit failed', err);
      rootEl.dispatchEvent(new CustomEvent('contactform:error', { bubbles: true, detail: { message: String(err) } }));
   } finally {
      form.dataset.loading = '0';
      // Restore previous disabled state (default to enabled)
      const restoredDisabled = prevDisabled === undefined ? false : !!prevDisabled;
      if (submitBtn) submitBtn.disabled = restoredDisabled;
   }
}

function mountContactForm(rootEl) {
   if (!rootEl) return () => { };

   const ac = new AbortController();
   const { signal } = ac;

   const formEl = rootEl.querySelector('form');
   if (!formEl) return () => ac.abort();

   try { formEl.noValidate = true; } catch (_) { }

   // Native submit handler (single source of truth)
   formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = formEl;
      if (!isRequiredInput(form)) return;
      await submitContactForm(form, rootEl);
   }, { signal });

   // File input label (per-form)
   const fileInput = formEl.querySelector('input[name="file_print"]');
   const fileLabel = formEl.querySelector('[data-name="print-maket"]');
   if (fileInput && fileLabel) {
      fileInput.addEventListener('change', () => {
         if (fileInput.files && fileInput.files.length > 0) {
            fileLabel.textContent = fileInput.files[0].name;
         } else {
            fileLabel.textContent = 'Додати макет';
         }
      }, { signal });
   }

   return () => ac.abort();
}

function initContactForms() {
   const roots = document.querySelectorAll('[data-component="contactform"][data-part="root"]');
   const cleanups = Array.from(roots, (root) => mountContactForm(root));
   if (import.meta.hot) {
      import.meta.hot.dispose(() => {
         cleanups.forEach((fn) => typeof fn === 'function' && fn());
      });
   }
}

if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initContactForms, { once: true });
} else {
   initContactForms();
}