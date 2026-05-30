/* ============================================================
   RCCG S&P Parish — contact.js
   
   This file runs only on the Contact page (contact.html).
   It validates the contact form on that page.
   
   Note: The homepage also has a contact form, but that one
   is handled by main.js. This file handles the separate
   form on the dedicated contact page.
   
   Fields validated:
     - Name (required)
     - Email (required, must be valid format)
     - Message (at least 10 characters)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Get references to the form and its fields.
     Note: these IDs are different from the homepage form
     (contactPageForm vs contactForm) so they don't conflict. */
  const form    = document.getElementById('contactPageForm');
  const nameEl  = document.getElementById('contactName');
  const emailEl = document.getElementById('contactEmail');
  const msgEl   = document.getElementById('contactMessage');

  /* Error message elements */
  const nameErr  = document.getElementById('contactNameError');
  const emailErr = document.getElementById('contactEmailError');
  const msgErr   = document.getElementById('contactMessageError');

  /* The green success box shown after submission */
  const success = document.getElementById('contactSuccess');

  /* If the form doesn't exist on this page, stop here */
  if (!form) return;


  /* ==========================================================
     HELPER FUNCTIONS
  ========================================================== */

  /* Show or clear an error under a field */
  function setError(el, errEl, msg) {
    errEl.textContent = msg;
    el.classList.toggle('error', !!msg);
  }

  /* Check email format using a regular expression */
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }


  /* ==========================================================
     REAL-TIME VALIDATION (on 'blur')
  ========================================================== */

  nameEl.addEventListener('blur', () =>
    setError(nameEl, nameErr,
      nameEl.value.trim() === '' ? 'Please enter your name.' : '')
  );

  emailEl.addEventListener('blur', () => {
    if (!emailEl.value.trim()) {
      setError(emailEl, emailErr, 'Please enter your email.');
    } else if (!isValidEmail(emailEl.value.trim())) {
      setError(emailEl, emailErr, 'Please enter a valid email.');
    } else {
      setError(emailEl, emailErr, '');
    }
  });

  msgEl.addEventListener('blur', () =>
    setError(msgEl, msgErr,
      msgEl.value.trim().length < 10
        ? 'Please enter a message (at least 10 characters).'
        : '')
  );


  /* ==========================================================
     FORM SUBMISSION
  ========================================================== */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    /* Check name */
    if (!nameEl.value.trim()) {
      setError(nameEl, nameErr, 'Please enter your name.');
      valid = false;
    } else { setError(nameEl, nameErr, ''); }

    /* Check email */
    if (!emailEl.value.trim()) {
      setError(emailEl, emailErr, 'Please enter your email.');
      valid = false;
    } else if (!isValidEmail(emailEl.value.trim())) {
      setError(emailEl, emailErr, 'Please enter a valid email.');
      valid = false;
    } else { setError(emailEl, emailErr, ''); }

    /* Check message length */
    if (msgEl.value.trim().length < 10) {
      setError(msgEl, msgErr, 'Please enter a message (at least 10 characters).');
      valid = false;
    } else { setError(msgEl, msgErr, ''); }

    /* Show success if all valid */
    if (valid) {
      form.reset();
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      /* Hide success message after 6 seconds */
      setTimeout(() => { success.hidden = true; }, 6000);
    }
  });

}); /* end DOMContentLoaded */
