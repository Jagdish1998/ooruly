# Implementation Plan — Section Pages, Home Previews & Card Refinement

Incremental, test-as-you-go build. Property tests (PBT) use the existing Node/VM harness that loads
`data.js` + `features.js` and invokes render functions with a minimal DOM stub. Verify in-browser at
each milestone. Bump the service worker `VERSION` at the end.

- [x] 1. Preview-ordering helper in features.js
  - Add pure `previewOrder(list, { pos })` and `previewItems(list, { pos, limit })`; expose on `window.Ooruly`.
  - Order: in-season/open-first, then nearest-first when `pos` given, then original order (stable).
  - Handle missing seasons/hours (rank "unknown") and missing coords (skip distance tie-break).
  - _Requirements: 2.2_

- [x] 1.1 Property test — preview ordering (P3)
  - Assert: all in-season/open items precede all off-season/closed items for any input list.
  - Assert: with a position supplied, distances are non-decreasing within the in-season group; ties preserve original order (stable).
  - Assert: `previewItems` returns `min(limit, length)` items.
  - _Requirements: 2.2, 2.1_
  - _Property-Based Test_

- [x] 2. COLLECTIONS registry in app.js
  - Add the single config object describing all six collections (key, route, legacy anchor, title, description, icon, data getter, card renderer, detailKey, flags: filters, typeChips, nearMe, compare).
  - _Requirements: 1.9, 4.1_

- [x] 3. Shared section-page renderer `renderSection(collId)`
  - Render page header (back link, title, description, live count), filter/sort bar (reuse `filterBarHTML`), full filtered+sorted grid, and empty state on zero matches.
  - Getaways variant: include type chips, "Near me", and compare toggles in-grid.
  - Set `currentView` to the collection key.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9_

- [x] 3.1 Property test — section renders full grid (P1)
  - For every collection, `renderSection` output contains exactly `collection.length` cards.
  - _Requirements: 1.1, 5.2_
  - _Property-Based Test_

- [x] 3.2 Property test — consistent section structure (1.9) + compare placement (P6)
  - Every section output shares the structural markers (page header, grid, count).
  - Compare control appears only in the getaways section; not in any other section.
  - _Requirements: 1.9, 1.6, 3.5_
  - _Property-Based Test_

- [x] 4. Routing: explicit section routes + legacy redirects
  - In `route()`, handle `#/city`, `#/temples`, `#/cafes`, `#/eats`, `#/do`, `#/getaways` → `renderSection`.
  - Redirect legacy anchors (`#city`, `#temples`, `#cafes`, `#eats`, `#do`, `#nearby`) to the matching section route.
  - Ensure deep-link/refresh renders the section directly.
  - _Requirements: 1.7, 4.3_

- [x] 4.1 Property test — legacy anchor redirect (P7)
  - For each legacy anchor, routing produces the same section view as its explicit route.
  - _Requirements: 4.3_
  - _Property-Based Test_

- [x] 4.2 Example test — deep-link render (1.7) + detail back targets (1.8)
  - Calling `route()` with a section hash renders that section without a prior home render.
  - Each detail renderer's back link points to its section route.
  - _Requirements: 1.7, 1.8_

- [x] 5. Home preview block `sectionPreviewHTML(collId)`
  - Render preview header (title, description, "View all N →" link to section route) + up to 6 cards via `previewItems` and the registry card renderer. No inline filter bar.
  - Omit "View all" when length ≤ 6.
  - _Requirements: 2.1, 2.3, 2.4, 2.6, 2.7_

- [x] 5.1 Property test — preview size (P2) + view-all (P4) + home smaller (P8)
  - Preview shows `min(6, length)`; "View all <length>" present iff length > 6, href = section route.
  - Total home cards ≤ 6 × collections and < sum of all lengths.
  - _Requirements: 2.1, 2.3, 2.4, 5.1_
  - _Property-Based Test_

- [x] 6. Recompose `renderHome()` to use previews
  - Replace the six inline all-cards sections with preview blocks in the agreed order (City sights, Getaways, [itineraries + themes interlude], Temples, Cafes, Eats, Things to do).
  - Preserve hero, daily-fact banner, and the itineraries/themes teasers.
  - Remove inline per-section filter bars from home.
  - _Requirements: 2.5, 2.6, 2.7, 5.1_

- [x] 6.1 Example test — home composition (2.5–2.7)
  - Home output contains hero, daily fact (when present), itinerary + theme teasers; previews contain no filter bar; heading/view-all link to section routes.
  - _Requirements: 2.5, 2.6, 2.7_

- [x] 7. Refine cards + relocate Compare
  - Give `cardHTML(d, opts)` an optional `compare` flag; render the compare control only when in the getaways section context.
  - Declutter the getaway card face (remove inline tag-pills+compare footer from previews); keep media overlays limited to heart + one badge + explored tick.
  - Ensure consistent structure across all card renderers (media/monogram, title, one tagline, one meta row).
  - _Requirements: 3.1, 3.2, 3.5, 1.6_

- [x] 7.1 Property test — consistent card structure (P5)
  - Every card renderer output contains exactly one title, one tagline, one meta row, and either an `<img>` or a monogram tile; no compare control unless getaways-section context.
  - _Requirements: 3.1, 3.2, 3.5_
  - _Property-Based Test_

- [x] 8. Navigation updates (index.html + app.js)
  - Point mega-menu, mobile drawer, footer, and hero CTA hrefs to the section routes.
  - Ensure nav click handling routes to section pages; active-state reflects the current section.
  - _Requirements: 4.1, 4.2_

- [x] 8.1 Example test — nav + active state (4.1, 4.2, 4.4)
  - Nav hrefs equal section routes; legacy anchors still resolve; feature APIs (search/favorites/plan/compare/map) remain callable.
  - _Requirements: 4.1, 4.2, 4.4, 5.3_

- [x] 9. Card refinement styles (style.css)
  - Consistent sizing, spacing, radius, hover; graceful tagline/meta truncation (`line-clamp`, ellipsis); consistent media aspect + scrim; monogram parity.
  - _Requirements: 3.3, 3.4, 3.6, 3.7_

- [x] 10. Section & preview styles (style.css)
  - Style the preview header + "View all" link; ensure section pages reuse the `.section--page` header pattern and consistent empty states.
  - Responsive: previews single-column on mobile; section grids match the design system.
  - _Requirements: 1.3, 2.8, 5.4, 6.7, 6.8_

- [x] 11. Whole-app aesthetic polish (style.css)
  - Normalize section vertical rhythm, heading spacing, and grid gaps into one scale.
  - Confirm typographic hierarchy (title/tagline/meta), unified interaction states (respecting reduced-motion), and imagery consistency across pages.
  - Verify light/dark AA contrast for coral/teal inks at their sizes; cohesive page-header + empty-state across map/saved/plan/journey/wizard/glossary/phrases.
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 11.1 Example test — aesthetic guard (6.1)
  - Grep assertion: no legacy palette (`#ff004f`, `#5a3cff`) or removed fonts remain in CSS/HTML.
  - _Requirements: 6.1_

- [x] 12. Regression smoke + service worker bump
  - Run the full smoke harness: index builds, all section routes render, previews render, features intact.
  - Bump `sw.js` `VERSION`; verify served files update. Manual pass in both themes at mobile/desktop widths.
  - _Requirements: 5.3, 5.5, 5.4_
