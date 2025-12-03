import './christmasStiker.scss'

// document.addEventListener("click", (e) => {
//    const parent = document.querySelector('[data-name="christmas-gifts"]');
//    if (!parent) return;

//    const closeBtn = e.target.closest('[data-action="close"]');
//    if (closeBtn) {
//       parent.remove();
//    }
// });

// 1. Перевіряємо, чи вже закривали стікер у цій сесії
if (!sessionStorage.getItem("christmasStickerClosed")) {
   const parent = document.querySelector('[data-name="christmas-gifts"]');
   
   if (parent) {
      parent.style.display = "block"; // показуємо, якщо треба
   }
}

// 2. Відслідковуємо клік на кнопку закриття
document.addEventListener("click", (e) => {
   const parent = document.querySelector('[data-name="christmas-gifts"]');
   if (!parent) return;

   const closeBtn = e.target.closest('[data-action="close"]');
   if (closeBtn) {
      parent.remove();

      // Записуємо у сесію, що стікер закритий
      sessionStorage.setItem("christmasStickerClosed", "true");
   }
});