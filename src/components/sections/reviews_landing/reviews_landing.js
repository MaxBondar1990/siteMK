import './reviews_landing.scss'

const reviewCards = document.querySelectorAll('.reviews__card');

reviewCards.forEach(card => {
  const dots = card.querySelectorAll('.reviews__dot');
  const images = card.querySelectorAll('.reviews__img');

  let currentIndex = 0;
  const total = images.length;

  // Функція для оновлення зображень (без змін у крапках)
  const updateImages = index => {
    images.forEach(img => img.classList.remove('_active'));
    if (images[index]) images[index].classList.add('_active');
  };

  // Клік по крапці — змінюємо зображення + оновлюємо _active
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('_active'));
      dot.classList.add('_active');
      currentIndex = index;
      updateImages(currentIndex);
    });
  });

  // Автоматичне гортання (тільки картинки)
  if (total > 1) {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % total;
      updateImages(currentIndex);
    }, 5000);
  }
});

