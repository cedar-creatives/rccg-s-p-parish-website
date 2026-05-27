/* ==============================
   RCCG S&P Parish — countdown.js
   Countdown to next service
   ============================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== SERVICE SCHEDULE =====
  // Each service is defined by:
  //   name     — display name
  //   day      — 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  //              OR 'first-of-month' for Hour of Mercy
  //   hour     — 24h format
  //   minute
  //   duration — how long the service lasts in minutes (used for "happening now")

  const WEEKLY_SERVICES = [
    { name: 'Sunday 1st Service',  day: 0, hour: 8,  minute: 0,  duration: 90  },
    { name: 'Sunday 2nd Service',  day: 0, hour: 10, minute: 0,  duration: 120 },
    { name: 'Digging Deep',        day: 2, hour: 18, minute: 0,  duration: 90  },
    { name: 'Faith Clinic',        day: 4, hour: 18, minute: 30, duration: 90  },
  ];

  // Hour of Mercy — 1st of every month at 6:00 AM
  // Handled separately since it's date-based not day-based

  // ===== ELEMENTS =====
  const serviceName    = document.getElementById('countdownServiceName');
  const timerEl        = document.getElementById('countdownTimer');
  const happeningEl    = document.getElementById('countdownHappening');
  const cdDays         = document.getElementById('cdDays');
  const cdHours        = document.getElementById('cdHours');
  const cdMins         = document.getElementById('cdMins');
  const cdSecs         = document.getElementById('cdSecs');

  let countdownInterval = null;


  // ===== FIND NEXT SERVICE =====

  function getNextOccurrence(service, from) {
    // Returns the next Date when this weekly service occurs after `from`
    const d = new Date(from);
    const dayDiff = (service.day - d.getDay() + 7) % 7;

    // Build candidate date
    const candidate = new Date(d);
    candidate.setDate(d.getDate() + dayDiff);
    candidate.setHours(service.hour, service.minute, 0, 0);

    // If candidate is in the past (same day but time passed), add 7 days
    if (candidate <= from) {
      candidate.setDate(candidate.getDate() + 7);
    }

    return candidate;
  }

  function getNextHourOfMercy(from) {
    // 1st of every month at 6:00 AM
    const d = new Date(from);
    let year  = d.getFullYear();
    let month = d.getMonth();

    // Try this month's 1st
    let candidate = new Date(year, month, 1, 6, 0, 0, 0);
    if (candidate <= from) {
      // Move to next month's 1st
      month++;
      if (month > 11) { month = 0; year++; }
      candidate = new Date(year, month, 1, 6, 0, 0, 0);
    }

    return { name: 'Hour of Mercy', date: candidate, duration: 60 };
  }

  function findNextService() {
    const now = new Date();

    // Check if a service is currently happening
    for (const svc of WEEKLY_SERVICES) {
      const prev = getNextOccurrence(svc, new Date(now - 7 * 24 * 60 * 60 * 1000));
      const endTime = new Date(prev.getTime() + svc.duration * 60 * 1000);
      if (now >= prev && now < endTime) {
        return { name: svc.name, date: prev, duration: svc.duration, happening: true };
      }
    }

    // Check Hour of Mercy happening now
    const hom = getNextHourOfMercy(new Date(now - 32 * 24 * 60 * 60 * 1000));
    const homEnd = new Date(hom.date.getTime() + hom.duration * 60 * 1000);
    if (now >= hom.date && now < homEnd) {
      return { ...hom, happening: true };
    }

    // Find the soonest upcoming service
    const candidates = WEEKLY_SERVICES.map(svc => ({
      name:     svc.name,
      date:     getNextOccurrence(svc, now),
      duration: svc.duration,
      happening: false
    }));

    // Add Hour of Mercy
    const nextHOM = getNextHourOfMercy(now);
    candidates.push({ name: nextHOM.name, date: nextHOM.date, duration: nextHOM.duration, happening: false });

    // Sort by soonest
    candidates.sort((a, b) => a.date - b.date);
    return candidates[0];
  }


  // ===== RENDER COUNTDOWN =====

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function renderCountdown(target) {
    const now  = new Date();
    const diff = target.date - now;

    if (diff <= 0 || target.happening) {
      // Service is happening now
      timerEl.hidden      = true;
      happeningEl.hidden  = false;
      serviceName.textContent = target.name;

      // After service ends, restart to find next
      const msUntilEnd = target.date.getTime() + target.duration * 60 * 1000 - now.getTime();
      if (msUntilEnd > 0) {
        setTimeout(startCountdown, msUntilEnd + 1000);
      } else {
        setTimeout(startCountdown, 5000);
      }
      return;
    }

    // Normal countdown
    timerEl.hidden     = false;
    happeningEl.hidden = true;
    serviceName.textContent = target.name;

    const totalSecs = Math.floor(diff / 1000);
    const days  = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins  = Math.floor((totalSecs % 3600) / 60);
    const secs  = totalSecs % 60;

    cdDays.textContent  = pad(days);
    cdHours.textContent = pad(hours);
    cdMins.textContent  = pad(mins);
    cdSecs.textContent  = pad(secs);
  }


  // ===== START / RESTART COUNTDOWN =====

  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    const next = findNextService();

    // Render immediately
    renderCountdown(next);

    // If not happening now, tick every second
    if (!next.happening) {
      countdownInterval = setInterval(() => {
        const now = new Date();
        // Check if we've passed the target — if so, restart
        if (now >= next.date) {
          startCountdown();
          return;
        }
        renderCountdown(next);
      }, 1000);
    }
  }

  // Kick off
  startCountdown();

}); // end DOMContentLoaded
