import './articleContent.scss'

export function handleArticleOrderForm(event) {
  const target = event.target;

  // Відкрити модалку
  if (target.closest('[data-name="view-order-btn"]')) {
    const modal = document.querySelector('[data-name="article-order-form"]');
    if (modal) modal.classList.add('_active');
  }

  // Закрити модалку
  if (target.closest('[data-name="close-article-order-form"]')) {
    const modal = document.querySelector('[data-name="article-order-form"]');
    if (modal) modal.classList.remove('_active');
  }
}

export function handleArticleColor(event) {
  const target = event.target;

  // 1. Знаходимо клікнутий елемент з кольором
  const colorItem = target.closest('.article__colors-item');
  if (!colorItem) return;

  // 2. Витягуємо клас типу colXXX (наприклад col011)
  const colorClass = [...colorItem.classList].find(cls => cls.startsWith('col'));
  if (!colorClass) return;

  const colorCode = colorClass.replace('col', '');

  // 3. Оновлюємо зображення
  const img = document.querySelector('.article__mine-img img');
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

