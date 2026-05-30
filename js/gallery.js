/* ============================================================
   RCCG S&P Parish — gallery.js
   
   This file runs only on the Gallery page (gallery.html).
   It handles two things:
   
   1. FILTERING — The buttons at the top (All Photos, Sunday
      Service, Outreach, etc.) show/hide photos by category.
   
   2. LIGHTBOX — Clicking any photo opens it full-screen in
      an overlay. You can navigate between photos with arrows,
      keyboard keys, or by swiping on mobile.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     GET ALL THE ELEMENTS WE NEED
     
     We grab references to HTML elements once at the top so
     we don't have to search for them repeatedly later.
     document.getElementById finds ONE element by its id="..."
     document.querySelectorAll finds ALL elements matching a
     CSS selector and returns them as a list.
  ========================================================== */

  /* Filter buttons: All Photos, Sunday Service, Outreach, etc. */
  const filterBtns   = document.querySelectorAll('.filter-btn');

  /* Every photo card in the gallery grid */
  const galleryItems = document.querySelectorAll('.gallery-item');

  /* The "Showing X of Y photos" counter text */
  const visibleCount = document.getElementById('visibleCount');
  const totalCount   = document.getElementById('totalCount');

  /* The "No photos in this category" empty state message */
  const galleryEmpty = document.getElementById('galleryEmpty');

  /* All the lightbox elements */
  const lightbox         = document.getElementById('lightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop'); /* dark background */
  const lightboxClose    = document.getElementById('lightboxClose');    /* ✕ button */
  const lightboxPrev     = document.getElementById('lightboxPrev');     /* ‹ arrow */
  const lightboxNext     = document.getElementById('lightboxNext');     /* › arrow */
  const lightboxImg      = document.getElementById('lightboxImg');      /* the big photo */
  const lightboxSpinner  = document.getElementById('lightboxSpinner'); /* loading spinner */
  const lightboxCaption  = document.getElementById('lightboxCaption'); /* photo description */
  const lightboxCategory = document.getElementById('lightboxCategory');/* category badge */
  const lightboxCounter  = document.getElementById('lightboxCounter'); /* "3 / 28" text */

  /* State variables — these track what's happening right now */
  let currentFilter = 'all'; /* which filter is active */
  let currentIndex  = 0;     /* which photo is open in the lightbox */
  let visibleItems  = [];    /* list of photo buttons currently visible (not hidden) */

  /* Set the total count immediately when the page loads */
  totalCount.textContent = galleryItems.length;
  updateVisibleItems(); /* build the initial list of visible items */


  /* ==========================================================
     PART 1: FILTER LOGIC
     
     Each photo card has a data-category attribute, e.g.:
       data-category="sunday-service"
       data-category="ministries"
     
     Each filter button has a data-filter attribute, e.g.:
       data-filter="all"
       data-filter="sunday-service"
     
     When a button is clicked, we loop through all photos and
     hide the ones that don't match the selected category.
     "Hidden" means we add the CSS class 'hidden' which sets
     display: none — making the element invisible and removed
     from the layout.
  ========================================================== */

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      /* If this filter is already active, do nothing */
      if (filter === currentFilter) return;

      /* Remove 'active' from all buttons, then add it to the clicked one */
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false'); /* accessibility: not pressed */
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true'); /* accessibility: now pressed */

      currentFilter = filter;
      applyFilter(filter);
    });
  });

  /* Show/hide photos based on the selected filter */
  function applyFilter(filter) {
    let shown = 0; /* count how many photos are visible after filtering */

    galleryItems.forEach(item => {
      const category = item.getAttribute('data-category');

      /* 'all' shows everything. Otherwise, only show matching category. */
      const matches = filter === 'all' || category === filter;

      if (matches) {
        item.classList.remove('hidden'); /* show this photo */
        shown++;
      } else {
        item.classList.add('hidden');    /* hide this photo */
      }
    });

    /* Update the "Showing X of Y" counter */
    visibleCount.textContent = shown;

    /* Show the empty state message if nothing matches */
    galleryEmpty.hidden = shown > 0;

    /* Rebuild the list of visible items for lightbox navigation */
    updateVisibleItems();
  }

  /* Build an array of all photo buttons that are currently visible.
     We need this so the lightbox knows which photos to navigate between.
     
     The selector '.gallery-item:not(.hidden) .gallery-thumb' means:
     "find all .gallery-thumb buttons that are inside a .gallery-item
      that does NOT have the class 'hidden'" */
  function updateVisibleItems() {
    visibleItems = Array.from(
      document.querySelectorAll('.gallery-item:not(.hidden) .gallery-thumb')
    );
  }


  /* ==========================================================
     PART 2: LIGHTBOX
     
     The lightbox is a full-screen overlay that shows one photo
     at a time. It has:
       - A large photo in the centre
       - A loading spinner while the photo downloads
       - Caption and category label below the photo
       - Left/right arrows to navigate
       - A counter showing "3 / 28"
       - A close button (✕)
     
     We listen for clicks on the gallery grids (not individual
     buttons) using "event delegation" — one listener on the
     parent catches clicks on all children. This is more
     efficient than adding a listener to every single photo.
  ========================================================== */

  /* The gallery has two grids: the main grid and the Service Moments grid */
  const grids = ['galleryGrid', 'serviceMomentsGrid'];

  grids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return; /* skip if this grid doesn't exist on the page */

    el.addEventListener('click', (e) => {
      /* e.target is the exact element that was clicked.
         .closest('.gallery-thumb') walks UP the DOM tree to find
         the nearest ancestor (or self) with class 'gallery-thumb'.
         This handles clicks on the image, the overlay, or the caption
         inside the button — they all find the same button. */
      const thumb = e.target.closest('.gallery-thumb');
      if (!thumb) return; /* click was not on a photo button */

      /* Find which position this photo is in the visible list */
      const index = visibleItems.indexOf(thumb);
      if (index === -1) return; /* photo not found (shouldn't happen) */

      openLightbox(index);
    });
  });

  /* Open the lightbox at a specific photo index */
  function openLightbox(index) {
    currentIndex = index;
    showSlide(currentIndex);

    lightbox.hidden = false;                    /* make the overlay visible */
    document.body.style.overflow = 'hidden';   /* prevent page scrolling behind it */
    lightboxClose.focus();                      /* move keyboard focus to close button */
  }

  /* Close the lightbox */
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = ''; /* restore page scrolling */

    /* Return keyboard focus to the photo that was clicked */
    if (visibleItems[currentIndex]) {
      visibleItems[currentIndex].focus();
    }
  }

  /* Load and display a specific photo in the lightbox */
  function showSlide(index) {
    const thumb    = visibleItems[index];
    const src      = thumb.getAttribute('data-src');           /* image file path */
    const caption  = thumb.getAttribute('data-caption');       /* photo description */
    const catLabel = thumb.getAttribute('data-category-label');/* e.g. "Ministries" */

    /* Show the spinner while the image loads */
    lightboxImg.classList.add('loading');
    lightboxSpinner.classList.add('active');

    /* Update the text content immediately (don't wait for image) */
    lightboxCaption.textContent  = caption;
    lightboxCategory.textContent = catLabel;
    lightboxCounter.textContent  = `${index + 1} / ${visibleItems.length}`;
    lightboxImg.alt = caption;

    /* Preload the image in the background.
       new Image() creates a hidden image element.
       When we set its .src, the browser starts downloading.
       .onload fires when the download is complete.
       .onerror fires if the download fails. */
    const tempImg = new Image();

    tempImg.onload = () => {
      /* Image loaded successfully — show it */
      lightboxImg.src = src;
      lightboxImg.classList.remove('loading');
      lightboxSpinner.classList.remove('active');
    };

    tempImg.onerror = () => {
      /* Image failed to load — show an error message */
      lightboxImg.src = '';
      lightboxImg.classList.remove('loading');
      lightboxSpinner.classList.remove('active');
      lightboxCaption.textContent = caption + ' (image not found)';
    };

    tempImg.src = src; /* this line triggers the download */

    /* Hide the left arrow on the first photo, right arrow on the last */
    lightboxPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
    lightboxNext.style.visibility = index === visibleItems.length - 1 ? 'hidden' : 'visible';
  }

  /* Go to the next photo */
  function goNext() {
    if (currentIndex < visibleItems.length - 1) {
      currentIndex++;
      showSlide(currentIndex);
    }
  }

  /* Go to the previous photo */
  function goPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      showSlide(currentIndex);
    }
  }

  /* Wire up the close and navigation buttons */
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox); /* click dark area to close */
  lightboxNext.addEventListener('click', goNext);
  lightboxPrev.addEventListener('click', goPrev);

  /* Keyboard navigation — only works when the lightbox is open */
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return; /* lightbox is closed — ignore key presses */

    switch (e.key) {
      case 'Escape':    closeLightbox(); break;
      case 'ArrowRight':
      case 'ArrowDown': e.preventDefault(); goNext(); break;
      case 'ArrowLeft':
      case 'ArrowUp':   e.preventDefault(); goPrev(); break;
    }
  });

  /* ==========================================================
     SWIPE SUPPORT FOR MOBILE
     
     On touchscreen devices, users expect to swipe left/right
     to navigate photos. We track where the finger starts
     (touchstart) and where it ends (touchend), then calculate
     the direction.
     
     e.changedTouches[0].screenX is the X position of the
     first finger on the screen.
     
     { passive: true } is a performance hint to the browser:
     "this listener won't call e.preventDefault(), so you can
     scroll smoothly without waiting for this code to run."
  ========================================================== */
  let touchStartX = 0;
  let touchEndX   = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX; /* record where finger touched down */
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX; /* record where finger lifted up */
    const diff = touchStartX - touchEndX;    /* positive = swiped left, negative = right */

    if (Math.abs(diff) > 50) { /* only count it as a swipe if moved more than 50px */
      if (diff > 0) {
        goNext(); /* swiped left → go to next photo */
      } else {
        goPrev(); /* swiped right → go to previous photo */
      }
    }
  }, { passive: true });

}); /* end DOMContentLoaded */
