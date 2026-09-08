(function () {
  'use strict';

  const form = document.getElementById('enrollForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');
  const honeypot = document.getElementById('website');

  const fullName = document.getElementById('fullName');
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const whatsapp = document.getElementById('whatsapp');
  const city = document.getElementById('city');
  const state = document.getElementById('state');
  const profession = document.getElementById('profession');
  const hearAbout = document.getElementById('hearAbout');
  const goals = document.getElementById('goals');
  const goalsCount = document.getElementById('goalsCount');
  const consent = document.getElementById('consent');
  const courseCheckboxes = document.querySelectorAll('.course-checkbox');

  // ---- Validation patterns ----
  const NAME_RE = /^[A-Za-z][A-Za-z\s'.-]{1,49}$/;
  const PHONE_RE = /^[6-9]\d{9}$/; // Indian mobile: 10 digits starting 6-9
  const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const CITY_RE = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/;

  // Reference dataset used ONLY for datalist suggestions — never used to block submission,
  // since it can never be exhaustive of every real town/city.
  const STATE_CITIES = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kadapa', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Anantapur', 'Vizianagaram', 'Eluru', 'Ongole', 'Chittoor', 'Srikakulam'],
    'Delhi': ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh', 'Janakpuri', 'Pitampura', 'Vasant Kunj', 'Mayur Vihar', 'Lajpat Nagar', 'Connaught Place'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Mehsana', 'Bharuch', 'Morbi', 'Vapi'],
    'Karnataka': ['Bengaluru', 'Bangalore', 'Mysuru', 'Mysore', 'Hubballi', 'Hubli', 'Mangaluru', 'Mangalore', 'Belagavi', 'Belgaum', 'Kalaburagi', 'Gulbarga', 'Davanagere', 'Shivamogga', 'Tumakuru', 'Udupi', 'Bellary', 'Bidar'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam', 'Malappuram', 'Ernakulam', 'Idukki', 'Wayanad'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Satara'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Firozpur', 'Kapurthala', 'Sangrur'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Trichy', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Tuticorin', 'Dindigul', 'Thanjavur', 'Karur'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Siddipet', 'Secunderabad'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Noida', 'Gorakhpur', 'Jhansi', 'Mathura', 'Saharanpur'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur', 'Haldia', 'Darjeeling', 'Berhampore']
  };

  function populateCityList() {
    const datalist = document.getElementById('cityOptions');
    if (!datalist) return;
    datalist.innerHTML = '';
    const cities = STATE_CITIES[state.value];
    if (!cities) return;
    const frag = document.createDocumentFragment();
    cities.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      frag.appendChild(opt);
    });
    datalist.appendChild(frag);
  }

  function setError(field, errId, message) {
    const wrapper = field.closest('.field');
    const errEl = document.getElementById(errId);
    if (message) {
      wrapper.classList.add('invalid');
      wrapper.classList.remove('valid');
      field.setAttribute('aria-invalid', 'true');
      errEl.textContent = message;
    } else {
      wrapper.classList.remove('invalid');
      wrapper.classList.add('valid');
      field.setAttribute('aria-invalid', 'false');
      errEl.textContent = '';
    }
  }

  function clearState(field, errId) {
    const wrapper = field.closest('.field');
    wrapper.classList.remove('invalid', 'valid');
    field.removeAttribute('aria-invalid');
    document.getElementById(errId).textContent = '';
  }

  // ---- Individual validators ----
  function validateFullName(showEmptyError) {
    const val = fullName.value.trim();
    if (!val) {
      if (showEmptyError) setError(fullName, 'err-fullName', 'Full name is required.');
      else clearState(fullName, 'err-fullName');
      return false;
    }
    if (val.length < 2) {
      setError(fullName, 'err-fullName', 'Name must be at least 2 characters.');
      return false;
    }
    if (!NAME_RE.test(val)) {
      setError(fullName, 'err-fullName', 'Enter a valid name (letters only, no numbers or symbols).');
      return false;
    }
    setError(fullName, 'err-fullName', '');
    return true;
  }

  function validatePhone(showEmptyError) {
    const val = phone.value.trim();
    if (!val) {
      if (showEmptyError) setError(phone, 'err-phone', 'Phone number is required.');
      else clearState(phone, 'err-phone');
      return false;
    }
    if (!PHONE_RE.test(val)) {
      setError(phone, 'err-phone', 'Enter a valid 10-digit mobile number.');
      return false;
    }
    setError(phone, 'err-phone', '');
    return true;
  }

  function validateEmail(showEmptyError) {
    const val = email.value.trim();
    if (!val) {
      if (showEmptyError) setError(email, 'err-email', 'Email address is required.');
      else clearState(email, 'err-email');
      return false;
    }
    if (val.length > 254 || !EMAIL_RE.test(val)) {
      setError(email, 'err-email', 'Enter a valid email address.');
      return false;
    }
    setError(email, 'err-email', '');
    return true;
  }

  function validateWhatsapp() {
    const val = whatsapp.value.trim();
    if (!val) {
      clearState(whatsapp, 'err-whatsapp');
      return true; // optional
    }
    if (!PHONE_RE.test(val)) {
      setError(whatsapp, 'err-whatsapp', 'Enter a valid 10-digit WhatsApp number.');
      return false;
    }
    setError(whatsapp, 'err-whatsapp', '');
    return true;
  }

  function validateCity(showEmptyError) {
    const val = city.value.trim();
    if (!val) {
      if (showEmptyError) setError(city, 'err-city', 'City is required.');
      else clearState(city, 'err-city');
      return false;
    }
    if (val.length < 2 || !CITY_RE.test(val)) {
      setError(city, 'err-city', 'Enter a valid city name.');
      return false;
    }
    // Note: city is intentionally NOT cross-validated against the state's
    // reference list — that list is only a convenience for autocomplete
    // suggestions and can never cover every real town, so blocking on it
    // would incorrectly reject valid users.
    setError(city, 'err-city', '');
    return true;
  }

  function validateState(showEmptyError) {
    const val = state.value;
    if (!val) {
      if (showEmptyError) setError(state, 'err-state', 'Please select your state.');
      else clearState(state, 'err-state');
      return false;
    }
    setError(state, 'err-state', '');
    return true;
  }

  function validateHearAbout(showEmptyError) {
    const val = hearAbout.value;
    if (!val) {
      if (showEmptyError) setError(hearAbout, 'err-hearAbout', 'Please select an option.');
      else clearState(hearAbout, 'err-hearAbout');
      return false;
    }
    setError(hearAbout, 'err-hearAbout', '');
    return true;
  }

  function validateCourse(showEmptyError) {
    const checked = document.querySelectorAll('.course-checkbox:checked');
    const errEl = document.getElementById('err-course');
    if (checked.length === 0) {
      if (showEmptyError) {
        errEl.textContent = 'Please select at least one course.';
        errEl.style.display = 'block';
      }
      return false;
    }
    errEl.textContent = '';
    errEl.style.display = 'none';
    return true;
  }

  function validateConsent(showEmptyError) {
    const wrapper = consent.closest('.checkbox-field');
    const errEl = document.getElementById('err-consent');
    if (!consent.checked) {
      if (showEmptyError) {
        wrapper.classList.add('invalid');
        errEl.textContent = 'You must agree to continue.';
      } else {
        wrapper.classList.remove('invalid');
        errEl.textContent = '';
      }
      return false;
    }
    wrapper.classList.remove('invalid');
    errEl.textContent = '';
    return true;
  }

  function validateGoals() {
    if (goals.value.length > 500) {
      goals.value = goals.value.slice(0, 500);
    }
    goalsCount.textContent = String(goals.value.length);
    return true;
  }

  // ---- Master check (silent — used only to enable/disable the submit button) ----
  function isFormValid() {
    const nameOk = NAME_RE.test(fullName.value.trim()) && fullName.value.trim().length >= 2;
    const phoneOk = PHONE_RE.test(phone.value.trim());
    const emailOk = email.value.trim().length <= 254 && EMAIL_RE.test(email.value.trim());
    const whatsappOk = whatsapp.value.trim() === '' || PHONE_RE.test(whatsapp.value.trim());
    const cityVal = city.value.trim();
    const cityOk = cityVal.length >= 2 && CITY_RE.test(cityVal);
    const stateOk = !!state.value;
    const hearAboutOk = !!hearAbout.value;
    const courseOk = document.querySelectorAll('.course-checkbox:checked').length > 0;
    const consentOk = consent.checked;

    return nameOk && phoneOk && emailOk && whatsappOk && cityOk && stateOk && hearAboutOk && courseOk && consentOk;
  }

  function updateSubmitState() {
    submitBtn.disabled = !isFormValid();
  }

  const STATUS_AUTO_HIDE_MS = 5000;
  let statusHideTimer = null;

  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = 'form-status show ' + type;

    if (statusHideTimer) {
      window.clearTimeout(statusHideTimer);
    }
    statusHideTimer = window.setTimeout(hideStatus, STATUS_AUTO_HIDE_MS);
  }

  function hideStatus() {
    if (statusHideTimer) {
      window.clearTimeout(statusHideTimer);
      statusHideTimer = null;
    }
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  }

  function setSubmitting(isSubmitting) {
    submitBtn.classList.toggle('loading', isSubmitting);
    submitBtn.disabled = isSubmitting || !isFormValid();
    submitBtn.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
  }

  // ---- Real-time listeners (validate as user types; only nag about emptiness on blur) ----
  fullName.addEventListener('input', () => { validateFullName(false); updateSubmitState(); });
  fullName.addEventListener('blur', () => { validateFullName(true); updateSubmitState(); });

  phone.addEventListener('input', () => {
    phone.value = phone.value.replace(/\D/g, '').slice(0, 10);
    validatePhone(false);
    updateSubmitState();
  });
  phone.addEventListener('blur', () => { validatePhone(true); updateSubmitState(); });

  email.addEventListener('input', () => { validateEmail(false); updateSubmitState(); });
  email.addEventListener('blur', () => { validateEmail(true); updateSubmitState(); });

  whatsapp.addEventListener('input', () => {
    whatsapp.value = whatsapp.value.replace(/\D/g, '').slice(0, 10);
    validateWhatsapp();
    updateSubmitState();
  });
  whatsapp.addEventListener('blur', () => { validateWhatsapp(); updateSubmitState(); });

  city.addEventListener('input', () => { validateCity(false); updateSubmitState(); });
  city.addEventListener('blur', () => { validateCity(true); updateSubmitState(); });

  state.addEventListener('change', () => {
    validateState(true);
    populateCityList();
    updateSubmitState();
  });

  profession.addEventListener('change', updateSubmitState);
  hearAbout.addEventListener('change', () => { validateHearAbout(true); updateSubmitState(); });

  courseCheckboxes.forEach((box) => {
    box.addEventListener('change', () => {
      validateCourse(true);
      updateSubmitState();
    });
  });

  goals.addEventListener('input', validateGoals);

  consent.addEventListener('change', () => { validateConsent(true); updateSubmitState(); });

  // ---- Submit handler ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideStatus();

    // Bot check: honeypot field should always be empty for real users.
    if (honeypot && honeypot.value.trim() !== '') {
      // Silently reject — don't tip off bots that they were caught.
      return;
    }

    const nameOk = validateFullName(true);
    const phoneOk = validatePhone(true);
    const emailOk = validateEmail(true);
    const whatsappOk = validateWhatsapp();
    const cityOk = validateCity(true);
    const stateOk = validateState(true);
    const hearAboutOk = validateHearAbout(true);
    const courseOk = validateCourse(true);
    const consentOk = validateConsent(true);

    const allValid = nameOk && phoneOk && emailOk && whatsappOk && cityOk && stateOk && hearAboutOk && courseOk && consentOk;

    updateSubmitState();

    if (!allValid) {
      showStatus('Please fix the highlighted fields before submitting.', 'error');
      const firstInvalid = form.querySelector('.field.invalid, .checkbox-field.invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = firstInvalid.querySelector('input, select, textarea');
        if (focusable) focusable.focus({ preventScroll: true });
      }
      return;
    }

    const payload = {
      fullName: fullName.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      whatsapp: whatsapp.value.trim(),
      city: city.value.trim(),
      state: state.value,
      profession: profession.value,
      hearAbout: hearAbout.value,
      courses: Array.from(document.querySelectorAll('.course-checkbox:checked')).map((c) => c.value),
      goals: goals.value.trim(),
      consent: consent.checked
    };

    setSubmitting(true);

    // Replace this block with a real API call, e.g.:
    // fetch('/api/enroll', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // })
    //   .then((res) => { if (!res.ok) throw new Error('Request failed'); return res.json(); })
    //   .then(() => onSubmitSuccess())
    //   .catch(() => onSubmitError());

    window.setTimeout(function onSubmitSuccess() {
      setSubmitting(false);
      showStatus('Thanks! Your seat request has been received — we will contact you shortly.', 'success');
      form.reset();
      goalsCount.textContent = '0';
      document.querySelectorAll('.field, .checkbox-field').forEach((f) => f.classList.remove('valid', 'invalid'));
      document.querySelectorAll('.error-msg').forEach((el) => { el.textContent = ''; });
      populateCityList();
      updateSubmitState();
    }, 900);
  });

  // Initial state
  populateCityList();
  validateGoals();
  updateSubmitState();
})();
