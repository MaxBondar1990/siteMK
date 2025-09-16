import "./showtextbtn.scss";

function toggleExpand(btn) {
   if (!btn) return;
   const section = btn.closest('[data-part="expandable"]');
   if (!section) return;

   const isClosed = btn.classList.contains('_down-arrow');
   if (isClosed) {
      btn.classList.remove('_down-arrow');
      btn.classList.add('_up-arrow');
      section.classList.add('_action');
      section.dataset.state = 'open';
      btn.setAttribute('aria-expanded', 'true');
   } else {
      btn.classList.remove('_up-arrow');
      btn.classList.add('_down-arrow');
      section.classList.remove('_action');
      section.dataset.state = 'closed';
      btn.setAttribute('aria-expanded', 'false');
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
   }
}

function mountShowTextBtn(btn) {
   if (!btn) return () => { };
   const ac = new AbortController();
   const { signal } = ac;

   if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');
   btn.setAttribute('aria-expanded', btn.classList.contains('_down-arrow') ? 'false' : 'true');

   btn.addEventListener('click', () => toggleExpand(btn), { signal });

   btn.addEventListener('keydown', (e) => {
      const isEnter = e.key === 'Enter';
      const isSpace = e.key === ' ' || e.key === 'Spacebar';
      if (!isEnter && !isSpace) return;
      e.preventDefault();
      toggleExpand(btn);
   }, { signal });

   return () => ac.abort();
}

const buttons = document.querySelectorAll('[data-component="showtextbtn"][data-part="button"]');
const cleanups = Array.from(buttons, (b) => mountShowTextBtn(b));

if (import.meta.hot) {
   import.meta.hot.dispose(() => {
      cleanups.forEach((fn) => typeof fn === 'function' && fn());
   });
}
