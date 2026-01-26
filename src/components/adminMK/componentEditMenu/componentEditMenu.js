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

   const FIELD_SEL = '.component-edit-menu-container__field';
   const TA_SEL = 'textarea._textarea';

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

   // Close menu action
   rootEl.addEventListener(
      'click',
      (e) => {
         const btn = e.target?.closest?.('[data-action="close-menu"]');
         if (!btn || !rootEl.contains(btn)) return;

         const target = btn.getAttribute('data-target');

         // If target matches this menu, close it. Otherwise, try to find by [data-name]
         const menuEl =
            (target && document.querySelector(`[data-name="${CSS.escape(target)}"]`)) ||
            rootEl;

         // Preferred: toggle state class
         menuEl.classList.remove('_view');

         // Optional: if menu is inserted into DOM dynamically, remove it
         // (keep if you prefer just hiding)
         // menuEl.remove();

         e.preventDefault();
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
