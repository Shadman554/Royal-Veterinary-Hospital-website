/**
 * Royal Veterinary Hospital — Modern Interactive Application
 * Sulaymaniyah, Kurdistan Region
 * Fully Accessible, Progressive Enhancement, Bilingual (EN/KU) & RTL Support
 */

(function () {
  'use strict';

  // --- Translation Dictionary ---
  const i18n = {
    en: {
      siteTitle: "Royal Veterinary Hospital",
      emergencyTop: "24/7 Emergency Triage Available",
      callUs: "Call 0770 123 4567",
      openNow: "Open Now",
      closesAt: "Closes at 9:00 PM",
      closedNow: "Closed Now",
      opensAt: "Opens at 8:30 AM",
      emergencyHotline: "Emergency 24/7",
      navHome: "Home",
      navServices: "Services",
      navPackages: "Packages",
      navTeam: "Our Team",
      navFacilities: "Facilities",
      navAbout: "About Us",
      navContact: "Contact",
      bookAppointment: "Book Appointment",
      bookConsultation: "Book Consultation",
      viewAllServices: "View All Services",
      exploreHospital: "Explore Our Hospital",
      getDirections: "Get Directions",
      sendInquiry: "Send Message",
      emergencyNotice: "For critical animal emergencies, please call our 24/7 triage line immediately.",
      appointmentIntro: "This form prepares your preferred visit details only. It does not send a request to the hospital. Please call reception to confirm.",
      prepareRequest: "Prepare Request",
      appointmentNotSentNote: "No request has been sent. Call reception to confirm:",
      inquiryNotSent: "This online inquiry form is not connected yet. Please call reception at 0770 123 4567.",
      prepareInquiry: "Prepare Inquiry",
      messageNotSent: "This form is not connected yet. Your message was not sent. Please call reception at 0770 123 4567.",
      newsletterUnavailable: "Newsletter signup is not connected yet.",
      searchPlaceholder: "Search veterinary services, diagnostics...",
      allCategories: "All",
      noResults: "No matching veterinary services found. Try another term.",
      showingServices: "Showing {count} of {total} services",
      // Confirmation
      receiptTitle: "Appointment Request Prepared",
      receiptSubtitle: "Your preferred visit details are ready, but the hospital has not received your request.",
      refCode: "Local Reference",
      owner: "Pet Guardian",
      pet: "Patient",
      service: "Care Service",
      doctor: "Veterinarian",
      dateTime: "Preferred Date & Time",
      addToCalendar: "Add to Calendar (.ics)",
      printReceipt: "Print Confirmation",
      close: "Close",
      langSwitchToast: "Switched to English.",
      copiedToast: "Copied to clipboard!"
    },
    ku: {
      siteTitle: "نەخۆشخانەی ڤێتێرنەری ڕۆیاڵ",
      emergencyTop: "بەشی فریاکەوتنی بەپەلەی ٢٤ کاتژمێری ئامادەیە",
      callUs: "پەیوەندی بکە: ٠٧٧٠ ١٢٣ ٤٥٦٧",
      openNow: "ئێستا کراوەیە",
      closesAt: "داخران لە کاتژمێر ٩:٠٠ ی شەو",
      closedNow: "ئێستا داخراوە",
      opensAt: "دەکرێتەوە لە ٨:٣٠ ی بەیانی",
      emergencyHotline: "فریاکەوتنی ٢٤/٧",
      navHome: "سەرەکی",
      navServices: "خزمەتگوزارییەکان",
      navPackages: "پاکێجەکان",
      navTeam: "تیمی پزیشکی",
      navFacilities: "بەشەکانی نەخۆشخانە",
      navAbout: "دەربارەی ئێمە",
      navContact: "پەیوەندی",
      bookAppointment: "وەرگرتنی نۆرە",
      bookConsultation: "تۆمارکردنی بینین",
      viewAllServices: "بینینی هەموو خزمەتگوزارییەکان",
      exploreHospital: "گەشتێک لە نەخۆشخانە",
      getDirections: "ڕێگاکانی هاتن",
      sendInquiry: "ناردنی پەیام",
      emergencyNotice: "بۆ بارودۆخی لەناکاوی ئاژەڵەکەت، تکایە ڕاستەوخۆ پەیوەندی بە هێڵی فریاکەوتنەوە بکە.",
      appointmentIntro: "ئەم فۆڕمە تەنها زانیاریی سەردانی پەسەندکراوت ئامادە دەکات. داواکارییەکە بۆ نەخۆشخانە نانێردرێت. تکایە بۆ دڵنیابوونەوە پەیوەندی بە پێشوازی بکە.",
      prepareRequest: "ئامادەکردنی داواکاری",
      appointmentNotSentNote: "هیچ داواکارییەک نەنێردراوە. بۆ دڵنیابوونەوە پەیوەندی بکە:",
      inquiryNotSent: "ئەم فۆڕمەی ئۆنلاین بە نەخۆشخانەوە نەبەستراوە. تکایە بە ژمارەی ٠٧٧٠ ١٢٣ ٤٥٦٧ پەیوەندی بکە.",
      prepareInquiry: "ئامادەکردنی پەیام",
      messageNotSent: "ئەم فۆڕمە بەستراو نییە و پەیامەکەت نەنێردراوە. تکایە بە ژمارەی ٠٧٧٠ ١٢٣ ٤٥٦٧ پەیوەندی بکە.",
      newsletterUnavailable: "تۆمارکردنی ئیمەیڵی هەواڵنامە بەستراو نییە.",
      searchPlaceholder: "گەڕان بۆ خزمەتگوزارییەکان و تاقیگە...",
      allCategories: "هەمووی",
      noResults: "هیچ خزمەتگوزارییەک نەدۆزرایەوە.",
      showingServices: "پیشاندانی {count} لە کۆی {total} خزمەتگوزاری",
      // Confirmation
      receiptTitle: "داواکاری نۆرە ئامادەیە",
      receiptSubtitle: "زانیارییەکانی سەردان ئامادەیە، بەڵام نەخۆشخانە داواکارییەکەت وەرنەگرتووە.",
      refCode: "کۆدی ناوخۆیی",
      owner: "خاوەنی ئاژەڵ",
      pet: "نەخۆش",
      service: "خزمەتگوزاری",
      doctor: "پزیشکی پسپۆڕ",
      dateTime: "ڕۆژ و کات",
      addToCalendar: "زیادکردن بۆ ساڵنامە",
      printReceipt: "چاپکردنی وەسڵ",
      close: "داخستن",
      langSwitchToast: "زمان گۆڕدرا بۆ کوردی سۆرانی.",
      copiedToast: "کۆپی کرا!"
    }
  };

  // Helper: DOM Selector
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // --- Toast System ---
  function showToast(message) {
    let toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('on');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toast.classList.remove('on');
    }, 4000);
  }

  // --- Live Hospital Hours & Open/Closed Status ---
  function updateHospitalStatus() {
    // Sulaymaniyah, Iraq is UTC+3
    const now = new Date();
    // Get UTC hours and convert to UTC+3
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const day = (now.getUTCDay() + (utcHours + 3 >= 24 ? 1 : 0)) % 7;
    const currentHour = (utcHours + 3) % 24;
    const currentDecimalTime = currentHour + utcMinutes / 60;

    let isOpen = false;
    let closeTimeStr = "9:00 PM";
    let openTimeStr = "8:30 AM";

    if (day === 5) {
      // Friday hours: 10:00 AM - 7:00 PM
      isOpen = currentDecimalTime >= 10.0 && currentDecimalTime < 19.0;
      closeTimeStr = "7:00 PM";
      openTimeStr = "10:00 AM";
    } else {
      // Saturday - Thursday: 8:30 AM - 9:00 PM
      isOpen = currentDecimalTime >= 8.5 && currentDecimalTime < 21.0;
      closeTimeStr = "9:00 PM";
      openTimeStr = "8:30 AM";
    }

    const lang = document.documentElement.getAttribute('lang') || 'en';
    const dict = i18n[lang] || i18n.en;

    const pulseDots = $$('.pulse-dot');
    const statusTexts = $$('.live-status-text');

    pulseDots.forEach(dot => {
      if (isOpen) {
        dot.classList.remove('closed');
      } else {
        dot.classList.add('closed');
      }
    });

    statusTexts.forEach(txt => {
      if (isOpen) {
        txt.innerHTML = `${dict.openNow} · <small>${dict.closesAt.replace('9:00 PM', closeTimeStr)}</small>`;
      } else {
        txt.innerHTML = `${dict.closedNow} · <small>${dict.opensAt.replace('8:30 AM', openTimeStr)}</small>`;
      }
    });
  }

  // --- Language Switcher & RTL Engine ---
  function setLanguage(lang, announce = true) {
    if (lang !== 'ku' && lang !== 'en') lang = 'en';
    localStorage.setItem('royal_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ku' ? 'rtl' : 'ltr');

    $$('.lang-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.lang === lang);
    });

    // Update Translatable Elements with data-i18n
    $$('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[lang] && i18n[lang][key]) {
        if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
          el.setAttribute('placeholder', i18n[lang][key]);
        } else {
          el.textContent = i18n[lang][key];
        }
      }
    });

    // Update navigation items
    const navMapping = {
      'index.html': { en: 'Home', ku: 'سەرەکی' },
      'services.html': { en: 'Services', ku: 'خزمەتگوزارییەکان' },
      'packages.html': { en: 'Packages', ku: 'پاکێجەکان' },
      'team.html': { en: 'Our Team', ku: 'تیمی پزیشکی' },
      'facilities.html': { en: 'Facilities', ku: 'بەشەکانی نەخۆشخانە' },
      'about.html': { en: 'About Us', ku: 'دەربارەی ئێمە' },
      'contact.html': { en: 'Contact', ku: 'پەیوەندی' }
    };

    $$('.main-nav a, .mobile-panel nav a:not(.mobile-cta)').forEach(link => {
      const href = link.getAttribute('href');
      if (navMapping[href]) {
        link.textContent = navMapping[href][lang];
      }
    });

    updateHospitalStatus();
    if (announce) showToast(i18n[lang].langSwitchToast);
  }

  function initLanguage() {
    const saved = localStorage.getItem('royal_lang') || 'en';
    setLanguage(saved, false);

    $$('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.currentTarget.dataset.lang;
        setLanguage(lang);
      });
    });
  }

  // --- Mobile Menu Toggle ---
  function initMobileMenu() {
    const toggle = $('.menu-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const isOpened = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(isOpened));
    });

    $$('.mobile-panel a').forEach(a => {
      a.addEventListener('click', () => {
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Services Filter & Search ---
  function initServicesFilter() {
    const searchInput = $('#service-search');
    const filterTabs = $$('.filter-tab');
    const serviceCards = $$('.services-grid.three > .service-card, #service-list > .service-card');
    const emptyNotice = $('.empty-search');
    const countDisplay = $('.services-count-hint');

    if (!searchInput && filterTabs.length === 0) return;

    let activeFilter = 'All';

    function applyFilter() {
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      let visibleCount = 0;

      serviceCards.forEach(card => {
        const category = card.dataset.category || '';
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('p')?.textContent || '').toLowerCase();

        const matchesCat = (activeFilter === 'All' || category.toLowerCase() === activeFilter.toLowerCase());
        const matchesQuery = !query || title.includes(query) || desc.includes(query) || category.toLowerCase().includes(query);

        if (matchesCat && matchesQuery) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      if (emptyNotice) {
        emptyNotice.classList.toggle('hidden', visibleCount > 0);
      }

      if (countDisplay) {
        countDisplay.textContent = `Showing ${visibleCount} of ${serviceCards.length} services`;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilter = tab.dataset.filter || 'All';
        applyFilter();
      });
    });
  }

  // --- Interactive Multi-Step Appointment Booking System ---
  function initAppointmentWizard() {
    const form = $('#appointment-wizard-form');
    if (!form) return;

    const steps = $$('.wizard-step');
    const stepIndicators = $$('.step-indicator');
    const prevBtn = $('#wizard-prev-btn');
    const nextBtn = $('#wizard-next-btn');
    const submitBtn = $('#wizard-submit-btn');

    let currentStep = 1;
    const totalSteps = steps.length;

    // Minimum date setup: Today
    const dateInput = $('#appt-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
      if (!dateInput.value) {
        // Default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
      }
    }

    // Pre-fill from URL parameters (e.g. ?service=Surgery&doctor=Dr.+Alan+Rashid)
    const urlParams = new URLSearchParams(window.location.search);
    const paramService = urlParams.get('service');
    const paramDoctor = urlParams.get('doctor');

    if (paramService) {
      const serviceSelect = $('#appt-service');
      if (serviceSelect) {
        for (let opt of serviceSelect.options) {
          if (opt.value.toLowerCase().includes(paramService.toLowerCase())) {
            opt.selected = true;
            break;
          }
        }
      }
    }

    if (paramDoctor) {
      const doctorSelect = $('#appt-doctor');
      if (doctorSelect) {
        for (let opt of doctorSelect.options) {
          if (opt.value.toLowerCase().includes(paramDoctor.toLowerCase())) {
            opt.selected = true;
            break;
          }
        }
      }
    }

    // Time Slot selection cards
    $$('.time-slot-card').forEach(card => {
      card.addEventListener('click', () => {
        $$('.time-slot-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          updateSummary();
        }
      });
    });

    // Real-time live summary updater
    function updateSummary() {
      const petName = $('#appt-pet-name')?.value || '—';
      const petType = $('#appt-pet-type')?.value || 'Pet';
      const service = $('#appt-service')?.value || 'General Consultation';
      const doctor = $('#appt-doctor')?.value || 'Any Available Specialist';
      const date = $('#appt-date')?.value || '—';
      const selectedSlot = $('input[name="timeSlot"]:checked')?.value || 'Morning (09:00 - 12:00)';
      const ownerName = $('#appt-owner-name')?.value || '—';
      const phone = $('#appt-phone')?.value || '—';

      const sumPet = $('#summary-patient');
      const sumService = $('#summary-service');
      const sumDoctor = $('#summary-doctor');
      const sumDateTime = $('#summary-datetime');
      const sumOwner = $('#summary-owner');

      if (sumPet) sumPet.textContent = petName !== '—' ? `${petName} (${petType})` : '—';
      if (sumService) sumService.textContent = service;
      if (sumDoctor) sumDoctor.textContent = doctor;
      if (sumDateTime) sumDateTime.textContent = date !== '—' ? `${date} · ${selectedSlot.split(' ')[0]}` : '—';
      if (sumOwner) sumOwner.textContent = ownerName !== '—' ? `${ownerName} (${phone})` : '—';
    }

    form.addEventListener('input', updateSummary);
    form.addEventListener('change', updateSummary);
    updateSummary();

    function showStep(stepIndex) {
      steps.forEach((step, idx) => {
        step.classList.toggle('active', idx + 1 === stepIndex);
      });

      stepIndicators.forEach((ind, idx) => {
        const stepNum = idx + 1;
        ind.classList.toggle('active', stepNum === stepIndex);
        ind.classList.toggle('completed', stepNum < stepIndex);
      });

      if (prevBtn) prevBtn.style.visibility = stepIndex === 1 ? 'hidden' : 'visible';
      if (nextBtn) nextBtn.style.display = stepIndex === totalSteps ? 'none' : 'inline-flex';
      if (submitBtn) submitBtn.style.display = stepIndex === totalSteps ? 'inline-flex' : 'none';

      currentStep = stepIndex;
      // Smooth scroll to top of wizard on step change
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateCurrentStep() {
      const activeStepEl = $(`.wizard-step[data-step="${currentStep}"]`);
      if (!activeStepEl) return true;
      const inputs = Array.from(activeStepEl.querySelectorAll('input[required], select[required], textarea[required]'));
      for (let input of inputs) {
        if (!input.checkValidity()) {
          input.reportValidity();
          return false;
        }
      }
      return true;
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
          if (currentStep < totalSteps) {
            showStep(currentStep + 1);
          }
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
          showStep(currentStep - 1);
        }
      });
    }

    // Handle Submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateCurrentStep()) return;

      const formData = new FormData(form);
      const bookingData = Object.fromEntries(formData.entries());
      const refCode = 'RVH-' + Math.floor(100000 + Math.random() * 900000);

      // Populate Receipt Modal
      $('#receipt-ref').textContent = refCode;
      $('#receipt-owner').textContent = `${bookingData.ownerName} (${bookingData.phone})`;
      $('#receipt-pet').textContent = `${bookingData.petName} (${bookingData.petType})`;
      $('#receipt-service').textContent = bookingData.service;
      $('#receipt-doctor').textContent = bookingData.doctor;
      $('#receipt-datetime').textContent = `${bookingData.date} · ${bookingData.timeSlot || 'Morning'}`;

      // Open Modal
      const modal = $('#receipt-modal');
      if (modal) {
        modal.classList.add('active');
      }

      form.reset();
      updateSummary();
      showStep(1);
    });

    // Close Modal Button
    $$('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        $('#receipt-modal')?.classList.remove('active');
      });
    });

    // Calendar (.ics) Generator
    $('#btn-download-ics')?.addEventListener('click', () => {
      const ref = $('#receipt-ref')?.textContent || 'RVH-APPT';
      const service = $('#receipt-service')?.textContent || 'Veterinary Appointment';
      const dt = $('#receipt-datetime')?.textContent || '';
      const doc = $('#receipt-doctor')?.textContent || 'Royal Veterinary Hospital Specialist';

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Royal Veterinary Hospital//Appointment//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${service} - Royal Veterinary Hospital (${ref})`,
        `DESCRIPTION:Appointment with ${doc} for your pet at Royal Veterinary Hospital, Gulan St, Sulaymaniyah. Tel: 0770 123 4567`,
        'LOCATION:Royal Veterinary Hospital, Gulan Street, Sulaymaniyah, Iraq',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${ref}-appointment.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Calendar invite downloaded!');
    });

    // Print Receipt
    $('#btn-print-receipt')?.addEventListener('click', () => {
      window.print();
    });
  }

  // --- Contact Form Handler ---
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const lang = document.documentElement.lang === 'ku' ? 'ku' : 'en';
      const feedback = $('.form-feedback', form);
      if (feedback) {
        feedback.textContent = i18n[lang].messageNotSent;
        feedback.className = 'form-feedback error';
      }
    });
  }

  // --- Interactive Leaflet Map for Contact Page ---
  function initMap() {
    const mapEl = $('#hospital-map');
    if (!mapEl) return;

    // Sulaymaniyah Coordinates
    const lat = 35.5668;
    const lng = 45.4161;

    if (typeof L !== 'undefined') {
      try {
        const map = L.map('hospital-map', {
          scrollWheelZoom: false
        }).setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors | Royal Veterinary Hospital'
        }).addTo(map);

        // Custom Green SVG Pin Marker
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background:#149554;width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:grid;place-items:center;">
                  <div aria-hidden="true" style="transform:rotate(45deg);color:white;font-weight:bold;font-size:16px;">+</div>
                 </div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;padding:6px;">
            <strong style="color:#149554;font-size:15px;display:block;margin-bottom:4px;">Royal Veterinary Hospital</strong>
            <p style="margin:0 0 6px 0;font-size:12.5px;color:#333;">Gulan Street, Sulaymaniyah</p>
            <span style="font-size:11px;background:#eaf7f0;color:#0d8145;padding:2px 6px;border-radius:10px;font-weight:bold;">Open Today: 8:30 AM – 9:00 PM</span>
          </div>
        `).openPopup();
      } catch (err) {
        console.warn('Leaflet map initialization skipped:', err);
      }
    }
  }

  // --- Smooth FAQ Accordion Helper ---
  function initFaq() {
    $$('.faq-item summary').forEach(summary => {
      summary.addEventListener('click', (e) => {
        const details = summary.parentElement;
        // Optionally close other accordions
        $$('.faq-item').forEach(item => {
          if (item !== details && item.hasAttribute('open')) {
            item.removeAttribute('open');
          }
        });
      });
    });
  }

  // --- Newsletter Form ---
  function initNewsletter() {
    $$('.newsletter-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          const lang = document.documentElement.lang === 'ku' ? 'ku' : 'en';
          showToast(i18n[lang].newsletterUnavailable);
        }
      });
    });
  }

  // --- Global Initialization ---
  document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initMobileMenu();
    updateHospitalStatus();
    initServicesFilter();
    initAppointmentWizard();
    initContactForm();
    initMap();
    initFaq();
    initNewsletter();

    // Check hospital status every 60 seconds
    setInterval(updateHospitalStatus, 60000);
  });

})();
