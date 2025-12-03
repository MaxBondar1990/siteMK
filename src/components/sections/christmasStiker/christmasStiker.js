import './christmasStiker.scss'

// document.addEventListener("click", (e) => {
//    const parent = document.querySelector('[data-name="christmas-gifts"]');
//    if (!parent) return;

//    const closeBtn = e.target.closest('[data-action="close"]');
//    if (closeBtn) {
//       parent.remove();
//    }
// });

// 1. Перевіряємо, чи стікер вже закрито раніше
if (!localStorage.getItem("christmasStickerClosed")) {
   const parent = document.querySelector('[data-name="christmas-gifts"]');

   if (parent) {
      parent.style.display = "block"; // якщо треба явно показати
   }
} else {
   // Якщо закрито — відразу не показуємо
   const parent = document.querySelector('[data-name="christmas-gifts"]');
   if (parent) parent.remove();
}

// 2. Відслідковуємо клік на кнопку закриття
document.addEventListener("click", (e) => {
   const parent = document.querySelector('[data-name="christmas-gifts"]');
   if (!parent) return;

   const closeBtn = e.target.closest('[data-action="close"]');
   if (closeBtn) {
      parent.remove();

      // Записуємо інформацію про закриття у localStorage
      localStorage.setItem("christmasStickerClosed", "true");
   }
});
