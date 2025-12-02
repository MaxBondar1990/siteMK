import './christmasStiker.scss'

document.addEventListener("click", (e) => {
   const parent = document.querySelector('[data-name="christmas-gifts"]');
   if (!parent) return;

   const closeBtn = e.target.closest('[data-action="close"]');
   if (closeBtn) {
      parent.remove();
   }
});
