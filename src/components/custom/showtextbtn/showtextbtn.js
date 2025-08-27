import "./showtextbtn.scss"

export function openFuleContentSection (event) {
   const btn = event.target.closest('[data-btn="action"]');
   if (btn) {
      const section = btn.closest('[data-name="action"]');
      section.classList.toggle('_action');
   }
}

export function closeFuleContentSection (event) {
   const btn = event.target.closest('[data-btn="action"]');
   if (btn) {
      if (btn.classList.contains('_down-arrow')) {
         btn.classList.remove('_down-arrow');
         btn.classList.add('_up-arrow');
      } else {
         btn.classList.remove('_up-arrow');
         btn.classList.add('_down-arrow');

            // Прокрутка до кнопки після згортання
         btn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
   }
}
