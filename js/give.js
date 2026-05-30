/* ============================================================
   RCCG S&P Parish — give.js
   
   This file runs only on the Give page (give.html).
   It handles:
   
   1. GIVING TYPE TABS — Tithe, Offering, Special Seed,
      Building Fund buttons that the user selects
   2. PRESET AMOUNT BUTTONS — Quick-select amounts like
      ₦500, ₦1000, ₦2000 etc.
   3. CUSTOM AMOUNT INPUT — User types their own amount
   4. SUMMARY — Shows a live preview of what they're giving
   5. FORM VALIDATION — Checks name, email, amount
   6. PAYSTACK PAYMENT — Opens the Paystack payment popup
   7. COPY ACCOUNT NUMBERS — Copies bank account numbers
      to clipboard for bank transfer giving
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     CONFIGURATION
     
     PAYSTACK_PUBLIC_KEY: Get this from your Paystack dashboard
     at https://dashboard.paystack.com → Settings → API Keys.
     Use the TEST key while building, LIVE key when launching.
     
     CHURCH_EMAIL: This email receives a notification for every
     successful payment. Update it to the real church email.
  ========================================================== */
  const PAYSTACK_PUBLIC_KEY = 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE';
  const CHURCH_EMAIL        = 'info@rccgsandpparish.com';


  /* ==========================================================
     GET REFERENCES TO HTML ELEMENTS
  ========================================================== */
  const giveForm       = document.getElementById('giveForm');
  const payBtn         = document.getElementById('payBtn');
  const giveSuccess    = document.getElementById('giveSuccess');    /* success message */
  const giveSummary    = document.getElementById('giveSummary');    /* "You are giving..." box */
  const summaryType    = document.getElementById('summaryType');    /* e.g. "Tithe" */
  const summaryAmount  = document.getElementById('summaryAmount');  /* e.g. "₦1,000" */
  const givingTypeInput = document.getElementById('givingType');   /* hidden input field */

  const donorName    = document.getElementById('donorName');
  const donorEmail   = document.getElementById('donorEmail');
  const customAmount = document.getElementById('customAmount');

  const nameError   = document.getElementById('nameError');
  const emailError  = document.getElementById('emailError');
  const amountError = document.getElementById('amountError');

  /* Track the currently selected values */
  let selectedAmount = 0;
  let selectedType   = 'tithe'; /* default giving type */

  /* Human-readable labels for each giving type code */
  const typeLabels = {
    tithe:    'Tithe',
    offering: 'Offering',
    seed:     'Special Seed',
    project:  'Building Fund'
  };


  /* ==========================================================
     PART 1: GIVING TYPE TABS
     
     The four buttons (Tithe, Offering, Special Seed, Building
     Fund) each have data-type="tithe" etc.
     
     When clicked:
     - Remove 'active' from all buttons
     - Add 'active' to the clicked one
     - Update selectedType
     - Update the summary box
  ========================================================== */
  document.querySelectorAll('.give-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      /* Deactivate all type buttons */
      document.querySelectorAll('.give-type-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });

      /* Activate the clicked one */
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      selectedType = btn.getAttribute('data-type');
      givingTypeInput.value = selectedType; /* update the hidden form field */
      updateSummary();
    });
  });


  /* ==========================================================
     PART 2: PRESET AMOUNT BUTTONS
     
     Buttons like "₦500", "₦1,000", "₦2,000" etc.
     Each has data-amount="500" etc.
     
     When clicked:
     - Deselect all preset buttons
     - Select the clicked one
     - Set selectedAmount and update the input field
  ========================================================== */
  document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      /* Deselect all preset buttons */
      document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));

      /* Select this one */
      btn.classList.add('selected');

      selectedAmount = parseInt(btn.getAttribute('data-amount'), 10);
      customAmount.value = selectedAmount; /* fill the input with this amount */
      clearError(customAmount, amountError);
      updateSummary();
    });
  });


  /* ==========================================================
     PART 3: CUSTOM AMOUNT INPUT
     
     When the user types their own amount, we:
     - Deselect all preset buttons (they typed something custom)
     - Update selectedAmount from what they typed
     - Update the summary
     
     parseInt(customAmount.value, 10) converts the string "1500"
     to the number 1500. The || 0 means "if it's not a valid
     number, use 0 instead."
  ========================================================== */
  customAmount.addEventListener('input', () => {
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
    selectedAmount = parseInt(customAmount.value, 10) || 0;
    clearError(customAmount, amountError);
    updateSummary();
  });


  /* ==========================================================
     PART 4: SUMMARY BOX
     
     Shows a preview like:
       "You are giving: Tithe — ₦1,000"
     
     Only shows when the amount is at least ₦100.
     .toLocaleString() formats numbers with commas: 1000 → "1,000"
  ========================================================== */
  function updateSummary() {
    if (selectedAmount >= 100) {
      giveSummary.hidden = false;
      summaryType.textContent   = typeLabels[selectedType] || selectedType;
      summaryAmount.textContent = '₦' + selectedAmount.toLocaleString();
    } else {
      giveSummary.hidden = true; /* hide if amount is too small */
    }
  }


  /* ==========================================================
     PART 5: FORM VALIDATION HELPERS
     
     setError: shows an error message under a field and adds
               a red border. If message is empty, clears it.
     clearError: shortcut to clear an error.
     isValidEmail: checks if an email looks real using a regex.
     
     !! converts a value to boolean:
       !!''    = false (empty string is falsy)
       !!'hi'  = true  (non-empty string is truthy)
     classList.toggle('error', true/false) adds or removes
     the class based on the boolean.
  ========================================================== */
  function setError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.toggle('error', !!message); /* add 'error' if message exists */
  }

  function clearError(input, errorEl) {
    setError(input, errorEl, ''); /* empty message = clear the error */
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  /* Validate fields when the user clicks away (real-time feedback) */
  donorName.addEventListener('blur', () => {
    setError(donorName, nameError,
      donorName.value.trim() === '' ? 'Please enter your full name.' : '');
  });

  donorEmail.addEventListener('blur', () => {
    if (donorEmail.value.trim() === '') {
      setError(donorEmail, emailError, 'Please enter your email address.');
    } else if (!isValidEmail(donorEmail.value.trim())) {
      setError(donorEmail, emailError, 'Please enter a valid email address.');
    } else {
      clearError(donorEmail, emailError);
    }
  });

  customAmount.addEventListener('blur', () => {
    const val = parseInt(customAmount.value, 10);
    if (!val || val < 100) {
      setError(customAmount, amountError, 'Please enter an amount of at least ₦100.');
    } else {
      clearError(customAmount, amountError);
    }
  });

  /* Full validation — checks all fields and returns true/false */
  function validateForm() {
    let valid = true;

    if (donorName.value.trim() === '') {
      setError(donorName, nameError, 'Please enter your full name.');
      valid = false;
    } else { clearError(donorName, nameError); }

    if (donorEmail.value.trim() === '') {
      setError(donorEmail, emailError, 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(donorEmail.value.trim())) {
      setError(donorEmail, emailError, 'Please enter a valid email address.');
      valid = false;
    } else { clearError(donorEmail, emailError); }

    const amount = parseInt(customAmount.value, 10);
    if (!amount || amount < 100) {
      setError(customAmount, amountError, 'Please select or enter an amount of at least ₦100.');
      valid = false;
    } else { clearError(customAmount, amountError); }

    return valid;
  }


  /* ==========================================================
     PART 6: FORM SUBMIT → PAYSTACK PAYMENT
     
     When the form is submitted:
     1. Validate all fields
     2. Check if Paystack is loaded
     3. Open the Paystack payment popup
     4. On success, show a thank-you message
     5. On close (user cancelled), re-enable the button
     
     IMPORTANT: Paystack amounts are in KOBO (the smallest
     Nigerian currency unit). ₦1 = 100 kobo.
     So we multiply the naira amount by 100.
     
     The 'ref' is a unique reference for this transaction.
     We use the current timestamp (Date.now()) to make it unique.
  ========================================================== */
  giveForm.addEventListener('submit', (e) => {
    e.preventDefault(); /* stop the page from reloading */
    if (!validateForm()) return; /* stop if validation failed */

    const amount = parseInt(customAmount.value, 10);
    const name   = donorName.value.trim();
    const email  = donorEmail.value.trim();
    const type   = typeLabels[selectedType] || selectedType;
    const note   = document.getElementById('giveNote').value.trim();
    const ref    = 'RCCG-SP-' + Date.now(); /* unique transaction reference */

    /* Check if the Paystack script has loaded.
       typeof checks the type of a variable.
       If Paystack hasn't loaded, 'PaystackPop' will be 'undefined'. */
    if (typeof PaystackPop === 'undefined') {
      showFallbackSuccess(name, amount, type);
      return;
    }

    /* Check if the developer has replaced the placeholder key */
    if (PAYSTACK_PUBLIC_KEY === 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE') {
      alert('Paystack is not yet configured. Update PAYSTACK_PUBLIC_KEY in js/give.js');
      return;
    }

    /* Disable the button while payment is processing */
    payBtn.disabled = true;
    payBtn.textContent = 'Opening payment...';

    /* Open the Paystack payment popup */
    const handler = PaystackPop.setup({
      key:      PAYSTACK_PUBLIC_KEY,
      email:    email,
      amount:   amount * 100, /* convert naira to kobo */
      currency: 'NGN',
      ref:      ref,
      metadata: {
        /* Extra info sent to Paystack dashboard for record-keeping */
        custom_fields: [
          { display_name: 'Donor Name',   variable_name: 'donor_name',   value: name },
          { display_name: 'Giving Type',  variable_name: 'giving_type',  value: type },
          { display_name: 'Note',         variable_name: 'note',         value: note || 'N/A' },
          { display_name: 'Church Email', variable_name: 'church_email', value: CHURCH_EMAIL }
        ]
      },
      callback: function(response) {
        /* Payment was successful — response.reference is the transaction ID */
        onPaymentSuccess(response, name, amount, type);
      },
      onClose: function() {
        /* User closed the popup without paying — re-enable the button */
        payBtn.disabled = false;
        payBtn.innerHTML = '<span aria-hidden="true">🔒</span> Give Securely via Paystack';
      }
    });

    handler.openIframe(); /* show the Paystack popup */
  });


  /* ==========================================================
     PART 7: PAYMENT SUCCESS
     
     After a successful payment, we hide the form and show
     a personalised thank-you message with the transaction ref.
  ========================================================== */
  function onPaymentSuccess(response, name, amount, type) {
    /* Hide all the form sections */
    giveForm.querySelector('.give-type-tabs').style.display = 'none';
    giveForm.querySelectorAll('.form-group').forEach(el => el.style.display = 'none');
    giveForm.querySelector('.form-row').style.display = 'none';
    giveSummary.hidden = true;
    payBtn.style.display = 'none';
    giveForm.querySelector('.give-secure-note').style.display = 'none';

    /* Show the success message */
    giveSuccess.hidden = false;
    giveSuccess.querySelector('h3').textContent = `Thank you, ${name.split(' ')[0]}!`;
    /* name.split(' ')[0] gets just the first name — e.g. "John Doe" → "John" */

    giveSuccess.querySelector('p').textContent =
      `Your ${type.toLowerCase()} of ₦${amount.toLocaleString()} has been received ` +
      `(Ref: ${response.reference}). May God bless and multiply it back to you in Jesus' name.`;

    giveSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* Fallback when Paystack is not configured — used for testing */
  function showFallbackSuccess(name, amount, type) {
    giveSuccess.hidden = false;
    giveSuccess.querySelector('h3').textContent = `Thank you, ${name.split(' ')[0]}!`;
    giveSuccess.querySelector('p').textContent =
      `Your ${type.toLowerCase()} of ₦${amount.toLocaleString()} has been noted. ` +
      `Please complete payment via bank transfer or contact us to confirm. God bless you!`;
    giveSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }


  /* ==========================================================
     PART 8: COPY ACCOUNT NUMBERS TO CLIPBOARD
     
     Each bank account card has a "Copy Account Number" button.
     When clicked, it copies the account number to the user's
     clipboard so they can paste it into their banking app.
     
     navigator.clipboard is the modern way to copy text.
     We fall back to the older document.execCommand('copy')
     for browsers that don't support the modern API.
     
     After copying, we show a "✅ Copied!" confirmation for
     3 seconds, then restore the original button text.
  ========================================================== */
  function setupCopyBtn(btnId, accountElId, confirmId) {
    const btn     = document.getElementById(btnId);
    const accEl   = document.getElementById(accountElId); /* the element with the account number */
    const confirm = document.getElementById(confirmId);   /* the "Copied!" message */
    if (!btn || !accEl) return; /* skip if elements don't exist */

    btn.addEventListener('click', () => {
      const accNum = accEl.textContent.trim(); /* get the account number text */

      if (navigator.clipboard) {
        /* Modern clipboard API */
        navigator.clipboard.writeText(accNum)
          .then(() => showCopyConfirm(btn, confirm))
          .catch(() => fallbackCopy(accNum, btn, confirm));
      } else {
        /* Older browser fallback */
        fallbackCopy(accNum, btn, confirm);
      }
    });
  }

  /* Fallback copy method using a hidden textarea */
  function fallbackCopy(text, btn, confirm) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed'; /* prevent page jumping */
    el.style.opacity  = '0';     /* invisible */
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy'); /* old-school copy command */
    document.body.removeChild(el);
    showCopyConfirm(btn, confirm);
  }

  /* Show the "Copied!" confirmation and restore button after 3 seconds */
  function showCopyConfirm(btn, confirm) {
    if (confirm) confirm.hidden = false;
    const originalText = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => {
      if (confirm) confirm.hidden = true;
      btn.textContent = originalText;
    }, 3000); /* 3000ms = 3 seconds */
  }

  /* Set up copy buttons for all three bank accounts */
  setupCopyBtn('copyAccBtn',      'accountNumber',         'copyConfirm');
  setupCopyBtn('copyTithesBtn',   'tithesAccountNumber',   'copyTithesConfirm');
  setupCopyBtn('copyBuildingBtn', 'buildingAccountNumber', 'copyBuildingConfirm');

}); /* end DOMContentLoaded */
