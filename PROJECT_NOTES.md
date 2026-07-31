# Leo Club of Moratuwa — Project Notes
> **For AI Copilot / Developer Handover**
> Last updated: 2026-07-03

---

## 1. What Is This Project?

A **single-page public website** for the **Leo Club of Moratuwa**, Sri Lanka.  
Built with pure HTML, CSS, and vanilla JavaScript — no frameworks, no build tools, no server required.  
Open `index.html` directly in a browser, or use VS Code Live Server for full functionality.

---

## 2. File Structure

```
Root/
├── index.html                  ← Entire website (one file, all sections)
├── PROJECT_NOTES.md            ← This file
│
├── css/
│   ├── style.css               ← All styles, organized by section with comments
│   └── responsive.css          ← Media queries for mobile/tablet
│
├── js/
│   └── main.js                 ← All interactivity (see §-map at top of file)
│
├── data/
│   ├── presidents.json         ← President data (name, term, memories count)
│   │                             Used by fetch() — requires a web server
│   └── presidents.js           ← Same data as window.PRESIDENTS_DATA
│                                 Used as <script> tag — works on file:// too
│
└── images/
  │   ├── logo/
  │   │   ├── logo.png            ← Official LEO emblem, transparent bg — used everywhere
  │   │   │                         (navbar, favicon, footer, hero watermark)
  │   │   └── clublogo.png        ← 2026/27 presidential theme badge (year + president
  │   │                             specific — not wired into the site; kept for reference)
    ├── samu.jpeg               ← Misc image
    ├── presidents/             ← 4 test images (test1–test4.jpg) for president #46
    │                             (will hold actual portrait photos of presidents)
    ├── team/                   ← Team member photos (01.jpg … 21.jpg)
    └── memories/
        └── 46/                 ← 100 memory photos for president #46 (test images)
            1.jpg … 100.jpg       (cycling through test1–test4.jpg duplicated)
```

---

## 3. Website Sections (Top → Bottom)

| Section | ID | Description |
|---|---|---|
| Navbar | — | Fixed top bar with scroll effects, active link highlight, mobile hamburger |
| Hero | `#home` | Full-screen landing with typewriter animation and CTA buttons |
| Stats | — | Animated counters: 46 years, 200 projects, 1000 Leos, 250 awards |
| About | `#about` | Club mission and vision |
| Approach | — | 3-step card grid (Connect → Plan → Reflect) |
| Projects | `#projects` | Upcoming project cards |
| Team | `#team` | Carousel of team member cards (prev/next/swipe) |
| Awards | `#awards` | Award cards |
| Blog | `#blog` | Blog post cards |
| History | `#history` | Timeline of all 46 presidents with clickable modal |
| Contact | `#contact` | Contact form (client-side validated, simulated send) |
| Footer | — | Links and club info |

---

## 4. Key JavaScript Features (js/main.js)

The file has a **§-map** at the top — search `§N` to jump to any section:

| Section | What it does |
|---|---|
| `§1` Scroll Handler | Navbar glass effect, back-to-top button, active nav link highlight |
| `§2` Mobile Nav | Hamburger open/close, overlay dismiss, Escape key support |
| `§3` Stats Counter | Animated count-up using requestAnimationFrame |
| `§4` Scroll Reveal | Fade-in cards on scroll using IntersectionObserver |
| `§5` Hero Typewriter | Types "WE SERVE. WE LEAD. WE INSPIRE." on page load |
| `§6` Team Carousel | Responsive sliding carousel with dots and swipe support |
| `§7` Contact Form | Client-side validation + simulated submit (no real email sent) |
| `§8` President Modal | Full-page modal with paginated photo gallery for each president |

---

## 5. President History System

### How it works
1. `data/presidents.js` is loaded as a `<script>` tag → sets `window.PRESIDENTS_DATA`
2. `main.js §8` reads this data and populates the president cards in the History section
3. Clicking a president card opens a full-screen modal
4. Modal loads memory photos from `images/memories/[padded-num]/1.jpg … N.jpg`
5. Photos load in batches of 20 (PAGE_SIZE). "Load More" button reveals next batch

### How to update president data
- Edit **both** `data/presidents.json` AND `data/presidents.js` (same values, different format)
- `presidents.json` → used when served from a web server
- `presidents.js` → used when opened directly via `file://` (no server)

### How to add memory photos for a president
1. Create folder: `images/memories/[padded-num]/` (e.g. `images/memories/46/`)
2. Name photos: `1.jpg`, `2.jpg`, `3.jpg` … `N.jpg`
3. Update `"memories": N` in both `data/presidents.json` and `data/presidents.js`

### Current state of memory photos
| President # | Photos | Notes |
|---|---|---|
| 1–45 | 0 | No photos yet — real photos to be added |
| 46 | 100 | Test images (test1–test4.jpg cycled × 100) |

---

## 6. Color Theme

```css
--bg-main    : #080001      /* very dark red-black — main background */
--bg-card    : #100003      /* card/panel backgrounds */
--red        : #CC0000      /* primary Leo red — buttons, accents */
--red-dark   : #aa0000      /* hover state for red */
--gold       : #C9A84C      /* accent gold — headings, highlights */
--gold-light : #e0c068      /* lighter gold */
--text-main  : #f0f0f0      /* primary text */
--text-muted : #a09090      /* secondary text */
--border     : rgba(255,255,255,0.06)
--border-gold: rgba(201,168,76,0.35)
```

Font: **Poppins** (Google Fonts) — weights 300, 400, 500, 600, 700, 800, 900

---

## 7. Navbar Buttons

| Button | Style | Link |
|---|---|---|
| Contact | Red filled (`.btn-nav`) | `#contact` |
| mora connect | Gold outlined (`.btn-nav-portal`) | `https://moraconnect.com/` |

---

## 8. Known Limitations / Things To Do

| Item | Status | Notes |
|---|---|---|
| President names | Placeholder ("President Name") | Update in `data/presidents.json` + `data/presidents.js` |
| President portrait photos | Missing | Add as `images/presidents/01.jpg … 46.jpg` |
| Team photos | Missing | Add as `images/team/01.jpg … 21.jpg` |
| Memory photos | Only #46 has test images | Add real photos per president |
| Contact form | Simulated only | Wire up EmailJS or Formspree (see §7 in main.js) |
| mora connect link | Opens `https://moraconnect.com/` in a new tab | |
| Blog posts | Placeholder content | Replace with real content |
| Projects | Placeholder content | Replace with real content |

---

## 9. Planned: mora connect (Separate Project)

A **private member portal** to be built as a separate website and linked from the navbar.

**Tech stack decided:**
- React 18 + Vite
- Tailwind CSS (same color theme as above)
- Firebase (Auth + Firestore + Hosting)
- docx.js for Word document export

**Target features:**
- Secretary-controlled membership list (only listed members can log in)
- Event management and attendance tracking
- Member dashboard with profile view
- Download personal profile as a `.docx` Word document
- Admin panel for secretary

**Status:** Navbar link now points to `https://moraconnect.com/`.

---

## 10. How to Run Locally

**Option A — Direct open (limited):**
- Double-click `index.html` — most features work, but `fetch()` for presidents.json
  is blocked by browser on `file://`. Presidents data loads from `data/presidents.js` instead.

**Option B — Live Server (recommended):**
1. Open folder in VS Code
2. Install "Live Server" extension
3. Right-click `index.html` → "Open with Live Server"
4. Site opens at `http://127.0.0.1:5500`

---

<!--
  index.html — Leo Club of Moratuwa
  ──────────────────────────────────────────────────────────────────────────
  Single-page static website. No framework — pure HTML, CSS, vanilla JS.


  PAGE SECTIONS (top → bottom):
    Navbar · Hero · Stats · About · Approach · Projects ·
    Team · Awards · Blog · History · Contact · Footer


  KEY FILES:
    css/style.css          — all styles (organized by section)
    js/main.js             — all interactivity (read the §-map at the top)
    data/presidents.json   — president names, terms, memory photo counts
    images/presidents/     — 01.jpg … 46.jpg
    images/team/           — 01.jpg … 21.jpg
    images/memories/[N]/   — 1.jpg … N.jpg  (memory photos per president)


  UPDATING CONTENT (no coding needed):
    • President names / terms  → edit data/presidents.json
    • Memory photos            → drop files in images/memories/[padded-num]/
    • Team member names        → edit .team-card blocks in the Team section
    • Stats numbers            → find data-target="N" in the Stats section
    • Awards / Blog / Projects → edit the matching card blocks below
  ──────────────────────────────────────────────────────────────────────────
-->


*This document is for AI Copilot / developer handover. Keep it updated as the project evolves.*
