/* ZEUSFEBO — Interazioni essenziali, senza librerie esterne. */
document.documentElement.classList.add('js');

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const navigationLinks = [...document.querySelectorAll('.main-nav a')];
const backToTopButton = document.querySelector('.back-to-top');
const revealElements = document.querySelectorAll('.reveal');
const pageSections = document.querySelectorAll('main section[id]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Apre e chiude il menu su smartphone, aggiornando anche gli attributi accessibili.
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('.sr-only').textContent = open ? 'Chiudi il menu' : 'Apri il menu';
  navigation.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
}

menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

navigationLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});

// Cambia l'header e mostra il pulsante "torna in alto" durante lo scorrimento.
function updateScrollInterface() {
  const hasScrolled = window.scrollY > 40;
  header.classList.toggle('scrolled', hasScrolled);
  backToTopButton.classList.toggle('visible', window.scrollY > 600);
}

window.addEventListener('scroll', updateScrollInterface, { passive: true });
updateScrollInterface();

backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});

// Fa comparire delicatamente le sezioni quando entrano nello schermo.
if ('IntersectionObserver' in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

// Evidenzia nel menu la sezione che si sta leggendo.
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55%', threshold: 0 });
  pageSections.forEach((section) => sectionObserver.observe(section));
}

// Evita che i link provvisori con "#" riportino accidentalmente in alto.
document.querySelectorAll('a[aria-disabled="true"]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

// Prepara il messaggio e lo apre nell'app di posta configurata sul dispositivo.
const contactForm = document.querySelector('#contact-form');

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.querySelector('#contact-name').value.trim();
  const email = document.querySelector('#contact-email').value.trim();
  const topic = document.querySelector('#contact-topic');
  const recipient = topic.value;
  const topicLabel = topic.options[topic.selectedIndex].text;
  const subject = document.querySelector('#contact-subject').value.trim();
  const message = document.querySelector('#contact-message').value.trim();
  const body = `Nome: ${name}\nEmail per la risposta: ${email}\n\n${message}`;
  const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(`[${topicLabel}] ${subject}`)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoLink;
});

document.querySelector('#current-year').textContent = new Date().getFullYear();

// Google Analytics 4: viene attivato solo dopo il consenso dell'utente.
const analyticsId = 'G-KR2F106Z9S';
const consentStorageKey = 'zeusfebo_analytics_consent';
const cookieBanner = document.querySelector('#cookie-banner');
const cookieAcceptButton = document.querySelector('#cookie-accept');
const cookieRejectButton = document.querySelector('#cookie-reject');
const cookieSettingsButton = document.querySelector('#cookie-settings');
let analyticsLoaded = false;

function loadGoogleAnalytics() {
  // Non registra le visite mentre il sito viene aperto come file locale.
  if (analyticsLoaded || !['http:', 'https:'].includes(window.location.protocol)) return;

  analyticsLoaded = true;
  const analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
  document.head.appendChild(analyticsScript);

  window.gtag('js', new Date());
  window.gtag('config', analyticsId);
}

function grantAnalyticsConsent() {
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  loadGoogleAnalytics();
}

function denyAnalyticsConsent() {
  window.gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  // Prova a eliminare gli eventuali cookie Analytics già presenti.
  document.cookie.split(';').forEach((cookie) => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName.startsWith('_ga')) {
      document.cookie = `${cookieName}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  });
}

function hideCookieBanner() {
  cookieBanner.hidden = true;
}

function showCookieBanner() {
  cookieBanner.hidden = false;
  cookieRejectButton.focus();
}

cookieAcceptButton.addEventListener('click', () => {
  localStorage.setItem(consentStorageKey, 'granted');
  grantAnalyticsConsent();
  hideCookieBanner();
});

cookieRejectButton.addEventListener('click', () => {
  localStorage.setItem(consentStorageKey, 'denied');
  denyAnalyticsConsent();
  hideCookieBanner();
});

cookieSettingsButton.addEventListener('click', showCookieBanner);

const savedAnalyticsConsent = localStorage.getItem(consentStorageKey);
if (savedAnalyticsConsent === 'granted') {
  grantAnalyticsConsent();
} else if (savedAnalyticsConsent !== 'denied') {
  showCookieBanner();
}
