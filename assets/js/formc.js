(function () {
    'use strict';

    var WHATSAPP_NUMBER = '919346273799'; // same number used by every WhatsApp link on this page

    var form = document.getElementById('contact-form');
    if (!form) return; // this script only runs on contact.html

    var statusEl = document.getElementById('form-status');
    var submitBtn = form.querySelector('button[type="submit"]');

    // Make sure the browser's own validation bubbles never fight ours.
    form.setAttribute('novalidate', '');

    /**
     * Field definitions: how to read each field's value and how to
     * validate it. Every field name here matches the `name`/`id`
     * attribute already in the HTML — nothing new is introduced.
     */
    var FIELDS = {
        name: {
            required: true,
            label: 'Name',
            validate: function (value) {
                if (!value) return 'Please enter your name.';
                if (value.length < 2) return 'Name must be at least 2 characters.';
                // Letters (incl. Telugu script), spaces, apostrophes, hyphens, dots.
                if (!/^[a-zA-Z\u0C00-\u0C7F.\s'-]{2,80}$/.test(value)) {
                    return 'Please enter a valid name (letters only).';
                }
                return '';
            }
        },
        phone: {
            required: true,
            label: 'Phone or WhatsApp',
            validate: function (value) {
                if (!value) return 'Please enter your phone or WhatsApp number.';
                var digitsOnly = value.replace(/[^\d]/g, '');
                if (!/^[+]?[\d\s()-]{7,20}$/.test(value)) {
                    return 'Please enter a valid phone number.';
                }
                if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                    return 'Phone number should have 7–15 digits.';
                }
                return '';
            }
        },
        email: {
            required: false,
            label: 'Email',
            validate: function (value) {
                if (!value) return ''; // optional field, empty is fine
                // Standard, pragmatic email pattern (RFC 5322-ish, not the whole spec).
                var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!pattern.test(value)) return 'Please enter a valid email address.';
                return '';
            }
        },
        enquiryType: {
            required: true,
            label: 'Enquiry type',
            validate: function (value) {
                if (!value) return 'Please choose an enquiry type.';
                return '';
            }
        },
        courseService: {
            required: false,
            label: 'Course or service',
            validate: function () { return ''; }
        },
        budget: {
            required: false,
            label: 'Budget range',
            validate: function () { return ''; }
        },
        timeline: {
            required: false,
            label: 'Preferred timeline',
            validate: function () { return ''; }
        },
        message: {
            required: true,
            label: 'Message',
            validate: function (value) {
                if (!value) return 'Please tell us a little about what you need.';
                if (value.trim().length < 10) return 'Message should be at least 10 characters.';
                return '';
            }
        },
        consent: {
            required: true,
            label: 'Consent',
            isCheckbox: true,
            validate: function (checked) {
                if (!checked) return 'Please agree before submitting.';
                return '';
            }
        }
    };

    function getField(name) {
        return form.elements[name];
    }

    function getErrorEl(name) {
        var el = form.querySelector('[data-error-for="' + name + '"]');
        if (el) return el;

        // The consent checkbox doesn't ship with a .field-error span in the
        // markup, so create one on the fly (same class the other fields
        // already use, so it inherits the existing error styling).
        if (name === 'consent') {
            var field = getField('consent');
            if (!field) return null;
            var span = document.createElement('span');
            span.className = 'field-error';
            span.setAttribute('data-error-for', 'consent');
            span.setAttribute('aria-live', 'polite');
            field.closest('.field').appendChild(span);
            return span;
        }
        return null;
    }

    function getValue(name) {
        var field = getField(name);
        if (!field) return '';
        var def = FIELDS[name];
        if (def && def.isCheckbox) return field.checked;
        return (field.value || '').trim();
    }

    function showError(name, message) {
        var field = getField(name);
        var errorEl = getErrorEl(name);

        if (errorEl) errorEl.textContent = message || '';
        if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validateField(name) {
        var def = FIELDS[name];
        if (!def) return true;

        var value = getValue(name);
        var error = def.validate(value);
        showError(name, error);
        return !error;
    }

    function validateAll() {
        var isValid = true;
        var firstInvalidField = null;

        Object.keys(FIELDS).forEach(function (name) {
            var fieldValid = validateField(name);
            if (!fieldValid) {
                isValid = false;
                if (!firstInvalidField) firstInvalidField = getField(name);
            }
        });

        if (firstInvalidField) {
            firstInvalidField.focus();
        }

        return isValid;
    }

    // Live validation: re-check a field once the user leaves it, and
    // clear its error as soon as they fix it while typing.
    Object.keys(FIELDS).forEach(function (name) {
        var field = getField(name);
        if (!field) return;

        var eventName = FIELDS[name].isCheckbox ? 'change' : 'blur';
        field.addEventListener(eventName, function () {
            validateField(name);
        });

        field.addEventListener('input', function () {
            var errorEl = getErrorEl(name);
            if (errorEl && errorEl.textContent) {
                validateField(name);
            }
        });
    });

    function buildWhatsAppMessage() {
        var lines = ['New enquiry from the website:', ''];

        lines.push('Name: ' + getValue('name'));
        lines.push('Phone: ' + getValue('phone'));

        var email = getValue('email');
        if (email) lines.push('Email: ' + email);

        lines.push('Enquiry type: ' + getValue('enquiryType'));

        var courseService = getValue('courseService');
        if (courseService) lines.push('Course/Service: ' + courseService);

        var budget = getValue('budget');
        if (budget) lines.push('Budget: ' + budget);

        var timeline = getValue('timeline');
        if (timeline) lines.push('Preferred timeline: ' + timeline);

        lines.push('');
        lines.push('Message: ' + getValue('message'));

        return lines.join('\n');
    }

    function setStatus(text) {
        if (statusEl) statusEl.textContent = text || '';
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // never let the browser do a native submit/reload

        var isValid = validateAll();

        if (!isValid) {
            setStatus('Please fix the highlighted fields before continuing.');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;
        setStatus('Opening WhatsApp with your enquiry…');

        var message = buildWhatsAppMessage();
        var whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

        window.open(whatsappUrl, '_blank', 'noopener');

        if (submitBtn) submitBtn.disabled = false;
        setStatus('WhatsApp opened in a new tab with your enquiry details.');
    });
})();