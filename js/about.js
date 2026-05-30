/* ============================================================
   RCCG S&P Parish — about.js
   
   This file runs only on the About page (about.html).
   It handles one thing: the animated number counters in the
   stats bar (e.g. "500+ Members", "10+ Years").
   
   When those numbers scroll into view, they count up from 0
   to their target value with a smooth animation.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     ANIMATED STAT COUNTER
     
     In the HTML, each stat number looks like this:
       <span class="stat-number" data-target="500">0</span>
     
     The data-target attribute holds the final number we want
     to count up to. We start at 0 and animate to that value.
     
     We use IntersectionObserver to only start the animation
     when the stats section scrolls into view — it would be
     pointless to animate numbers the user hasn't seen yet.
  ========================================================== */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  /* This selector finds all elements with class "stat-number"
     that ALSO have a "data-target" attribute */

  function animateCounter(el) {
    /* Read the target number from the HTML attribute */
    const target   = parseInt(el.getAttribute('data-target'), 10);
    /* parseInt converts the string "500" to the number 500
       The 10 means "parse it as base-10 (normal decimal)" */

    const duration = 1800; /* total animation time in milliseconds (1.8 seconds) */
    const startTime = performance.now(); /* high-precision timestamp of when we started */

    /* Ease-out function: makes the counter slow down near the end.
       Without this, it would count at a constant speed which feels robotic.
       
       't' goes from 0 to 1 (representing progress through the animation).
       At t=0 (start): easeOut(0) = 0
       At t=0.5 (halfway): easeOut(0.5) ≈ 0.875 (already 87.5% done!)
       At t=1 (end): easeOut(1) = 1
       
       This means it counts fast at first, then slows down — feels natural. */
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
      /* Math.pow(x, 3) = x³
         So: 1 - (1-t)³
         When t=0: 1 - 1 = 0
         When t=1: 1 - 0 = 1 */
    }

    /* requestAnimationFrame asks the browser to call our 'step' function
       before the next screen repaint (usually 60 times per second).
       This is the smoothest way to animate in JavaScript. */
    function step(currentTime) {
      const elapsed  = currentTime - startTime; /* how many ms have passed */
      const progress = Math.min(elapsed / duration, 1);
      /* progress goes from 0 to 1. Math.min caps it at 1 so we never go over. */

      const value = Math.round(easeOut(progress) * target);
      /* easeOut(progress) gives us a 0-1 value, multiply by target to get
         the current display number, Math.round removes decimals */

      el.textContent = value.toLocaleString();
      /* .toLocaleString() adds commas for large numbers: 1000 → "1,000" */

      if (progress < 1) {
        requestAnimationFrame(step); /* not done yet — request another frame */
      } else {
        /* Animation complete — add "+" for numbers that represent "and more" */
        if (target === 500) el.textContent = '500+';
      }
    }

    requestAnimationFrame(step); /* start the animation */
  }

  /* Watch each stat number. When it enters the viewport (becomes visible),
     start its counter animation. We unobserve after triggering so it
     only animates once — not every time you scroll past it. */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {       /* element is now visible */
        animateCounter(entry.target);   /* start counting */
        counterObserver.unobserve(entry.target); /* stop watching — animate once only */
      }
    });
  }, { threshold: 0.5 });
  /* threshold: 0.5 means "trigger when 50% of the element is visible" */

  statNumbers.forEach(el => counterObserver.observe(el));

}); /* end DOMContentLoaded */
