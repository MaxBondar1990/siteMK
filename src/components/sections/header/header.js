import './header.scss'
import { loadContent } from '../../globalBlokcs/fetch/fetch.js'
import { view } from '../../custom/modal/modal.js'

// Helpers use only within header root
function handleSearchClean(e, rootEl) {
   const btn = e.target.closest('[data-part="clean"]');
   if (!btn || !rootEl.contains(btn)) return;
   const searchInput = rootEl.querySelector('[data-part="input"][name="search"]');
   if (!searchInput) return;
   searchInput.value = '';
   btn.classList.remove('_view');
   if (btn) btn.classList.remove('_view');
}

function handleSearchOpen(e, rootEl) {
   const trigger = e.target.closest('[data-action="open-modal"]');
   if (!trigger || !rootEl.contains(trigger)) return;

   const target = trigger.dataset.target || 'search-modal';
   try { view(target); } catch (_) { }

   // Optional ARIA sync if present
   if (trigger.hasAttribute('aria-expanded')) {
      trigger.setAttribute('aria-expanded', 'true');
   }
}

function handleSearchClose(rootEl) {
   const trigger = rootEl.querySelector('[data-action="open-modal"][data-target="search-modal"]');
   if (trigger && trigger.hasAttribute('aria-expanded')) {
      trigger.setAttribute('aria-expanded', 'false');
      try { trigger.focus({ preventScroll: true }); } catch (_) { }
   }
}

async function handleSearchInput(e, rootEl) {
   const input = e.target.closest('[data-part="input"][name="search"]');
   if (!input || !rootEl.contains(input)) return;

   const value = input.value || '';
   const cleanBtn = rootEl.querySelector('[data-part="clean"]');
   if (cleanBtn) {
      if (value.length > 0) cleanBtn.classList.add('_view');
      else cleanBtn.classList.remove('_view');
   }

   const results = rootEl.querySelector('[data-part="results"]');
   if (value.length >= 3) {
      const formData = new FormData();
      formData.append('formName', 'search');
      formData.append('searchValue', value);
      const fileName = 'search__result';
      const res = await loadContent(fileName, formData, undefined, 'json');
      if (results) {
         if (res && res.status === 'success' && res.html) {
            results.innerHTML = res.html;
         } else if (res && res.status !== 'success') {
            // On error/timeout clear or keep last results — opting to clear
            results.innerHTML = '';
         }
      }
   }
}

function handleSearchTriggerKey(e, rootEl) {
   const trigger = e.target.closest('[data-action="open-modal"][data-target]');
   if (!trigger || !rootEl.contains(trigger)) return;
   const isEnter = e.key === 'Enter';
   const isSpace = e.key === ' ' || e.key === 'Spacebar';
   if (!isEnter && !isSpace) return;
   e.preventDefault();
   const target = trigger.dataset.target || 'search-modal';
   try { view(target); } catch (_) { }
   if (trigger.hasAttribute('aria-expanded')) {
      trigger.setAttribute('aria-expanded', 'true');
   }
}

function mountHeader(rootEl) {
   if (!rootEl) return () => { };
   const ac = new AbortController();
   const { signal } = ac;

   // Click delegation in header only
   rootEl.addEventListener('click', (e) => {
      handleSearchClean(e, rootEl);

      // Do not open modal if clicking the clean button
      if (!e.target.closest('[data-part="clean"]')) {
         handleSearchOpen(e, rootEl);
      }
   }, { signal });

   // Input delegation for search
   rootEl.addEventListener('input', (e) => {
      handleSearchInput(e, rootEl);
   }, { signal });

   // Keyboard activation for the search trigger (supports role="button")
   rootEl.addEventListener('keydown', (e) => {
      handleSearchTriggerKey(e, rootEl);
   }, { signal });

   // Scope closing sync to the search modal root (no global listeners)
   const searchModalRoot = document.getElementById('search-modal');
   if (searchModalRoot) {
      searchModalRoot.addEventListener('click', (e) => {
         const btnClose = e.target.closest('[data-part="close"][data-action="close-modal"]');
         if (!btnClose) return;
         handleSearchClose(rootEl);
      }, { signal });
   }

   return () => ac.abort();
}

// Auto-mount only on new component root
const headerRoot = document.querySelector('[data-component="header"][data-part="root"]');
if (headerRoot) {
   const cleanup = mountHeader(headerRoot);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}