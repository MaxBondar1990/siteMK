import './christmasStiker.scss'

// document.addEventListener("click", (e) => {
//    const parent = document.querySelector('[data-name="christmas-gifts"]');
//    if (!parent) return;

//    const closeBtn = e.target.closest('[data-action="close"]');
//    if (closeBtn) {
//       parent.remove();
//    }
// });

document.addEventListener("DOMContentLoaded", () => {
   const sticker = document.querySelector('[data-name="christmas-gifts"]');
   const openBtn = document.querySelector('[data-action="view-christmas-gifts"]');
   if (!sticker || !openBtn) return;

   const state = localStorage.getItem("christmasStickerState");

   // ============================
   // 1. ВІДНОВЛЕННЯ СТАНУ
   // ============================
   if (state === "hidden") {
      // Стікер — схований
      sticker.classList.add("_departure");
      sticker.classList.add("_hide");
      sticker.classList.remove("_show");

      // Кнопка відкрити — показана
      openBtn.classList.add("_show");
      openBtn.classList.remove("_hide");

   } else {
      // Стікер — показаний
      sticker.classList.remove("_departure");
      sticker.classList.remove("_hide");
      sticker.classList.add("_show");

      // Кнопка відкрити — схована
      openBtn.classList.add("_hide");
      openBtn.classList.remove("_show");
   }

   // ============================
   // 2. ОБРОБНИКИ КЛІКІВ
   // ============================
   document.addEventListener("click", (e) => {
      const closeBtn = e.target.closest('[data-action="close"]');
      const viewBtn  = e.target.closest('[data-action="view-christmas-gifts"]');

      // ----------------------------
      // ЗАКРИТИ СТІКЕР
      // ----------------------------
      if (closeBtn) {
         sticker.classList.add("_departure");
         sticker.classList.add("_hide");
         sticker.classList.remove("_show");

         openBtn.classList.remove("_hide");
         openBtn.classList.add("_show");

         localStorage.setItem("christmasStickerState", "hidden");
      }

      // ----------------------------
      // ПОКАЗАТИ СТІКЕР
      // ----------------------------
      if (viewBtn) {
         sticker.classList.remove("_departure");
         sticker.classList.remove("_hide");
         sticker.classList.add("_show");

         openBtn.classList.add("_hide");
         openBtn.classList.remove("_show");

         localStorage.setItem("christmasStickerState", "shown");
      }
   });
});
