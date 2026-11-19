/**
 * AquaGleam Detailing & Wash (АкваБлеск Детейлинг)
 * Core Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initCalculator();
  initBeforeAfterSlider();
  initBookingSystem();
  initFaqAccordion();
  initSocialProofToast();
  initBackToTop();
  initScrollAnimations();
});

/* ---------------- 1. Header & Navigation ---------------- */
function initHeader() {
  const header = document.querySelector('.header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightActiveNavLink();
  });

  // Mobile menu toggle
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link scroll spy
  function highlightActiveNavLink() {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }
}

/* ---------------- 2. Interactive Cost Calculator ---------------- */
const CALC_DATA = {
  bodies: {
    sedan: { name: 'Седан', coef: 1.0 },
    crossover: { name: 'Кроссовер', coef: 1.2 },
    suv: { name: 'Внедорожник', coef: 1.4 },
    van: { name: 'Микроавтобус', coef: 1.7 }
  },
  packages: {
    express: {
      name: 'Экспресс',
      basePrice: 1200,
      time: '25 мин',
      desc: '1-фазная бесконтактная мойка + коврики'
    },
    standard: {
      name: 'Комплекс Стандарт',
      basePrice: 2400,
      time: '45 мин',
      desc: '2-фазная деликатная мойка + уборка салона'
    },
    premium: {
      name: 'Премиум Детейлинг 3-фазы',
      basePrice: 4800,
      time: '75 мин',
      desc: '3 фазы Koch Chemie + консервант + салон LeTech + озон'
    },
    ceramic: {
      name: 'Керамика & Защита',
      basePrice: 9900,
      time: '180 мин',
      desc: 'Глубокая очистка + легкая полировка + 2 слоя 9H'
    }
  },
  addons: {
    'tire-black': { name: 'Чернение шин с сатиновым эффектом', price: 400, time: 5 },
    'hydro-wax': { name: 'Защитный воск HydroGloss', price: 800, time: 10 },
    'antirain': { name: 'Антидождь (лобовое + передние стекла)', price: 1200, time: 15 },
    'ozonation': { name: 'Антибактериальная озонация салона', price: 1500, time: 20 },
    'engine': { name: 'Деликатная мойка двигателя диэлектриком', price: 2500, time: 30 },
    'rim-ceramic': { name: 'Керамическая защита колесных дисков', price: 1800, time: 20 }
  }
};

let currentCalcState = {
  body: 'crossover',
  package: 'premium',
  addons: new Set(['hydro-wax', 'antirain'])
};

function initCalculator() {
  const bodyCards = document.querySelectorAll('.body-type-card');
  const pkgCards = document.querySelectorAll('.calc-pkg-card');
  const addonItems = document.querySelectorAll('.calc-addon-item');
  const applyBtn = document.getElementById('calc-apply-btn');

  // Body type selection
  bodyCards.forEach(card => {
    card.addEventListener('click', () => {
      bodyCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentCalcState.body = card.dataset.body;
      updateCalculatorDisplay();
    });
  });

  // Package selection
  pkgCards.forEach(card => {
    card.addEventListener('click', () => {
      pkgCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentCalcState.package = card.dataset.pkg;
      updateCalculatorDisplay();
    });
  });

  // Add-on selection
  addonItems.forEach(item => {
    item.addEventListener('click', () => {
      const addonKey = item.dataset.addon;
      if (currentCalcState.addons.has(addonKey)) {
        currentCalcState.addons.delete(addonKey);
        item.classList.remove('active');
      } else {
        currentCalcState.addons.add(addonKey);
        item.classList.add('active');
      }
      updateCalculatorDisplay();
    });
  });

  // Connect tariff cards "Выбрать тариф"
  const selectTariffBtns = document.querySelectorAll('.select-tariff-btn');
  selectTariffBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pkg = btn.dataset.package;
      if (pkg && CALC_DATA.packages[pkg]) {
        currentCalcState.package = pkg;
        // Update calc package cards UI
        pkgCards.forEach(c => {
          c.classList.toggle('active', c.dataset.pkg === pkg);
        });
        updateCalculatorDisplay();

        // Smooth scroll to calculator or booking
        const target = document.querySelector('#calculator');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Apply to booking button
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      syncCalculatorToBooking();
      const bookingSec = document.querySelector('#booking');
      if (bookingSec) {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Initial calculation
  updateCalculatorDisplay();
}

function updateCalculatorDisplay() {
  const bodyInfo = CALC_DATA.bodies[currentCalcState.body];
  const pkgInfo = CALC_DATA.packages[currentCalcState.package];

  // Base calculation with body ratio, round to hundred
  const calculatedBasePrice = Math.round((pkgInfo.basePrice * bodyInfo.coef) / 100) * 100;

  // Addons sum
  let addonsSum = 0;
  let addonsNames = [];
  currentCalcState.addons.forEach(key => {
    const addon = CALC_DATA.addons[key];
    if (addon) {
      addonsSum += addon.price;
      addonsNames.push(addon.name);
    }
  });

  const totalPrice = calculatedBasePrice + addonsSum;

  // Animate total price number
  const totalEl = document.getElementById('calc-total-amount');
  if (totalEl) {
    animateValue(totalEl, parseInt(totalEl.dataset.current || '0', 10), totalPrice, 400);
    totalEl.dataset.current = totalPrice;
  }

  // Update summary rows
  const sumBody = document.getElementById('calc-sum-body');
  const sumPkg = document.getElementById('calc-sum-package');
  const sumAddons = document.getElementById('calc-sum-addons');
  const sumTime = document.getElementById('calc-sum-time');

  if (sumBody) sumBody.textContent = `${bodyInfo.name} (x${bodyInfo.coef})`;
  if (sumPkg) sumPkg.textContent = `${pkgInfo.name} — ${calculatedBasePrice.toLocaleString('ru-RU')} ₽`;
  if (sumAddons) {
    if (currentCalcState.addons.size === 0) {
      sumAddons.textContent = 'Не выбраны';
    } else {
      sumAddons.textContent = `${currentCalcState.addons.size} шт. (+${addonsSum.toLocaleString('ru-RU')} ₽)`;
    }
  }
  if (sumTime) {
    sumTime.textContent = `~ ${pkgInfo.time}`;
  }

  // Keep state for booking form
  window.lastCalculatedPrice = totalPrice;
}

function animateValue(obj, start, end, duration) {
  if (start === end) {
    obj.textContent = end.toLocaleString('ru-RU') + ' ₽';
    return;
  }
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = Math.floor(progress * (end - start) + start);
    obj.textContent = current.toLocaleString('ru-RU') + ' ₽';
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function syncCalculatorToBooking() {
  const pkgInfo = CALC_DATA.packages[currentCalcState.package];
  const bodyInfo = CALC_DATA.bodies[currentCalcState.body];
  const totalPrice = window.lastCalculatedPrice || pkgInfo.basePrice;

  const bookingSummaryWrap = document.getElementById('booking-calc-summary');
  const bookingSummaryText = document.getElementById('booking-summary-text');
  const bookingSummaryPrice = document.getElementById('booking-summary-price');

  if (bookingSummaryWrap && bookingSummaryText && bookingSummaryPrice) {
    bookingSummaryWrap.style.display = 'flex';
    bookingSummaryText.textContent = `${pkgInfo.name} (${bodyInfo.name}) + ${currentCalcState.addons.size} доп. опций`;
    bookingSummaryPrice.textContent = `${totalPrice.toLocaleString('ru-RU')} ₽`;
  }
}

/* ---------------- 3. Before / After Interactive Slider ---------------- */
const SLIDER_CASES = {
  body: {
    title: 'Кузов: Полировка & Керамика 9H',
    beforeImg: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80',
    afterImg: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    beforeCaption: 'Налёт реагентов, дорожная пыль, паутина микроцарапин, потускневший лак.',
    afterCaption: 'Зеркальная глубина цвета, удаление 98% рисок, гидрофобный щит 9H с эффектом стекания капель.'
  },
  interior: {
    title: 'Салон: Детейлинг-химчистка & Защита кожи',
    beforeImg: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    afterImg: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    beforeCaption: 'Залоснившаяся кожа, пыль в воздуховодах, пятна на ворсе и обивке.',
    afterCaption: 'Матовая текстура заводской кожи без блеска, крем-кондиционер LeTech, озонированный свежий салон.'
  },
  wheels: {
    title: 'Колёсные диски & Тормозные суппорты',
    beforeImg: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
    afterImg: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    beforeCaption: 'Въевшаяся термо-пыль от колодок, битумные точки, желтый известковый нагар.',
    afterCaption: 'Химическая очистка индикаторным составом Koch Chemie Felgenblitz, термостойкий керамический воск.'
  }
};

function initBeforeAfterSlider() {
  const container = document.querySelector('.ba-slider-container');
  const afterLayer = document.querySelector('.ba-after-layer');
  const handle = document.querySelector('.ba-handle');
  const caseTabs = document.querySelectorAll('.case-tab');
  const beforeImg = document.getElementById('ba-img-before');
  const afterImg = document.getElementById('ba-img-after');
  const capBefore = document.getElementById('ba-caption-before');
  const capAfter = document.getElementById('ba-caption-after');

  if (!container || !afterLayer || !handle) return;

  let isDragging = false;

  function setSliderPosition(xPercentage) {
    const clamped = Math.max(0, Math.min(100, xPercentage));
    afterLayer.style.clipPath = `polygon(0 0, ${clamped}% 0, ${clamped}% 100%, 0 100%)`;
    handle.style.left = `${clamped}%`;
  }

  function handleMove(clientX) {
    const rect = container.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const xPercentage = (xPos / rect.width) * 100;
    setSliderPosition(xPercentage);
  }

  // Pointer Events (supports mouse + touch seamlessly)
  container.addEventListener('pointerdown', (e) => {
    isDragging = true;
    container.setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  });

  container.addEventListener('pointermove', (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  });

  const endDrag = (e) => {
    if (isDragging) {
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);

  // Tabs for switching comparison cases
  caseTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      caseTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const caseKey = tab.dataset.case;
      const data = SLIDER_CASES[caseKey];
      if (data) {
        if (beforeImg) beforeImg.src = data.beforeImg;
        if (afterImg) afterImg.src = data.afterImg;
        if (capBefore) capBefore.textContent = data.beforeCaption;
        if (capAfter) capAfter.textContent = data.afterCaption;

        // Reset handle to center with smooth transition
        setSliderPosition(50);
      }
    });
  });

  // Set initial 50%
  setSliderPosition(50);
}

/* ---------------- 4. Online Booking System ---------------- */
function initBookingSystem() {
  const daysRow = document.querySelector('.days-chips-row');
  const slotsGrid = document.querySelector('.time-slots-grid');
  const bookingForm = document.getElementById('online-booking-form');
  const modalOverlay = document.getElementById('booking-success-modal');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const modalCloseAction = document.getElementById('modal-close-action');
  const phoneInput = document.getElementById('booking-phone');

  // Populate 7 days dynamically
  if (daysRow) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'февр', 'март', 'апр', 'май', 'июн', 'июл', 'авг', 'сент', 'окт', 'нояб', 'дек'];
    const today = new Date();

    daysRow.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayName = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : days[date.getDay()];
      const dateStr = `${date.getDate()} ${months[date.getMonth()]}`;

      const chip = document.createElement('div');
      chip.className = `day-chip ${i === 0 ? 'active' : ''}`;
      chip.dataset.date = `${dateStr}, ${date.getFullYear()}`;
      chip.innerHTML = `
        <span class="day-chip-dow">${dayName}</span>
        <span class="day-chip-date">${dateStr}</span>
      `;

      chip.addEventListener('click', () => {
        document.querySelectorAll('.day-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        randomizeDisabledSlots();
      });

      daysRow.appendChild(chip);
    }
  }

  // Populate time slots
  if (slotsGrid) {
    const times = [
      '09:00', '10:30', '12:00', '13:30', '15:00', '16:30',
      '18:00', '19:30', '21:00', '22:30', '00:00', '02:00'
    ];

    slotsGrid.innerHTML = '';
    times.forEach((t, idx) => {
      const slot = document.createElement('div');
      slot.className = `time-slot ${idx === 2 ? 'active' : ''} ${idx === 1 || idx === 5 ? 'disabled' : ''}`;
      slot.textContent = t;
      slot.dataset.time = t;

      slot.addEventListener('click', () => {
        if (slot.classList.contains('disabled')) return;
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
        slot.classList.add('active');
      });

      slotsGrid.appendChild(slot);
    });
  }

  function randomizeDisabledSlots() {
    const slots = document.querySelectorAll('.time-slot');
    slots.forEach((s, idx) => {
      s.classList.remove('disabled');
      if (Math.random() < 0.25) {
        s.classList.add('disabled');
        if (s.classList.contains('active')) {
          s.classList.remove('active');
        }
      }
    });
    // Ensure at least one active
    const active = document.querySelector('.time-slot.active:not(.disabled)');
    if (!active) {
      const available = document.querySelector('.time-slot:not(.disabled)');
      if (available) available.classList.add('active');
    }
  }

  // Phone input formatting mask
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
      if (!x[2]) {
        e.target.value = x[1] ? `+7 (${x[1]}` : '';
      } else {
        e.target.value = `+7 (${x[2]}` + (x[3] ? `) ${x[3]}` : '') + (x[4] ? `-${x[4]}` : '') + (x[5] ? `-${x[5]}` : '');
      }
    });
  }

  // Booking Form Submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const carInput = document.getElementById('booking-car');
      const nameInput = document.getElementById('booking-name');
      const activeDay = document.querySelector('.day-chip.active');
      const activeSlot = document.querySelector('.time-slot.active');

      const car = carInput ? carInput.value.trim() : 'Автомобиль';
      const name = nameInput ? nameInput.value.trim() : 'Гость';
      const date = activeDay ? activeDay.dataset.date : 'Сегодня';
      const time = activeSlot ? activeSlot.dataset.time : '12:00';

      const pkgInfo = CALC_DATA.packages[currentCalcState.package];
      const totalPrice = window.lastCalculatedPrice || pkgInfo.basePrice;

      // Generate realistic booking ID
      const bookingCode = `#AG-${Math.floor(1000 + Math.random() * 9000)}`;
      const boxNumber = `Бокс №${Math.floor(1 + Math.random() * 8)} (Премиум)`;

      // Populate modal
      document.getElementById('modal-booking-code').textContent = bookingCode;
      document.getElementById('modal-car-value').textContent = car;
      document.getElementById('modal-time-value').textContent = `${date} в ${time}`;
      document.getElementById('modal-pkg-value').textContent = `${pkgInfo.name} (${totalPrice.toLocaleString('ru-RU')} ₽)`;
      document.getElementById('modal-box-value').textContent = boxNumber;

      // Start 15:00 countdown timer
      startModalCountdown();

      // Show modal
      if (modalOverlay) {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      bookingForm.reset();
    });
  }

  // Close modal
  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalCloseAction) modalCloseAction.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Copy code button inside modal
  const copyBtn = document.getElementById('modal-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = document.getElementById('modal-booking-code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        const origText = copyBtn.textContent;
        copyBtn.textContent = 'Скопировано! ✓';
        setTimeout(() => {
          copyBtn.textContent = origText;
        }, 2000);
      });
    });
  }
}

let countdownInterval = null;
function startModalCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  let secondsLeft = 15 * 60; // 15 mins
  const countdownEl = document.getElementById('modal-timer-digits');

  function update() {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    if (countdownEl) {
      countdownEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
    }
    secondsLeft--;
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

/* ---------------- 5. FAQ Accordion ---------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other items
        faqItems.forEach(i => i.classList.remove('active'));

        // Toggle clicked item
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ---------------- 6. Social Proof Live Toast ---------------- */
const TOAST_MESSAGES = [
  { car: 'Porsche Macan GTS', action: 'Записан на «Премиум Детейлинг 3-фазы»', time: '1 мин назад' },
  { car: 'BMW X6 M-Competition', action: 'Завершена керамика HydroGloss 9H', time: '3 мин назад' },
  { car: 'Mercedes-Benz G-Class', action: 'Записан на комплексную мойку', time: 'только что' },
  { car: 'Audi RS6 Avant', action: 'Выполнена деликатная мойка двигателя', time: '4 мин назад' },
  { car: 'Zeekr 001', action: 'Записан на «Комплекс Стандарт»', time: '2 мин назад' }
];

function initSocialProofToast() {
  const toast = document.querySelector('.social-proof-toast');
  if (!toast) return;

  const toastCar = document.getElementById('toast-car-name');
  const toastAction = document.getElementById('toast-action-text');
  const toastTime = document.getElementById('toast-time');

  let index = 0;

  function showNextToast() {
    const data = TOAST_MESSAGES[index];
    if (toastCar) toastCar.textContent = data.car;
    if (toastAction) toastAction.textContent = data.action;
    if (toastTime) toastTime.textContent = data.time;

    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 5000);

    index = (index + 1) % TOAST_MESSAGES.length;
  }

  // Initial delay 4s, then loop every 22s
  setTimeout(() => {
    showNextToast();
    setInterval(showNextToast, 22000);
  }, 4000);
}

/* ---------------- 7. Back to Top Button ---------------- */
function initBackToTop() {
  const btt = document.querySelector('.back-to-top');
  if (!btt) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      btt.classList.add('visible');
    } else {
      btt.classList.remove('visible');
    }
  });

  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------- 8. Reveal on Scroll Animation ---------------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.glass-card, .section-header, .pricing-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index % 4 * 0.08}s`;
    observer.observe(el);
  });
}
