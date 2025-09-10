import "./orderform.scss"
  const quantityInput = document.querySelector('input[name="quantity"]');
  const totalElement = document.querySelector('[data-name="total-price"]');
  const priceElement = document.querySelector('[data-name="product-price"]');

  const basePrice = parseFloat(priceElement.textContent.trim());

  // Функція для оновлення суми
export function updateTotal() {
   
  const quantity = parseInt(quantityInput.value, 10) || 1;
  const total = basePrice * quantity;

  // Форматування як у магазині: пробіли для тисяч, 2 знаки після коми
  totalElement.textContent = total.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' грн.';
}

  quantityInput.addEventListener('input', updateTotal);

  // Запускаємо одразу для початкового значення
  updateTotal();
