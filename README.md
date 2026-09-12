# Ooruly

A local's static travel guide to Bengaluru and around — city sights, hidden cafes, iconic
eateries, things to do, and easy weekend getaways. Where to go, how to reach, the best time,
and one tap to get directions or hand off to MakeMyTrip for flights, trains, buses and hotels.

("Ooru" is Kannada for town/hometown — Ooruly is a guide to the city and its surroundings.)

Live: https://jagdish1998.github.io/ooruly/

## What it is

- **No build step.** Plain HTML, CSS and vanilla JS, served straight from GitHub Pages.
- **Data-driven.** Every place is one object in [`data.js`](data.js) across five collections —
  `DESTINATIONS`, `CITY_ATTRACTIONS`, `CAFES`, `EATERIES` and `ACTIVITIES`. The home sections and
  all detail pages are generated from these; add an entry and it shows up with no code change.
- **Hash-routed SPA.** `#/` is home (Inside Bengaluru, Hidden cafes, Authentic eats, Things to do,
  Nearby Bengaluru). Detail routes: `#/place/<slug>`, `#/city/<slug>`, `#/cafe/<slug>`,
  `#/eat/<slug>`, `#/do/<slug>`. Refresh-safe on static hosting.
- **Honest booking.** A static site can't take a payment, so the booking buttons deep-link to
  the right MakeMyTrip section (flights / trains / bus / hotels) with the destination in hand.
  The link builder in [`booking.js`](booking.js) is affiliate-ready: flip `AFFILIATE.enabled`
  and every outbound link becomes tracked in one place.

## Structure

| File | Role |
| --- | --- |
| `index.html` | App shell: header, theme toggle, view container, footer |
| `data.js` | `ORIGIN`, `DESTINATIONS[]`, `CITY_ATTRACTIONS[]`, `CAFES[]`, `EATERIES[]`, `ACTIVITIES[]`, `TYPES[]` — all the content |
| `booking.js` | MakeMyTrip deep-link helper (affiliate-ready) |
| `app.js` | Hash router, home sections + filters, and all detail views |
| `style.css` | Theme (dark/light), shared with the portfolio's design tokens |

## Credits

Photos via [Pexels](https://www.pexels.com/) and
[Wikimedia Commons](https://commons.wikimedia.org/) (CC BY / CC BY-SA). Travel times and
distances are approximate and meant for planning, not precision.
