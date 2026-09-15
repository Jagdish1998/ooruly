# Design — Section Pages, Home Previews & Card Refinement

## Overview

This design restructures Ooruly's browse experience and elevates its visual polish, without changing
the static, no-build, hash-routed SPA architecture or the data-driven model.

Three coordinated changes:
1. **Section pages** — every collection gets an explicit route (`#/city`, `#/temples`, `#/cafes`,
   `#/eats`, `#/do`, `#/getaways`) rendering its full grid with filters, sort, count, and empty
   state, via one shared renderer for consistency.
2. **Home previews** — the home page shows a 6-card preview per collection (ordered
   in-season/open-first, then nearest-first, then default) with a "View all N" link to the section
   page. Full inline filters move to the section pages.
3. **Refined cards + whole-app aesthetic** — one consistent, decluttered card shape becomes the
   aesthetic anchor; a small set of systemic CSS/token refinements (rhythm, hierarchy, imagery,
   states) lifts the whole app.

## Architecture

Current flow (unchanged in spirit):
```
data.js  ── collections (DESTINATIONS, CITY_ATTRACTIONS, TEMPLES, CAFES, EATERIES, ACTIVITIES)
features.js ── Ooruly API (index, favorites, plan, compare, geo, season/open, progress, …)
app.js   ── hash router → view renderers → innerHTML into #view
```

### Routing changes (app.js `route()`)

Add explicit section routes and redirect legacy anchors:

| Route          | Renders                    | Legacy anchor (redirect) |
| -------------- | -------------------------- | ------------------------ |
| `#/city`       | City sights section page   | `#city`                  |
| `#/temples`    | Temples section page       | `#temples`               |
| `#/cafes`      | Cafes section page         | `#cafes`                 |
| `#/eats`       | Eats section page          | `#eats`                  |
| `#/do`         | Things-to-do section page  | `#do`                    |
| `#/getaways`   | Getaways section page      | `#nearby`                |

- Legacy anchors (`#city`, `#temples`, `#cafes`, `#eats`, `#do`, `#nearby`) are detected early in
  `route()` and redirected via `location.replace(hash → sectionRoute)` (or handled by rendering the
  same section view) so old links, the mega-menu, drawer, and hero CTAs keep working.
- The home page (`#/`) no longer contains the section anchors as scroll targets; nav items point to
  the section routes instead.

### A single shared "collection" registry

To guarantee consistency (Req 1.9, Req 6.7) and keep it data-driven, introduce one config that
describes every browsable collection. This is the single source of truth for section pages, home
previews, filters, and card rendering.

```js
// app.js
const COLLECTIONS = {
  city:     { key:'city',   route:'#/city',     legacy:'#city',   title:'City sights',
              sub:'…', icon:'fa-city',        data:() => CITY_ATTRACTIONS,
              card:cityCardHTML,     detailKey:'city',   filters:true,  compare:false },
  temples:  { key:'temple', route:'#/temples',  legacy:'#temples',title:'Temples', … card:templeCardHTML … },
  cafes:    { key:'cafe',   route:'#/cafes',    legacy:'#cafes',  title:'Hidden cafes', … },
  eats:     { key:'eat',    route:'#/eats',     legacy:'#eats',   title:'Authentic eats', … },
  do:       { key:'do',     route:'#/do',       legacy:'#do',     title:'Things to do', … },
  getaways: { key:'place',  route:'#/getaways', legacy:'#nearby', title:'Nearby Bengaluru',
              typeChips:true, nearMe:true, compare:true, card:cardHTML, … },
};
```

One `renderSection(collId)` and one `sectionPreviewHTML(collId)` read from this registry, so all
six pages/previews share layout, controls, headings, counts, and empty states by construction.

### Home preview ordering (features.js — new pure helper)

A pure, testable ordering function drives previews (Req 2.2):

```js
// features.js
// Order a collection for preview: in-season/open first, then nearest-first (if pos known),
// then original order. Returns a new array (does not mutate).
function previewOrder(list, opts) {
  const pos = opts && opts.pos;                 // {lat,lng} or null
  const idx = new Map(list.map((x, i) => [x, i]));
  const rank = (x) => {
    // 0 = in-season or open today; 1 = unknown; 2 = off-season / closed
    const s = isInSeason(x.seasons);            // null if no seasons
    const o = isOpenToday(x);                   // null if no hours
    if (s === true || o === true) return 0;
    if (s === false || o === false) return 2;
    return 1;
  };
  return list.slice().sort((a, b) => {
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (pos) {
      const da = typeof a.lat === 'number' ? haversineKm(pos, {lat:a.lat,lng:a.lng}) : Infinity;
      const db = typeof b.lat === 'number' ? haversineKm(pos, {lat:b.lat,lng:b.lng}) : Infinity;
      if (da !== db) return da - db;
    }
    return idx.get(a) - idx.get(b);             // stable: original order
  });
}
function previewItems(list, opts) { return previewOrder(list, opts).slice(0, (opts && opts.limit) || 6); }
```

Exposed on `window.Ooruly` so app.js uses it for previews and tests can call it directly.

### Home page composition (app.js `renderHome()`)

New home structure (Req 2, Req 5.1):
```
Hero
Daily-fact banner
Preview: Inside Bengaluru      (6 cards + "View all 22")
Preview: Nearby Bengaluru      (6 cards + "View all 17")
"Ways to explore" interlude    (Itineraries teaser + Themes teaser) — unchanged
Preview: Temples               (6 + view all)
Preview: Hidden cafes          (all 6)
Preview: Authentic eats        (6 + view all)
Preview: Things to do          (6 + view all)
```
- Previews contain NO inline filter bars (Req 2.7). Each preview header carries the section title,
  the description, and a "View all N →" link (also acts as the heading link).
- `sectionPreviewHTML(collId)` uses `previewItems()` + the registry's `card` renderer.

### Section page (app.js `renderSection(collId)`)

```
[back to Home]
Section title + description + result count
Filter/sort bar (area, vibe, sort) — from filterBarHTML (existing)
[Getaways only] type chips + "Near me"
Grid (full, filtered, sorted)  — Compare toggles live here (getaways) 
Empty state when filtered to zero (with Clear)
```
- Reuses the existing `applyFilter` / `applySort` and `filterBarHTML`. The per-collection filter
  state (`collFilter`) is retained but now scoped to section pages.
- `currentView` is set to the collection key so the back link from a detail page returns to the
  section page (Req 1.8) and nav active-state reflects location (Req 4.2).

### Detail back-link behavior (Req 1.8)

Detail renderers already accept a back target. Update the back hrefs to the section routes:
- getaway detail → `#/getaways`; city → `#/city`; temple → `#/temples`; cafe → `#/cafes`;
  eat → `#/eats`; activity → `#/do`.

### Card refinement (Req 3) + Compare relocation (Req 3.5 / 1.6)

- One consistent card structure (already largely in place): media (photo or monogram) with limited
  overlays (heart + at most one status badge + explored tick), then body (title, one tagline, one
  meta row). Remove the tag-pills+compare footer from the getaway card face.
- Compare toggles render only inside the Getaways **section page** grid (a small control appended to
  the getaway card when rendered in the section context), never on home previews or other pages.
  Implementation: `cardHTML(d, { compare:true })` adds the compare control; previews call without it.
- Truncation via CSS (`-webkit-line-clamp` for tagline, ellipsis for meta) for consistent heights.

### Whole-app aesthetic (Req 6) — systemic, token-level

Applied in style.css as shared rules, not per-page tweaks:
- **Rhythm**: normalize section vertical padding, `.section-head` spacing, and grid gaps into a
  consistent scale; ensure section pages and utility pages share the `.section--page` header pattern.
- **Hierarchy**: confirm Fraunces headings / Inter body; tune card title vs tagline vs meta
  weight/size/color so primary info leads.
- **Imagery**: consistent `aspect-ratio`, radius, and legibility scrim on all media (already added);
  monogram tiles share the same shape.
- **States**: unify hover/focus/active on cards, buttons, chips, links; keep motion subtle and
  behind `prefers-reduced-motion`.
- **Contrast**: verify coral/teal inks meet AA at their sizes in both themes.
- **Cohesion**: every page (section, detail, map, saved, plan, journey, wizard, glossary, phrases)
  uses the same page-header component and empty-state pattern.

## Components and interfaces

New/changed in `features.js` (public API additions):
- `previewOrder(list, { pos })` → ordered array
- `previewItems(list, { pos, limit })` → first N ordered

New/changed in `app.js`:
- `COLLECTIONS` registry (config object)
- `renderSection(collId)` — shared section-page renderer
- `sectionPreviewHTML(collId)` — home preview block
- `renderHome()` — recomposed to use previews (no inline filter bars)
- `route()` — add `#/city|#/temples|#/cafes|#/eats|#/do|#/getaways`; redirect legacy anchors
- `cardHTML(d, opts)` — optional `compare` flag; getaway footer declutter
- Nav (index.html) — mega-menu + drawer + hero CTA hrefs point to section routes

## Data model

No breaking changes. Optional, additive fields already present (`seasons`, `closedOn`, `lat`/`lng`,
`tags`) drive preview ordering and filters. No new required fields.

## Error handling

- Unknown/typo section route → fall back to home (existing pattern).
- Empty collection → section page shows the empty state; preview renders nothing gracefully.
- Missing geolocation → `previewOrder` skips the distance tie-breaker (in-season/default still apply).
- Missing image → monogram tile (existing fallback).

## Testing strategy

Unit + property tests run in the existing Node/VM harness that loads `data.js` + `features.js`
(and pure helpers). Rendering assertions run against the HTML strings produced by the render
functions (invoked with a minimal DOM stub, as current smoke tests do). Framework: lightweight
Node assertions (consistent with existing `node -c` + VM smoke tests); property checks use simple
generators over the real collections and randomized synthetic lists.

### Correctness properties (from prework)

- **P1 — Section renders full grid (1.1, 5.2):** For every collection, `renderSection` output
  contains exactly `collection.length` cards. _(property)_
- **P2 — Preview size (2.1, 2.4):** For every collection, the preview shows `min(6, length)` cards.
  _(property)_
- **P3 — Preview ordering (2.2):** For any input list, `previewOrder` places all in-season/open
  items before all off-season/closed items; and when a position is supplied, distances are
  non-decreasing within the in-season group (ties fall back to original order → stable). _(property)_
- **P4 — View-all presence (2.3):** For every collection with length > 6, the preview output
  contains a "View all <length>" link whose href equals the collection's section route; length ≤ 6
  omits it. _(property)_
- **P5 — Consistent card structure (3.1):** Every card renderer output contains exactly one title,
  one tagline node, and one meta row, and either an `<img>` or a monogram tile. _(property)_
- **P6 — Compare only on getaways section (3.5, 1.6):** No card rendered in a home preview or in a
  non-getaway context contains a compare control; getaway cards rendered in the section context do.
  _(property)_
- **P7 — Legacy anchor redirect (4.3):** For each legacy anchor, routing yields the corresponding
  section view (same output as the explicit route). _(property)_
- **P8 — Home is smaller (5.1):** Total cards rendered on home ≤ 6 × (number of collections), and
  strictly less than the sum of all collection lengths (given current data). _(property)_

### Example / regression tests

- Section page includes heading, description, live count, back link, and filter bar (1.2–1.5).
- Getaways section includes type chips, "Near me", compare; others do not include compare (1.6).
- Deep-link render: calling `route()` with `#/temples` yields the temples section without a prior
  home render (1.7).
- Detail back hrefs point to the right section route per collection (1.8).
- Home preserves hero, daily fact, itinerary + theme teasers; previews contain no filter bar
  (2.5–2.7).
- Nav hrefs point to section routes; legacy anchors still resolve (4.1, 4.3).
- Regression smoke: search, favorites, plan, compare, map, journey APIs still callable and correct
  (4.4, 5.3).
- Aesthetic guard (6.1): grep assertion that no legacy palette (`#ff004f`, `#5a3cff`) or removed
  fonts remain in CSS/HTML.

### Not unit-testable (verify manually / visually)

- Exact spacing, radius, hover polish, truncation appearance, contrast perception, responsive
  single-column layout (3.3, 3.4, 3.7, 5.4, and most of Req 6). These are validated by design review
  and a local run in both themes and at mobile/desktop widths.

## Rollout / no-regression

- Keep all existing feature routes and APIs intact; only add section routes and recompose home.
- Bump the service worker `VERSION` so updated files are served (5.5).
- Verify with the existing smoke-test approach after each task; run the property tests for the pure
  ordering + registry-driven rendering.
