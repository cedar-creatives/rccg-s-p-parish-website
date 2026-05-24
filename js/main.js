/* ==============================
   RCCG S&P Parish — main.js
   Author: Cedar Creatives
   ============================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. SET FOOTER YEAR DYNAMICALLY =====
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  // ===== 2. SCROLL TO TOP BUTTON =====
  const scrollBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // ===== 3. NAVBAR SCROLL EFFECT =====
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });


  // ===== 4. HAMBURGER MOBILE MENU =====
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const body      = document.body;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    body.classList.toggle('nav-open', isOpen);
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      body.classList.remove('nav-open');
    });
  });

  // Close menu when clicking the overlay (body::before)
  document.addEventListener('click', (e) => {
    if (
      body.classList.contains('nav-open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      body.classList.remove('nav-open');
    }
  });


  // ===== 5. ACTIVE NAV LINK ON SCROLL (IntersectionObserver) =====
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px' // triggers when section is in middle of viewport
  });

  sections.forEach(section => sectionObserver.observe(section));


  // ===== 6. SCROLL REVEAL ANIMATION =====
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly for a cascading effect
        const delay = (Array.from(entry.target.parentElement.children).indexOf(entry.target)) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));


  // ===== 7. CONTACT FORM VALIDATION =====
  const form         = document.getElementById('contactForm');
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameError    = document.getElementById('nameError');
  const emailError   = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const formSuccess  = document.getElementById('formSuccess');

  // Helper: show or clear an error
  function setError(input, errorEl, message) {
    errorEl.textContent = message;
    if (message) {
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }
  }

  // Validate email format
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Validate a single field on blur (real-time feedback)
  nameInput.addEventListener('blur', () => {
    setError(nameInput, nameError, nameInput.value.trim() === '' ? 'Please enter your name.' : '');
  });

  emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim() === '') {
      setError(emailInput, emailError, 'Please enter your email address.');
    } else if (!isValidEmail(emailInput.value.trim())) {
      setError(emailInput, emailError, 'Please enter a valid email address.');
    } else {
      setError(emailInput, emailError, '');
    }
  });

  messageInput.addEventListener('blur', () => {
    setError(messageInput, messageError, messageInput.value.trim().length < 10 ? 'Please enter a message (at least 10 characters).' : '');
  });

  // Full form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    // Name
    if (nameInput.value.trim() === '') {
      setError(nameInput, nameError, 'Please enter your name.');
      valid = false;
    } else {
      setError(nameInput, nameError, '');
    }

    // Email
    if (emailInput.value.trim() === '') {
      setError(emailInput, emailError, 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      setError(emailInput, emailError, 'Please enter a valid email address.');
      valid = false;
    } else {
      setError(emailInput, emailError, '');
    }

    // Message
    if (messageInput.value.trim().length < 10) {
      setError(messageInput, messageError, 'Please enter a message (at least 10 characters).');
      valid = false;
    } else {
      setError(messageInput, messageError, '');
    }

    if (valid) {
      // In production you'd send data to a backend or service like Formspree.
      // For now, we simulate success.
      form.reset();
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Hide success after 6 seconds
      setTimeout(() => {
        formSuccess.hidden = true;
      }, 6000);
    }
  });

}); // end DOMContentLoaded
