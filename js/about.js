/* ==============================
   RCCG S&P Parish — about.js
   About page specific JS
   Requires: js/main.js first
   ============================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== ANIMATED STAT COUNTER =====
  // Counts up numbers when they scroll into view

  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // ms
    const startTime = performance.now();

    // Use ease-out so it slows near the end — feels natural
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Show a "+" for memberships and years to add energy
        if (target === 500) el.textContent = '500+';
      }
    }

    requestAnimationFrame(step);
  }

  // Trigger counter only once per element when it enters the viewport
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target); // only once
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

});
