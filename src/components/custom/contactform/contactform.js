import "./contactform.scss";
import { loadContent, isRequiredInput } from '../../globalBlokcs/fetch/fetch.js';

// DEBUG: log all submit and click events to detect blockers
['submit'].forEach((evt) => {
   document.addEventListener(evt, (e) => {
      console.log(`[debug] ${evt} event`, {
         target: e.target,
         defaultPrevented: e.defaultPrevented,
         eventPhase: e.eventPhase,
         type: e.type
      });
   }, true); // capture phase
});

function collectFormData(form) {
   const fd = new FormData(form);
   const formName = form.getAttribute('name');
   if (formName) fd.append('formName', formName);
   return fd;
}

async function submitContactForm(form) {
   const formData = collectFormData(form);
   const maybePromise = loadContent('submit', formData, 'body', 'form');
   if (maybePromise && typeof maybePromise.then === 'function') {
      try { await maybePromise; } catch (_) { }
   }
}

function mountContactForm(rootEl) {
   if (!rootEl) return () => { };

   const ac = new AbortController();
   const { signal } = ac;

   const formEl = rootEl.querySelector('form');
   if (!formEl) return () => ac.abort();

   // Fallback to avoid blocked native submit: handle click on submit controls
   formEl.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[type="submit"], input[type="submit"], [data-action="send-contact-form"]');
      if (!btn) return;
      e.preventDefault();
      const form = formEl;
      if (!form) return;
      if (!isRequiredInput(form)) return;
      await submitContactForm(form);
      rootEl.dispatchEvent(new CustomEvent('contactform:submitted', { bubbles: true }));
   }, { signal });

   // Enter-to-submit inside the form (except textarea)
   formEl.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'textarea') return;
      e.preventDefault();
      const form = formEl;
      if (!isRequiredInput(form)) return;
      await submitContactForm(form);
      rootEl.dispatchEvent(new CustomEvent('contactform:submitted', { bubbles: true }));
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