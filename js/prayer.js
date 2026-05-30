/* ============================================================
   RCCG S&P Parish — prayer.js
   
   This file runs only on the Prayer page (prayer.html).
   It handles the prayer request form — validating that the
   user has filled in all required fields before "submitting."
   
   Fields validated:
     - Name (required)
     - Email (optional, but must be valid if provided)
     - Prayer category (must select one from the dropdown)
     - Prayer request text (at least 20 characters)
     - Consent checkbox (must be ticked)
   
   NOTE: Like the contact form, this currently simulates
   submission by showing a success message. In a real
   deployment, you would send the data to a backend server
   or a service like Formspree/EmailJS.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Get references to all the form elements */
  const form        = document.getElementById('prayerForm');
  const nameInput   = document.getElementById('prayerName');
  const emailInput  = document.getElementById('prayerEmail');
  const categorySel = document.getElementById('prayerCategory'); /* the dropdown <select> */
  const requestTA   = document.getElementById('prayerRequest');  /* the big textarea */
  const consentCB   = document.getElementById('prayerConsent'); /* the checkbox */
  const success     = document.getElementById('prayerSuccess'); /* the green success box */

  /* Get references to all the error message elements */
  const nameErr    = document.getElementById('prayerNameError');
  const emailErr   = document.getElementById('prayerEmailError');
  const catErr     = document.getElementById('categoryError');
  const reqErr     = document.getElementById('requestError');
  const consentErr = document.getElementById('consentError');

  /* ==========================================================
     HELPER FUNCTIONS
  ========================================================== */

  /* Show or clear an error message under a field.
     !!msg converts the message to a boolean:
       !!'Please enter your name.' = true  → add 'error' class
       !!''                        = false → remove 'error' class */
  function setError(el, errEl, msg) {
    errEl.textContent = msg;
    el.classList.toggle('error', !!msg);
  }

  /* Check if an email address looks valid */
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }


  /* ==========================================================
     REAL-TIME VALIDATION (on 'blur')
     
     'blur' fires when the user clicks away from a field.
     This gives immediate feedback without waiting for submit.
  ========================================================== */

  nameInput.addEventListener('blur', () =>
    setError(nameInput, nameErr,
      nameInput.value.trim() === '' ? 'Please enter your name.' : '')
  );

  /* Email is optional — only validate format if they typed something */
  emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
      setError(emailInput, emailErr, 'Please enter a valid email address.');
    } else {
      setError(emailInput, emailErr, ''); /* clear error */
    }
  });


  /* ==========================================================
     FORM SUBMISSION
     
     When the user clicks "Submit Prayer Request":
     1. e.preventDefault() stops the browser from reloading
     2. We check every field
     3. If anything fails, we show errors and stop
     4. If everything passes, we show the success message
  ========================================================== */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true; /* assume valid until we find a problem */

    /* Check name */
    if (nameInput.value.trim() === '') {
      setError(nameInput, nameErr, 'Please enter your name.');
      valid = false;
    } else {
      setError(nameInput, nameErr, '');
    }

    /* Check email (only if they typed something) */
    if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
      setError(emailInput, emailErr, 'Please enter a valid email address.');
      valid = false;
    } else {
      setError(emailInput, emailErr, '');
    }

    /* Check that a category was selected from the dropdown.
       A <select> with no selection has value = '' (empty string) */
    if (!categorySel.value) {
      setError(categorySel, catErr, 'Please select a prayer category.');
      valid = false;
    } else {
      setError(categorySel, catErr, '');
    }

    /* Check that the prayer request is at least 20 characters.
       We want enough detail to actually pray meaningfully. */
    if (requestTA.value.trim().length < 20) {
      setError(requestTA, reqErr, 'Please describe your prayer request (at least 20 characters).');
      valid = false;
    } else {
      setError(requestTA, reqErr, '');
    }

    /* Check that the consent checkbox is ticked.
       .checked is true if the checkbox is ticked, false if not. */
    if (!consentCB.checked) {
      consentErr.textContent = 'Please confirm your consent to proceed.';
      valid = false;
    } else {
      consentErr.textContent = '';
    }

    /* If all checks passed, show success */
    if (valid) {
      form.reset(); /* clear all fields */
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      /* Hide the success message after 8 seconds */
      setTimeout(() => { success.hidden = true; }, 8000);
    }
  });

}); /* end DOMContentLoaded */
