/* ==============================
   RCCG S&P Parish — volunteer.js
   ============================== */
document.addEventListener('DOMContentLoaded', () => {

  const form        = document.getElementById('volunteerForm');
  const firstName   = document.getElementById('volFirstName');
  const lastName    = document.getElementById('volLastName');
  const email       = document.getElementById('volEmail');
  const phone       = document.getElementById('volPhone');
  const age         = document.getElementById('volAge');
  const status      = document.getElementById('volStatus');
  const success     = document.getElementById('volunteerSuccess');

  const firstNameErr  = document.getElementById('firstNameError');
  const lastNameErr   = document.getElementById('lastNameError');
  const emailErr      = document.getElementById('volEmailError');
  const phoneErr      = document.getElementById('volPhoneError');
  const ageErr        = document.getElementById('ageError');
  const statusErr     = document.getElementById('statusError');
  const ministryErr   = document.getElementById('ministryError');

  function setError(el, errEl, msg) { errEl.textContent=msg; el.classList.toggle('error',!!msg); }
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isValidPhone(v) { return /^[0-9+\s\-()]{7,15}$/.test(v.trim()); }

  // Blur validation
  firstName.addEventListener('blur', () => setError(firstName, firstNameErr, firstName.value.trim()===''?'Please enter your first name.':''));
  lastName.addEventListener('blur',  () => setError(lastName,  lastNameErr,  lastName.value.trim()===''?'Please enter your last name.':''));
  email.addEventListener('blur', () => {
    if (!email.value.trim()) setError(email, emailErr, 'Please enter your email.');
    else if (!isValidEmail(email.value.trim())) setError(email, emailErr, 'Please enter a valid email.');
    else setError(email, emailErr, '');
  });
  phone.addEventListener('blur', () => {
    if (!phone.value.trim()) setError(phone, phoneErr, 'Please enter your phone number.');
    else if (!isValidPhone(phone.value)) setError(phone, phoneErr, 'Please enter a valid phone number.');
    else setError(phone, phoneErr, '');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!firstName.value.trim()) { setError(firstName, firstNameErr, 'Please enter your first name.'); valid=false; } else setError(firstName, firstNameErr, '');
    if (!lastName.value.trim())  { setError(lastName,  lastNameErr,  'Please enter your last name.');  valid=false; } else setError(lastName,  lastNameErr,  '');

    if (!email.value.trim()) { setError(email, emailErr, 'Please enter your email.'); valid=false; }
    else if (!isValidEmail(email.value.trim())) { setError(email, emailErr, 'Please enter a valid email.'); valid=false; }
    else setError(email, emailErr, '');

    if (!phone.value.trim()) { setError(phone, phoneErr, 'Please enter your phone number.'); valid=false; }
    else if (!isValidPhone(phone.value)) { setError(phone, phoneErr, 'Please enter a valid phone number.'); valid=false; }
    else setError(phone, phoneErr, '');

    if (!age.value)    { setError(age,    ageErr,    'Please select your age group.'); valid=false; } else setError(age,    ageErr,    '');
    if (!status.value) { setError(status, statusErr, 'Please select your member status.'); valid=false; } else setError(status, statusErr, '');

    const checked = document.querySelectorAll('input[name="ministry"]:checked');
    if (checked.length === 0) { ministryErr.textContent='Please select at least one ministry.'; valid=false; } else ministryErr.textContent='';

    if (valid) {
      const name = firstName.value.trim();
      form.reset();
      // Uncheck all checkboxes manually (reset doesn't always fire :has selector update)
      document.querySelectorAll('input[name="ministry"]').forEach(cb => cb.checked=false);
      success.hidden = false;
      success.querySelector ? null : null;
      success.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
  });
});
