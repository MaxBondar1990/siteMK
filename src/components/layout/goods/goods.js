import './goods.scss'

export function addAction(event) {
  const colorList = event.target.closest('[data-name="view-color-items"]');
  const colorItem = event.target.closest('.goods-card__color-item');

  // Клік по ul (відкриття/закриття списку)
  if (colorList && !colorItem) {
    // Закриваємо всі інші
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

    // Додаємо _action, якщо ще не додано
    if (!colorList.classList.contains('_action')) {
      colorList.classList.add('_action');
    }

    const card = colorItem.closest('.goods-card');
    const img = card?.querySelector('.goods-card__img img');
    const newSrc = colorItem.getAttribute('data-srcImg');

    if (img && newSrc) {
      img.src = newSrc;
    }

    event.stopPropagation(); // Не даємо спрацювати ul-кліку
  }
}
