/* ============================================================
   RCCG S&P Parish — events.js
   
   This file runs only on the Events page (events.html).
   It handles three things:
   
   1. AUTO-MARK PAST EVENTS — Reads the date on each event
      card and automatically greys it out if the date has
      already passed. No manual updating needed.
   
   2. FILTER BUTTONS — The category buttons (All, Special,
      Vigil, Outreach, Youth) show/hide event cards.
   
   3. ADD TO CALENDAR — The "Add to Calendar" button on the
      featured event generates a .ics file that users can
      open in Google Calendar, Apple Calendar, Outlook etc.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     PART 1: AUTO-MARK PAST EVENTS
     
     Each event card has two elements:
       <span class="event-day">15</span>
       <span class="event-month">JUN</span>
     
     We read these, build a Date object, and compare it to
     today. If the event date is before today, we add the
     CSS class 'event-card--past' which makes it grey.
     
     We also add a "Past Event" label so it's clear to users.
  ========================================================== */

  const currentYear = new Date().getFullYear();

  /* today at midnight — we compare dates, not times */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* Map month abbreviations to JavaScript month numbers.
     JavaScript months are 0-indexed: January = 0, December = 11 */
  const monthMap = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4,  JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
  };

  document.querySelectorAll('.event-card').forEach(card => {
    const dayEl   = card.querySelector('.event-day');
    const monthEl = card.querySelector('.event-month');
    if (!dayEl || !monthEl) return; /* skip cards without date elements */

    const day   = parseInt(dayEl.textContent.trim(), 10);
    const month = monthMap[monthEl.textContent.trim().toUpperCase()];

    /* Skip if we couldn't parse the date */
    if (isNaN(day) || month === undefined) return;

    /* Build a Date for this event (assume current year) */
    const eventDate = new Date(currentYear, month, day);

    /* If the event date is before today, mark it as past */
    if (eventDate < today) {
      card.classList.add('event-card--past'); /* CSS makes it grey */

      /* Add a "Past Event" text label next to the category tag */
      const tag = card.querySelector('.event-tag');
      if (tag && !card.querySelector('.past-label')) {
        const pastLabel = document.createElement('span');
        pastLabel.className = 'past-label';
        pastLabel.textContent = 'Past Event';
        pastLabel.setAttribute('aria-label', 'This event has already taken place');
        /* insertAdjacentElement('afterend', el) inserts el right after tag */
        tag.insertAdjacentElement('afterend', pastLabel);
      }
    }
  });


  /* ==========================================================
     PART 2: FILTER BUTTONS
     
     Each event card has data-category="special" etc.
     Each filter button has data-filter="special" etc.
     
     When a button is clicked, we show only cards that match
     the selected category (or all cards for "all").
     
     We use card.style.display = 'none' to hide cards instead
     of adding a CSS class — both approaches work, this is
     just a slightly different technique from the gallery.
  ========================================================== */

  const filterBtns  = document.querySelectorAll('.event-filter-btn');
  const eventCards  = document.querySelectorAll('.event-card');
  const eventsEmpty = document.getElementById('eventsEmpty'); /* "no events" message */
  let currentFilter = 'all';

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (filter === currentFilter) return; /* already active — do nothing */

      /* Update active button */
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

    eventCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const matches  = filter === 'all' || category === filter;

      if (matches) {
        card.style.display = '';     /* restore default display */
        shown++;
      } else {
        card.style.display = 'none'; /* hide this card */
      }
    });

    /* Show the empty state if no cards match */
    eventsEmpty.hidden = shown > 0;
  }


  /* ==========================================================
     PART 3: ADD TO CALENDAR (.ics file download)
     
     ICS (iCalendar) is a standard file format that all
     calendar apps understand. When a user downloads an .ics
     file and opens it, their calendar app asks if they want
     to add the event.
     
     We build the ICS content as a text string following the
     iCalendar format specification, then create a downloadable
     file from it using the Blob API.
     
     Blob = Binary Large Object — a way to create files in
     memory from JavaScript strings or data.
     
     URL.createObjectURL(blob) creates a temporary URL that
     points to the blob, so we can trigger a download.
     URL.revokeObjectURL(url) cleans up that temporary URL
     after the download starts.
  ========================================================== */

  const addToCalBtn = document.querySelector('.btn-outline-dark');
  if (addToCalBtn) {
    addToCalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      generateICS({
        title:       'Annual Thanksgiving Service — RCCG S&P Parish',
        date:        '20250615',  /* format: YYYYMMDD */
        startTime:   '093000',   /* format: HHMMSS (24-hour) */
        endTime:     '130000',
        location:    '52 Peter Agha Street, Oke-Afa, Isolo, Lagos',
        description: 'Annual Thanksgiving Service at RCCG S&P Parish. A powerful service of praise, worship and testimonies.'
      });
    });
  }

  function generateICS({ title, date, startTime, endTime, location, description }) {
    /* Create a unique ID for this calendar event */
    const uid = `rccg-sp-${date}-${Math.random().toString(36).slice(2)}@rccgsandpparish.com`;

    /* Current timestamp in ICS format: YYYYMMDDTHHMMSSZ */
    const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

    /* Build the ICS file content.
       Each line follows the iCalendar standard format.
       \r\n is the required line ending (carriage return + newline). */
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RCCG S&P Parish//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${date}T${startTime}`,
      `DTEND:${date}T${endTime}`,
      `SUMMARY:${title}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    /* Create a downloadable file from the text */
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob); /* temporary URL for the blob */

    /* Create a hidden link, click it to trigger download, then remove it */
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'rccg-thanksgiving-service.ics'; /* suggested filename */
    document.body.appendChild(a);
    a.click();                    /* trigger the download */
    document.body.removeChild(a); /* clean up the link */
    URL.revokeObjectURL(url);     /* free the temporary URL */
  }

}); /* end DOMContentLoaded */
