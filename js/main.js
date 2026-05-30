/* ============================================================
   RCCG S&P Parish — main.js
   
   This file runs on EVERY page of the website.
   It handles all the things that are shared across pages:
     - The navbar (top menu)
     - The hamburger menu on mobile
     - Dropdown menus (Explore, Connect)
     - The scroll-to-top button
     - The scroll reveal animation (elements fading in)
     - The contact form validation
     - The team photo lightbox (homepage)
     - The WhatsApp floating button
     - The service moments slideshow (homepage)
   
   HOW IT LOADS:
   Every HTML page has this at the bottom:
     <script src="js/main.js"></script>
   That line tells the browser to load and run this file.
   ============================================================ */


/* 'DOMContentLoaded' means: "wait until the entire HTML page has
   been read and built before running any of this code."
   Without this, JavaScript might try to find elements (like buttons
   or forms) before the browser has created them — and crash.
   Everything inside this block runs only after the page is ready. */
document.addEventListener('DOMContentLoaded', () => {


  /* ==========================================================
     1. SET FOOTER YEAR AUTOMATICALLY
     
     In the footer of every page there is:
       <span id="year"></span>
     
     Instead of typing the year manually (and forgetting to
     update it every January), we grab that element and fill
     it with the current year from JavaScript.
     
     new Date()           → creates a "Date" object for right now
     .getFullYear()       → pulls just the 4-digit year from it
     yearEl.textContent   → sets the visible text inside the element
     
     The 'if (yearEl)' check makes sure the element exists before
     we try to use it — some pages might not have it.
  ========================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ==========================================================
     2. SCROLL-TO-TOP BUTTON
     
     There is a small circular button (↑) fixed to the bottom-
     right corner of every page. It only appears after the user
     has scrolled down 400 pixels, and clicking it smoothly
     scrolls back to the very top.
     
     window.scrollY       → how many pixels the user has scrolled down
     classList.add()      → adds a CSS class to the element
     classList.remove()   → removes a CSS class from the element
     
     The CSS class 'visible' makes the button appear (opacity: 1).
     Without it, the button is invisible (opacity: 0).
  ========================================================== */
  const scrollBtn = document.getElementById('scrollTop');

  /* Listen for any scroll event on the whole window */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');    /* show the button */
    } else {
      scrollBtn.classList.remove('visible'); /* hide the button */
    }
  });

  /* When the button is clicked, scroll smoothly to the top */
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    /* top: 0 means "go to position 0 (the very top)"
       behavior: 'smooth' means "animate it, don't just jump" */
  });


  /* ==========================================================
     3. NAVBAR SCROLL EFFECT
     
     When the user scrolls down more than 80px, we add the
     class 'scrolled' to the navbar. The CSS then makes the
     navbar background slightly darker/more opaque so it
     stands out against the page content below it.
     
     This is a common pattern on modern websites — the navbar
     starts transparent over the hero image, then becomes solid
     as you scroll.
  ========================================================== */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });


  /* ==========================================================
     4. HAMBURGER MOBILE MENU
     
     On small screens (phones/tablets), the full navigation
     links are hidden. Instead, a "hamburger" button (☰) appears.
     Clicking it slides in a menu panel from the right side.
     
     How it works:
     - The hamburger button has id="hamburger"
     - The nav links list has id="navLinks"
     - When the button is clicked, we toggle the class 'open'
       on both elements
     - CSS uses that 'open' class to slide the panel in/out
     
     classList.toggle('open') means:
       "If 'open' is there, remove it. If it's not there, add it."
       It returns true if the class was ADDED, false if removed.
     
     aria-expanded is an accessibility attribute that tells
     screen readers whether the menu is open or closed.
  ========================================================== */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const body      = document.body; /* document.body = the <body> element */

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open'); /* toggle and save result */
    hamburger.classList.toggle('open', isOpen);       /* sync hamburger animation */
    hamburger.setAttribute('aria-expanded', isOpen);  /* tell screen readers */
    body.classList.toggle('nav-open', isOpen);        /* adds dark overlay behind menu */
  });

  /* Close the menu automatically when any nav link is clicked.
     This is important on mobile — after tapping a link, the
     menu should close so the user can see the page. */
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      body.classList.remove('nav-open');
    });
  });

  /* Close the menu if the user taps the dark overlay behind it.
     We check that the click was NOT inside the nav panel and
     NOT on the hamburger button itself. */
  document.addEventListener('click', (e) => {
    if (
      body.classList.contains('nav-open') &&   /* menu is open */
      !navLinks.contains(e.target) &&           /* click was outside the nav */
      !hamburger.contains(e.target)             /* click was not on the hamburger */
    ) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      body.classList.remove('nav-open');
    }
  });


  /* ==========================================================
     5. DROPDOWN MENUS (Explore & Connect)
     
     Some nav items have sub-menus (dropdowns). On desktop,
     these appear on hover via CSS. On mobile, they open when
     the parent item is clicked.
     
     querySelectorAll('.nav-dropdown-toggle') finds ALL the
     buttons that have sub-menus (Explore, Connect).
     
     For each one, we listen for a click:
       1. Close any OTHER open dropdowns first
       2. Toggle this one open/closed
     
     e.stopPropagation() prevents the click from "bubbling up"
     to the document-level click listener that closes dropdowns —
     otherwise the dropdown would open and immediately close.
  ========================================================== */
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    /* .closest('.nav-item') walks UP the DOM tree to find the
       nearest parent element with class 'nav-item' */
    const navItem = toggle.closest('.nav-item');

    toggle.addEventListener('click', (e) => {
      e.stopPropagation(); /* stop this click reaching the document listener */

      const isOpen = navItem.classList.contains('open'); /* is it already open? */

      /* Close all other open dropdowns */
      document.querySelectorAll('.nav-item.open').forEach(item => {
        if (item !== navItem) { /* don't close the one we're about to toggle */
          item.classList.remove('open');
          item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
          /* The ?. is "optional chaining" — it means "only call this if it exists" */
        }
      });

      /* Toggle this dropdown */
      navItem.classList.toggle('open', !isOpen); /* add 'open' if it was closed */
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* Close all dropdowns when clicking anywhere outside a nav item */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* Close all dropdowns when the user presses the Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-item.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });


  /* ==========================================================
     6. SCROLL REVEAL ANIMATION
     
     Any element with class="reveal" starts invisible
     (opacity: 0, slightly shifted down). When it scrolls
     into the visible area of the screen, it fades in and
     slides up into place.
     
     We use IntersectionObserver — a browser tool that watches
     elements and fires a callback when they enter or leave
     the viewport (the visible part of the screen).
     
     threshold: 0.12 means "trigger when 12% of the element
     is visible" — so it fires just as the element appears.
     
     The stagger delay creates a "cascade" effect: if multiple
     elements are siblings (e.g. a row of cards), each one
     animates slightly after the previous one.
     
     revealObserver.unobserve(el) means "stop watching this
     element" — we only want the animation to happen once.
  ========================================================== */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { /* element has entered the viewport */

        /* Calculate how many siblings come before this element.
           This creates a staggered delay so cards animate one after another. */
        const siblings = Array.from(entry.target.parentElement.children);
        const index    = siblings.indexOf(entry.target);
        const delay    = index * 80; /* 80ms between each sibling */

        setTimeout(() => {
          entry.target.classList.add('visible'); /* CSS transition kicks in */
        }, delay);

        revealObserver.unobserve(entry.target); /* animate only once */
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ==========================================================
     7. CONTACT FORM VALIDATION
     
     The contact form on the homepage (and contact page) needs
     to check that the user filled everything in correctly
     before we pretend to "send" it.
     
     We validate:
       - Name: must not be empty
       - Email: must look like a real email (has @ and a dot)
       - Message: must be at least 10 characters
     
     We show errors in real time (on 'blur' = when the user
     leaves a field) AND again on submit.
     
     In a real production site, you'd send the form data to a
     backend server or a service like Formspree. For now, we
     just simulate success by showing a green message.
  ========================================================== */
  const form         = document.getElementById('contactForm');
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameError    = document.getElementById('nameError');
  const emailError   = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const formSuccess  = document.getElementById('formSuccess');

  /* Only run form code if the form actually exists on this page */
  if (form) {

    /* Helper function: show or clear an error message under a field.
       If 'message' is empty string, we clear the error.
       If 'message' has text, we show it and mark the input red. */
    function setError(input, errorEl, message) {
      errorEl.textContent = message;
      if (message) {
        input.classList.add('error');    /* red border */
      } else {
        input.classList.remove('error'); /* back to normal */
      }
    }

    /* Check if an email address looks valid.
       The /regex/ pattern checks for: something @ something . something
       .test() returns true or false */
    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    /* Validate name when user clicks away from the field ('blur' event) */
    nameInput.addEventListener('blur', () => {
      setError(nameInput, nameError,
        nameInput.value.trim() === '' ? 'Please enter your name.' : ''
      );
      /* .trim() removes spaces from both ends — so "   " counts as empty */
    });

    /* Validate email when user clicks away */
    emailInput.addEventListener('blur', () => {
      if (emailInput.value.trim() === '') {
        setError(emailInput, emailError, 'Please enter your email address.');
      } else if (!isValidEmail(emailInput.value.trim())) {
        setError(emailInput, emailError, 'Please enter a valid email address.');
      } else {
        setError(emailInput, emailError, ''); /* clear error */
      }
    });

    /* Validate message when user clicks away */
    messageInput.addEventListener('blur', () => {
      setError(messageInput, messageError,
        messageInput.value.trim().length < 10
          ? 'Please enter a message (at least 10 characters).'
          : ''
      );
    });

    /* Full validation when the form is submitted */
    form.addEventListener('submit', (e) => {
      e.preventDefault(); /* stop the browser from reloading the page */

      let valid = true; /* we'll set this to false if anything fails */

      /* Check name */
      if (nameInput.value.trim() === '') {
        setError(nameInput, nameError, 'Please enter your name.');
        valid = false;
      } else {
        setError(nameInput, nameError, '');
      }

      /* Check email */
      if (emailInput.value.trim() === '') {
        setError(emailInput, emailError, 'Please enter your email address.');
        valid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
        setError(emailInput, emailError, 'Please enter a valid email address.');
        valid = false;
      } else {
        setError(emailInput, emailError, '');
      }

      /* Check message */
      if (messageInput.value.trim().length < 10) {
        setError(messageInput, messageError, 'Please enter a message (at least 10 characters).');
        valid = false;
      } else {
        setError(messageInput, messageError, '');
      }

      /* If everything passed, show success */
      if (valid) {
        form.reset(); /* clear all the fields */
        formSuccess.hidden = false; /* show the green success message */
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        /* Hide the success message after 6 seconds */
        setTimeout(() => {
          formSuccess.hidden = true;
        }, 6000);
      }
    });

  } /* end if (form) */


  /* ==========================================================
     8. TEAM PHOTO LIGHTBOX (Homepage)
     
     On the homepage "Meet Our Team" section, each team card
     is a button. When clicked, it opens a full-screen overlay
     (called a "lightbox") showing the full photo.
     
     How it works:
     1. Each card has data-src="..." (the image path) and
        data-caption="..." (the team name) as HTML attributes
     2. When clicked, we read those attributes and load the image
     3. We show a spinner while the image loads
     4. The lightbox closes when: the X button is clicked,
        the dark backdrop is clicked, or Escape is pressed
     
     We preload the image using a hidden Image() object so the
     lightbox doesn't show a broken image while it loads.
  ========================================================== */
  const teamLightbox         = document.getElementById('teamLightbox');
  const teamLightboxBackdrop = document.getElementById('teamLightboxBackdrop');
  const teamLightboxClose    = document.getElementById('teamLightboxClose');
  const teamLightboxImg      = document.getElementById('teamLightboxImg');
  const teamLightboxSpinner  = document.getElementById('teamLightboxSpinner');
  const teamLightboxCaption  = document.getElementById('teamLightboxCaption');

  /* Only run if the lightbox HTML exists on this page */
  if (teamLightbox) {

    document.querySelectorAll('.team-card').forEach(card => {
      card.addEventListener('click', () => {
        const src     = card.getAttribute('data-src');     /* image file path */
        const caption = card.getAttribute('data-caption') || '';

        /* Show spinner while image loads */
        teamLightboxImg.classList.add('loading');
        if (teamLightboxSpinner) teamLightboxSpinner.classList.add('active');
        teamLightboxCaption.innerHTML = caption;
        teamLightboxImg.alt = caption.replace(/&amp;/g, '&'); /* decode HTML entities */

        /* Preload the image in the background */
        const tmp = new Image(); /* creates a hidden image element */
        tmp.onload = () => {
          /* Image has finished loading — now show it */
          teamLightboxImg.src = src;
          teamLightboxImg.classList.remove('loading');
          if (teamLightboxSpinner) teamLightboxSpinner.classList.remove('active');
        };
        tmp.src = src; /* this triggers the download */

        /* Show the lightbox overlay */
        teamLightbox.hidden = false;
        document.body.style.overflow = 'hidden'; /* prevent background scrolling */
        teamLightboxClose.focus(); /* move keyboard focus to the close button */
      });
    });

    /* Function to close the lightbox */
    function closeTeamLightbox() {
      teamLightbox.hidden = true;
      document.body.style.overflow = ''; /* restore scrolling */
      teamLightboxImg.src = '';           /* clear the image to free memory */
    }

    teamLightboxClose.addEventListener('click', closeTeamLightbox);
    teamLightboxBackdrop.addEventListener('click', closeTeamLightbox);

    /* Close on Escape key — only if the lightbox is currently open */
    document.addEventListener('keydown', (e) => {
      if (!teamLightbox.hidden && e.key === 'Escape') closeTeamLightbox();
    });

  } /* end if (teamLightbox) */


  /* ==========================================================
     9. WHATSAPP FLOATING BUTTON
     
     Instead of adding the WhatsApp button HTML to every single
     page manually, we create it here in JavaScript and inject
     it into the page automatically.
     
     document.createElement('a') creates a new <a> link element
     in memory (not yet on the page).
     
     We set its properties (href, class, innerHTML etc.) then
     use document.body.appendChild(waBtn) to add it to the page.
     
     To change the phone number, update WA_NUMBER below.
     Format: country code + number, no + sign, no spaces.
     Nigeria (+234): remove the leading 0 from the number.
     e.g. 0706 734 6021 becomes 2347067346021
  ========================================================== */
  const WA_NUMBER = '2347067346021';

  const waBtn = document.createElement('a');
  waBtn.href      = `https://wa.me/${WA_NUMBER}`; /* WhatsApp click-to-chat link */
  waBtn.target    = '_blank';                      /* open in a new tab */
  waBtn.rel       = 'noopener noreferrer';         /* security best practice for _blank links */
  waBtn.className = 'whatsapp-float';
  waBtn.setAttribute('aria-label', 'Chat with us on WhatsApp');

  /* innerHTML sets the HTML content inside the element.
     We're putting in the WhatsApp SVG icon and a tooltip. */
  waBtn.innerHTML = `
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

  document.body.appendChild(waBtn); /* add the button to the page */


  /* ==========================================================
     10. SERVICE MOMENTS SLIDESHOW (Homepage)
     
     The homepage has a slideshow of service photos that
     automatically advances every 4.5 seconds.
     
     The HTML structure is:
       <div id="slideshowTrack">   ← the moving strip of slides
         <div class="slide">...</div>
         <div class="slide">...</div>
         ...
       </div>
     
     To show slide 0: move the track 0% to the left
     To show slide 1: move the track 100% to the left
     To show slide 2: move the track 200% to the left
     
     We use CSS transform: translateX(-N%) to do the moving.
     The CSS transition property makes it animate smoothly.
     
     The dots at the bottom are clickable — clicking dot 2
     jumps to slide 2, etc.
     
     resetAutoplay() restarts the 4.5s timer whenever the user
     manually clicks a button — so it doesn't jump mid-click.
  ========================================================== */
  const track        = document.getElementById('slideshowTrack');
  const prevBtn      = document.getElementById('slideshowPrev');
  const nextBtn      = document.getElementById('slideshowNext');
  const dotsContainer = document.getElementById('slideshowDots');

  /* Only run if the slideshow exists on this page */
  if (track && prevBtn && nextBtn && dotsContainer) {
    const slides = Array.from(track.children); /* all slide divs */
    const dots   = Array.from(dotsContainer.children); /* all dot buttons */
    let slideIndex  = 0;    /* which slide is currently showing (starts at 0) */
    let autoplayTimer = null; /* will hold the setInterval reference */

    /* Move the track and update which slide/dot is "active" */
    function updateSlideshow() {
      /* Move the track: slide 0 = 0%, slide 1 = -100%, slide 2 = -200% etc. */
      track.style.transform = `translateX(-${slideIndex * 100}%)`;

      /* Mark the current slide as active (for the Ken Burns zoom effect) */
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === slideIndex);
      });

      /* Mark the current dot as active (it turns gold) */
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === slideIndex);
      });
    }

    /* Go to the next slide. The % operator wraps around:
       if we're on the last slide, (last + 1) % total = 0 (back to start) */
    function showNextSlide() {
      slideIndex = (slideIndex + 1) % slides.length;
      updateSlideshow();
    }

    /* Go to the previous slide. We add slides.length before % to avoid
       negative numbers (e.g. -1 % 5 would be -1, not 4) */
    function showPrevSlide() {
      slideIndex = (slideIndex - 1 + slides.length) % slides.length;
      updateSlideshow();
    }

    /* Clear the existing timer and start a fresh 4.5s countdown */
    function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(showNextSlide, 4500); /* 4500ms = 4.5 seconds */
    }

    /* Wire up the arrow buttons */
    nextBtn.addEventListener('click', () => { showNextSlide(); resetAutoplay(); });
    prevBtn.addEventListener('click', () => { showPrevSlide(); resetAutoplay(); });

    /* Wire up each dot — clicking dot i jumps to slide i */
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        slideIndex = i;
        updateSlideshow();
        resetAutoplay();
      });
    });

    /* Start the autoplay when the page loads */
    resetAutoplay();
  }


}); /* end DOMContentLoaded — everything above runs after the page is ready */
