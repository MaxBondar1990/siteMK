import './cover.scss'
import { view } from '../../custom/modal/modal.js'

function mountCover(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   // Делегування КЛІКІВ в межах компонента
   rootEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="open-modal"]');
      if (!btn || !rootEl.contains(btn)) return;
      const target = btn.dataset.target || 'contact-form';
      view(target, rootEl);
   }, { signal });

   //// Приклад прямого слухача для input (якщо є)
   //const qtyInput = rootEl.querySelector('input[name="quantity"]');
   //if (qtyInput) {
   //   qtyInput.addEventListener('input', () => {
   //      // calcTotalCost();
   //   }, { signal, passive: true });
   //}

   return () => ac.abort();
}

// Приклад автозапуску, якщо компонент одиничний і вже в DOM:
const rootCover = document.querySelector('[data-component="cover"][data-part="root"]');
if (rootCover) {
   const cleanup = mountCover(rootCover);
   if (import.meta.hot && cleanup) {
      import.meta.hot.dispose(cleanup);
   }
}


// Міняємо вигляд пвнелі навігації по стрінці
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.page-nav-menu');
  const btnBlock = document.querySelector('.page-nav-menu__btns_blck');

  if (!nav || !btnBlock) return;

  const checkSticky = () => {
    const navTop = nav.getBoundingClientRect().top;

    if (navTop <= 0) {
      btnBlock.classList.add('_sticky');
    } else {
      btnBlock.classList.remove('_sticky');
    }
  };

  window.addEventListener('scroll', checkSticky);
});


// Підсвітка кнопок навігації по сторінці
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.page-nav-menu__btn');
  const sections = [];

  links.forEach(link => {
    const targetId = link.getAttribute('href');

    if (!targetId.startsWith('#') || targetId === '#header') return;

    const section = document.querySelector(targetId);
    if (section) {
      sections.push(section);
    }
  });

  // 🔥 Обробка кнопки "На гору"
  const topBtn = document.querySelector('.page-nav-menu__btn[href="#header"]');
  if (topBtn) {
    topBtn.addEventListener('click', () => {
      links.forEach(link => link.classList.remove('_active'));
    });
  }

  let currentActive = null;

  const observer = new IntersectionObserver(
    (entries) => {
      // Фільтруємо тільки ті, що реально в зоні видимості
      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleSections.length > 0) {
        const mostVisible = visibleSections[0];
        const id = mostVisible.target.id;

        if (currentActive !== id) {
          currentActive = id;

          links.forEach(link => link.classList.remove('_active'));

          const activeLink = document.querySelector(
            `.page-nav-menu__btn[href="#${id}"]`
          );

          activeLink?.classList.add('_active');
        }
      }
    },
    {
      root: null,
      rootMargin: "-10% 0px -40% 0px", // 🔥 звужений діапазон
      threshold: [0.25, 0.5, 0.75]      // точніше визначення
    }
  );

  sections.forEach(section => observer.observe(section));
});