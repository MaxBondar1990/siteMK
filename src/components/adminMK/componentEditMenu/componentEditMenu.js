import './componentEditMenu.scss';

/**
 * Component Edit Menu
 * - Autosize for textareas (Variant 3)
 * - Close by [data-action="close-menu"] with data-target
 */
export function mountComponentEditMenu(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   const FIELD_SEL = '.component-edit-menu__tile';
   const TA_SEL = 'textarea.component-edit-menu__param-input';

   const autosize = (ta) => {
      // Variant 3 autosize (reliable)
      ta.style.height = 'auto';
      ta.style.overflowY = 'hidden';
      ta.style.height = `${ta.scrollHeight}px`;
   };

   const updateField = (ta) => {
      const field = ta.closest(FIELD_SEL);
      if (!field) return;

      // Autosize
      if (ta.dataset.autosize === 'true') {
         autosize(ta);
      }

      // Value state (useful for styling)
      const valueRaw = ta.value ?? '';
      const value = valueRaw.trim();
      const isEmpty = value.length === 0;
      field.classList.toggle('_is-empty', isEmpty);
      field.classList.toggle('_has-value', !isEmpty);
   };

   const initAll = () => {
      rootEl.querySelectorAll(TA_SEL).forEach(updateField);
   };

   // Init after mount (after styles/layout are applied)
   const scheduleInit = () => {
      requestAnimationFrame(() => {
         requestAnimationFrame(() => {
            initAll();
         });
      });
   };

   scheduleInit();

   // If menu visibility is toggled with transitions/classes, re-init after transition
   rootEl.addEventListener(
      'transitionend',
      (e) => {
         if (e.target !== rootEl) return;
         scheduleInit();
      },
      { signal }
   );

   // Delegate input for autosize + value state
   rootEl.addEventListener(
      'input',
      (e) => {
         const ta = e.target?.closest?.(TA_SEL);
         if (!ta || !rootEl.contains(ta)) return;
         updateField(ta);
      },
      { signal }
   );

   // Remember menu state before native form submit (for reopen after reload)
   rootEl.addEventListener(
      'submit',
      (e) => {
         const form = e.target?.closest?.('.component-edit-menu__form');
         if (!form || !rootEl.contains(form)) return;

         const instanceId = form.querySelector('input[name="instance_id"]')?.value || null;
         const pageId = form.querySelector('input[name="page_id"]')?.value || null;
         const anchor = form.getAttribute('id') || null;

         if (!instanceId) return;

         const payload = {
            url: '/admin/html/component-edit-menu/',
            instance_id: instanceId,
            page_id: pageId,
            anchor,
         };

         try {
            sessionStorage.setItem('adminMenuReopen', JSON.stringify(payload));
         } catch (_) { }
         // IMPORTANT: do NOT preventDefault — native submit + reload must happen
      },
      { signal }
   );

   // Actions (close menu, toggle submenu)
   rootEl.addEventListener(
      'click',
      (e) => {
         const actionEl = e.target?.closest?.('[data-action]');
         if (!actionEl || !rootEl.contains(actionEl)) return;

         const action = actionEl.getAttribute('data-action');

         // 0) Open admin menu (fetch menu for another instance) — used by child component buttons
         if (action === 'open-admin-menu') {
            const url = actionEl.getAttribute('data-target');
            if (!url) return;

            const fd = new FormData();
            const instanceId = actionEl.getAttribute('data-instance-id');
            const pageId = actionEl.getAttribute('data-page-id');
            const componentId = actionEl.getAttribute('data-component-id');

            if (instanceId) fd.append('instance_id', instanceId);
            if (pageId) fd.append('page_id', pageId);
            if (componentId) fd.append('component_id', componentId);

            // Optional: prevent double-click spam
            actionEl.disabled = true;

            fetch(url, {
               method: 'POST',
               body: fd,
               headers: { 'X-Requested-With': 'fetch' },
               signal,
            })
               .then(async (res) => {
                  const ct = (res.headers.get('content-type') || '').toLowerCase();
                  if (ct.includes('application/json')) {
                     const json = await res.json();
                     const html = json?.html || json?.data?.html || '';
                     return { ok: res.ok, html };
                  }
                  const html = await res.text();
                  return { ok: res.ok, html };
               })
               .then(({ ok, html }) => {
                  if (!ok || !html) return;

                  // Remove current menu and insert new one
                  try {
                     rootEl.remove();
                  } catch (_) { }

                  document.body.insertAdjacentHTML('beforeend', html);
               })
               .catch(() => {
                  // ignore (abort/network)
               })
               .finally(() => {
                  try { actionEl.disabled = false; } catch (_) { }
               });

            e.preventDefault();
            e.stopPropagation();
            return;
         }

         // 1) Close menu
         if (action === 'close-menu') {
            const target = actionEl.getAttribute('data-target');

            // If target matches this menu, close it. Otherwise, try to find by [data-name]
            const menuEl =
               (target && document.querySelector(`[data-name="${CSS.escape(target)}"]`)) ||
               rootEl;

            menuEl.classList.remove('_view');
            e.preventDefault();
            return;
         }

         // 2) Toggle submenu
         if (action === 'toggle-submenu') {
            const target = actionEl.getAttribute('data-target');
            if (!target) return;

            const submenu = rootEl.querySelector(`[data-submenu="${CSS.escape(target)}"]`);
            if (!submenu) return;

            const wasCollapsed = submenu.classList.contains('_collapsed-menu');
            // If collapsed -> open (remove). If open -> collapse (add).
            submenu.classList.toggle('_collapsed-menu', !wasCollapsed);

            const nowCollapsed = !wasCollapsed;

            // Visual state of the toggle button:
            // - when submenu is OPEN -> show "cross" (_show)
            // - when submenu is COLLAPSED -> show "tick" (_hide)
            actionEl.classList.toggle('_show', !nowCollapsed);
            actionEl.classList.toggle('_hide', nowCollapsed);

            e.preventDefault();
            return;
         }
      },
      { signal }
   );

   return () => ac.abort();
}

// Auto-mount for existing + dynamically inserted instances
const mounted = new WeakSet();

function tryMount(el) {
   if (!el || mounted.has(el)) return;
   const cleanup = mountComponentEditMenu(el);
   mounted.add(el);
   // Store cleanup to allow potential manual cleanup if needed
   if (typeof cleanup === 'function') {
      el.__componentEditMenuCleanup = cleanup;
   }
}

// Mount existing
document
   .querySelectorAll('[data-component="component_edit_menu"][data-part="root"]')
   .forEach((el) => tryMount(el));

// Observe future inserts (menus injected via fetch)
const mo = new MutationObserver((mutations) => {
   mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
         if (!(node instanceof Element)) return;

         // If the inserted node itself is the root
         if (node.matches?.('[data-component="component_edit_menu"][data-part="root"]')) {
            tryMount(node);
         }

         // Or it contains roots
         node
            .querySelectorAll?.('[data-component="component_edit_menu"][data-part="root"]')
            .forEach((el) => tryMount(el));
      });
   });
});

mo.observe(document.documentElement, { childList: true, subtree: true });

// Reopen admin menu after page reload (sessionStorage-based)
(function reopenAdminMenuAfterReload() {
   let raw = null;
   try {
      raw = sessionStorage.getItem('adminMenuReopen');
   } catch (_) { }

   if (!raw) return;

   let data;
   try {
      data = JSON.parse(raw);
   } catch (_) {
      sessionStorage.removeItem('adminMenuReopen');
      return;
   }

   if (!data || !data.url || !data.instance_id) {
      sessionStorage.removeItem('adminMenuReopen');
      return;
   }

   // Clean immediately to avoid loops
   sessionStorage.removeItem('adminMenuReopen');

   const fd = new FormData();
   fd.append('instance_id', data.instance_id);
   if (data.page_id) fd.append('page_id', data.page_id);

   fetch(data.url, {
      method: 'POST',
      body: fd,
      headers: { 'X-Requested-With': 'fetch' },
   })
      .then(async (res) => {
         const ct = (res.headers.get('content-type') || '').toLowerCase();
         if (ct.includes('application/json')) {
            const json = await res.json();
            return json?.html || json?.data?.html || '';
         }
         return res.text();
      })
      .then((html) => {
         if (!html) return;

         document.body.insertAdjacentHTML('beforeend', html);

         if (data.anchor) {
            requestAnimationFrame(() => {
               const el = document.getElementById(data.anchor);
               if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            });
         }
      })
      .catch(() => { });
})();

if (import.meta?.hot) {
   import.meta.hot.dispose(() => {
      mo.disconnect();
      document
         .querySelectorAll('[data-component="component_edit_menu"][data-part="root"]')
         .forEach((el) => {
            try {
               el.__componentEditMenuCleanup?.();
            } catch (_) { }
         });
   });
}
