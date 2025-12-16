import './sectionSelectPanel.scss'

document.addEventListener("click", (e) => {
   const menu = document.querySelector('[data-name="section-select-menu"]');
   if (!menu) return;

   const btn = e.target.closest('[data-fetch-html="sectionSelectMenu"]');
   const closeBtn = e.target.closest('[data-name="close-section-select-menu"]');

   // ВІДКРИТТЯ
   if (btn) {
      menu.classList.add('_view');
      return;
   }

   // ЗАКРИТТЯ
   if (closeBtn) {
      menu.classList.remove('_view');
   }
});


