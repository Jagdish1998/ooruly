# Requirements — Section Pages, Home Previews & Card Refinement

## Overview

The Ooruly home page currently renders every card of every collection inline: ~22 city sights,
17 getaways, 10 temples, 9 eateries, 8 activities, and 6 cafes — 72+ cards on a single scroll,
plus the hero, daily-fact banner, and the itineraries/themes teasers. This makes the landing page
excessively long and overwhelming, buries the value proposition, and slows scanning.

This feature restructures the experience around three ideas:
1. **Dedicated section pages** — each collection gets its own route/page with the full grid,
   filters, and sort, so full lists live on focused pages rather than one endless home page.
2. **Home previews** — the home page shows a short, curated preview of each collection (a handful
   of cards) with a clear "View all" link to the section page, turning home into a scannable landing.
3. **Refined cards** — cards are simplified to a clean, consistent, aesthetic shape: image, title,
   a single tagline, one concise meta row, at most one status badge, and minimal controls, so they
   look beautiful and are easy to scan without clutter.

Constraints: keep the existing static, no-build, hash-routed SPA architecture; remain data-driven
(new places appear automatically); preserve existing features (search, favorites, plan, compare,
map, educational content, gamification) and accessibility; keep it fast and mobile-first.

## Glossary

- **Collection**: A group of places of one kind — City sights, Temples, Cafes, Eats (eateries),
  Things to do (activities), Getaways (destinations).
- **Section page**: A dedicated route that shows the full grid of one collection with its filters
  and sort controls (e.g. `#/city`, `#/temples`).
- **Home preview**: A short row of a limited number of cards for a collection shown on the home
  page, with a "View all" link to the section page.
- **Preview limit**: The maximum number of cards shown for a collection in its home preview.
  **Fixed at 6** for this feature.
- **Card**: The clickable tile representing a single place in a grid.

## Decisions (resolved)

These design decisions are final and drive the acceptance criteria below:

1. **Preview count = 6** cards per collection on the home page.
2. **Explicit section routes** are introduced for every collection: `#/city`, `#/temples`,
   `#/cafes`, `#/eats`, `#/do`, `#/getaways`. Existing anchor links (`#city`, `#temples`, `#cafes`,
   `#eats`, `#do`, `#nearby`) SHALL be redirected to their corresponding section routes for
   backward compatibility.
3. **Home preview ordering**: within each collection's preview, items that are currently
   in-season (or open today, where applicable) are shown first; when more than 6 are in-season,
   those in-season items are further ordered nearest-first (using the user's location when
   available, otherwise the collection's default order). Collections without season/open data fall
   back to nearest-first, then default order.
4. **Compare** is available only on the Getaways section page (not on the card face anywhere).
5. **All six collections get their own dedicated, consistent section pages** — City sights,
   Temples, Cafes, Eats, Things to do, and Getaways — with the same layout, controls, and card
   design, regardless of how many items each holds.

## Requirements

### Requirement 1 — Dedicated section pages

**User story:** As a visitor, I want each category to have its own page with the full list, so I can
browse a category in depth without scrolling past every other category.

#### Acceptance criteria
1. WHEN the user navigates to a section route (`#/city`, `#/temples`, `#/cafes`, `#/eats`, `#/do`,
   `#/getaways`) THEN the system SHALL render a dedicated page showing that collection's full grid
   of cards.
2. WHEN a section page is shown THEN the system SHALL include that collection's existing filter
   controls (area, vibe) and sort controls, and they SHALL work the same as they do today.
3. WHEN a section page is shown THEN the system SHALL display a page heading, a short description,
   and a live result count consistent with the rest of the app.
4. WHEN a section page is shown THEN the system SHALL provide a back link to the home page.
5. WHEN the user filters or sorts on a section page and no items match THEN the system SHALL show a
   friendly empty state with a way to clear filters.
6. WHERE the Getaways section page is shown THE system SHALL retain the getaway type chips, the
   "Near me" control, and the Compare toggles. Compare SHALL appear ONLY on the Getaways section
   page — not on any card face on the home page or in any preview.
9. WHEN all six collections are shown as section pages THEN the system SHALL use a consistent
   layout, heading pattern, filter/sort controls, card design, and empty state across every
   collection, regardless of item count.
7. WHEN a section route is loaded directly (deep link / refresh) THEN the system SHALL render that
   section page correctly without requiring a prior visit to the home page.
8. WHEN the user opens a place from a section page THEN returning (back) SHALL go to that section
   page, not the home page.

### Requirement 2 — Home page previews

**User story:** As a first-time visitor, I want a short, scannable home page that previews each
category, so I can quickly understand what's on offer and dive into what interests me.

#### Acceptance criteria
1. WHEN the home page is shown THEN the system SHALL render, for each collection, a preview
   containing at most 6 cards.
2. WHEN a collection's preview is built THEN the system SHALL order candidates in-season/open-first,
   then nearest-first among those (using the user's location when available), then the collection's
   default order, and take the first 6.
3. WHEN a collection has more than 6 items THEN the system SHALL show a "View all N" link (or
   button) that navigates to that collection's section page, where N is the total count.
4. WHEN a collection has 6 or fewer items THEN the system SHALL show all of them and MAY omit the
   "View all" link.
5. WHEN the home page is shown THEN the system SHALL preserve the hero, the daily-fact banner, and
   the itineraries and themes teasers.
6. WHEN the home page is shown THEN each preview SHALL show the same section heading and description
   as today, and tapping the heading area or "View all" SHALL open the section page.
7. WHERE per-section filters currently appear inline on the home page THE system SHALL move the full
   filter/sort controls to the section pages, and the home previews SHALL show a curated default
   selection rather than inline filters (to keep the home page short).
8. WHEN the home page is shown on mobile THEN previews SHALL remain single-column and the page
   SHALL be substantially shorter than the current all-cards layout.

### Requirement 3 — Refined, consistent card design

**User story:** As a user, I want cards that look clean and aesthetic, so browsing feels pleasant
and I can scan places quickly without visual clutter.

#### Acceptance criteria
1. WHEN a card is displayed THEN the system SHALL present a consistent structure across all
   collections: image (or branded monogram tile), title, a single-line tagline, and one concise
   meta row.
2. WHEN a card is displayed THEN the system SHALL limit image overlays to essentials: the save
   (heart) control and at most one status badge (e.g. season / open-today), plus the small
   "explored" tick; secondary controls SHALL NOT crowd the image.
3. WHEN a card's tagline or meta text is long THEN the system SHALL truncate gracefully (no
   overflow, no layout break) and keep card heights visually consistent within a row.
4. WHEN cards are shown in a grid THEN the system SHALL use consistent sizing, spacing, corner
   radius, and hover treatment across all collections.
5. WHERE the getaway card currently shows a Compare button inline THE system SHALL keep compare
   available but present it without cluttering the card face (e.g. on the section page or a
   restrained control), subject to design review.
6. WHEN a card is displayed THEN it SHALL remain fully keyboard- and screen-reader-accessible, and
   tapping anywhere on the card (outside interactive controls) SHALL open the place.
7. WHEN the theme is light or dark THEN cards SHALL maintain sufficient contrast and legibility of
   overlays and text.

### Requirement 4 — Navigation & information architecture

**User story:** As a user, I want navigation that reflects the new section pages, so I can reach any
category directly and understand where I am.

#### Acceptance criteria
1. WHEN the primary navigation (desktop mega-menu and mobile drawer) is shown THEN links for the
   in-city collections and Getaways SHALL point to their dedicated section pages.
2. WHEN a section page is active THEN the system SHALL reflect the current location appropriately
   (e.g. active state) where the app already indicates active navigation.
3. WHEN existing deep links or anchors to sections are used THEN the system SHALL route them to the
   corresponding section page without breaking (backward compatibility for existing hash anchors
   SHALL be maintained or redirected).
4. WHEN the user is on a section page and uses global search, favorites, plan, compare, or the map
   THEN those features SHALL continue to work unchanged.

### Requirement 5 — Performance, consistency & no regressions

**User story:** As a user, I want the restructure to make the app faster and cleaner without losing
any features, so the experience only improves.

#### Acceptance criteria
1. WHEN the home page loads THEN it SHALL render fewer cards than today (only previews), reducing
   initial DOM size and scroll length.
2. WHEN new places are added to a collection in data THEN they SHALL appear automatically in the
   correct section page and be eligible for the home preview, with no code change (data-driven).
3. WHEN the restructure is complete THEN existing features (search, favorites, weekend plan,
   compare, map, itineraries, themes, quizzes, audio narration, journey/badges, wizard) SHALL
   continue to function.
4. WHEN the app is used on mobile and desktop THEN all new pages and previews SHALL be responsive
   and consistent with the current design system (coral/teal palette, Fraunces/Inter type, radii).
5. WHEN the service worker version is bumped THEN updated pages SHALL be served on next load.

### Requirement 6 — Aesthetic & visual polish (whole application)

**User story:** As a user, I want the entire application to look modern, cohesive, and beautiful, so
it feels premium and pleasant to use across every page.

#### Acceptance criteria
1. WHEN any page is shown THEN the system SHALL apply the design system consistently — the coral
   primary / teal secondary palette, Fraunces display headings with Inter body, consistent radii,
   spacing scale, shadows, and borders — with no leftover legacy colors or fonts.
2. WHEN content sections are shown THEN the system SHALL maintain a calm, consistent vertical rhythm
   (consistent section padding, heading spacing, and grid gaps) so the page reads cleanly rather
   than cluttered.
3. WHEN interactive elements (cards, buttons, chips, links, controls) are shown THEN the system
   SHALL use consistent, restrained hover/focus/active states and tasteful micro-interactions that
   respect `prefers-reduced-motion`.
4. WHEN imagery is shown THEN the system SHALL present images and monogram tiles with consistent
   aspect ratios, corner treatment, and legibility scrims, so no image looks broken, stretched, or
   low-contrast in either theme.
5. WHEN headings, taglines, and metadata are shown THEN the system SHALL apply a clear typographic
   hierarchy (weight, size, color) so the primary information stands out and secondary details
   recede.
6. WHEN the light and dark themes are compared THEN both SHALL look intentional and polished, with
   text and accents meeting WCAG AA contrast for their sizes.
7. WHEN section pages, detail pages, and utility pages (map, saved, plan, journey, wizard,
   glossary, phrases) are shown THEN they SHALL share the same visual language and page-header
   pattern, so the whole app feels like one cohesive product.
8. WHEN empty states, loading, and error states are shown THEN they SHALL be visually consistent
   and on-brand.

## Notes for design phase

- Aesthetic improvements should be systemic (tokens, shared components, spacing/typography rules)
  rather than one-off page tweaks, so consistency is enforced by the design system.
- Card refinement (Requirement 3) and visual polish (Requirement 6) should be designed together so
  the new card is the aesthetic anchor the rest of the app aligns to.
- Any visual change must preserve existing functionality and accessibility (Requirements 4 & 5).
