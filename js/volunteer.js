/* ============================================================
   RCCG S&P Parish — volunteer.js
   
   This file runs only on the Volunteer page (volunteer.html).
   It validates the "Join a Ministry Team" sign-up form.
   
   Fields validated:
     - First name (required)
     - Last name (required)
     - Email (required, must be valid format)
     - Phone number (required, must look like a phone number)
     - Age group (must select from dropdown)
     - Member status (must select from dropdown)
     - Ministry checkboxes (at least one must be ticked)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Get references to all form fields */
  const form      = document.getElementById('volunteerForm');
  const firstName = document.getElementById('volFirstName');
  const lastName  = document.getElementById('volLastName');
  const email     = document.getElementById('volEmail');
  const phone     = document.getElementById('volPhone');
  const age       = document.getElementById('volAge');
  const status    = document.getElementById('volStatus');
  const success   = document.getElementById('volunteerSuccess');

  /* Get references to all error message elements */
  const firstNameErr = document.getElementById('firstNameError');
  const lastNameErr  = document.getElementById('lastNameError');
  const emailErr     = document.getElementById('volEmailError');
  const phoneErr     = document.getElementById('volPhoneError');
  const ageErr       = document.getElementById('ageError');
  const statusErr    = document.getElementById('statusError');
  const ministryErr  = document.getElementById('ministryError');


  /* ==========================================================
     HELPER FUNCTIONS
  ========================================================== */

  /* Show or clear an error under a field */
  function setError(el, errEl, msg) {
    errEl.textContent = msg;
    el.classList.toggle('error', !!msg);
  }

  /* Check email format */
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  /* Check phone number format.
     This regex allows: digits, +, spaces, hyphens, parentheses.
     Must be between 7 and 15 characters.
     Examples that pass: "08012345678", "+234 706 734 6021", "(080) 123-4567" */
  function isValidPhone(v) {
    return /^[0-9+\s\-()]{7,15}$/.test(v.trim());
  }


  /* ==========================================================
     REAL-TIME VALIDATION (on 'blur')
     
     Each field validates itself when the user clicks away.
  ========================================================== */

  firstName.addEventListener('blur', () =>
    setError(firstName, firstNameErr,
      firstName.value.trim() === '' ? 'Please enter your first name.' : '')
  );

  lastName.addEventListener('blur', () =>
    setError(lastName, lastNameErr,
      lastName.value.trim() === '' ? 'Please enter your last name.' : '')
  );

  email.addEventListener('blur', () => {
    if (!email.value.trim()) {
      setError(email, emailErr, 'Please enter your email.');
    } else if (!isValidEmail(email.value.trim())) {
      setError(email, emailErr, 'Please enter a valid email.');
    } else {
      setError(email, emailErr, '');
    }
  });

  phone.addEventListener('blur', () => {
    if (!phone.value.trim()) {
      setError(phone, phoneErr, 'Please enter your phone number.');
    } else if (!isValidPhone(phone.value)) {
      setError(phone, phoneErr, 'Please enter a valid phone number.');
    } else {
      setError(phone, phoneErr, '');
    }
  });


  /* ==========================================================
     FORM SUBMISSION
  ========================================================== */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    /* Validate first name */
    if (!firstName.value.trim()) {
      setError(firstName, firstNameErr, 'Please enter your first name.');
      valid = false;
    } else { setError(firstName, firstNameErr, ''); }

    /* Validate last name */
    if (!lastName.value.trim()) {
      setError(lastName, lastNameErr, 'Please enter your last name.');
      valid = false;
    } else { setError(lastName, lastNameErr, ''); }

    /* Validate email */
    if (!email.value.trim()) {
      setError(email, emailErr, 'Please enter your email.');
      valid = false;
    } else if (!isValidEmail(email.value.trim())) {
      setError(email, emailErr, 'Please enter a valid email.');
      valid = false;
    } else { setError(email, emailErr, ''); }

    /* Validate phone */
    if (!phone.value.trim()) {
      setError(phone, phoneErr, 'Please enter your phone number.');
      valid = false;
    } else if (!isValidPhone(phone.value)) {
      setError(phone, phoneErr, 'Please enter a valid phone number.');
      valid = false;
    } else { setError(phone, phoneErr, ''); }

    /* Validate age group dropdown */
    if (!age.value) {
      setError(age, ageErr, 'Please select your age group.');
      valid = false;
    } else { setError(age, ageErr, ''); }

    /* Validate member status dropdown */
    if (!status.value) {
      setError(status, statusErr, 'Please select your member status.');
      valid = false;
    } else { setError(status, statusErr, ''); }

    /* Validate ministry checkboxes — at least one must be ticked.
       querySelectorAll returns a NodeList. .length tells us how many
       checkboxes with name="ministry" are currently checked. */
    const checked = document.querySelectorAll('input[name="ministry"]:checked');
    if (checked.length === 0) {
      ministryErr.textContent = 'Please select at least one ministry.';
      valid = false;
    } else {
      ministryErr.textContent = '';
    }

    /* If everything passed, show success */
    if (valid) {
      form.reset(); /* clear all fields */

      /* Manually uncheck all checkboxes — form.reset() doesn't always
         trigger the CSS :has(input:checked) selector update in all browsers */
      document.querySelectorAll('input[name="ministry"]').forEach(cb => cb.checked = false);

      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

}); /* end DOMContentLoaded */
