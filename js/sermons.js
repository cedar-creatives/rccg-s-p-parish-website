/* ==============================
   RCCG S&P Parish — sermons.js
   Sermons page: search, filter, audio player
   Requires: js/main.js first
   ============================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== ELEMENTS =====
  const sermonCards   = document.querySelectorAll('.sermon-card');
  const filterBtns    = document.querySelectorAll('.sermon-filter-btn');
  const searchInput   = document.getElementById('sermonSearch');
  const visibleCount  = document.getElementById('sermonVisible');
  const totalCount    = document.getElementById('sermonTotal');
  const sermonsEmpty  = document.getElementById('sermonsEmpty');
  const emptyMsg      = document.getElementById('sermonsEmptyMsg');

  // Audio player elements
  const audioPlayer   = document.getElementById('audioPlayer');
  const audioEl       = document.getElementById('audioEl');
  const audioTitle    = document.getElementById('audioTitle');
  const audioSpeaker  = document.getElementById('audioSpeaker');
  const audioClose    = document.getElementById('audioClose');

  let currentFilter   = 'all';
  let currentSearch   = '';

  // Set total count
  totalCount.textContent = sermonCards.length;


  // ===== 1. FILTER LOGIC =====

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (filter === currentFilter) return;

      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      currentFilter = filter;
      applyFilters();
    });
  });


  // ===== 2. SEARCH LOGIC =====

  // Debounce so we don't filter on every single keystroke
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = searchInput.value.trim().toLowerCase();
      applyFilters();
    }, 250);
  });


  // ===== 3. COMBINED FILTER + SEARCH =====

  function applyFilters() {
    let shown = 0;

    sermonCards.forEach(card => {
      const series  = card.getAttribute('data-series');
      const title   = card.getAttribute('data-title') || '';
      const speaker = card.getAttribute('data-speaker') || '';

      const matchesFilter = currentFilter === 'all' || series === currentFilter;
      const matchesSearch = currentSearch === '' ||
                            title.includes(currentSearch) ||
                            speaker.includes(currentSearch);

      if (matchesFilter && matchesSearch) {
        card.classList.remove('hidden');
        shown++;
      } else {
        card.classList.add('hidden');
      }
    });

    visibleCount.textContent = shown;

    // Show/hide empty state with appropriate message
    if (shown === 0) {
      sermonsEmpty.hidden = false;
      if (currentSearch !== '') {
        emptyMsg.textContent = `No sermons found for "${searchInput.value.trim()}". Try a different search.`;
      } else {
        emptyMsg.textContent = 'No sermons in this category yet. Check back soon!';
      }
    } else {
      sermonsEmpty.hidden = true;
    }
  }


  // ===== 4. AUDIO PLAYER =====
  // "Play Audio" buttons open the fixed bottom audio bar.
  // In production, update the href on each .sermon-media-btn to point
  // to a real audio file URL (e.g. /audio/sermon-title.mp3 or a CDN link).

  document.getElementById('sermonsGrid').addEventListener('click', (e) => {
    const playBtn = e.target.closest('.sermon-media-btn:not(.sermon-media-btn--outline)');
    if (!playBtn) return;

    e.preventDefault();

    const card    = playBtn.closest('.sermon-card');
    const title   = card.querySelector('h3').textContent;
    const speaker = card.querySelector('.sermon-card-speaker').textContent.trim();
    const src     = playBtn.getAttribute('href');

    // Don't load if href is just "#" (placeholder)
    if (!src || src === '#') {
      showAudioPlaceholder(title, speaker);
      return;
    }

    loadAudio(src, title, speaker);
  });

  function loadAudio(src, title, speaker) {
    audioTitle.textContent   = title;
    audioSpeaker.textContent = speaker;
    audioEl.src              = src;
    audioPlayer.hidden       = false;
    audioEl.play().catch(() => {
      // Autoplay blocked — player is still visible, user can press play manually
    });
  }

  function showAudioPlaceholder(title, speaker) {
    // Audio file not yet linked — show the player bar with a notice
    audioTitle.textContent   = title + ' (audio coming soon)';
    audioSpeaker.textContent = speaker;
    audioEl.src              = '';
    audioPlayer.hidden       = false;
  }

  audioClose.addEventListener('click', () => {
    audioEl.pause();
    audioEl.src    = '';
    audioPlayer.hidden = true;
  });

  // Pause audio when navigating away
  window.addEventListener('beforeunload', () => {
    audioEl.pause();
  });

}); // end DOMContentLoaded
