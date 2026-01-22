import './componentEditMenu.scss';

/**
 * Component Edit Menu
 * - Autosize for textareas (Variant 3)
 * - Ghost placeholder (data-placeholder)
 * - Lightweight preview line
 * - Close by [data-action="close-menu"] with data-target
 */
export function mountComponentEditMenu(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   const FIELD_SEL = '.component-edit-menu-container__field';
   const TA_SEL = 'textarea._textarea';
   const GHOST_SEL = '.section_block-menu-container__ghost';
   const PREVIEW_SEL = '.section_block-menu-container__preview';

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

      // Ghost placeholder
      const ghost = field.querySelector(GHOST_SEL);
      const placeholder = ta.dataset.placeholder || 'Введіть значення…';
      const valueRaw = ta.value ?? '';
      const value = valueRaw.trim();
      const isEmpty = value.length === 0;

      field.classList.toggle('_is-empty', isEmpty);
      field.classList.toggle('_has-value', !isEmpty);

      if (ghost) {
         ghost.textContent = placeholder;
      }

      // Lightweight preview (single-line)
      const preview = field.querySelector(PREVIEW_SEL);
      if (preview) {
         preview.textContent = value ? value.replace(/\s+/g, ' ') : '';
      }
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

   // Delegate input for autosize + ghost/preview
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

// Auto-mount for single instance
const root = document.querySelector('[data-fls-componentEditMenu]');
if (root) {
   const cleanup = mountComponentEditMenu(root);
   if (import.meta?.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}
