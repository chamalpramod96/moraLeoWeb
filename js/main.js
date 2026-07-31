/**
 * main.js — Leo Club of Moratuwa
 * ─────────────────────────────────────────────────────────────────────────────
 * All site interactivity lives here. No external frameworks — vanilla ES6+.
 *
 * SECTION MAP (search "§N" to jump to any feature):
 *   §1  Scroll Handler ......... navbar glass · back-to-top · active nav link
 *   §2  Mobile Nav Toggle ...... hamburger open/close + overlay dismiss
 *   §3  Stats Counter .......... animated number count-up (RAF + ease-out)
 *   §4  Scroll Reveal .......... fade-in cards as the user scrolls down
 *   §5  Hero Typewriter ........ typing animation on the hero tag line
 *   §6  Team Carousel .......... prev/next/swipe carousel with dot navigation
 *   §7  Contact Form ........... client-side validation + simulated submit
 *   §8  President Modal ........ full-page cover with paginated photo gallery
 *   §9  Project Map ............ Leaflet.js Sri Lanka map with project markers
 *
 * ── HOW TO UPDATE PRESIDENT NAMES / PHOTOS ──────────────────────────────────
 *   Edit  data/presidents.json  — set  name, term, memories  for each entry.
 *   Drop memory photos in  images/memories/[padded-num]/1.jpg … N.jpg
 *   No HTML edits needed — JS reads the JSON and updates cards automatically.
 *
 * ── HOW TO UPDATE TEAM MEMBERS ──────────────────────────────────────────────
 *   Edit .team-card elements in the Team section of index.html.
 *   Drop photos as  images/team/01.jpg … 21.jpg
 *
 * ── CONTACT FORM ─────────────────────────────────────────────────────────────
 *   Currently simulates sending. See §7 for EmailJS / Formspree instructions
 *   to enable real email delivery — no backend server required.
 *
 * ── LOCAL DEVELOPMENT ────────────────────────────────────────────────────────
 *   fetch('data/presidents.json') requires a web server, not file://.
 *   Fix: install the VS Code "Live Server" extension and click "Go Live",
 *        OR host on Cloudflare Pages / Netlify (both free).
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// §1  SCROLL HANDLER  (navbar · back-to-top · active nav — ONE merged listener)
//
// WHY MERGED? Previously two separate scroll listeners ran on every pixel
// scrolled (~60 times/second on smooth displays). One RAF-throttled listener
// does the same work at most once per animation frame — cleaner performance.
//
// { passive: true } — tells the browser we won't call preventDefault(),
//                     allowing it to optimise scroll handling on mobile.
// ─────────────────────────────────────────────────────────────────────────────

const navbar     = document.getElementById('navbar');
const backToTop  = document.getElementById('backToTop');
const sections   = document.querySelectorAll('section[id]');   // all page sections
const navAnchors = document.querySelectorAll('.nav-links a:not(.btn-nav)');

let rafPending = false; // RAF throttle flag — process at most one frame at a time

window.addEventListener('scroll', () => {
  if (rafPending) return;
  rafPending = true;

  requestAnimationFrame(() => {
    const scrollY = window.scrollY;

    // ── Navbar glass-morphism effect ─────────────────────────────────────────
    // .scrolled class in CSS applies backdrop-blur + dark bg + gold border
    navbar.classList.toggle('scrolled', scrollY > 80);

    // ── Back-to-top button ───────────────────────────────────────────────────
    // CSS transitions .visible → fades the arrow button in/out
    backToTop.classList.toggle('visible', scrollY > 400);

    // ── Active nav link highlight ────────────────────────────────────────────
    // +120px offset compensates for the fixed navbar height so the active
    // link switches slightly before the section hits the very top of the screen
    const pos = scrollY + 120;
    sections.forEach(sec => {
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
        const active = document.querySelector(
          '.nav-links a[href="#' + sec.getAttribute('id') + '"]'
        );
        if (active) {
          navAnchors.forEach(a => a.classList.remove('active-link'));
          active.classList.add('active-link');
        }
      }
    });

    rafPending = false;
  });
}, { passive: true });


// ─────────────────────────────────────────────────────────────────────────────
// §2  MOBILE NAV TOGGLE
// Slides in the nav panel from the right on screens ≤ 768px (see CSS).
// A dark overlay dims the page behind the panel when it is open.
// Closing triggers: X button · overlay tap · any nav link tap · Escape key.
// ─────────────────────────────────────────────────────────────────────────────

const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');

// Dark overlay injected once behind the nav panel — click it to close the menu
const navOverlay = document.createElement('div');
navOverlay.classList.add('nav-overlay');
document.body.appendChild(navOverlay);

function openMenu() {
  navLinks.classList.add('open');
  hamburger.classList.add('active');
  navOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent background page scroll
}

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeMenu() : openMenu();
});

navOverlay.addEventListener('click', closeMenu);                           // tap outside to close
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu)); // tap link to close


// ─────────────────────────────────────────────────────────────────────────────
// §3  STATS COUNTER
// Counts up from 0 to data-target when the stats section scrolls into view.
// Uses requestAnimationFrame + cubic ease-out for smooth, natural deceleration.
//
// To change a stat:   edit  data-target="N"  on the .counter element in HTML.
// To change duration: edit  COUNTER_DURATION  below (milliseconds).
// ─────────────────────────────────────────────────────────────────────────────

const COUNTER_DURATION = 1800; // ms — total length of the count-up animation

function animateCounter(el) {
  const target    = parseInt(el.getAttribute('data-target'), 10);
  const startTime = performance.now();

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / COUNTER_DURATION, 1);

    // Cubic ease-out: fast at start, decelerates smoothly toward the end
    const eased   = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    el.textContent = progress < 1 ? current : target + '+';
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Trigger once when the stats section enters the viewport; then disconnect
const statsSection  = document.querySelector('.stats-section');
const counterEls    = document.querySelectorAll('.counter');
let countersStarted = false;

if (statsSection) {
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      counterEls.forEach(animateCounter);
      obs.disconnect(); // fired once — no need to keep watching
    }
  }, { threshold: 0.3 }).observe(statsSection);
}


// ─────────────────────────────────────────────────────────────────────────────
// §4  SCROLL REVEAL
// Elements fade + slide up into view as the user scrolls.
//
// How it works:
//   1. JS adds .reveal to each target element  →  CSS sets its initial hidden state.
//   2. IntersectionObserver adds .visible when the element enters the viewport.
//   3. CSS animates the transition from hidden (.reveal) to visible (.visible).
//
// To add a new element type to the reveal: append its selector to REVEAL_SELECTORS.
// ─────────────────────────────────────────────────────────────────────────────

// All element types that receive the scroll-reveal fade-in treatment
// NOTE: .stats-section .section-tag / .section-title are included so the
// "PROVEN TRACK" heading animates in before the cards cascade below it.
const REVEAL_SELECTORS = [
  '.stats-section .section-tag',   // PROVEN TRACK label — draws in with flanking lines
  '.stats-section .section-title', // section heading
  '.stat-card',
  '.approach-card',
  '.project-card',
  '.team-card',
  '.award-card',
  '.blog-card',
  '.about-grid',
  '.contact-grid',
].join(', ');

const revealEls = document.querySelectorAll(REVEAL_SELECTORS);
revealEls.forEach(el => el.classList.add('reveal')); // CSS uses .reveal as the initial hidden state

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // once visible, stop watching this element
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));


// ─────────────────────────────────────────────────────────────────────────────
// §5  HERO TYPEWRITER
// Types the hero tag line character by character on page load.
// The blinking cursor (|) after the text is CSS-only — no JS needed for it.
//
// To change the typed text:  edit  TEXT  below.
// To change typing speed:    edit  TYPE_SPEED  (milliseconds per character).
// ─────────────────────────────────────────────────────────────────────────────

(function heroTypewriter() {
  const el = document.getElementById('heroTagTyped');
  if (!el) return;

  const TEXT        = 'LEADING TODAY.  SHAPING TOMORROW.';
  const TYPE_SPEED  = 80;  // ms per character
  const START_DELAY = 800; // ms before first character (lets page fully paint)
  let i = 0;

  function tick() {
    if (i < TEXT.length) {
      el.textContent += TEXT[i++];
      setTimeout(tick, TYPE_SPEED);
    }
    // When done, the cursor keeps blinking via CSS @keyframes cursorBlink
  }

  setTimeout(tick, START_DELAY);
}());


// ─────────────────────────────────────────────────────────────────────────────
// §6  TEAM CAROUSEL
// Responsive sliding carousel with:
//   • Previous / next arrow buttons
//   • Dot indicators (click any dot to jump to that slide)
//   • Touch / swipe support (mobile-friendly)
//   • Debounced resize handler (re-calculates on window resize)
//
// Cards visible by viewport width:
//   ≤ 480px → 1    ≤ 768px → 2    ≤ 1100px → 3    > 1100px → 4
//
// To adjust breakpoints: edit getVisible() below.
// To add a team member: add a .team-card element in index.html — carousel auto-adjusts.
// ─────────────────────────────────────────────────────────────────────────────

(function teamCarousel() {
  const track    = document.getElementById('teamTrack');
  const prevBtn  = document.getElementById('teamPrev');
  const nextBtn  = document.getElementById('teamNext');
  const dotsWrap = document.getElementById('teamDots');
  if (!track) return;

  const cards = Array.from(track.children);
  let current = 0;

  /** Returns how many cards fit side-by-side at the current viewport width */
  function getVisible() {
    const w = window.innerWidth;
    if (w <= 480)  return 1;
    if (w <= 768)  return 2;
    if (w <= 1100) return 3;
    return 4;
  }

  /** Total number of slides (pages) given current visible count */
  function totalSlides() {
    return Math.ceil(cards.length / getVisible());
  }

  /** Rebuild dot buttons (called on init and after resize) */
  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const d = document.createElement('button');
      d.className = 'team-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  /** Sync dot highlight without rebuilding all dots */
  function updateDots() {
    dotsWrap.querySelectorAll('.team-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  /**
   * Slide to a given index.
   *
   * Offset formula: slide N shows cards starting at index N*vis.
   * That card's left edge is at pixel position: N * vis * (cardWidth + gap).
   * (The CSS gap is between every pair of adjacent cards, so each card
   *  occupies cardWidth + gap of horizontal space except visually the last
   *  one — but the OFFSET formula is still accurate for positioning.)
   */
  function goTo(index) {
    const vis    = getVisible();
    const max    = totalSlides() - 1;
    current      = Math.max(0, Math.min(index, max));

    const cardWidth = cards[0].offsetWidth;
    const gap       = parseFloat(getComputedStyle(track).gap) || 24;
    const offset    = current * vis * (cardWidth + gap);

    track.style.transform = 'translateX(-' + offset + 'px)';

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= max;
    updateDots();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // ── Touch / swipe support ──────────────────────────────────────────────────
  // Swipe left → next slide.   Swipe right → previous slide.
  // 50px threshold avoids triggering on small accidental movements.
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }
  });

  // ── Resize handler (debounced 200ms) ──────────────────────────────────────
  // Resets to slide 0 and recalculates when viewport width changes
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      current = 0;
      buildDots();
      goTo(0);
    }, 200);
  });

  // Initial render
  buildDots();
  goTo(0);
}());


// ─────────────────────────────────────────────────────────────────────────────
// §7  CONTACT FORM
// Validates all fields client-side. The form currently SIMULATES sending
// (shows a success message after 1.2s but does not actually deliver email).
//
// ► TO ENABLE REAL EMAIL DELIVERY (no backend / server needed):
//
//   Option A — EmailJS (recommended — free tier, 200 emails/month):
//     1. Create account at  https://www.emailjs.com
//     2. Add to <head> in index.html:
//        <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
//     3. Replace the "Simulated submission" block below with:
//        emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', contactForm)
//          .then(() => { /* show success */ })
//          .catch(() => { /* show error  */ });
//
//   Option B — Formspree (zero JS — just change the HTML form tag):
//     <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
//     Then you can remove this entire JS submit handler.
// ─────────────────────────────────────────────────────────────────────────────

const contactForm = document.getElementById('contactForm');
const formMsg     = document.getElementById('formMsg');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    // Reset any previous status message
    formMsg.className   = 'form-msg';
    formMsg.textContent = '';

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    // All four fields required
    if (!name || !email || !subject || !message) {
      formMsg.textContent = 'Please fill in all fields.';
      formMsg.classList.add('error');
      return;
    }

    // Basic email format check (full validation happens server / service side)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formMsg.textContent = 'Please enter a valid email address.';
      formMsg.classList.add('error');
      return;
    }

    // ── Simulated submission ──────────────────────────────────────────────────
    // REPLACE THIS BLOCK with real EmailJS or Formspree code (see notes above)
    const submitBtn       = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending\u2026';

    setTimeout(() => {
      contactForm.reset();
      formMsg.textContent = 'Thank you! Your message has been sent successfully.';
      formMsg.classList.add('success');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
    }, 1200);
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// §8  PRESIDENT MODAL
// Clicking any president card (non-milestone) slides up a full-page cover
// showing the president's photo, name, term, an inspiring quote, and a
// paginated gallery of memory photos.
//
// DATA FLOW:
//   data/presidents.json  →  presidentsMap (Map<int, {name, term, memories}>)
//     loaded once on page load via fetch()
//   → president card names/terms in the DOM are updated from JSON
//   → card click → openModal() reads the memories count from presidentsMap
//   → gallery loads PAGE_SIZE images; "Load More" reveals the next batch
//
// ADDING / UPDATING PHOTOS FOR A PRESIDENT:
//   1. Drop numbered images:  images/memories/[padded-num]/1.jpg … N.jpg
//   2. Update "memories": N  in data/presidents.json
//   No HTML edits needed.
//
// NOTE: fetch() requires a web server — won't work on file://.
//   Fallback behaviour: HTML placeholder names + FALLBACK_MEM image slots.
// ─────────────────────────────────────────────────────────────────────────────

(function presidentModal() {

  // ── DOM references ─────────────────────────────────────────────────────────
  const overlay     = document.getElementById('presModal');
  const closeBtn    = document.getElementById('presModalClose');
  const titleEl     = document.getElementById('presModalTitle');
  const quoteEl     = document.getElementById('presModalQuote');
  const imgEl       = document.getElementById('presModalImg');
  const phEl        = document.getElementById('presModalPh');
  const numEl       = document.getElementById('presModalNum');
  const termEl      = document.getElementById('presModalTerm');
  const memLabelEl  = document.getElementById('presModalMemLabel');
  const galleryEl   = document.getElementById('presModalGallery');
  const loadMoreBtn = document.getElementById('presModalLoadMore');

  // ── Configuration ──────────────────────────────────────────────────────────
  const PAGE_SIZE    = 20; // memory images loaded per "Load More" click
  const FALLBACK_MEM = 8;  // image slots used when JSON cannot be fetched

  // ── State ──────────────────────────────────────────────────────────────────
  // presidentsMap: int → { name, term, memories }  (populated by fetch below)
  let presidentsMap = new Map();

  // currentPres tracks the open modal's pagination state
  let currentPres = null; // { padded, nameText, totalMemories, loaded }

  // ── Rotating quotes — shown on the modal right panel ──────────────────────
  // Cycle assignment: QUOTES[(presidentNumber - 1) % QUOTES.length]
  // To add a quote: append a new string to this array.
  const QUOTES = [
    '"A legacy carved in service, leadership &amp; fellowship."',
    '"Leadership is not a position \u2014 it is a commitment to others."',
    '"Every great club was built one dedicated leader at a time."',
    '"Their time may have passed, but their impact echoes forever."',
    '"In service to others, we discover the true measure of greatness."',
    '"Honor, courage, and fellowship \u2014 the mark of every Leo leader."',
    '"Each term a new chapter; together they write our story."',
    '"Greatness is not what you receive \u2014 it is what you give."',
  ];

  // ── Load presidents data ──────────────────────────────────────────────────
  // Primary: window.PRESIDENTS_DATA set by data/presidents.js (works on file://)
  // Fallback: fetch presidents.json (requires a web server / Live Server)
  function applyPresidentsData(data) {
    data.forEach(p => presidentsMap.set(p.num, p));
    document.querySelectorAll('.pres-card:not(.milestone-inline)').forEach(card => {
      const numText = card.querySelector('.pres-num') && card.querySelector('.pres-num').textContent.trim();
      if (!numText) return;
      const p = presidentsMap.get(parseInt(numText, 10));
      if (!p) return;
      const h4   = card.querySelector('h4');
      const term = card.querySelector('.pres-term');
      if (h4)   h4.textContent   = p.name;
      if (term) term.textContent = p.term;
    });
  }

  if (window.PRESIDENTS_DATA) {
    applyPresidentsData(window.PRESIDENTS_DATA);
  } else {
    fetch('data/presidents.json')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(applyPresidentsData)
      .catch(err => {
        console.info('[Presidents] Data not loaded:', err.message || 'unavailable');
      });
  }

  // ── Build one memory image tile ────────────────────────────────────────────
  function createMemItem(padded, index, presName) {
    const item = document.createElement('div');
    item.className = 'pres-mem-item';

    const img   = document.createElement('img');
    img.src     = 'images/memories/' + padded + '/' + index + '.jpg';
    img.alt     = presName + ' \u2014 Memory ' + index;
    img.loading = 'lazy'; // browser-native lazy loading — no JS library needed

    // Hover label overlay
    const ov  = document.createElement('div');
    ov.className = 'pres-mem-overlay';
    const lbl = document.createElement('span');
    lbl.textContent = 'MEMORIES OF LEADER ' + presName.toUpperCase();
    ov.appendChild(lbl);

    // If the image file does not exist, show an "Add Photo" placeholder tile
    img.onerror = function () {
      this.remove();
      const ph = document.createElement('div');
      ph.className = 'pres-mem-placeholder';
      ph.innerHTML = '<i class="fas fa-image"></i><span>Add Photo</span>';
      item.prepend(ph);
    };

    item.appendChild(img);
    item.appendChild(ov);
    return item;
  }

  // ── Load the next batch of memory images ───────────────────────────────────
  // Called on modal open (loads first PAGE_SIZE images) and on "Load More" click.
  function loadMore() {
    if (!currentPres) return;

    const { padded, nameText, totalMemories } = currentPres;
    const start = currentPres.loaded + 1;
    const end   = Math.min(start + PAGE_SIZE - 1, totalMemories);

    for (let i = start; i <= end; i++) {
      galleryEl.appendChild(createMemItem(padded, i, nameText));
    }
    currentPres.loaded = end;

    // Show "Load More" button only if there are still unrevealed photos
    if (loadMoreBtn) {
      loadMoreBtn.style.display =
        currentPres.loaded < totalMemories ? 'inline-flex' : 'none';
    }
  }

  // ── Open the president modal ────────────────────────────────────────────────
  function openModal(card) {
    const numText = (card.querySelector('.pres-num') && card.querySelector('.pres-num').textContent.trim()) || '01';
    const numInt  = parseInt(numText, 10);
    const padded  = numText.padStart(2, '0');
    const imgSrc  = (card.querySelector('.pres-photo img') && card.querySelector('.pres-photo img').getAttribute('src')) || '';

    // Prefer JSON data; gracefully fall back to whatever is in the card HTML
    const pData    = presidentsMap.get(numInt);
    const nameText = (pData && pData.name)  || (card.querySelector('h4') && card.querySelector('h4').textContent.trim())         || 'President';
    const termText = (pData && pData.term)  || (card.querySelector('.pres-term') && card.querySelector('.pres-term').textContent.trim()) || '';
    const totalMem = (pData && pData.memories != null) ? pData.memories : FALLBACK_MEM;

    // ── Populate modal header ─────────────────────────────────────────────────
    titleEl.textContent    = nameText.toUpperCase();
    memLabelEl.textContent = 'MEMORIES OF LEADER ' + nameText.toUpperCase();
    numEl.textContent      = '#' + padded;
    termEl.textContent     = termText;
    quoteEl.innerHTML      = QUOTES[(numInt - 1) % QUOTES.length];

    // ── President portrait ────────────────────────────────────────────────────
    imgEl.src           = imgSrc;
    imgEl.alt           = nameText;
    imgEl.style.display = 'block';
    phEl.style.display  = 'none';
    imgEl.onerror = function () {
      this.style.display = 'none'; // hide broken image
      phEl.style.display = 'flex'; // show the silhouette placeholder
    };

    // ── Reset gallery and load first page ─────────────────────────────────────
    galleryEl.innerHTML = '';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    currentPres = { padded, nameText, totalMemories: totalMem, loaded: 0 };
    loadMore();

    // ── Open overlay ──────────────────────────────────────────────────────────
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // lock background scroll
    overlay.scrollTop = 0;
  }

  // ── Close the modal ─────────────────────────────────────────────────────────
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    currentPres = null;
  }

  // ── Event listeners ─────────────────────────────────────────────────────────

  if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMore);

  // President card click — open modal (milestone cards are excluded)
  document.querySelectorAll('.pres-card:not(.milestone-inline)').forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.setAttribute('tabindex', '0'); // make keyboard-accessible (Tab + Enter)
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(card);
    });
  });

  closeBtn.addEventListener('click', closeModal);

  // Escape key closes modal from anywhere on the page
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

}());


// ─────────────────────────────────────────────────────────────────────────────
// §9  PROJECT MAP
// Renders a Leaflet.js map of Sri Lanka (CartoDB dark tiles) with project markers.
//
// ── TO ADD A NEW PROJECT LOCATION ────────────────────────────────────────────
//   Add an entry to the PROJECT_LOCATIONS array below:
//   { name, location, category, lat, lng }
//   lat/lng: decimal degrees (Google Maps → right-click → copy coordinates)
//
// ── CATEGORIES (controls badge colour) ───────────────────────────────────────
//   "Community Service" | "Environment" | "Education" | "Health" | "Fellowship"
// ─────────────────────────────────────────────────────────────────────────────

(function projectMap() {

  const mapEl = document.getElementById('leoMap');
  if (!mapEl || typeof L === 'undefined') return;

  // ── Project locations — edit this array to add / update projects ───────────
  const PROJECT_LOCATIONS = [
    { name: 'Aloka 26',                       location: 'Bellanwila Temple',                 category: 'Fellowship',        lat: 6.8433, lng: 79.8886 },
    { name: 'Tri Life 26 — Phase 01, Day 01', location: 'Rawatawatta, Moratuwa',        category: 'Health',            lat: 6.7736, lng: 79.8847 },
    { name: 'Leo Voyage',                     location: 'Prince of Wales College, Moratuwa', category: 'Fellowship',        lat: 6.7729, lng: 79.8809 },
    { name: 'Saviya',                         location: 'Henegama National College',         category: 'Education',         lat: 7.1544, lng: 80.1272 },
    { name: 'Leo Ape Dansala',                location: 'Prince of Wales College, Moratuwa', category: 'Community Service', lat: 6.7732, lng: 79.8813 },
  ];

  // ── Initialise Leaflet map ─────────────────────────────────────────────────
  const map = L.map('leoMap', {
    center:          [6.96, 80.00],
    zoom:            9,
    zoomControl:     true,
    scrollWheelZoom: false
  });

  // CartoDB dark tiles — real Sri Lanka map, dark themed
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains:  'abcd',
    maxZoom:     19
  }).addTo(map);

  // ── Category → colour mapping ──────────────────────────────────────────────
  const CAT_COLOUR = {
    'Health':           '#e05555',
    'Environment':      '#4caf7c',
    'Education':        '#5b8ce0',
    'Community Service':'#CC0000',
    'Fellowship':       '#C9A84C',
  };

  // ── Build legend sidebar ───────────────────────────────────────────────────
  const legendList = document.getElementById('mapLegendList');

  // ── Add each project marker ────────────────────────────────────────────────
  PROJECT_LOCATIONS.forEach(p => {
    const colour = CAT_COLOUR[p.category] || '#C9A84C';

    // Circle marker
    const marker = L.circleMarker([p.lat, p.lng], {
      radius:      9,
      fillColor:   colour,
      color:       '#C9A84C',
      weight:      2,
      opacity:     1,
      fillOpacity: 0.95
    }).addTo(map);

    // Popup
    marker.bindPopup(`
      <div class="map-popup-title">${p.name}</div>
      <div class="map-popup-location">
        <i class="fas fa-map-marker-alt"></i>${p.location}
      </div>
    `, { maxWidth: 220 });

    // Pulsing tooltip (always visible label on desktop)
    marker.bindTooltip(p.location, {
      permanent:  true,
      direction:  'right',
      offset:     [10, 0],
      className:  'map-tooltip'
    });

    // Legend item — click to fly to the marker
    if (legendList) {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="legend-name">${p.name}</span>
        <span class="legend-place"><i class="fas fa-map-marker-alt"></i>${p.location}</span>
      `;
      li.addEventListener('click', () => {
        map.flyTo([p.lat, p.lng], 10, { duration: 1.2 });
        marker.openPopup();
      });
      legendList.appendChild(li);
    }
  });

}());
