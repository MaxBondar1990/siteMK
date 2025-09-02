import './catalog.scss'

export function viewColorItems(event) {
  const colorList = event.target.closest('[data-name="view-color-items"]');
  const colorItem = event.target.closest('.goods-card__color-item');

  // Клік по ul (відкриття/закриття списку)
  if (colorList && !colorItem) {
    // Закриваємо всі інші списки
    document.querySelectorAll('[data-name="view-color-items"]').forEach(list => {
      if (list !== colorList) {
        list.classList.remove('_action');
      }
    });

    // Перемикаємо _action для поточного
    colorList.classList.toggle('_action');
    return;
  }

  // Клік по li (зміна картинки + відкриття, якщо ще не відкрито)
  if (colorItem) {
    const colorList = colorItem.closest('[data-name="view-color-items"]');

    // Закриваємо всі інші списки, крім поточного
    document.querySelectorAll('[data-name="view-color-items"]').forEach(list => {
      if (list !== colorList) {
        list.classList.remove('_action');
      }
    });

    // Додаємо _action для поточного
    colorList.classList.add('_action');

    const card = colorItem.closest('.goods-card');
    const img = card?.querySelector('.goods-card__img img');
    const newSrc = colorItem.getAttribute('data-srcImg');

    if (img && newSrc) {
      img.src = newSrc;
    }

    event.stopPropagation(); // Не даємо спрацювати ul-кліку
  }
}


// colorPriceUpdater.js
export function applyColorAndPriceChange(event) {
   const colorItem = event.target.closest(".goods-card__color-item");
   if (!colorItem) return;

   const card = colorItem.closest(".goods-card");
   if (!card) return;

   const priceElement = card.querySelector(".goods-card__price [itemprop='price']");
   const productImg = card.querySelector(".goods-card__img img");

   // Форматуємо ціну в гривнях
   if (priceElement && colorItem.dataset.price) {
      const rawPrice = colorItem.dataset.price.replace(",", "."); // на випадок коми
      const numberPrice = parseFloat(rawPrice);
      if (!isNaN(numberPrice)) {
         // Форматування: 425,00
         const formattedPrice = numberPrice.toLocaleString("uk-UA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
         });
         priceElement.textContent = formattedPrice;
      } else {
         priceElement.textContent = colorItem.dataset.price; // fallback
      }
   }

   // Оновлюємо зображення
   if (productImg && colorItem.dataset.srcimg) {
      productImg.src = colorItem.dataset.srcimg;
   }

   // Активний клас для вибраного кольору
   const colorItems = card.querySelectorAll(".goods-card__color-item");
   colorItems.forEach(el => el.classList.remove("active"));
   colorItem.classList.add("active");
}

