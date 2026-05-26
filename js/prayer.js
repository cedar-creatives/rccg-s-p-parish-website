/* ==============================
   RCCG S&P Parish — prayer.js
   ============================== */
document.addEventListener('DOMContentLoaded', () => {

  const form        = document.getElementById('prayerForm');
  const nameInput   = document.getElementById('prayerName');
  const emailInput  = document.getElementById('prayerEmail');
  const categorySel = document.getElementById('prayerCategory');
  const requestTA   = document.getElementById('prayerRequest');
  const consentCB   = document.getElementById('prayerConsent');
  const success     = document.getElementById('prayerSuccess');

  const nameErr     = document.getElementById('prayerNameError');
  const emailErr    = document.getElementById('prayerEmailError');
  const catErr      = document.getElementById('categoryError');
  const reqErr      = document.getElementById('requestError');
  const consentErr  = document.getElementById('consentError');

  function setError(el, errEl, msg) {
    errEl.textContent = msg;
    el.classList.toggle('error', !!msg);
  }

  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  nameInput.addEventListener('blur', () =>
    setError(nameInput, nameErr, nameInput.value.trim() === '' ? 'Please enter your name.' : ''));

  emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim()))
      setError(emailInput, emailErr, 'Please enter a valid email address.');
    else setError(emailInput, emailErr, '');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (nameInput.value.trim() === '') { setError(nameInput, nameErr, 'Please enter your name.'); valid = false; }
    else setError(nameInput, nameErr, '');

    if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
      setError(emailInput, emailErr, 'Please enter a valid email address.'); valid = false;
    } else setError(emailInput, emailErr, '');

    if (!categorySel.value) { setError(categorySel, catErr, 'Please select a prayer category.'); valid = false; }
    else setError(categorySel, catErr, '');

    if (requestTA.value.trim().length < 20) { setError(requestTA, reqErr, 'Please describe your prayer request (at least 20 characters).'); valid = false; }
    else setError(requestTA, reqErr, '');

    if (!consentCB.checked) { consentErr.textContent = 'Please confirm your consent to proceed.'; valid = false; }
    else consentErr.textContent = '';

    if (valid) {
      form.reset();
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => { success.hidden = true; }, 8000);
    }
  });
});
