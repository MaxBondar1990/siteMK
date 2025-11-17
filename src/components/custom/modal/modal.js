import "./modal.scss"

function setModalState(modal, state) {
   if (!modal) return;
   modal.dataset.state = state;

   if (state === 'open') {
      modal.classList.add('_view');
      modal.setAttribute('aria-hidden', 'false');
   } else {
      modal.classList.remove('_view');
      modal.setAttribute('aria-hidden', 'true');
   }

   // Lock/unlock page scroll depending on any open modals
   const anyOpen = document.querySelector('[data-component="modal"][data-part="root"][data-state="open"]');
   document.documentElement.classList.toggle('modal-open', Boolean(anyOpen));
}

export function close(target) {
   let modal = null;
   if (typeof target === 'string') {
      modal = document.querySelector(`[data-component="modal"][data-part="root"][data-target="${target}"]`);
   } else if (target && target.matches && target.matches('[data-component="modal"][data-part="root"]')) {
      modal = target;
   }
   if (!modal) return;
   setModalState(modal, 'closed');
}

export function view(target, component = null) {
   let modal = null;

   if (typeof target === 'string') {
      const selector = `[data-component="modal"][data-part="root"][data-target="${target}"]`;

      if (component !== null) {
         modal = component.querySelector(selector);
      } else {
         modal = document.querySelector(selector);
      }

   } else if (target?.matches?.('[data-component="modal"][data-part="root"]')) {
      modal = target;
   }

   if (!modal) return;

   setModalState(modal, 'open');
}


export function handleModalClick(event) {
   const btn = event.target.closest('[data-action]');
   if (!btn) return;

   const action = btn.dataset.action;
   const modal = btn.closest('[data-component="modal"][data-part="root"]');
   if (!modal) return;

   switch (action) {
      case 'close-modal':
         setModalState(modal, 'closed');
         break;
      case 'remove-modal':
         setModalState(modal, 'closed');
         modal.remove();
         // re-evaluate scroll lock after removal
         {
            const anyOpen = document.querySelector('[data-component="modal"][data-part="root"][data-state="open"]');
            document.documentElement.classList.toggle('modal-open', Boolean(anyOpen));
         }
         break;
      default:
         break;
   }
}
// Mount listeners per-modal root instead of the whole document
function mountModalRoot(rootEl) {
   if (!rootEl) return () => { };
   const ac = new AbortController();
   const { signal } = ac;

   // Delegate clicks only within this modal root
   rootEl.addEventListener('click', (event) => {
      handleModalClick(event);
   }, { signal });

   // Close this modal when a nested contact form reports success
   rootEl.addEventListener('contactform:success', () => {
      close(rootEl);
   }, { signal });

   return () => ac.abort();
}

// Auto-mount all current modal roots on the page
const modalRoots = document.querySelectorAll('[data-component="modal"][data-part="root"]');
const modalCleanups = Array.from(modalRoots, (root) => mountModalRoot(root));

// Vite HMR: clean up listeners on module replacement
if (import.meta.hot) {
   import.meta.hot.dispose(() => {
      modalCleanups.forEach((fn) => typeof fn === 'function' && fn());
   });
}
