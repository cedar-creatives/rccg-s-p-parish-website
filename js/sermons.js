/* ============================================================
   RCCG S&P Parish — sermons.js
   
   This file runs only on the Sermons page (sermons.html).
   It handles three things:
   
   1. FILTER BUTTONS — Show sermons by series (Sunday Service,
      Digging Deep, Faith Clinic, Special)
   
   2. SEARCH — A search box that filters sermons by title or
      speaker name as you type
   
   3. AUDIO PLAYER — A fixed bar at the bottom of the screen
      that plays sermon audio. It appears when you click
      "Play Audio" on any sermon card.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     GET REFERENCES TO HTML ELEMENTS
  ========================================================== */

  /* All the sermon cards in the grid */
  const sermonCards  = document.querySelectorAll('.sermon-card');

  /* The series filter buttons (All, Sunday Service, etc.) */
  const filterBtns   = document.querySelectorAll('.sermon-filter-btn');

  /* The search input box */
  const searchInput  = document.getElementById('sermonSearch');

  /* The "Showing X of Y sermons" counter */
  const visibleCount = document.getElementById('sermonVisible');
  const totalCount   = document.getElementById('sermonTotal');

  /* The "No sermons found" empty state */
  const sermonsEmpty = document.getElementById('sermonsEmpty');
  const emptyMsg     = document.getElementById('sermonsEmptyMsg');

  /* The fixed audio player bar at the bottom */
  const audioPlayer  = document.getElementById('audioPlayer');
  const audioEl      = document.getElementById('audioEl');       /* the <audio> element */
  const audioTitle   = document.getElementById('audioTitle');    /* sermon title text */
  const audioSpeaker = document.getElementById('audioSpeaker'); /* speaker name text */
  const audioClose   = document.getElementById('audioClose');   /* ✕ close button */

  /* Track the current state */
  let currentFilter = 'all'; /* which series filter is active */
  let currentSearch = '';    /* what the user has typed in the search box */

  /* Show the total count immediately */
  totalCount.textContent = sermonCards.length;


  /* ==========================================================
     PART 1: FILTER BUTTONS
     
     Each sermon card has data-series="sunday" etc.
     Each filter button has data-filter="sunday" etc.
     
     When a button is clicked, we update currentFilter and
     call applyFilters() which handles both filter AND search.
  ========================================================== */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (filter === currentFilter) return; /* already active */

      /* Update active button */
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      currentFilter = filter;
      applyFilters(); /* re-run the combined filter + search */
    });
  });


  /* ==========================================================
     PART 2: SEARCH
     
     As the user types in the search box, we filter sermons
     by title or speaker name.
     
     DEBOUNCING: We don't filter on every single keystroke
     because that would be wasteful. Instead, we wait 250ms
     after the user stops typing before filtering.
     
     How debouncing works:
     - User types a letter → we set a 250ms timer
     - User types another letter → we CANCEL the old timer
       and set a NEW 250ms timer
     - User stops typing → the timer runs out → we filter
     
     clearTimeout(searchTimeout) cancels the pending timer.
     setTimeout(..., 250) starts a new 250ms timer.
  ========================================================== */
  let searchTimeout; /* stores the timer ID so we can cancel it */

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout); /* cancel any pending filter */
    searchTimeout = setTimeout(() => {
      /* .toLowerCase() makes the search case-insensitive:
         "GRACE" and "grace" and "Grace" all match */
      currentSearch = searchInput.value.trim().toLowerCase();
      applyFilters();
    }, 250); /* wait 250ms after last keystroke */
  });


  /* ==========================================================
     PART 3: COMBINED FILTER + SEARCH
     
     This function runs whenever either the filter OR the
     search changes. It checks BOTH conditions for each card:
     
     matchesFilter: does this card's series match the filter?
     matchesSearch: does the title or speaker contain the
                    search text?
     
     A card is shown only if BOTH conditions are true.
     String.includes() checks if one string contains another:
       'grace and faith'.includes('grace') → true
       'grace and faith'.includes('love')  → false
  ========================================================== */
  function applyFilters() {
    let shown = 0;

    sermonCards.forEach(card => {
      const series  = card.getAttribute('data-series');
      /* data-title and data-speaker are stored in lowercase on the card
         for easy comparison */
      const title   = (card.getAttribute('data-title')   || '').toLowerCase();
      const speaker = (card.getAttribute('data-speaker') || '').toLowerCase();

      /* Does this card match the active filter? */
      const matchesFilter = currentFilter === 'all' || series === currentFilter;

      /* Does this card match the search text?
         Empty search matches everything. */
      const matchesSearch = currentSearch === '' ||
                            title.includes(currentSearch) ||
                            speaker.includes(currentSearch);

      if (matchesFilter && matchesSearch) {
        card.classList.remove('hidden'); /* show this card */
        shown++;
      } else {
        card.classList.add('hidden');    /* hide this card */
      }
    });

    /* Update the visible count */
    visibleCount.textContent = shown;

    /* Show the empty state if nothing matches */
    if (shown === 0) {
      sermonsEmpty.hidden = false;
      /* Show a helpful message depending on whether they searched or filtered */
      if (currentSearch !== '') {
        emptyMsg.textContent = `No sermons found for "${searchInput.value.trim()}". Try a different search.`;
      } else {
        emptyMsg.textContent = 'No sermons in this category yet. Check back soon!';
      }
    } else {
      sermonsEmpty.hidden = true;
    }
  }


  /* ==========================================================
     PART 4: AUDIO PLAYER
     
     The audio player is a fixed bar at the bottom of the page.
     It's hidden by default (audioPlayer.hidden = true).
     
     When the user clicks "Play Audio" on a sermon card:
     1. We find the sermon card that contains the button
     2. We read the title, speaker, and audio file URL
     3. We load the audio and show the player bar
     
     We use EVENT DELEGATION — one listener on the grid
     catches clicks on all "Play Audio" buttons inside it.
     This is more efficient than adding a listener to each button.
     
     e.target.closest('.sermon-media-btn:not(.sermon-media-btn--outline)')
     means: "find the nearest ancestor button that has class
     'sermon-media-btn' but NOT 'sermon-media-btn--outline'"
     (the outline button is "Watch Video", not "Play Audio")
     
     TO ADD REAL AUDIO: Update the href="..." on each
     .sermon-media-btn in sermons.html to point to a real
     audio file URL (e.g. https://yoursite.com/audio/sermon.mp3)
  ========================================================== */
  const sermonsGrid = document.getElementById('sermonsGrid');
  if (sermonsGrid) {
    sermonsGrid.addEventListener('click', (e) => {
      /* Find the "Play Audio" button that was clicked */
      const playBtn = e.target.closest('.sermon-media-btn:not(.sermon-media-btn--outline)');
      if (!playBtn) return; /* click was not on a play button */

      e.preventDefault(); /* stop the link from navigating */

      /* Get the sermon details from the card */
      const card    = playBtn.closest('.sermon-card');
      const title   = card.querySelector('h3').textContent;
      const speaker = card.querySelector('.sermon-card-speaker').textContent.trim();
      const src     = playBtn.getAttribute('href'); /* the audio file URL */

      /* If href is "#" (placeholder), show a "coming soon" message */
      if (!src || src === '#') {
        showAudioPlaceholder(title, speaker);
        return;
      }

      loadAudio(src, title, speaker);
    });
  }

  /* Load and play an audio file */
  function loadAudio(src, title, speaker) {
    audioTitle.textContent   = title;
    audioSpeaker.textContent = speaker;
    audioEl.src              = src;    /* set the audio source */
    audioPlayer.hidden       = false;  /* show the player bar */
    document.body.classList.add('audio-playing'); /* offset scroll-to-top button */

    /* .play() returns a Promise. We use .catch() to handle the case
       where the browser blocks autoplay (common on mobile).
       If autoplay is blocked, the player still shows — user can press play. */
    audioEl.play().catch(() => {
      /* Autoplay was blocked — that's okay, the player is still visible */
    });
  }

  /* Show the player bar with a "coming soon" notice */
  function showAudioPlaceholder(title, speaker) {
    audioTitle.textContent   = title + ' (audio coming soon)';
    audioSpeaker.textContent = speaker;
    audioEl.src              = ''; /* no audio to play */
    audioPlayer.hidden       = false;
    document.body.classList.add('audio-playing');
  }

  /* Close the audio player when the ✕ button is clicked */
  audioClose.addEventListener('click', () => {
    audioEl.pause();           /* stop playback */
    audioEl.src = '';          /* clear the source (frees memory) */
    audioPlayer.hidden = true; /* hide the player bar */
    document.body.classList.remove('audio-playing'); /* restore scroll-to-top position */
  });

  /* Pause audio automatically when the user navigates away from the page.
     'beforeunload' fires just before the page is closed or navigated away. */
  window.addEventListener('beforeunload', () => {
    audioEl.pause();
  });

}); /* end DOMContentLoaded */
