import './menu_header.scss';

/**
 * Menu Header component
 * Handles `[data-action="close-menu"]` clicks inside its root element.
 *
 * Usage:
 *   const rootCover = document.querySelector('[data-component="menu-header"]');
 *   mountMenuHeader(rootCover);
 */

export function mountMenuHeader(rootEl) {
   if (!rootEl) return () => { };

   const titleEl = rootEl.querySelector('[data-part="title"]');
   const originalTitle = titleEl ? titleEl.textContent : '';

   const ac = new AbortController();
   const { signal } = ac;

   rootEl.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('[data-action="close-menu"]');
      if (!btn || !rootEl.contains(btn)) return;

      const target = btn.getAttribute('data-target');

      // 1) Prefer explicit target: close the menu with matching data-component
      if (target) {
         const menuEl = document.querySelector(`[data-component="${CSS.escape(target)}"]`);
         if (menuEl) {
            menuEl.classList.remove('_view');
            if (titleEl) titleEl.textContent = originalTitle;
            e.preventDefault();
            return;
         }
      }

      // 2) Fallback: close the nearest visible menu-like container
      const fallbackMenu = btn.closest('._view');
      if (fallbackMenu) {
         fallbackMenu.classList.remove('_view');
         if (titleEl) titleEl.textContent = originalTitle;
         e.preventDefault();
      }
   }, { signal });

   // Unmount helper
   return () => ac.abort();
}

export function setMenuHeaderTitle(rootEl, newTitle) {
   if (!rootEl) return;

   const titleEl = rootEl.querySelector('[data-part="title"]');
   if (!titleEl) return;

   if (typeof newTitle === 'string') {
      titleEl.textContent = newTitle;
   }
}

// Self-mount: supports both initial DOM and dynamically injected menus (fetch -> insert)
(function selfMountMenuHeaders() {
   const ROOT_SELECTOR = '[data-component="menu-header"][data-part="part"]';
   const MOUNT_FLAG = 'data-menu-header-mounted';

   const tryMount = (el) => {
      if (!el || el.nodeType !== 1) return;
      if (!el.matches(ROOT_SELECTOR)) return;
      if (el.hasAttribute(MOUNT_FLAG)) return;

      el.setAttribute(MOUNT_FLAG, '1');
      mountMenuHeader(el);
   };

   // 1) Mount what is already in DOM
   document.querySelectorAll(ROOT_SELECTOR).forEach(tryMount);

   // 2) Mount anything that gets injected later
   const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
         for (const n of m.addedNodes) {
            if (!n || n.nodeType !== 1) continue;

            // The added node itself may be a header
            tryMount(n);

            // Or it may contain headers
            if (n.querySelectorAll) {
               n.querySelectorAll(ROOT_SELECTOR).forEach(tryMount);
            }
         }
      }
   });

   mo.observe(document.documentElement, { childList: true, subtree: true });
})();
