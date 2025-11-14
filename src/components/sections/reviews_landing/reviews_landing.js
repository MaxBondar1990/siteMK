import './reviews_landing.scss'

const reviewCards = document.querySelectorAll('.reviews__card');

reviewCards.forEach(card => {
  const dots = card.querySelectorAll('.reviews__dot');
  const images = card.querySelectorAll('.reviews__img');

  let currentIndex = 0;
  const total = images.length;

  // Оновлення зображень
  const updateImages = index => {
    images.forEach(img => img.classList.remove('_active'));
    if (images[index]) images[index].classList.add('_active');
  };

  // Оновлення крапок
  const updateDots = index => {
    dots.forEach(dot => dot.classList.remove('_active'));
    if (dots[index]) dots[index].classList.add('_active');
  };

  // Клік по крапці — оновлюємо все
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateImages(currentIndex);
      updateDots(currentIndex);
    });
  });

  // Автоматичне гортання (картинки + крапки)
  if (total > 1) {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % total;
      updateImages(currentIndex);
      updateDots(currentIndex);
    }, 5000);
  }
});


