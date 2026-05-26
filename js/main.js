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


  // ===== 5. DROPDOWN MENUS =====
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    const navItem = toggle.closest('.nav-item');

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navItem.classList.contains('open');

      // Close all other dropdowns first
      document.querySelectorAll('.nav-item.open').forEach(item => {
        if (item !== navItem) {
          item.classList.remove('open');
          item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        }
      });

      navItem.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Close dropdowns on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-item.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
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


  // ===== 8. WHATSAPP FLOATING BUTTON =====
  // Injects the button into every page automatically from main.js
  // Update the phone number below to the real WhatsApp number
  const WA_NUMBER = '2348000000000'; // Format: country code + number, no + or spaces

  const waBtn = document.createElement('a');
  waBtn.href        = `https://wa.me/${WA_NUMBER}`;
  waBtn.target      = '_blank';
  waBtn.rel         = 'noopener noreferrer';
  waBtn.className   = 'whatsapp-float';
  waBtn.setAttribute('aria-label', 'Chat with us on WhatsApp');
  waBtn.innerHTML   = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
               -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075
               -.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059
               -.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
               .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
               -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51
               -.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
               -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074
               .149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625
               .712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
               .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.508
               A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818
               a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.727.977.994-3.634-.235-.374
               A9.818 9.818 0 1112 21.818z"/>
    </svg>
    <span class="whatsapp-tooltip">Chat with us</span>
  `;
  document.body.appendChild(waBtn);

}); // end DOMContentLoaded
