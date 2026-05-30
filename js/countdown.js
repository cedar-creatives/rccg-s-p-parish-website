/* ============================================================
   RCCG S&P Parish — countdown.js
   
   This file powers the countdown bar at the top of the
   homepage. It shows how long until the next church service,
   and switches to "Happening Now" when a service is live.
   
   HOW IT WORKS (big picture):
   1. We define a list of all weekly services (day + time)
   2. Every second, we calculate how far away the next one is
   3. We display the days, hours, minutes, seconds
   4. If a service is currently happening, we show a live badge
   5. When a service ends, we automatically find the next one
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     SERVICE SCHEDULE
     
     This is the list of all regular services.
     Each service is an object with these properties:
       name     — what to display in the countdown bar
       day      — day of the week as a number:
                  0 = Sunday, 1 = Monday, 2 = Tuesday,
                  3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
       hour     — start hour in 24-hour format (8 = 8am, 18 = 6pm)
       minute   — start minute
       duration — how long the service lasts in minutes
                  (used to know when "Happening Now" should end)
     
     TO ADD A NEW SERVICE: copy one of the lines below and
     change the values. Make sure to add a comma after each
     object except the last one.
  ========================================================== */
  const WEEKLY_SERVICES = [
    { name: 'Sunday 1st Service',  day: 0, hour: 8,  minute: 0,  duration: 90  },
    { name: 'Sunday 2nd Service',  day: 0, hour: 10, minute: 0,  duration: 120 },
    { name: 'Digging Deep',        day: 2, hour: 18, minute: 0,  duration: 90  },
    { name: 'Faith Clinic',        day: 4, hour: 18, minute: 30, duration: 90  },
  ];
  /* Note: Hour of Mercy (1st of every month, 6am) is handled
     separately below because it's date-based, not day-based */


  /* ==========================================================
     GET REFERENCES TO THE HTML ELEMENTS
     
     These are the elements in the countdown bar HTML.
     We grab them once here so we can update them later.
  ========================================================== */
  const serviceName = document.getElementById('countdownServiceName'); /* e.g. "Sunday 1st Service" */
  const timerEl     = document.getElementById('countdownTimer');       /* the numbers block */
  const happeningEl = document.getElementById('countdownHappening');   /* "Happening Now" block */
  const cdDays      = document.getElementById('cdDays');               /* days number */
  const cdHours     = document.getElementById('cdHours');              /* hours number */
  const cdMins      = document.getElementById('cdMins');               /* minutes number */
  const cdSecs      = document.getElementById('cdSecs');               /* seconds number */

  let countdownInterval = null; /* will hold our setInterval so we can clear it later */


  /* ==========================================================
     HELPER: FIND NEXT OCCURRENCE OF A WEEKLY SERVICE
     
     Given a service (e.g. Sunday 8am) and a starting time,
     this function returns the next Date when that service
     will happen.
     
     Example: if today is Wednesday and the service is Sunday,
     it returns the Date for this coming Sunday at 8am.
     
     The % 7 trick handles the wrap-around:
       (Sunday(0) - Wednesday(3) + 7) % 7 = 4 days away
  ========================================================== */
  function getNextOccurrence(service, from) {
    const d = new Date(from); /* copy the 'from' date so we don't modify it */

    /* How many days until the next occurrence of this service's day? */
    const dayDiff = (service.day - d.getDay() + 7) % 7;

    /* Build the candidate date */
    const candidate = new Date(d);
    candidate.setDate(d.getDate() + dayDiff);          /* move to the right day */
    candidate.setHours(service.hour, service.minute, 0, 0); /* set the time */

    /* If the candidate is in the past (same day but time already passed),
       add 7 days to get next week's occurrence */
    if (candidate <= from) {
      candidate.setDate(candidate.getDate() + 7);
    }

    return candidate;
  }


  /* ==========================================================
     HELPER: FIND NEXT HOUR OF MERCY
     
     Hour of Mercy happens on the 1st of every month at 6am.
     We find the next upcoming 1st-of-month after 'from'.
  ========================================================== */
  function getNextHourOfMercy(from) {
    const d = new Date(from);
    let year  = d.getFullYear();
    let month = d.getMonth(); /* 0 = January, 11 = December */

    /* Try this month's 1st at 6am */
    let candidate = new Date(year, month, 1, 6, 0, 0, 0);

    /* If that's already in the past, move to next month */
    if (candidate <= from) {
      month++;
      if (month > 11) { month = 0; year++; } /* wrap December → January */
      candidate = new Date(year, month, 1, 6, 0, 0, 0);
    }

    return { name: 'Hour of Mercy', date: candidate, duration: 60 };
  }


  /* ==========================================================
     FIND THE NEXT (OR CURRENT) SERVICE
     
     This is the main logic function. It:
     1. Checks if any service is happening RIGHT NOW
     2. If not, finds the soonest upcoming service
     3. Returns an object with the service info
  ========================================================== */
  function findNextService() {
    const now = new Date(); /* current date and time */

    /* --- Check if a weekly service is happening right now --- */
    for (const svc of WEEKLY_SERVICES) {
      /* Get the most recent past occurrence of this service */
      const prev = getNextOccurrence(svc, new Date(now - 7 * 24 * 60 * 60 * 1000));
      /* Calculate when it ends: start time + duration in milliseconds */
      const endTime = new Date(prev.getTime() + svc.duration * 60 * 1000);

      /* If now is between start and end, it's happening! */
      if (now >= prev && now < endTime) {
        return { name: svc.name, date: prev, duration: svc.duration, happening: true };
      }
    }

    /* --- Check if Hour of Mercy is happening right now --- */
    /* Look back 32 days to catch the most recent 1st-of-month */
    const hom    = getNextHourOfMercy(new Date(now - 32 * 24 * 60 * 60 * 1000));
    const homEnd = new Date(hom.date.getTime() + hom.duration * 60 * 1000);
    if (now >= hom.date && now < homEnd) {
      return { ...hom, happening: true }; /* spread operator copies all hom properties */
    }

    /* --- Nothing is happening now — find the soonest upcoming service --- */
    const candidates = WEEKLY_SERVICES.map(svc => ({
      name:      svc.name,
      date:      getNextOccurrence(svc, now),
      duration:  svc.duration,
      happening: false
    }));

    /* Add Hour of Mercy to the candidates list */
    const nextHOM = getNextHourOfMercy(now);
    candidates.push({ name: nextHOM.name, date: nextHOM.date, duration: nextHOM.duration, happening: false });

    /* Sort by soonest date — a.date - b.date gives a negative number if a is earlier */
    candidates.sort((a, b) => a.date - b.date);

    return candidates[0]; /* the first one after sorting is the soonest */
  }


  /* ==========================================================
     HELPER: PAD A NUMBER TO 2 DIGITS
     
     We want "05" not "5", "09" not "9".
     String(n).padStart(2, '0') means:
       "Convert n to a string, and if it's shorter than 2
        characters, add '0' at the start."
  ========================================================== */
  function pad(n) {
    return String(n).padStart(2, '0');
  }


  /* ==========================================================
     RENDER THE COUNTDOWN DISPLAY
     
     This function updates the numbers on screen.
     It's called once immediately, then every second.
     
     If the service is happening now:
       - Hide the timer numbers
       - Show the "Happening Now" badge
       - Schedule a restart after the service ends
     
     If counting down:
       - Show the timer numbers
       - Calculate days/hours/mins/secs from the millisecond difference
  ========================================================== */
  function renderCountdown(target) {
    const now  = new Date();
    const diff = target.date - now; /* milliseconds until the service */

    if (diff <= 0 || target.happening) {
      /* Service is live right now */
      timerEl.hidden     = true;
      happeningEl.hidden = false;
      serviceName.textContent = target.name;

      /* Schedule a restart after the service ends */
      const msUntilEnd = target.date.getTime() + target.duration * 60 * 1000 - now.getTime();
      if (msUntilEnd > 0) {
        setTimeout(startCountdown, msUntilEnd + 1000); /* +1s buffer */
      } else {
        setTimeout(startCountdown, 5000); /* fallback: retry in 5s */
      }
      return; /* stop here — don't update the numbers */
    }

    /* Normal countdown mode */
    timerEl.hidden     = false;
    happeningEl.hidden = true;
    serviceName.textContent = target.name;

    /* Convert milliseconds into days, hours, minutes, seconds */
    const totalSecs = Math.floor(diff / 1000);          /* total seconds remaining */
    const days  = Math.floor(totalSecs / 86400);         /* 86400 seconds in a day */
    const hours = Math.floor((totalSecs % 86400) / 3600);/* remaining hours */
    const mins  = Math.floor((totalSecs % 3600) / 60);   /* remaining minutes */
    const secs  = totalSecs % 60;                         /* remaining seconds */

    /* Update the display */
    cdDays.textContent  = pad(days);
    cdHours.textContent = pad(hours);
    cdMins.textContent  = pad(mins);
    cdSecs.textContent  = pad(secs);
  }


  /* ==========================================================
     START (OR RESTART) THE COUNTDOWN
     
     This function:
     1. Clears any existing interval (to avoid duplicates)
     2. Finds the next service
     3. Renders immediately (so there's no 1-second blank)
     4. Sets up a 1-second interval to keep updating
  ========================================================== */
  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval); /* stop old timer */

    const next = findNextService();

    renderCountdown(next); /* show immediately — don't wait 1 second */

    /* If a service is happening now, renderCountdown already
       scheduled the restart — no need for a tick interval */
    if (!next.happening) {
      countdownInterval = setInterval(() => {
        const now = new Date();
        /* If we've passed the target time, restart to find the next service */
        if (now >= next.date) {
          startCountdown();
          return;
        }
        renderCountdown(next);
      }, 1000); /* run every 1000ms = 1 second */
    }
  }

  /* Kick everything off when the page loads */
  startCountdown();

}); /* end DOMContentLoaded */
