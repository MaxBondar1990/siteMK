import './related-categories'


const tiles = document.querySelectorAll('.related-categories__item');

tiles.forEach(tile => {
  tile.addEventListener('mousemove', e => {

    const rect = tile.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    tile.style.setProperty('--x', x + '%');
    tile.style.setProperty('--y', y + '%');

  });
});