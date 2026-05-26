/* ==============================
   RCCG S&P Parish — blog.js
   ============================== */
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.blog-filter-btn');
  const blogCards  = document.querySelectorAll('.blog-card');
  const blogEmpty  = document.getElementById('blogEmpty');
  let current = 'all';

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('data-filter') === current) return;
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
      current = btn.getAttribute('data-filter');
      let shown = 0;
      blogCards.forEach(card => {
        const match = current === 'all' || card.getAttribute('data-category') === current;
        card.classList.toggle('hidden', !match);
        if (match) shown++;
      });
      blogEmpty.hidden = shown > 0;
    });
  });
});
