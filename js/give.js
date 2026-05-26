/* ==============================
   RCCG S&P Parish — give.js
   Donations page: form, Paystack integration
   Requires: js/main.js first
   ============================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== CONFIGURATION =====
  // Replace with your real Paystack PUBLIC key from https://dashboard.paystack.com
  const PAYSTACK_PUBLIC_KEY = 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE';

  // Church email — receives notification of every successful payment
  const CHURCH_EMAIL = 'info@rccgsandpparish.com';


  // ===== ELEMENTS =====
  const giveForm      = document.getElementById('giveForm');
  const payBtn        = document.getElementById('payBtn');
  const giveSuccess   = document.getElementById('giveSuccess');
  const giveSummary   = document.getElementById('giveSummary');
  const summaryType   = document.getElementById('summaryType');
  const summaryAmount = document.getElementById('summaryAmount');
  const givingTypeInput = document.getElementById('givingType');

  const donorName     = document.getElementById('donorName');
  const donorEmail    = document.getElementById('donorEmail');
  const customAmount  = document.getElementById('customAmount');

  const nameError     = document.getElementById('nameError');
  const emailError    = document.getElementById('emailError');
  const amountError   = document.getElementById('amountError');

  const copyAccBtn    = document.getElementById('copyAccBtn');
  const copyConfirm   = document.getElementById('copyConfirm');
  const accountNumber = document.getElementById('accountNumber');

  let selectedAmount  = 0;
  let selectedType    = 'tithe';

  const typeLabels = {
    tithe:    'Tithe',
    offering: 'Offering',
    seed:     'Special Seed',
    project:  'Building Fund'
  };


  // ===== 1. GIVING TYPE TABS =====

  document.querySelectorAll('.give-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.give-type-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      selectedType = btn.getAttribute('data-type');
      givingTypeInput.value = selectedType;
      updateSummary();
    });
  });


  // ===== 2. PRESET AMOUNT BUTTONS =====

  document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      selectedAmount = parseInt(btn.getAttribute('data-amount'), 10);
      customAmount.value = selectedAmount;
      clearError(customAmount, amountError);
      updateSummary();
    });
  });


  // ===== 3. CUSTOM AMOUNT INPUT =====

  customAmount.addEventListener('input', () => {
    // Deselect preset buttons when typing a custom amount
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
    selectedAmount = parseInt(customAmount.value, 10) || 0;
    clearError(customAmount, amountError);
    updateSummary();
  });


  // ===== 4. SUMMARY UPDATE =====

  function updateSummary() {
    if (selectedAmount >= 100) {
      giveSummary.hidden = false;
      summaryType.textContent   = typeLabels[selectedType] || selectedType;
      summaryAmount.textContent = '₦' + selectedAmount.toLocaleString();
    } else {
      giveSummary.hidden = true;
    }
  }


  // ===== 5. FORM VALIDATION =====

  function setError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.toggle('error', !!message);
  }

  function clearError(input, errorEl) {
    setError(input, errorEl, '');
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  // Real-time blur validation
  donorName.addEventListener('blur', () => {
    setError(donorName, nameError, donorName.value.trim() === '' ? 'Please enter your full name.' : '');
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

  function validateForm() {
    let valid = true;

    if (donorName.value.trim() === '') {
      setError(donorName, nameError, 'Please enter your full name.');
      valid = false;
    } else {
      clearError(donorName, nameError);
    }

    if (donorEmail.value.trim() === '') {
      setError(donorEmail, emailError, 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(donorEmail.value.trim())) {
      setError(donorEmail, emailError, 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(donorEmail, emailError);
    }

    const amount = parseInt(customAmount.value, 10);
    if (!amount || amount < 100) {
      setError(customAmount, amountError, 'Please select or enter an amount of at least ₦100.');
      valid = false;
    } else {
      clearError(customAmount, amountError);
    }

    return valid;
  }


  // ===== 6. FORM SUBMIT → PAYSTACK =====

  giveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const amount  = parseInt(customAmount.value, 10);
    const name    = donorName.value.trim();
    const email   = donorEmail.value.trim();
    const type    = typeLabels[selectedType] || selectedType;
    const note    = document.getElementById('giveNote').value.trim();
    const ref     = 'RCCG-SP-' + Date.now();

    // Check if Paystack script loaded
    if (typeof PaystackPop === 'undefined') {
      // Paystack not loaded (no internet / key not set) — show fallback
      showFallbackSuccess(name, amount, type);
      return;
    }

    // Check if key is still the placeholder
    if (PAYSTACK_PUBLIC_KEY === 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE') {
      alert('Paystack is not yet configured. Please update PAYSTACK_PUBLIC_KEY in js/give.js with your real key from dashboard.paystack.com');
      return;
    }

    payBtn.disabled = true;
    payBtn.textContent = 'Opening payment...';

    const handler = PaystackPop.setup({
      key:       PAYSTACK_PUBLIC_KEY,
      email:     email,
      amount:    amount * 100,           // Paystack uses kobo (multiply by 100)
      currency:  'NGN',
      ref:       ref,
      metadata: {
        custom_fields: [
          { display_name: 'Donor Name',   variable_name: 'donor_name',   value: name },
          { display_name: 'Giving Type',  variable_name: 'giving_type',  value: type },
          { display_name: 'Note',         variable_name: 'note',         value: note || 'N/A' },
          { display_name: 'Church Email', variable_name: 'church_email', value: CHURCH_EMAIL }
        ]
      },
      callback: function(response) {
        // Payment successful
        onPaymentSuccess(response, name, amount, type);
      },
      onClose: function() {
        // User closed the popup without paying
        payBtn.disabled = false;
        payBtn.innerHTML = '<span aria-hidden="true">🔒</span> Give Securely via Paystack';
      }
    });

    handler.openIframe();
  });


  // ===== 7. PAYMENT SUCCESS HANDLER =====

  function onPaymentSuccess(response, name, amount, type) {
    // Hide the form, show success message
    giveForm.querySelector('.give-type-tabs').style.display = 'none';
    giveForm.querySelectorAll('.form-group').forEach(el => el.style.display = 'none');
    giveForm.querySelector('.form-row').style.display = 'none';
    giveSummary.hidden = true;
    payBtn.style.display = 'none';
    giveForm.querySelector('.give-secure-note').style.display = 'none';

    giveSuccess.hidden = false;
    giveSuccess.querySelector('h3').textContent = `Thank you, ${name.split(' ')[0]}!`;
    giveSuccess.querySelector('p').textContent =
      `Your ${type.toLowerCase()} of ₦${amount.toLocaleString()} has been received (Ref: ${response.reference}). May God bless and multiply it back to you in Jesus' name.`;

    giveSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showFallbackSuccess(name, amount, type) {
    // Used when Paystack is not configured — for demo/testing
    giveSuccess.hidden = false;
    giveSuccess.querySelector('h3').textContent = `Thank you, ${name.split(' ')[0]}!`;
    giveSuccess.querySelector('p').textContent =
      `Your ${type.toLowerCase()} of ₦${amount.toLocaleString()} has been noted. Please complete payment via bank transfer or contact us to confirm. God bless you!`;
    giveSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }


  // ===== 8. COPY ACCOUNT NUMBER =====

  copyAccBtn.addEventListener('click', () => {
    const accNum = accountNumber.textContent.trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(accNum).then(() => {
        showCopyConfirm();
      }).catch(() => {
        fallbackCopy(accNum);
      });
    } else {
      fallbackCopy(accNum);
    }
  });

  function fallbackCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity  = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showCopyConfirm();
  }

  function showCopyConfirm() {
    copyConfirm.hidden = false;
    copyAccBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      copyConfirm.hidden = true;
      copyAccBtn.textContent = '📋 Copy Account Number';
    }, 3000);
  }

}); // end DOMContentLoaded
