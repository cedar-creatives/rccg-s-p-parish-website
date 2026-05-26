/* ==============================
   RCCG S&P Parish — events.js
   Events page: filter + past-event detection
   Requires: js/main.js first
   ============================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. AUTO-MARK PAST EVENTS =====
  // Reads the date from each card and greys it out if it has passed.
  // Date is derived from the visible day + month text on the card.
  // Year defaults to current year; if the resulting date is in the past, mark it.

  const currentYear = new Date().getFullYear();
  const today       = new Date();
  today.setHours(0, 0, 0, 0); // compare date only, not time

  const monthMap = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4,  JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
  };

  document.querySelectorAll('.event-card').forEach(card => {
    const dayEl   = card.querySelector('.event-day');
    const monthEl = card.querySelector('.event-month');
    if (!dayEl || !monthEl) return;

    const day   = parseInt(dayEl.textContent.trim(), 10);
    const month = monthMap[monthEl.textContent.trim().toUpperCase()];

    if (isNaN(day) || month === undefined) return;

    const eventDate = new Date(currentYear, month, day);

    if (eventDate < today) {
      card.classList.add('event-card--past');
      // Add a "Past Event" label for clarity
      const tag = card.querySelector('.event-tag');
      if (tag && !card.querySelector('.past-label')) {
        const pastLabel = document.createElement('span');
        pastLabel.className = 'past-label';
        pastLabel.textContent = 'Past Event';
        pastLabel.setAttribute('aria-label', 'This event has already taken place');
        tag.insertAdjacentElement('afterend', pastLabel);
      }
    }
  });


  // ===== 2. FILTER LOGIC =====

  const filterBtns  = document.querySelectorAll('.event-filter-btn');
  const eventCards  = document.querySelectorAll('.event-card');
  const eventsEmpty = document.getElementById('eventsEmpty');
  let currentFilter = 'all';

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (filter === currentFilter) return;

      // Update active state
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
        card.style.display = '';
        shown++;
      } else {
        card.style.display = 'none';
      }
    });

    eventsEmpty.hidden = shown > 0;
  }


  // ===== 3. ADD TO CALENDAR (ICS download) =====
  // Generates a basic .ics file for the featured event so users can
  // add it to Google Calendar, Apple Calendar, Outlook etc.

  const addToCalBtn = document.querySelector('.btn-outline-dark');
  if (addToCalBtn) {
    addToCalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      generateICS({
        title:    'Annual Thanksgiving Service — RCCG S&P Parish',
        date:     '20250615',       // YYYYMMDD
        startTime:'093000',         // HHMMSS
        endTime:  '130000',
        location: '52 Peter Agha Street, Oke-Afa, Isolo, Lagos',
        description: 'Annual Thanksgiving Service at RCCG S&P Parish. A powerful service of praise, worship and testimonies.'
      });
    });
  }

  function generateICS({ title, date, startTime, endTime, location, description }) {
    const uid     = `rccg-sp-${date}-${Math.random().toString(36).slice(2)}@rccgsandpparish.com`;
    const now     = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

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

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'rccg-thanksgiving-service.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

}); // end DOMContentLoaded
