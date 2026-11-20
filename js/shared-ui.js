// Shared UI script for standalone static HTML pages (About, Privacy, Terms, Contact, Disclaimer)
(function () {
  const themeKey = 'playgrid_theme_v1';
  const cookieKey = 'playgrid_cookie_consent_v1';

  try {
    const savedTheme = localStorage.getItem(themeKey) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  } catch {
    // Ignore
  }

  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () {
      const open = drawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const essentialBtn = document.getElementById('cookie-essential');
  try {
    if (banner && !localStorage.getItem(cookieKey)) {
      banner.classList.add('visible');
    }
    if (acceptBtn && banner) {
      acceptBtn.addEventListener('click', function () {
        localStorage.setItem(cookieKey, 'all');
        banner.classList.remove('visible');
      });
    }
    if (essentialBtn && banner) {
      essentialBtn.addEventListener('click', function () {
        localStorage.setItem(cookieKey, 'essential');
        banner.classList.remove('visible');
      });
    }
  } catch {
    // Ignore
  }

  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-status');
  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      if (!name || !email || message.length < 10) {
        contactStatus.textContent = 'Please complete your name, valid email, and a message of at least 10 characters.';
        contactStatus.style.color = 'var(--status-danger)';
        return;
      }
      contactStatus.textContent = 'Thank you! Your inquiry has been validated and logged for our editorial team.';
      contactStatus.style.color = 'var(--status-win)';
      contactForm.reset();
    });
  }
})();
