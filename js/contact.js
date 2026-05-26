/* ==============================
   RCCG S&P Parish — contact.js
   ============================== */
document.addEventListener('DOMContentLoaded', () => {
  const form    = document.getElementById('contactPageForm');
  const nameEl  = document.getElementById('contactName');
  const emailEl = document.getElementById('contactEmail');
  const msgEl   = document.getElementById('contactMessage');
  const nameErr = document.getElementById('contactNameError');
  const emailErr= document.getElementById('contactEmailError');
  const msgErr  = document.getElementById('contactMessageError');
  const success = document.getElementById('contactSuccess');

  function setError(el, errEl, msg) { errEl.textContent=msg; el.classList.toggle('error',!!msg); }
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  nameEl.addEventListener('blur',  () => setError(nameEl,  nameErr,  nameEl.value.trim()===''?'Please enter your name.':''));
  emailEl.addEventListener('blur', () => {
    if (!emailEl.value.trim()) setError(emailEl, emailErr, 'Please enter your email.');
    else if (!isValidEmail(emailEl.value.trim())) setError(emailEl, emailErr, 'Please enter a valid email.');
    else setError(emailEl, emailErr, '');
  });
  msgEl.addEventListener('blur', () => setError(msgEl, msgErr, msgEl.value.trim().length<10?'Please enter a message (at least 10 characters).':''));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    if (!nameEl.value.trim())  { setError(nameEl,  nameErr,  'Please enter your name.');  valid=false; } else setError(nameEl,  nameErr,  '');
    if (!emailEl.value.trim()) { setError(emailEl, emailErr, 'Please enter your email.'); valid=false; }
    else if (!isValidEmail(emailEl.value.trim())) { setError(emailEl, emailErr, 'Please enter a valid email.'); valid=false; }
    else setError(emailEl, emailErr, '');
    if (msgEl.value.trim().length<10) { setError(msgEl, msgErr, 'Please enter a message (at least 10 characters).'); valid=false; } else setError(msgEl, msgErr, '');
    if (valid) {
      form.reset();
      success.hidden = false;
      success.scrollIntoView({ behavior:'smooth', block:'nearest' });
      setTimeout(() => { success.hidden = true; }, 6000);
    }
  });
});
