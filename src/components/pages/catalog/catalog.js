const tiles = document.querySelectorAll('.related-categories__item');

let rafId = null;

function handleMove(tile, e) {
  const rect = tile.getBoundingClientRect();

  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  tile.style.setProperty('--x', x + '%');
  tile.style.setProperty('--y', y + '%');
}

tiles.forEach(tile => {

  tile.addEventListener('mousemove', e => {
    if (rafId) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      handleMove(tile, e);
    });
  });

  tile.addEventListener('mouseleave', () => {
    tile.style.setProperty('--x', '50%');
    tile.style.setProperty('--y', '50%');
  });

});