import "./showtextbtn.scss"

// export function openFuleContentWelcomTxt (event) {
//    console.log('123123123')
//    const btn = event.target.closest('[data-btn="action"]');
//    if (btn) {
//       const section = event.target.closest('[data-btn="action"]');
//       section.classList.add('_down-arrow');
//    }
// }

export function openFuleContentWelcomTxt (event) {
   const btn = event.target.closest('[data-btn="action"]');
   if (btn) {
      const section = btn.closest('[data-name="action"]');
      section.classList.toggle('_action');
   }
}

export function classReplacement(event) {
   const btn = event.target.closest('[data-btn="action"]');
   if (btn) {
      if (btn.classList.contains('_down-arrow')) {
         btn.classList.remove('_down-arrow');
         btn.classList.add('_up-arrow');
      } else {
         btn.classList.remove('_up-arrow');
         btn.classList.add('_down-arrow');
      }
   }
}