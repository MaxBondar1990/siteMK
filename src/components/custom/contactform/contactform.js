import "./contactform.scss";
import '../../fetch/submitContactForm/submitContactForm.js';

import { loadContent, isRequiredInput } from '../../globalBlokcs/fetch/fetch.js';


function collectFormData(form) {
   const fd = new FormData(form);
   const formName = form.getAttribute('name');
   if (formName) fd.append('formName', formName);
   return fd;
}

// Returns fallback error HTML string from the page (if present)
function getFallbackErrorHTML() {
   // Preferred: <template data-part="contactform-error">
   const tpl = document.querySelector('template[data-part="contactform-error"]');
   if (tpl) {
      return tpl.innerHTML.trim();
   }
   // Alternative: hidden element to clone: <div id="contactform-error-template" hidden>...</div>
   const node = document.getElementById('contactform-error-template') || document.querySelector('[data-part="contactform-error"]');
   if (node) {
      return node.innerHTML.trim();
   }
   return '';
}

// Returns fallback success HTML string from the page (if present)
function getFallbackSuccessHTML() {
   const tpl = document.querySelector('template[data-part="contactform-success"]');
   if (tpl) return tpl.innerHTML.trim();
   const node = document.getElementById('contactform-success-template') || document.querySelector('[data-part="contactform-success"]');
   if (node) return node.innerHTML.trim();
   return '';
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
      if (res && res.status === 'success') {
         const html = res.html || getFallbackSuccessHTML();
         if (html) {
            document.body.insertAdjacentHTML('beforeend', html);
            // Only now signal success (modal will close itself on this event)
            rootEl.dispatchEvent(new CustomEvent('contactform:success', { bubbles: true, detail: res }));
         } else {
            // No HTML to show -> keep the form open and do not close the modal
            console.warn('[contactform] success without HTML; modal remains open');
         }
      } else if (res && res.status === 'timeout') {
         const fallback = getFallbackErrorHTML();
         if (fallback) {
            document.body.insertAdjacentHTML('beforeend', fallback);
         }
         rootEl.dispatchEvent(new CustomEvent('contactform:timeout', { bubbles: true, detail: res }));
      } else {
         // Any non-success (network/HTTP error shape, or unexpected)
         const html = (res && res.html) ? res.html : getFallbackErrorHTML();
         if (html) {
            document.body.insertAdjacentHTML('beforeend', html);
         }
         rootEl.dispatchEvent(new CustomEvent('contactform:error', { bubbles: true, detail: res }));
      }
   } catch (err) {
      const fallback = getFallbackErrorHTML();
      if (fallback) {
         document.body.insertAdjacentHTML('beforeend', fallback);
      }
      rootEl.dispatchEvent(new CustomEvent('contactform:error', { bubbles: true, detail: { message: String(err) } }));
   } finally {
      form.dataset.loading = '0';
      if (submitBtn) submitBtn.disabled = !!prevDisabled;
   }
}

function mountContactForm(rootEl) {
   if (!rootEl) return () => { };

   const ac = new AbortController();
   const { signal } = ac;

   const formEl = rootEl.querySelector('form');
   if (!formEl) return () => ac.abort();

   try { formEl.noValidate = true; } catch (_) { }

   // Fallback to avoid blocked native submit: handle click on submit controls
   formEl.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[type="submit"], input[type="submit"], [data-action="send-contact-form"]');
      if (!btn) return;
      e.preventDefault();
      const form = formEl;
      if (!form) return;
      if (!isRequiredInput(form)) return;
      await submitContactForm(form, rootEl);
   }, { signal });

   // Enter-to-submit inside the form (except textarea)
   formEl.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'textarea') return;
      e.preventDefault();
      const form = formEl;
      if (!isRequiredInput(form)) return;
      await submitContactForm(form, rootEl);
   }, { signal });

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