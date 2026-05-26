/* ==============================
   RCCG S&P Parish — gallery.js
   Gallery page: filter + lightbox
   Requires: js/main.js first
   ============================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== ELEMENTS =====
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const visibleCount = document.getElementById('visibleCount');
  const totalCount   = document.getElementById('totalCount');
  const galleryEmpty = document.getElementById('galleryEmpty');

  // Lightbox elements
  const lightbox        = document.getElementById('lightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxClose   = document.getElementById('lightboxClose');
  const lightboxPrev    = document.getElementById('lightboxPrev');
  const lightboxNext    = document.getElementById('lightboxNext');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxSpinner = document.getElementById('lightboxSpinner');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxCounter = document.getElementById('lightboxCounter');

  // Track state
  let currentFilter  = 'all';
  let currentIndex   = 0;
  let visibleItems   = [];   // array of gallery-thumb buttons currently visible

  // Set total count on load
  totalCount.textContent = galleryItems.length;
  updateVisibleItems();


  // ===== 1. FILTER LOGIC =====

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (filter === currentFilter) return; // no-op if already active

      // Update active button state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      currentFilter = filter;
      applyFilter(filter);
    });
  });

  function applyFilter(filter) {
    let shown = 0;

    galleryItems.forEach(item => {
      const category = item.getAttribute('data-category');
      const matches  = filter === 'all' || category === filter;

      if (matches) {
        item.classList.remove('hidden');
        shown++;
      } else {
        item.classList.add('hidden');
      }
    });

    // Update count
    visibleCount.textContent = shown;

    // Show/hide empty state
    galleryEmpty.hidden = shown > 0;

    // Rebuild the visible items list for lightbox navigation
    updateVisibleItems();
  }

  function updateVisibleItems() {
    // Collect all gallery-thumb buttons that are currently visible
    visibleItems = Array.from(document.querySelectorAll('.gallery-item:not(.hidden) .gallery-thumb'));
  }


  // ===== 2. LIGHTBOX =====

  // Open lightbox when a thumbnail is clicked
  document.getElementById('galleryGrid').addEventListener('click', (e) => {
    const thumb = e.target.closest('.gallery-thumb');
    if (!thumb) return;

    const index = visibleItems.indexOf(thumb);
    if (index === -1) return;

    openLightbox(index);
  });

  function openLightbox(index) {
    currentIndex = index;
    showSlide(currentIndex);

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden'; // prevent background scroll

    // Focus the close button for accessibility
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';

    // Return focus to the thumbnail that was clicked
    if (visibleItems[currentIndex]) {
      visibleItems[currentIndex].focus();
    }
  }

  function showSlide(index) {
    const thumb   = visibleItems[index];
    const src     = thumb.getAttribute('data-src');
    const caption = thumb.getAttribute('data-caption');
    const catLabel = thumb.getAttribute('data-category-label');

    // Show spinner while image loads
    lightboxImg.classList.add('loading');
    lightboxSpinner.classList.add('active');

    // Set caption and category immediately
    lightboxCaption.textContent  = caption;
    lightboxCategory.textContent = catLabel;
    lightboxCounter.textContent  = `${index + 1} / ${visibleItems.length}`;
    lightboxImg.alt = caption;

    // Load image
    const tempImg = new Image();
    tempImg.onload = () => {
      lightboxImg.src = src;
      lightboxImg.classList.remove('loading');
      lightboxSpinner.classList.remove('active');
    };
    tempImg.onerror = () => {
      // If image fails to load, show a fallback
      lightboxImg.src = '';
      lightboxImg.classList.remove('loading');
      lightboxSpinner.classList.remove('active');
      lightboxCaption.textContent = caption + ' (image not found)';
    };
    tempImg.src = src;

    // Update arrow visibility
    lightboxPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
    lightboxNext.style.visibility = index === visibleItems.length - 1 ? 'hidden' : 'visible';
  }

  function goNext() {
    if (currentIndex < visibleItems.length - 1) {
      currentIndex++;
      showSlide(currentIndex);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      showSlide(currentIndex);
    }
  }

  // Button events
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', goNext);
  lightboxPrev.addEventListener('click', goPrev);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        goNext();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        goPrev();
        break;
    }
  });

  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX   = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) { // minimum swipe distance
      if (diff > 0) {
        goNext(); // swipe left → next
      } else {
        goPrev(); // swipe right → prev
      }
    }
  }, { passive: true });

}); // end DOMContentLoaded
