/* ============================================================
   EA-HTS 2027 — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Nav Toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Navbar scroll effect ---
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // --- Active nav link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // --- Countdown Timer ---
  const targetDate = new Date('2027-01-27T08:00:00+02:00').getTime();
  function updateCountdown() {
    const now = Date.now();
    const diff = targetDate - now;
    if (diff <= 0) {
      document.querySelectorAll('.countdown-number').forEach(el => el.textContent = '0');
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const ids = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'];
    const vals = [days, hours, mins, secs];
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = vals[i];
    });
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --- Animated counter (stats bar) ---
  function animateCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(counter => {
      if (counter.dataset.animated) return;
      const target = parseInt(counter.dataset.target);
      const suffix = counter.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      function step(ts) {
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(target * ease) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      counter.dataset.animated = 'true';
      requestAnimationFrame(step);
    });
  }

  // --- Scroll reveal ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Trigger counter animation if inside stats bar
        if (entry.target.closest('.stats-bar')) animateCounters();
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Also observe stats bar directly
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    const statsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) animateCounters();
    }, { threshold: 0.3 });
    statsObs.observe(statsBar);
  }

  // --- Registration form: conditional payment display ---
  const participantType = document.getElementById('participant-type');
  const payLocal = document.getElementById('payment-local');
  const payIntl = document.getElementById('payment-intl');
  if (participantType) {
    participantType.addEventListener('change', function () {
      if (payLocal) payLocal.classList.toggle('active', this.value === 'local');
      if (payIntl) payIntl.classList.toggle('active', this.value === 'international');
    });
  }

  // --- Form submission (demo) ---
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const privacy = document.getElementById('privacy-check');
      if (privacy && !privacy.checked) {
        alert('Please agree to the IEEE Privacy Policy to continue.');
        return;
      }
      // In production, this would submit to Google Forms or a backend
      alert('Thank you for registering! We will confirm your registration via email within 48 hours.');
      regForm.reset();
      if (payLocal) payLocal.classList.remove('active');
      if (payIntl) payIntl.classList.remove('active');
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
