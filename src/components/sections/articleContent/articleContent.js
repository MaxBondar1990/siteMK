import './articleContent.scss'

function viewArticleOrderForm(event) {
  const btn = event.target.closest('[data-btn="view-order-btn"]');
  if (btn) {
   const modal = document.querySelector('[data-name="article-order-form"]');
   if (modal) {
      modal.classList.add('_view');
   }
  }
}

function setProductColorAndImage(event) {
  const target = event.target;

  // 1. Знаходимо клікнутий елемент з кольором
  const colorItem = target.closest('[data-name="colors-item"]');
  if (!colorItem) return;

  // 2. Витягуємо клас типу colXXX (наприклад col011)
  const colorClass = [...colorItem.classList].find(cls => cls.startsWith('col'));
  if (!colorClass) return;

  const colorCode = colorClass.replace('col', '');

  // 3. Оновлюємо зображення
  const img = document.querySelector('[data-name="mine-img"] img');
  if (img) {
    // Оновлення src (автоматично оновлюється і на мобільних)
    img.src = `assets/img/articleContent/article_${colorCode}.jpg`;
    img.alt = `Колір ${colorCode}`;
  }

  // 4. Оновлюємо блок із текстом кольору
  const infoColor = document.querySelector('.info__color');
  if (infoColor) {
    // Видаляємо попередній клас colXXX, якщо є
    infoColor.className = 'info__color'; // скидаємо всі colXXX
    infoColor.classList.add(colorClass);
    infoColor.textContent = colorCode;
  }
}

function updatePriceByQuantity() {
  const quantityInput = document.querySelector('input[name="quantity"]');
  const priceElement = document.querySelector('[data-name="product-price"]');
  const totalElement = document.querySelector('[data-name="total-price"]');

  if (!quantityInput || !priceElement || !totalElement) {
    console.warn('Не знайдено потрібних елементів для калькулятора');
    return;
  }

  // Беремо базову ціну з DOM
  const basePrice = parseFloat(priceElement.textContent.trim());

  // Функція для оновлення суми
function updateTotal() {
  const quantity = parseInt(quantityInput.value, 10) || 1;
  const total = basePrice * quantity;

  // Форматування як у магазині: пробіли для тисяч, 2 знаки після коми
  totalElement.textContent = total.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' грн.';
}

  // Оновлюємо при зміні значення
  quantityInput.addEventListener('input', updateTotal);

  // Запускаємо одразу для початкового значення
  updateTotal();
}

document.addEventListener('click', (event) => {
   viewArticleOrderForm(event);
   // closeArticleOrderForm(event);
   setProductColorAndImage(event);
   updatePriceByQuantity();

   // sendForm(event);
   
   // switchTariffTab(event);
});
