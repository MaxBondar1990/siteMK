import "./showtextbtn.scss"

export function actionFuleContentSection(event) {
   const btn = event.target.closest('[data-btn="action"]');
   if (!btn) return;

   const section = btn.closest('[data-name="action"]');
   if (!section) return;

   if (btn.classList.contains('_down-arrow')) {
      btn.classList.remove('_down-arrow');
      btn.classList.add('_up-arrow');

      section.classList.add('_action');
   } else {
      btn.classList.remove('_up-arrow');
      btn.classList.add('_down-arrow');

      section.classList.remove('_action');

      // Прокрутка до кнопки після згортання
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
   }
}
