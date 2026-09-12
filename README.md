# Ooruly

A local's static travel guide to Bengaluru and around — city sights, hidden cafes, iconic
eateries, things to do, and easy weekend getaways. Where to go, how to reach, the best time,
and one tap to get directions or hand off to MakeMyTrip for flights, trains, buses and hotels.

("Ooru" is Kannada for town/hometown — Ooruly is a guide to the city and its surroundings.)

Live: https://jagdish1998.github.io/ooruly/

## What it is

- **No build step.** Plain HTML, CSS and vanilla JS, served straight from GitHub Pages.
- **Data-driven.** Every place is one object in [`data.js`](data.js) across six collections —
  `DESTINATIONS`, `CITY_ATTRACTIONS`, `TEMPLES`, `CAFES`, `EATERIES` and `ACTIVITIES` (plus
  `INTENTS`, `PHRASES` and `TYPES`). The home sections and all detail pages are generated from
  these; add an entry — with `tags`, `lat`/`lng` and `maps` — and it shows up in the grids,
  search, filters, the map and the planner with no code change.
- **Hash-routed SPA.** `#/` is home (Inside Bengaluru, Temples, Hidden cafes, Authentic eats,
  Things to do, Nearby Bengaluru). Detail routes: `#/place/<slug>`, `#/city/<slug>`,
  `#/temple/<slug>`, `#/cafe/<slug>`, `#/eat/<slug>`, `#/do/<slug>`. Feature pages: `#/map`,
  `#/saved`, `#/plan` (and shareable `#/plan/<ids>`), `#/phrases`. Refresh-safe on static hosting.
- **Honest booking.** A static site can't take a payment, so the booking buttons deep-link to
  the right MakeMyTrip section (flights / trains / bus / hotels) with the destination in hand.
  The link builder in [`booking.js`](booking.js) is affiliate-ready: flip `AFFILIATE.enabled`
  and every outbound link becomes tracked in one place.
- **Discover, save, plan.** A global search palette (⌘K / Ctrl-K or `/`) spans every collection;
  per-section area + "vibe" (intent) filters; save any place to a shortlist; build a shareable
  weekend plan (encoded in the URL); "near me" distance sorting; an all-pins map; and a Kannada
  phrasebook. All client-side, all in [`features.js`](features.js).
- **Installable & offline.** A web app manifest and a service worker ([`sw.js`](sw.js)) precache
  the shell and city photos, so the guide installs to a home screen and opens offline.

## Structure

| File | Role |
| --- | --- |
| `index.html` | App shell: header, theme toggle, view container, footer |
| `data.js` | `ORIGIN`, `DESTINATIONS[]`, `CITY_ATTRACTIONS[]`, `CAFES[]`, `EATERIES[]`, `ACTIVITIES[]`, `TYPES[]` — all the content |
| `booking.js` | MakeMyTrip deep-link helper (affiliate-ready) |
| `features.js` | Search index, favourites, weekend plan, geolocation, share, season/open helpers |
| `app.js` | Hash router, home sections + filters, detail views, search palette, map, saved/plan/phrases pages |
| `style.css` | Theme (dark/light), shared with the portfolio's design tokens |
| `manifest.webmanifest` | PWA manifest (installable, standalone) |
| `sw.js` | Service worker: precache app shell + runtime-cache images for offline |

## Credits

Photos via [Pexels](https://www.pexels.com/) and
[Wikimedia Commons](https://commons.wikimedia.org/) (CC BY / CC BY-SA). Travel times and
distances are approximate and meant for planning, not precision.
