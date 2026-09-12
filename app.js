/*
 * Ooruly front-end: a tiny hash router over the DESTINATIONS data.
 *
 *   #/                 -> home: hero, jump nav, "Inside Bengaluru" grid, "Nearby Bengaluru" grid
 *   #/place/<slug>     -> one getaway: overview, how to reach, best months, precautions, booking
 *   #/city/<slug>      -> one city sight: overview, what to see, getting there, timings, tips, map
 *   #/cafe/<slug>      -> one hidden cafe: the vibe, what to order, good to know, directions
 *   #/eat/<slug>       -> one iconic eatery: the story, what to order, good to know, directions
 *   #/do/<slug>        -> one activity: overview, what you'll do, good to know, find it on Maps
 *   #city/#cafes/#eats/#do/#nearby -> scroll to a section of the home view
 *
 * There is no framework and no build step. Everything renders from data.js, so the site is entirely
 * content-driven: add a destination there and it appears here with no code change.
 */

(function () {
    'use strict';

    const view = document.getElementById('view');
    const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const MONTH_LABEL = {
        jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
        jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
    };

    let activeType = 'all';

    /* Per-collection filter + sort state for each home section that has filters. */
    const collFilter = {
        city: { area: 'all', intent: 'all', sort: 'default' },
        temples: { area: 'all', intent: 'all', sort: 'default' },
        cafes: { area: 'all', intent: 'all', sort: 'default' },
        eats: { area: 'all', intent: 'all', sort: 'default' },
        do: { area: 'all', intent: 'all', sort: 'default' },
    };

    /* Sort a filtered collection per the chosen mode. 'near' uses geolocation if available. */
    function applySort(list, mode) {
        const arr = list.slice();
        if (mode === 'az') {
            arr.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        } else if (mode === 'open') {
            // Open-today first (true), then unknown, then closed.
            const rank = (x) => { const o = F ? F.isOpenToday(x) : null; return o === true ? 0 : o === null ? 1 : 2; };
            arr.sort((a, b) => rank(a) - rank(b));
        } else if (mode === 'near' && F && F.lastPos) {
            arr.sort((a, b) => {
                const da = typeof a.lat === 'number' ? F.haversineKm(F.lastPos, { lat: a.lat, lng: a.lng }) : Infinity;
                const db = typeof b.lat === 'number' ? F.haversineKm(F.lastPos, { lat: b.lat, lng: b.lng }) : Infinity;
                return da - db;
            });
        }
        return arr;
    }

    /* Distinct areas within a collection, for the area filter chips. */
    function areasOf(list) {
        const seen = [];
        list.forEach((x) => { if (x.area && seen.indexOf(x.area) === -1) seen.push(x.area); });
        return seen.sort();
    }

    /* Apply area + intent filters to a collection. */
    function applyFilter(list, f) {
        return list.filter((x) => {
            const areaOk = f.area === 'all' || x.area === f.area;
            const intentOk = f.intent === 'all' || (Array.isArray(x.tags) && x.tags.indexOf(f.intent) !== -1);
            return areaOk && intentOk;
        });
    }

    /* Build an area + intent + sort bar for a section, plus a live result count. `sec` keys into
       collFilter; `shownCount`/`totalCount` drive the "Showing X of Y" line. */
    function filterBarHTML(sec, list, shownCount, totalCount) {
        const f = collFilter[sec];
        const areas = areasOf(list);
        const areaOpts = ['all'].concat(areas).map((a) =>
            `<option value="${esc(a)}" ${f.area === a ? 'selected' : ''}>${a === 'all' ? 'All areas' : esc(a)}</option>`
        ).join('');

        const intents = typeof INTENTS !== 'undefined' ? INTENTS : [];
        const usedIntents = intents.filter((i) =>
            list.some((x) => Array.isArray(x.tags) && x.tags.indexOf(i.id) !== -1));
        const intentSelect = usedIntents.length ? `
            <label class="filter-select">
                <span class="filter-select-label"><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Vibe</span>
                <select class="select" data-filter-sec="${sec}" data-filter-kind="intent" aria-label="Filter by vibe">
                    <option value="all" ${f.intent === 'all' ? 'selected' : ''}>Any vibe</option>
                    ${usedIntents.map((i) =>
                        `<option value="${i.id}" ${f.intent === i.id ? 'selected' : ''}>${esc(i.label)}</option>`).join('')}
                </select>
            </label>` : '';

        // Sort options; "Nearest" only makes sense once we have the user's location.
        const hasGeo = F && F.lastPos;
        const sortOpts = [
            { id: 'default', label: 'Featured' },
            { id: 'az', label: 'A–Z' },
        ];
        if (sec === 'eats' || sec === 'city') sortOpts.push({ id: 'open', label: 'Open today' });
        if (hasGeo) sortOpts.push({ id: 'near', label: 'Nearest' });
        const sortSelect = `
            <label class="filter-select">
                <span class="filter-select-label"><i class="fa-solid fa-arrow-down-wide-short" aria-hidden="true"></i> Sort</span>
                <select class="select" data-filter-sec="${sec}" data-filter-kind="sort" aria-label="Sort">
                    ${sortOpts.map((o) => `<option value="${o.id}" ${f.sort === o.id ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
                </select>
            </label>`;

        const active = f.area !== 'all' || f.intent !== 'all' || f.sort !== 'default';
        const clear = active
            ? `<button class="filter-clear" type="button" data-filter-sec="${sec}" data-filter-kind="clear">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i> Clear
               </button>`
            : '';

        // Live result count, announced to screen readers.
        const filtered = f.area !== 'all' || f.intent !== 'all';
        const count = `<p class="filter-count" role="status" aria-live="polite">${
            filtered ? `Showing <strong>${shownCount}</strong> of ${totalCount}` : `${totalCount} places`
        }</p>`;

        return `<div class="filters filters--select" data-filter-bar="${sec}">
                    <label class="filter-select">
                        <span class="filter-select-label"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Area</span>
                        <select class="select" data-filter-sec="${sec}" data-filter-kind="area" aria-label="Filter by area">
                            ${areaOpts}
                        </select>
                    </label>
                    ${intentSelect}
                    ${sortSelect}
                    ${clear}
                    ${count}
                </div>`;
    }

    /* ---------- small helpers ---------- */

    function esc(s) {
        return String(s)
            .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;');
    }

    function bySlug(slug) {
        return DESTINATIONS.find((d) => d.slug === slug);
    }

    function byCitySlug(slug) {
        const list = typeof CITY_ATTRACTIONS !== 'undefined' ? CITY_ATTRACTIONS : [];
        return list.find((p) => p.slug === slug);
    }

    function byTempleSlug(slug) {
        const list = typeof TEMPLES !== 'undefined' ? TEMPLES : [];
        return list.find((t) => t.slug === slug);
    }

    function byCafeSlug(slug) {
        const list = typeof CAFES !== 'undefined' ? CAFES : [];
        return list.find((c) => c.slug === slug);
    }

    function byEatSlug(slug) {
        const list = typeof EATERIES !== 'undefined' ? EATERIES : [];
        return list.find((e) => e.slug === slug);
    }

    function byActivitySlug(slug) {
        const list = typeof ACTIVITIES !== 'undefined' ? ACTIVITIES : [];
        return list.find((a) => a.slug === slug);
    }

    function typeLabel(id) {
        const t = TYPES.find((x) => x.id === id);
        return t ? t.label : id;
    }

    const F = window.Ooruly; // feature layer (features.js)

    /* A small heart button that toggles a favourite. `key` is the collection ('cafe', 'eat', …). */
    function favBtnHTML(key, slug, extraClass) {
        const on = F && F.isFav(key, slug);
        return `<button class="fav-btn ${on ? 'is-on' : ''} ${extraClass || ''}" type="button"
                    data-fav-key="${esc(key)}" data-fav-slug="${esc(slug)}"
                    aria-pressed="${on ? 'true' : 'false'}"
                    aria-label="${on ? 'Remove from saved' : 'Save this place'}">
                    <i class="fa-${on ? 'solid' : 'regular'} fa-heart" aria-hidden="true"></i>
                </button>`;
    }

    /* A "plan" button that adds/removes an item from the weekend plan. */
    function planBtnHTML(key, slug, label) {
        const on = F && F.inPlan(key, slug);
        return `<button class="plan-btn ${on ? 'is-on' : ''}" type="button"
                    data-plan-key="${esc(key)}" data-plan-slug="${esc(slug)}"
                    aria-pressed="${on ? 'true' : 'false'}">
                    <i class="fa-solid ${on ? 'fa-check' : 'fa-plus'}" aria-hidden="true"></i>
                    ${esc(label || (on ? 'In your plan' : 'Add to plan'))}
                </button>`;
    }

    /* Small "in season" / "open today" pills used on getaway and eatery cards. */
    function seasonBadgeHTML(seasons) {
        if (!F) return '';
        const s = F.isInSeason(seasons);
        if (s === null) return '';
        return s
            ? `<span class="badge badge--good"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Good to go now</span>`
            : `<span class="badge badge--off"><i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i> Off-season</span>`;
    }
    function openBadgeHTML(item) {
        if (!F) return '';
        const o = F.isOpenToday(item);
        if (o === null) return '';
        return o
            ? `<span class="badge badge--good"><i class="fa-solid fa-door-open" aria-hidden="true"></i> Open today</span>`
            : `<span class="badge badge--off"><i class="fa-solid fa-door-closed" aria-hidden="true"></i> Closed today</span>`;
    }

    /* Intent tag chips (read-only) shown on a card/detail. */
    /* Fav + plan + share action row for detail pages. */
    function detailActionsHTML(key, slug, name) {
        return `
            <div class="detail-actions">
                ${favBtnHTML(key, slug, 'fav-btn--label')}
                ${planBtnHTML(key, slug)}
                <button class="share-btn" type="button" data-share data-share-title="${esc(name)} — Ooruly">
                    <i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Share
                </button>
            </div>`;
    }

    function tagPillsHTML(tags) {
        if (!Array.isArray(tags) || !tags.length || typeof INTENTS === 'undefined') return '';
        const byId = {};
        INTENTS.forEach((i) => { byId[i.id] = i; });
        const pills = tags.map((t) => {
            const meta = byId[t];
            if (!meta) return '';
            return `<span class="tag-pill"><i class="fa-solid ${meta.icon}" aria-hidden="true"></i> ${esc(meta.label)}</span>`;
        }).join('');
        return pills ? `<div class="tag-pills">${pills}</div>` : '';
    }

    /* ---------- home view ---------- */

    function renderHome() {
        const filters = TYPES.map((t) => {
            const count = t.id === 'all'
                ? DESTINATIONS.length
                : DESTINATIONS.filter((d) => d.type === t.id).length;
            return `<button class="chip ${t.id === activeType ? 'is-active' : ''}"
                        type="button" data-type="${t.id}">
                        ${esc(t.label)} <span class="chip-count">${count}</span>
                    </button>`;
        }).join('');

        const list = DESTINATIONS
            .filter((d) => activeType === 'all' || d.type === activeType)
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .map(cardHTML)
            .join('');

        const cityAll = (typeof CITY_ATTRACTIONS !== 'undefined' ? CITY_ATTRACTIONS : []);
        const templeAll = (typeof TEMPLES !== 'undefined' ? TEMPLES : []);
        const cafeAll = (typeof CAFES !== 'undefined' ? CAFES : []);
        const eatAll = (typeof EATERIES !== 'undefined' ? EATERIES : []);
        const doAll = (typeof ACTIVITIES !== 'undefined' ? ACTIVITIES : []);

        // Ready-made itineraries teaser (top 3), linking to the full page.
        const itinTeaser = itinerariesData().slice(0, 3).map(itineraryCardHTML).join('');

        // Themes / learning collections teaser (top 3).
        const themeTeaser = themesData().slice(0, 3).map(themeCardHTML).join('');

        const emptyMsg = '<p class="grid-empty">Nothing matches those filters yet — try clearing one.</p>';

        // Filter, then sort, then render — and pass the shown/total counts into each bar.
        const cityFiltered = applySort(applyFilter(cityAll, collFilter.city), collFilter.city.sort);
        const templeFiltered = applySort(applyFilter(templeAll, collFilter.temples), collFilter.temples.sort);
        const cafeFiltered = applySort(applyFilter(cafeAll, collFilter.cafes), collFilter.cafes.sort);
        const eatFiltered = applySort(applyFilter(eatAll, collFilter.eats), collFilter.eats.sort);
        const doFiltered = applySort(applyFilter(doAll, collFilter.do), collFilter.do.sort);

        const cityBar = filterBarHTML('city', cityAll, cityFiltered.length, cityAll.length);
        const templeBar = filterBarHTML('temples', templeAll, templeFiltered.length, templeAll.length);
        const cafeBar = filterBarHTML('cafes', cafeAll, cafeFiltered.length, cafeAll.length);
        const eatBar = filterBarHTML('eats', eatAll, eatFiltered.length, eatAll.length);
        const doBar = filterBarHTML('do', doAll, doFiltered.length, doAll.length);

        const cityList = cityFiltered.length ? cityFiltered.map(cityCardHTML).join('') : emptyMsg;
        const templeList = templeFiltered.length ? templeFiltered.map(templeCardHTML).join('') : emptyMsg;
        const cafeList = cafeFiltered.length ? cafeFiltered.map(cafeCardHTML).join('') : emptyMsg;
        const eatList = eatFiltered.length ? eatFiltered.map(eatCardHTML).join('') : emptyMsg;
        const doList = doFiltered.length ? doFiltered.map(activityCardHTML).join('') : emptyMsg;

        // Counts for the hero stat row (proof of how much is inside).
        const cityCount = (typeof CITY_ATTRACTIONS !== 'undefined' ? CITY_ATTRACTIONS : []).length;
        const templeCount = (typeof TEMPLES !== 'undefined' ? TEMPLES : []).length;
        const cafeCount = (typeof CAFES !== 'undefined' ? CAFES : []).length;
        const eatCount = (typeof EATERIES !== 'undefined' ? EATERIES : []).length;
        const doCount = (typeof ACTIVITIES !== 'undefined' ? ACTIVITIES : []).length;
        const totalCount = DESTINATIONS.length + cityCount + templeCount + cafeCount + eatCount + doCount;

        view.innerHTML = `
            <section class="hero">
                <div class="hero-aura" aria-hidden="true"></div>
                <div class="container hero-inner">
                    <div class="hero-copy">
                        <p class="eyebrow">Travel guide to Bengaluru &amp; around</p>
                        <h1 class="hero-title">Where to go, <span class="accent">how to reach</span>,
                            and when it's worth it.</h1>
                        <p class="hero-lede">A practical travel guide — the places, the best time to go,
                            the precautions that actually matter, and one tap to reach or book. From day
                            trips inside Bengaluru to weekend getaways around it.</p>
                        <div class="hero-cta">
                            <a class="btn btn-primary" href="#nearby">
                                Explore getaways <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                            </a>
                            <a class="btn btn-ghost" href="#city">
                                <i class="fa-solid fa-city" aria-hidden="true"></i> Inside Bengaluru
                            </a>
                        </div>
                        <ul class="hero-stats" aria-label="What's inside">
                            <li><strong>${totalCount}</strong> curated spots</li>
                            <li><strong>${DESTINATIONS.length}</strong> weekend getaways</li>
                            <li><strong>${cityCount}</strong> city sights</li>
                            <li><strong>${templeCount}</strong> temples</li>
                            <li>cafes, eats &amp; more</li>
                        </ul>
                    </div>

                    <div class="hero-collage" aria-hidden="true">
                        <figure class="hero-tile hero-tile--tall">
                            <img src="images/mysuru.jpg" alt="" loading="eager" decoding="async"
                                onerror="this.classList.add('img-fallback')">
                            <figcaption>Mysuru</figcaption>
                        </figure>
                        <figure class="hero-tile">
                            <img src="images/coorg.jpg" alt="" loading="eager" decoding="async"
                                onerror="this.classList.add('img-fallback')">
                            <figcaption>Coorg</figcaption>
                        </figure>
                        <figure class="hero-tile">
                            <img src="images/gokarna.jpg" alt="" loading="lazy" decoding="async"
                                onerror="this.classList.add('img-fallback')">
                            <figcaption>Gokarna</figcaption>
                        </figure>
                        <figure class="hero-tile hero-tile--wide">
                            <img src="images/hampi.jpg" alt="" loading="lazy" decoding="async"
                                onerror="this.classList.add('img-fallback')">
                            <figcaption>Hampi</figcaption>
                        </figure>
                    </div>
                </div>
            </section>

            ${itinTeaser ? `
            <section class="section section--itin" id="itineraries">
                <div class="container">
                    <div class="section-head section-head--row">
                        <div>
                            <h2 class="section-title">Ready-Made Itineraries</h2>
                            <p class="section-sub">Not sure where to start? Use a curated day plan as-is,
                                or tweak it in the planner.</p>
                        </div>
                        <a class="near-btn" href="#/itineraries">All itineraries <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
                    </div>
                    <div class="grid itin-grid">${itinTeaser}</div>
                </div>
            </section>` : ''}

            ${themeTeaser ? `
            <section class="section section--themes" id="themes-teaser">
                <div class="container">
                    <div class="section-head section-head--row">
                        <div>
                            <h2 class="section-title">Learn by Theme</h2>
                            <p class="section-sub">Understand Bengaluru through the threads that run through it —
                                dynasties, faith, coffee and food.</p>
                        </div>
                        <a class="near-btn" href="#/themes">All themes <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
                    </div>
                    <div class="grid itin-grid">${themeTeaser}</div>
                </div>
            </section>` : ''}

            <section class="section section--city" id="city">
                <div class="container">
                    <div class="section-head">
                        <h2 class="section-title">Inside Bengaluru</h2>
                        <p class="section-sub">No trip needed — city sights you can do in a few hours.
                            Tap any place for how to reach it, the best time to go, and travel tips.</p>
                    </div>
                    ${cityBar}
                    <div class="grid" id="grid-city">${cityList}</div>
                </div>
            </section>

            <section class="section section--temples" id="temples">
                <div class="container">
                    <div class="section-head">
                        <h2 class="section-title">Temples</h2>
                        <p class="section-sub">Famous temples across the city — from the oldest
                            Chola-era shrines and a 16th-century cave temple to a modern landmark.
                            Tap one for its story, how to reach it, timings and tips.</p>
                    </div>
                    ${templeBar}
                    <div class="grid" id="grid-temples">${templeList}</div>
                </div>
            </section>

            <section class="section section--cafes" id="cafes">
                <div class="container">
                    <div class="section-head">
                        <h2 class="section-title">Hidden cafes</h2>
                        <p class="section-sub">Independent, under-the-radar cafes tucked across the
                            city — Indiranagar, Jayanagar, Koramangala and beyond. Tap one for what it's
                            known for, what to order, and directions.</p>
                    </div>
                    ${cafeBar}
                    <div class="grid" id="grid-cafes">${cafeList}</div>
                </div>
            </section>

            <section class="section section--eats" id="eats">
                <div class="container">
                    <div class="section-head">
                        <h2 class="section-title">Authentic eats</h2>
                        <p class="section-sub">The legendary, decades-old institutions locals grew up
                            on — tiffin rooms, benne-dosa joints and colonial-era cafes. Tap one for
                            what to order, the story behind it, and directions.</p>
                    </div>
                    ${eatBar}
                    <div class="grid" id="grid-eats">${eatList}</div>
                </div>
            </section>

            <section class="section section--do" id="do">
                <div class="container">
                    <div class="section-head">
                        <h2 class="section-title">Things to do</h2>
                        <p class="section-sub">Hands-on experiences to fill a weekend — pottery and
                            candle workshops, pizza classes, lake kayaking, heritage cycling and
                            go-karting. Tap one for what to expect and where to find it.</p>
                    </div>
                    ${doBar}
                    <div class="grid" id="grid-do">${doList}</div>
                </div>
            </section>

            <section class="section" id="nearby">
                <div class="container">
                    <div class="section-head section-head--row">
                        <div>
                            <h2 class="section-title">Nearby Bengaluru</h2>
                            <p class="section-sub">Weekend and long-weekend getaways, sorted by distance from the city.</p>
                        </div>
                        <button class="near-btn" id="near-me-inline" type="button">
                            <i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i> Near me
                        </button>
                    </div>
                    <div class="filters" role="tablist" aria-label="Filter by type">${filters}</div>
                    <div class="grid" id="grid">${list}</div>
                </div>
            </section>`;

        // Getaway type chips (existing behaviour).
        view.querySelectorAll('.chip[data-type]').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeType = btn.dataset.type;
                renderHome();
                const nearby = document.getElementById('nearby');
                if (nearby) nearby.scrollIntoView({ behavior: 'instant' in window ? 'instant' : 'auto', block: 'start' });
            });
        });

        // Per-collection area + intent filters (native dropdowns). Re-render in place, keep anchored.
        function anchorTo(sec) {
            const target = document.getElementById(sec);
            if (target) target.scrollIntoView({ behavior: 'instant' in window ? 'instant' : 'auto', block: 'start' });
        }
        view.querySelectorAll('.select[data-filter-sec]').forEach((sel) => {
            sel.addEventListener('change', () => {
                const sec = sel.dataset.filterSec;
                const kind = sel.dataset.filterKind; // 'area' | 'intent'
                collFilter[sec][kind] = sel.value;
                renderHome();
                anchorTo(sec);
            });
        });
        view.querySelectorAll('.filter-clear[data-filter-sec]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const sec = btn.dataset.filterSec;
                collFilter[sec] = { area: 'all', intent: 'all', sort: 'default' };
                renderHome();
                anchorTo(sec);
            });
        });
    }

    function cardHTML(d) {
        const dist = F && F.lastPos && typeof d.lat === 'number'
            ? `<span class="card-dist">${Math.round(F.haversineKm(F.lastPos, { lat: d.lat, lng: d.lng }))} km away</span>`
            : `<span class="card-dist">${d.distanceKm} km</span>`;
        return `
            <a class="card" href="#/place/${d.slug}">
                <div class="card-media">
                    <img src="${esc(d.image)}" alt="${esc(d.name)}, ${esc(d.state)}"
                        loading="lazy" decoding="async"
                        onerror="this.classList.add('img-fallback')">
                    <span class="card-type">${esc(typeLabel(d.type))}</span>
                    ${favBtnHTML('place', d.slug)}
                    <span class="card-badges">${seasonBadgeHTML(d.seasons)}</span>
                </div>
                <div class="card-body">
                    <div class="card-head">
                        <h3>${esc(d.name)}</h3>
                        ${dist}
                    </div>
                    <p class="card-tag">${esc(d.tagline)}</p>
                    <p class="card-meta">
                        <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
                        Best: ${esc(d.bestMonths)}
                    </p>
                    ${tagPillsHTML(d.tags)}
                </div>
            </a>`;
    }

    function cityCardHTML(p) {
        return `
            <a class="card" href="#/city/${p.slug}">
                <div class="card-media">
                    <img src="${esc(p.image)}" alt="${esc(p.name)}, Bengaluru"
                        loading="lazy" decoding="async"
                        onerror="this.classList.add('img-fallback')">
                    <span class="card-type">${esc(p.category)}</span>
                    ${favBtnHTML('city', p.slug)}
                    <span class="card-badges">${openBadgeHTML(p)}</span>
                </div>
                <div class="card-body">
                    <div class="card-head">
                        <h3>${esc(p.name)}</h3>
                    </div>
                    <p class="card-tag">${esc(p.tagline)}</p>
                    <p class="card-meta">
                        <i class="fa-solid fa-clock" aria-hidden="true"></i>
                        Best: ${esc(p.bestTime)}
                    </p>
                    ${tagPillsHTML(p.tags)}
                </div>
            </a>`;
    }

    function templeCardHTML(t) {
        return `
            <a class="card" href="#/temple/${t.slug}">
                <div class="card-media">
                    <img src="${esc(t.image)}" alt="${esc(t.name)}, Bengaluru"
                        loading="lazy" decoding="async"
                        onerror="this.classList.add('img-fallback')">
                    <span class="card-type">${esc(t.category)}</span>
                    ${favBtnHTML('temple', t.slug)}
                </div>
                <div class="card-body">
                    <div class="card-head">
                        <h3>${esc(t.name)}</h3>
                    </div>
                    <p class="card-tag">${esc(t.tagline)}</p>
                    <p class="card-meta">
                        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                        ${esc(t.area)}
                    </p>
                    ${tagPillsHTML(t.tags)}
                </div>
            </a>`;
    }

    function cafeCardHTML(c) {
        const initial = esc((c.name || '?').trim().charAt(0).toUpperCase());
        return `
            <a class="card" href="#/cafe/${c.slug}">
                <div class="card-media cafe-media">
                    <span class="cafe-fallback" aria-hidden="true">
                        <span class="cafe-initial">${initial}</span>
                        <i class="fa-solid fa-mug-saucer cafe-cup"></i>
                    </span>
                    ${c.image ? `<img src="${esc(c.image)}" alt="${esc(c.name)}, ${esc(c.area)}"
                        loading="lazy" decoding="async"
                        onerror="this.style.display='none'">` : ''}
                    <span class="card-type">${esc(c.area)}</span>
                    ${favBtnHTML('cafe', c.slug)}
                </div>
                <div class="card-body">
                    <div class="card-head">
                        <h3>${esc(c.name)}</h3>
                    </div>
                    <p class="card-tag">${esc(c.tagline)}</p>
                    <p class="card-meta">
                        <i class="fa-solid fa-mug-hot" aria-hidden="true"></i>
                        ${esc(c.knownFor)}
                    </p>
                    ${tagPillsHTML(c.tags)}
                </div>
            </a>`;
    }

    function eatCardHTML(e) {
        const initial = esc((e.name || '?').trim().charAt(0).toUpperCase());
        return `
            <a class="card" href="#/eat/${e.slug}">
                <div class="card-media cafe-media">
                    <span class="cafe-fallback" aria-hidden="true">
                        <span class="cafe-initial">${initial}</span>
                        <i class="fa-solid fa-utensils cafe-cup"></i>
                    </span>
                    ${e.image ? `<img src="${esc(e.image)}" alt="${esc(e.name)}, ${esc(e.area)}"
                        loading="lazy" decoding="async"
                        onerror="this.style.display='none'">` : ''}
                    ${e.since ? `<span class="card-type card-type--since">Since ${esc(e.since)}</span>` : ''}
                    ${favBtnHTML('eat', e.slug)}
                    <span class="card-badges">${openBadgeHTML(e)}</span>
                </div>
                <div class="card-body">
                    <div class="card-head">
                        <h3>${esc(e.name)}</h3>
                        ${e.veg ? `<span class="card-dist veg-tag veg-tag--${e.veg === 'veg' ? 'veg' : 'mixed'}">${esc(e.veg)}</span>` : ''}
                    </div>
                    <p class="card-tag">${esc(e.tagline)}</p>
                    <p class="card-meta">
                        <i class="fa-solid fa-star" aria-hidden="true"></i>
                        ${esc(e.signature)}
                    </p>
                    ${tagPillsHTML(e.tags)}
                </div>
            </a>`;
    }

    function activityCardHTML(a) {
        const initial = esc((a.name || '?').trim().charAt(0).toUpperCase());
        return `
            <a class="card" href="#/do/${a.slug}">
                <div class="card-media cafe-media">
                    <span class="cafe-fallback" aria-hidden="true">
                        <span class="cafe-initial">${initial}</span>
                        <i class="fa-solid fa-palette cafe-cup"></i>
                    </span>
                    ${a.image ? `<img src="${esc(a.image)}" alt="${esc(a.name)} in Bengaluru"
                        loading="lazy" decoding="async"
                        onerror="this.style.display='none'">` : ''}
                    <span class="card-type">${esc(a.category)}</span>
                    ${favBtnHTML('do', a.slug)}
                </div>
                <div class="card-body">
                    <div class="card-head">
                        <h3>${esc(a.name)}</h3>
                        ${a.duration ? `<span class="card-dist">${esc(a.duration)}</span>` : ''}
                    </div>
                    <p class="card-tag">${esc(a.tagline)}</p>
                    <p class="card-meta">
                        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                        ${esc(a.area)}
                    </p>
                    ${tagPillsHTML(a.tags)}
                </div>
            </a>`;
    }

    /* ---------- detail view ---------- */

    function renderDetail(slug) {
        const d = bySlug(slug);
        if (!d) { location.hash = '#/'; return; }

        const reach = [
            { icon: 'fa-plane', label: 'By air', text: d.howToReach.flight },
            { icon: 'fa-train', label: 'By train', text: d.howToReach.train },
            { icon: 'fa-bus', label: 'By bus', text: d.howToReach.bus },
            { icon: 'fa-car', label: 'By road', text: d.howToReach.road },
        ].filter((r) => r.text).map((r) => `
            <li>
                <i class="fa-solid ${r.icon}" aria-hidden="true"></i>
                <div><strong>${r.label}</strong><span>${esc(r.text)}</span></div>
            </li>`).join('');

        const months = MONTHS.map((m) => `
            <span class="month ${d.seasons.includes(m) ? 'is-good' : ''}">${MONTH_LABEL[m]}</span>`
        ).join('');

        const cautions = d.precautions.map((p) => `<li>${esc(p)}</li>`).join('');

        const links = bookingLinks(d, ORIGIN).map((l) => `
            <a class="book-btn" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">
                <span class="book-btn-top">
                    <i class="fa-solid ${l.icon}" aria-hidden="true"></i> ${esc(l.label)}
                    <i class="fa-solid fa-arrow-up-right-from-square book-ext" aria-hidden="true"></i>
                </span>
                <span class="book-note">${esc(l.note)}</span>
            </a>`).join('');

        view.innerHTML = `
            <article class="detail">
                <div class="detail-hero">
                    <img src="${esc(d.image)}" alt="${esc(d.name)}, ${esc(d.state)}"
                        decoding="async" onerror="this.classList.add('img-fallback')">
                    <div class="detail-hero-overlay"></div>
                    <div class="container detail-hero-inner">
                        <a class="back" href="#/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> All places</a>
                        <span class="detail-type">${esc(typeLabel(d.type))}</span>
                        <h1>${esc(d.name)}${d.also ? ` <small>(${esc(d.also)})</small>` : ''}</h1>
                        <p class="detail-tag">${esc(d.tagline)}</p>
                        <ul class="detail-facts">
                            <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${esc(d.state)}</li>
                            <li><i class="fa-solid fa-route" aria-hidden="true"></i> ${d.distanceKm} km from ${esc(ORIGIN.city)}</li>
                            <li><i class="fa-solid fa-clock" aria-hidden="true"></i> ${esc(d.driveHours)} hrs by road</li>
                        </ul>
                        ${detailActionsHTML('place', d.slug, d.name)}
                    </div>
                </div>

                <div class="container detail-body">
                    ${tagPillsHTML(d.tags)}
                    ${bestForHTML(d)}
                    ${listenBtnHTML(d)}
                    <section class="block">
                        <h2>Overview</h2>
                        <p>${esc(d.description)}</p>
                    </section>

                    <section class="block">
                        <h2>How to reach</h2>
                        <ul class="reach">${reach}</ul>
                    </section>

                    <section class="block">
                        <h2>Best time to visit</h2>
                        <p class="best-line">${esc(d.bestMonths)}</p>
                        <div class="months" aria-label="Recommended months highlighted">${months}</div>
                    </section>

                    <section class="block">
                        <h2>Precautions &amp; tips</h2>
                        <ul class="cautions">${cautions}</ul>
                    </section>

                    ${eduBlocksHTML(d)}

                    <section class="block book">
                        <h2>Book your trip</h2>
                        <p class="book-intro">One tap through to MakeMyTrip for each leg. Ooruly doesn't
                            handle the booking — it just takes you to the right place to make it.</p>
                        <div class="book-grid">${links}</div>
                    </section>
                </div>
            </article>`;

        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- city / temple detail view ---------- */
    /* Shared renderer for the Bengaluru "attraction" model (city sights and temples share fields).
       backHref / backLabel point the back link at whichever section the item came from. */

    function renderCityDetail(slug) {
        renderAttractionDetail(byCitySlug(slug), '#city', 'Inside Bengaluru', 'city');
    }

    function renderTempleDetail(slug) {
        renderAttractionDetail(byTempleSlug(slug), '#temples', 'Temples', 'temple');
    }

    function renderAttractionDetail(p, backHref, backLabel, key) {
        if (!p) { location.hash = '#/'; return; }

        const mapsUrl = 'https://www.google.com/maps/search/?api=1&query='
            + encodeURIComponent(p.maps || `${p.name}, Bengaluru`);

        const highlights = (p.highlights || []).map((h) => `<li>${esc(h)}</li>`).join('');

        const reach = [
            { icon: 'fa-train-subway', label: 'By Metro', text: p.gettingThere && p.gettingThere.metro },
            { icon: 'fa-car', label: 'By road', text: p.gettingThere && p.gettingThere.road },
        ].filter((r) => r.text).map((r) => `
            <li>
                <i class="fa-solid ${r.icon}" aria-hidden="true"></i>
                <div><strong>${r.label}</strong><span>${esc(r.text)}</span></div>
            </li>`).join('');

        const tips = (p.tips || []).map((t) => `<li>${esc(t)}</li>`).join('');

        view.innerHTML = `
            <article class="detail">
                <div class="detail-hero">
                    <img src="${esc(p.image)}" alt="${esc(p.name)}, Bengaluru"
                        decoding="async" onerror="this.classList.add('img-fallback')">
                    <div class="detail-hero-overlay"></div>
                    <div class="container detail-hero-inner">
                        <a class="back" href="${esc(backHref)}"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> ${esc(backLabel)}</a>
                        <span class="detail-type">${esc(p.category)}</span>
                        <h1>${esc(p.name)}</h1>
                        <p class="detail-tag">${esc(p.tagline)}</p>
                        <ul class="detail-facts">
                            <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${esc(p.area)}</li>
                            <li><i class="fa-solid fa-clock" aria-hidden="true"></i> Best time: ${esc(p.bestTime)}</li>
                        </ul>
                        ${detailActionsHTML(key, p.slug, p.name)}
                    </div>
                </div>

                <div class="container detail-body">
                    ${tagPillsHTML(p.tags)}
                    ${bestForHTML(p)}
                    ${listenBtnHTML(p)}
                    <section class="block">
                        <h2>Overview</h2>
                        <p>${esc(p.description)}</p>
                    </section>

                    ${highlights ? `
                    <section class="block">
                        <h2>What to see</h2>
                        <ul class="cautions cautions--plain">${highlights}</ul>
                    </section>` : ''}

                    ${reach ? `
                    <section class="block">
                        <h2>Getting there</h2>
                        <ul class="reach">${reach}</ul>
                    </section>` : ''}

                    ${p.entry ? `
                    <section class="block">
                        <h2>Entry &amp; timings</h2>
                        <p class="best-line">${esc(p.entry)}</p>
                    </section>` : ''}

                    ${tips ? `
                    <section class="block">
                        <h2>Tips</h2>
                        <ul class="cautions">${tips}</ul>
                    </section>` : ''}

                    ${eduBlocksHTML(p)}

                    ${nearbyHTML(key, p.slug, 'Nearby places')}

                    <section class="block book">
                        <h2>Get directions</h2>
                        <p class="book-intro">Open the location in Google Maps for live directions
                            from wherever you are in the city.</p>
                        <div class="book-grid">
                            <a class="book-btn" href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer">
                                <span class="book-btn-top">
                                    <i class="fa-solid fa-diamond-turn-right" aria-hidden="true"></i> Directions
                                    <i class="fa-solid fa-arrow-up-right-from-square book-ext" aria-hidden="true"></i>
                                </span>
                                <span class="book-note">Open ${esc(p.name)} in Google Maps</span>
                            </a>
                        </div>
                    </section>
                </div>
            </article>`;

        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- cafe detail view ---------- */

    function renderCafeDetail(slug) {
        const c = byCafeSlug(slug);
        if (!c) { location.hash = '#/'; return; }

        const mapsUrl = 'https://www.google.com/maps/search/?api=1&query='
            + encodeURIComponent(c.maps || `${c.name}, Bengaluru`);

        const initial = esc((c.name || '?').trim().charAt(0).toUpperCase());
        const order = (c.order || []).map((o) => `<li>${esc(o)}</li>`).join('');
        const tips = (c.tips || []).map((t) => `<li>${esc(t)}</li>`).join('');

        const facts = [
            { icon: 'fa-location-dot', text: c.area },
            { icon: 'fa-mug-hot', text: c.knownFor },
            { icon: 'fa-clock', text: c.bestTime ? `Best time: ${c.bestTime}` : '' },
            { icon: 'fa-wallet', text: c.priceHint },
        ].filter((f) => f.text).map((f) =>
            `<li><i class="fa-solid ${f.icon}" aria-hidden="true"></i> ${esc(f.text)}</li>`).join('');

        view.innerHTML = `
            <article class="detail">
                <div class="detail-hero detail-hero--cafe">
                    <div class="cafe-hero-art" aria-hidden="true">
                        <span class="cafe-hero-initial">${initial}</span>
                        <i class="fa-solid fa-mug-saucer"></i>
                    </div>
                    ${c.image ? `<img class="detail-hero-img" src="${esc(c.image)}"
                        alt="${esc(c.name)}, ${esc(c.area)}" decoding="async"
                        onerror="this.style.display='none'">` : ''}
                    <div class="detail-hero-overlay"></div>
                    <div class="container detail-hero-inner">
                        <a class="back" href="#cafes"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Hidden cafes</a>
                        <span class="detail-type">Cafe</span>
                        <h1>${esc(c.name)}</h1>
                        <p class="detail-tag">${esc(c.tagline)}</p>
                        <ul class="detail-facts">${facts}</ul>
                        ${detailActionsHTML('cafe', c.slug, c.name)}
                    </div>
                </div>

                <div class="container detail-body">
                    ${tagPillsHTML(c.tags)}
                    ${bestForHTML(c)}
                    ${listenBtnHTML(c)}
                    <section class="block">
                        <h2>The vibe</h2>
                        <p>${esc(c.description)}</p>
                    </section>

                    ${order ? `
                    <section class="block">
                        <h2>What to order</h2>
                        <ul class="cautions cautions--plain">${order}</ul>
                    </section>` : ''}

                    ${tips ? `
                    <section class="block">
                        <h2>Good to know</h2>
                        <ul class="cautions">${tips}</ul>
                    </section>` : ''}

                    ${eduBlocksHTML(c)}

                    ${nearbyHTML('cafe', c.slug, 'Nearby places')}

                    <section class="block book">
                        <h2>Get directions</h2>
                        <p class="book-intro">Open the cafe in Google Maps for live directions from
                            wherever you are in the city.</p>
                        <div class="book-grid">
                            <a class="book-btn" href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer">
                                <span class="book-btn-top">
                                    <i class="fa-solid fa-diamond-turn-right" aria-hidden="true"></i> Directions
                                    <i class="fa-solid fa-arrow-up-right-from-square book-ext" aria-hidden="true"></i>
                                </span>
                                <span class="book-note">Open ${esc(c.name)} in Google Maps</span>
                            </a>
                        </div>
                    </section>
                </div>
            </article>`;

        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- eatery detail view ---------- */

    function renderEatDetail(slug) {
        const e = byEatSlug(slug);
        if (!e) { location.hash = '#/'; return; }

        const mapsUrl = 'https://www.google.com/maps/search/?api=1&query='
            + encodeURIComponent(e.maps || `${e.name}, Bengaluru`);

        const initial = esc((e.name || '?').trim().charAt(0).toUpperCase());
        const mustTry = (e.mustTry || []).map((m) => `<li>${esc(m)}</li>`).join('');
        const tips = (e.tips || []).map((t) => `<li>${esc(t)}</li>`).join('');

        const facts = [
            { icon: 'fa-location-dot', text: e.area },
            { icon: 'fa-clock-rotate-left', text: e.since ? `Since ${e.since}` : '' },
            { icon: 'fa-star', text: e.signature },
            { icon: 'fa-wallet', text: e.priceHint },
        ].filter((f) => f.text).map((f) =>
            `<li><i class="fa-solid ${f.icon}" aria-hidden="true"></i> ${esc(f.text)}</li>`).join('');

        view.innerHTML = `
            <article class="detail">
                <div class="detail-hero detail-hero--cafe">
                    <div class="cafe-hero-art" aria-hidden="true">
                        <span class="cafe-hero-initial">${initial}</span>
                        <i class="fa-solid fa-utensils"></i>
                    </div>
                    ${e.image ? `<img class="detail-hero-img" src="${esc(e.image)}"
                        alt="${esc(e.name)}, ${esc(e.area)}" decoding="async"
                        onerror="this.style.display='none'">` : ''}
                    <div class="detail-hero-overlay"></div>
                    <div class="container detail-hero-inner">
                        <a class="back" href="#eats"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Authentic eats</a>
                        <span class="detail-type">Iconic eatery</span>
                        <h1>${esc(e.name)}</h1>
                        <p class="detail-tag">${esc(e.tagline)}</p>
                        <ul class="detail-facts">${facts}</ul>
                        ${detailActionsHTML('eat', e.slug, e.name)}
                    </div>
                </div>

                <div class="container detail-body">
                    ${tagPillsHTML(e.tags)}
                    ${bestForHTML(e)}
                    ${listenBtnHTML(e)}
                    <section class="block">
                        <h2>The story</h2>
                        <p>${esc(e.description)}</p>
                    </section>

                    ${mustTry ? `
                    <section class="block">
                        <h2>What to order</h2>
                        <ul class="cautions cautions--plain">${mustTry}</ul>
                    </section>` : ''}

                    ${tips ? `
                    <section class="block">
                        <h2>Good to know</h2>
                        <ul class="cautions">${tips}</ul>
                    </section>` : ''}

                    ${eduBlocksHTML(e)}

                    ${nearbyHTML('eat', e.slug, 'Nearby places')}

                    <section class="block book">
                        <h2>Get directions</h2>
                        <p class="book-intro">Open the eatery in Google Maps for live directions from
                            wherever you are in the city.</p>
                        <div class="book-grid">
                            <a class="book-btn" href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer">
                                <span class="book-btn-top">
                                    <i class="fa-solid fa-diamond-turn-right" aria-hidden="true"></i> Directions
                                    <i class="fa-solid fa-arrow-up-right-from-square book-ext" aria-hidden="true"></i>
                                </span>
                                <span class="book-note">Open ${esc(e.name)} in Google Maps</span>
                            </a>
                        </div>
                    </section>
                </div>
            </article>`;

        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- activity detail view ---------- */

    function renderActivityDetail(slug) {
        const a = byActivitySlug(slug);
        if (!a) { location.hash = '#/'; return; }

        const mapsUrl = 'https://www.google.com/maps/search/?api=1&query='
            + encodeURIComponent(a.maps || `${a.name}, Bengaluru`);

        const initial = esc((a.name || '?').trim().charAt(0).toUpperCase());
        const steps = (a.whatYoullDo || []).map((s) => `<li>${esc(s)}</li>`).join('');
        const tips = (a.tips || []).map((t) => `<li>${esc(t)}</li>`).join('');

        const facts = [
            { icon: 'fa-tag', text: a.category },
            { icon: 'fa-location-dot', text: a.area },
            { icon: 'fa-hourglass-half', text: a.duration },
            { icon: 'fa-circle-check', text: a.priceHint },
        ].filter((f) => f.text).map((f) =>
            `<li><i class="fa-solid ${f.icon}" aria-hidden="true"></i> ${esc(f.text)}</li>`).join('');

        view.innerHTML = `
            <article class="detail">
                <div class="detail-hero detail-hero--cafe">
                    <div class="cafe-hero-art" aria-hidden="true">
                        <span class="cafe-hero-initial">${initial}</span>
                        <i class="fa-solid fa-palette"></i>
                    </div>
                    ${a.image ? `<img class="detail-hero-img" src="${esc(a.image)}"
                        alt="${esc(a.name)} in Bengaluru" decoding="async"
                        onerror="this.style.display='none'">` : ''}
                    <div class="detail-hero-overlay"></div>
                    <div class="container detail-hero-inner">
                        <a class="back" href="#do"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Things to do</a>
                        <span class="detail-type">${esc(a.category)}</span>
                        <h1>${esc(a.name)}</h1>
                        <p class="detail-tag">${esc(a.tagline)}</p>
                        <ul class="detail-facts">${facts}</ul>
                        ${detailActionsHTML('do', a.slug, a.name)}
                    </div>
                </div>

                <div class="container detail-body">
                    ${tagPillsHTML(a.tags)}
                    ${bestForHTML(a)}
                    ${listenBtnHTML(a)}
                    <section class="block">
                        <h2>Overview</h2>
                        <p>${esc(a.description)}</p>
                    </section>

                    ${steps ? `
                    <section class="block">
                        <h2>What you'll do</h2>
                        <ul class="cautions cautions--plain">${steps}</ul>
                    </section>` : ''}

                    ${tips ? `
                    <section class="block">
                        <h2>Good to know</h2>
                        <ul class="cautions">${tips}</ul>
                    </section>` : ''}

                    ${eduBlocksHTML(a)}

                    ${nearbyHTML('do', a.slug, 'Nearby places')}

                    <section class="block book">
                        <h2>Find it near you</h2>
                        <p class="book-intro">Ooruly points you to the kind of experience, not one
                            operator — search Google Maps for current studios, timings and bookings.</p>
                        <div class="book-grid">
                            <a class="book-btn" href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer">
                                <span class="book-btn-top">
                                    <i class="fa-solid fa-magnifying-glass-location" aria-hidden="true"></i> Search on Maps
                                    <i class="fa-solid fa-arrow-up-right-from-square book-ext" aria-hidden="true"></i>
                                </span>
                                <span class="book-note">Find ${esc(a.name)} spots in Bengaluru</span>
                            </a>
                        </div>
                    </section>
                </div>
            </article>`;

        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- educational modules (all optional, render only when data exists) ---------- */

    /* "Did you know?" — 2-3 bite-sized, surprising facts. */
    function didYouKnowHTML(facts) {
        if (!Array.isArray(facts) || !facts.length) return '';
        const cards = facts.map((f) =>
            `<li class="fact-card"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i><span>${esc(f)}</span></li>`
        ).join('');
        return `
            <section class="block">
                <h2>Did you know?</h2>
                <ul class="fact-grid">${cards}</ul>
            </section>`;
    }

    /* History / timeline — array of { year, event } (year optional). Renders as a vertical timeline. */
    function historyHTML(history) {
        if (!Array.isArray(history) || !history.length) return '';
        const rows = history.map((h) => `
            <li class="timeline-item">
                ${h.year ? `<span class="timeline-year">${esc(String(h.year))}</span>` : '<span class="timeline-year timeline-year--dot"></span>'}
                <span class="timeline-event">${esc(h.event || h)}</span>
            </li>`).join('');
        return `
            <section class="block">
                <h2>A little history</h2>
                <ol class="timeline">${rows}</ol>
            </section>`;
    }

    /* Culture & etiquette — how to visit respectfully. */
    function etiquetteHTML(notes) {
        if (!Array.isArray(notes) || !notes.length) return '';
        const items = notes.map((n) => `<li>${esc(n)}</li>`).join('');
        return `
            <section class="block block--etiquette">
                <h2><i class="fa-solid fa-hands-praying" aria-hidden="true"></i> Visiting respectfully</h2>
                <ul class="cautions cautions--etiquette">${items}</ul>
            </section>`;
    }

    /* Local words — vocabulary of the place: array of { term, meaning }. */
    function localWordsHTML(words) {
        if (!Array.isArray(words) || !words.length) return '';
        const rows = words.map((w) => `
            <div class="word-card">
                <span class="word-term">${esc(w.term)}</span>
                <span class="word-meaning">${esc(w.meaning)}</span>
            </div>`).join('');
        return `
            <section class="block">
                <h2>Words to know</h2>
                <div class="word-grid">${rows}</div>
            </section>`;
    }

    /* Responsible / sustainable travel tips — "travel light, travel right". */
    function responsibleHTML(tips) {
        if (!Array.isArray(tips) || !tips.length) return '';
        const items = tips.map((t) => `<li>${esc(t)}</li>`).join('');
        return `
            <section class="block block--responsible">
                <h2><i class="fa-solid fa-leaf" aria-hidden="true"></i> Travel light, travel right</h2>
                <ul class="cautions cautions--responsible">${items}</ul>
            </section>`;
    }

    /* "Best for" + effort labels — an at-a-glance educational chip row. `bestFor` is an array of
       short audience labels; `effort` is a single short label. */
    function bestForHTML(item) {
        const bestFor = Array.isArray(item.bestFor) ? item.bestFor : [];
        const effort = item.effort;
        if (!bestFor.length && !effort) return '';
        const chips = bestFor.map((b) =>
            `<span class="tag-pill"><i class="fa-solid fa-user-check" aria-hidden="true"></i> ${esc(b)}</span>`).join('');
        const effortChip = effort
            ? `<span class="tag-pill tag-pill--effort"><i class="fa-solid fa-gauge-high" aria-hidden="true"></i> ${esc(effort)}</span>`
            : '';
        return `
            <section class="block block--bestfor">
                <div class="bestfor-row">
                    ${bestFor.length ? `<span class="bestfor-label">Good for</span> ${chips}` : ''}
                    ${effortChip}
                </div>
            </section>`;
    }

    /* "Fun for kids" — age-appropriate notes and what children will enjoy. */
    function forKidsHTML(notes) {
        if (!Array.isArray(notes) || !notes.length) return '';
        const items = notes.map((n) => `<li>${esc(n)}</li>`).join('');
        return `
            <section class="block block--kids">
                <h2><i class="fa-solid fa-child-reaching" aria-hidden="true"></i> Fun for kids</h2>
                <ul class="cautions cautions--kids">${items}</ul>
            </section>`;
    }

    /* Further reading — credible external sources: array of { label, url }. */
    function sourcesHTML(sources) {
        if (!Array.isArray(sources) || !sources.length) return '';
        const items = sources.map((s) =>
            `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> ${esc(s.label)}
            </a></li>`).join('');
        return `
            <section class="block block--sources">
                <h2>Learn more</h2>
                <ul class="sources-list">${items}</ul>
            </section>`;
    }

    /* "Listen to this place" — narrates the description (plus a fact or two) via speech synthesis.
       Renders nothing if the browser can't speak. The button toggles play/stop and is wired via
       the delegated view click handler (data-listen carries the text). */
    function listenBtnHTML(item) {
        if (!F || !F.canSpeak() || !item || !item.description) return '';
        // Build a short narration: name + description + up to 2 "did you know" facts.
        let text = (item.name ? item.name + '. ' : '') + item.description;
        if (Array.isArray(item.didYouKnow) && item.didYouKnow.length) {
            text += ' Did you know? ' + item.didYouKnow.slice(0, 2).join(' ');
        }
        const enc = encodeURIComponent(text);
        return `
            <button class="listen-btn" type="button" data-listen="${enc}" aria-live="polite">
                <i class="fa-solid fa-volume-high" aria-hidden="true"></i>
                <span class="listen-label">Listen to this place</span>
            </button>`;
    }

    /* Convenience: all educational blocks in a consistent order for a detail page. bestForHTML and
       listenBtnHTML are rendered separately near the top of the page (see each detail view). */
    function eduBlocksHTML(item) {
        if (!item) return '';
        return historyHTML(item.history)
            + didYouKnowHTML(item.didYouKnow)
            + localWordsHTML(item.localWords)
            + forKidsHTML(item.forKids)
            + etiquetteHTML(item.etiquette)
            + responsibleHTML(item.responsible)
            + sourcesHTML(item.sources);
    }

    /* Cross-linking block for detail pages: the closest few places to this one, across the whole
       guide. Reuses the generic entry card. Renders nothing if the place has no coordinates. */
    function nearbyHTML(key, slug, headline) {
        if (!F) return '';
        const items = F.nearby(key, slug, { limit: 4 });
        if (!items.length) return '';
        const cards = items.map((e) =>
            `<a class="near-card" href="${esc(e.route)}">
                <span class="near-card-icon"><i class="fa-solid ${esc(e.icon)}" aria-hidden="true"></i></span>
                <span class="near-card-text">
                    <span class="near-card-name">${esc(e.name)}</span>
                    <span class="near-card-meta">${esc(e.label)} · ${e.km} km away</span>
                </span>
                <i class="fa-solid fa-arrow-right near-card-go" aria-hidden="true"></i>
            </a>`).join('');
        return `
            <section class="block">
                <h2>${esc(headline || 'Nearby')}</h2>
                <div class="near-list">${cards}</div>
            </section>`;
    }

    /* ---------- generic card for saved/plan/search (works across collections) ---------- */
    function entryCardHTML(e, opts) {
        opts = opts || {};
        const item = e.item || {};
        const img = item.image;
        const initial = esc((e.name || '?').trim().charAt(0).toUpperCase());
        const media = img
            ? `<div class="card-media"><img src="${esc(img)}" alt="${esc(e.name)}"
                    loading="lazy" decoding="async" onerror="this.classList.add('img-fallback')">
                    <span class="card-type">${esc(e.label)}</span>${favBtnHTML(e.key, e.slug)}</div>`
            : `<div class="card-media cafe-media">
                    <span class="cafe-fallback" aria-hidden="true">
                        <span class="cafe-initial">${initial}</span>
                        <i class="fa-solid ${esc(e.icon)} cafe-cup"></i>
                    </span>
                    <span class="card-type">${esc(e.label)}</span>${favBtnHTML(e.key, e.slug)}</div>`;
        const controls = opts.planControls ? `
            <div class="plan-controls">
                <button class="icon-btn plan-move" data-plan-move="up" data-plan-id="${esc(e.id)}" aria-label="Move up"><i class="fa-solid fa-arrow-up"></i></button>
                <button class="icon-btn plan-move" data-plan-move="down" data-plan-id="${esc(e.id)}" aria-label="Move down"><i class="fa-solid fa-arrow-down"></i></button>
                <button class="icon-btn plan-remove" data-plan-id="${esc(e.id)}" aria-label="Remove from plan"><i class="fa-solid fa-xmark"></i></button>
            </div>` : '';
        return `
            <div class="card card--entry">
                <a class="card-link" href="${esc(e.route)}" aria-label="${esc(e.name)}">${media}</a>
                <div class="card-body">
                    <div class="card-head"><h3><a href="${esc(e.route)}">${esc(e.name)}</a></h3></div>
                    <p class="card-tag">${esc(e.tagline)}</p>
                    <p class="card-meta"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${esc(e.area || e.category || '')}</p>
                    ${controls}
                </div>
            </div>`;
    }

    /* ---------- saved / favourites view ---------- */
    function renderSaved() {
        const entries = F ? F.favEntries() : [];
        const body = entries.length
            ? `<div class="grid">${entries.map((e) => entryCardHTML(e)).join('')}</div>`
            : `<div class="empty-state">
                    <i class="fa-regular fa-heart" aria-hidden="true"></i>
                    <h2>Nothing saved yet</h2>
                    <p>Tap the heart on any place, cafe, eatery or getaway to save it here for later.</p>
                    <a class="btn btn-primary" href="#/">Browse the guide</a>
               </div>`;
        view.innerHTML = `
            <section class="section section--page">
                <div class="container">
                    <div class="section-head page-head">
                        <a class="back back--inline" href="#/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Home</a>
                        <h1 class="section-title">Saved places</h1>
                        <p class="section-sub">Your shortlist, kept on this device.</p>
                    </div>
                    ${body}
                </div>
            </section>`;
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- weekend plan / itinerary view ---------- */
    function renderPlan() {
        const entries = F ? F.planEntries() : [];
        const mapsUrl = entries.length
            ? 'https://www.google.com/maps/dir/' + entries.map((e) =>
                encodeURIComponent((e.item && e.item.maps) || (e.name + ', Bengaluru'))).join('/')
            : '';
        const body = entries.length
            ? `<div class="plan-actions">
                    <button class="btn btn-primary" id="plan-share"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Share this plan</button>
                    <a class="btn btn-ghost" href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-route" aria-hidden="true"></i> Route on Maps</a>
               </div>
               <ol class="grid plan-grid">${entries.map((e) => `<li>${entryCardHTML(e, { planControls: true })}</li>`).join('')}</ol>`
            : `<div class="empty-state">
                    <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                    <h2>Your plan is empty</h2>
                    <p>Open any place and tap "Add to plan" to build a day out. Reorder them here and share the plan as a link.</p>
                    <a class="btn btn-primary" href="#/">Start planning</a>
               </div>`;
        view.innerHTML = `
            <section class="section section--page">
                <div class="container">
                    <div class="section-head page-head">
                        <a class="back back--inline" href="#/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Home</a>
                        <h1 class="section-title">Weekend plan</h1>
                        <p class="section-sub">Line up your day, reorder the stops, then share it or open the whole route in Maps.</p>
                    </div>
                    ${body}
                </div>
            </section>`;
        const shareBtn = document.getElementById('plan-share');
        if (shareBtn) shareBtn.addEventListener('click', async () => {
            const url = F.planShareUrl();
            const res = await F.share({ title: 'My Bengaluru plan — Ooruly', text: 'Here\'s a day out I planned on Ooruly', url });
            toast(res === 'copied' ? 'Plan link copied' : res === 'shared' ? 'Shared' : 'Could not share');
        });
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- ready-made itineraries ---------- */
    function itinerariesData() {
        return typeof ITINERARIES !== 'undefined' ? ITINERARIES : [];
    }

    function itineraryCardHTML(it) {
        const stops = (it.stops || []).map((id) => {
            const [key, slug] = id.split(':');
            return F ? F.lookup(key, slug) : null;
        }).filter(Boolean);
        const preview = stops.slice(0, 4).map((e) =>
            `<li><i class="fa-solid ${esc(e.icon)}" aria-hidden="true"></i> ${esc(e.name)}</li>`).join('');
        const more = stops.length > 4 ? `<li class="itin-more">+${stops.length - 4} more</li>` : '';
        return `
            <article class="itin-card">
                <div class="itin-head">
                    <span class="itin-icon"><i class="fa-solid ${esc(it.icon || 'fa-route')}" aria-hidden="true"></i></span>
                    <div>
                        <h3>${esc(it.title)}</h3>
                        <span class="itin-meta">${esc(it.duration || '')} · ${stops.length} stops</span>
                    </div>
                </div>
                <p class="itin-summary">${esc(it.summary || '')}</p>
                <ul class="itin-stops">${preview}${more}</ul>
                <div class="itin-actions">
                    <button class="btn btn-primary btn-sm" type="button" data-use-itin="${esc(it.slug)}">
                        <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Use this plan
                    </button>
                    <a class="btn btn-ghost btn-sm" href="#/plan/${encodeURIComponent((it.stops || []).join(','))}">Preview</a>
                </div>
            </article>`;
    }

    function renderItineraries() {
        const list = itinerariesData();
        const body = list.length
            ? `<div class="grid itin-grid">${list.map(itineraryCardHTML).join('')}</div>`
            : `<div class="empty-state"><i class="fa-solid fa-route" aria-hidden="true"></i>
                    <h2>No itineraries yet</h2></div>`;
        view.innerHTML = `
            <section class="section section--page">
                <div class="container">
                    <div class="section-head page-head">
                        <a class="back back--inline" href="#/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Home</a>
                        <h1 class="section-title">Ready-Made Itineraries</h1>
                        <p class="section-sub">Curated day plans you can use as-is or tweak. "Use this plan"
                            drops all the stops into your weekend planner, where you can reorder, share, or
                            open the whole route in Maps.</p>
                    </div>
                    ${body}
                </div>
            </section>`;
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- themes / learning collections ---------- */
    function themesData() { return typeof THEMES !== 'undefined' ? THEMES : []; }
    function bySlugTheme(slug) { return themesData().find((t) => t.slug === slug); }

    function themeCardHTML(t) {
        const members = (t.members || []).map((id) => {
            const [key, slug] = id.split(':');
            return F ? F.lookup(key, slug) : null;
        }).filter(Boolean);
        return `
            <a class="itin-card theme-card" href="#/theme/${esc(t.slug)}">
                <div class="itin-head">
                    <span class="itin-icon"><i class="fa-solid ${esc(t.icon || 'fa-book-open')}" aria-hidden="true"></i></span>
                    <div>
                        <h3>${esc(t.title)}</h3>
                        <span class="itin-meta">${members.length} places</span>
                    </div>
                </div>
                <p class="itin-summary">${esc(t.blurb || '')}</p>
                <span class="theme-link">Explore this theme <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
            </a>`;
    }

    function renderThemes() {
        const list = themesData();
        const body = list.length
            ? `<div class="grid itin-grid">${list.map(themeCardHTML).join('')}</div>`
            : `<div class="empty-state"><i class="fa-solid fa-book-open" aria-hidden="true"></i><h2>No themes yet</h2></div>`;
        view.innerHTML = `
            <section class="section section--page">
                <div class="container">
                    <div class="section-head page-head">
                        <a class="back back--inline" href="#/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Home</a>
                        <h1 class="section-title">Themes to Explore</h1>
                        <p class="section-sub">Learn Bengaluru by the threads that run through it — dynasties,
                            faith, coffee and food. Each theme groups places by what you'll understand,
                            with a short primer and a curated list.</p>
                    </div>
                    ${body}
                </div>
            </section>`;
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    function renderThemeDetail(slug) {
        const t = bySlugTheme(slug);
        if (!t) { location.hash = '#/themes'; return; }
        const members = (t.members || []).map((id) => {
            const [key, s] = id.split(':');
            return F ? F.lookup(key, s) : null;
        }).filter(Boolean);
        const cards = members.map((e) => entryCardHTML(e)).join('');
        view.innerHTML = `
            <section class="section section--page">
                <div class="container">
                    <div class="section-head page-head">
                        <a class="back back--inline" href="#/themes"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> All themes</a>
                        <div class="theme-hero">
                            <span class="itin-icon theme-hero-icon"><i class="fa-solid ${esc(t.icon || 'fa-book-open')}" aria-hidden="true"></i></span>
                            <h1 class="section-title">${esc(t.title)}</h1>
                        </div>
                        <p class="theme-intro">${esc(t.intro || t.blurb || '')}</p>
                    </div>
                    <h2 class="theme-places-head">Places in this theme</h2>
                    <div class="grid">${cards}</div>
                    ${quizHTML(t)}
                </div>
            </section>`;
        wireQuiz();
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* Per-theme "test what you learned" quiz. `quiz` is an array of { q, options, answer } where
       answer is the index of the correct option. Interactive, no scoring backend. */
    function quizHTML(t) {
        const quiz = Array.isArray(t.quiz) ? t.quiz : [];
        if (!quiz.length) return '';
        const qs = quiz.map((item, qi) => {
            const opts = item.options.map((o, oi) => `
                <button class="quiz-opt" type="button" data-quiz-q="${qi}" data-quiz-opt="${oi}" data-quiz-answer="${item.answer}">
                    ${esc(o)}
                </button>`).join('');
            return `
                <li class="quiz-item" data-quiz-item="${qi}">
                    <p class="quiz-q">${esc(item.q)}</p>
                    <div class="quiz-opts">${opts}</div>
                    <p class="quiz-feedback" role="status" aria-live="polite"></p>
                </li>`;
        }).join('');
        return `
            <section class="quiz" aria-label="Test what you learned">
                <h2 class="theme-places-head"><i class="fa-solid fa-circle-question" aria-hidden="true"></i> Test what you learned</h2>
                <ol class="quiz-list">${qs}</ol>
            </section>`;
    }

    /* Wire quiz option clicks: mark correct/incorrect, lock the question once answered. */
    function wireQuiz() {
        view.querySelectorAll('.quiz-opt').forEach((btn) => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.quiz-item');
                if (!item || item.classList.contains('is-answered')) return;
                const chosen = Number(btn.dataset.quizOpt);
                const answer = Number(btn.dataset.quizAnswer);
                item.classList.add('is-answered');
                const feedback = item.querySelector('.quiz-feedback');
                item.querySelectorAll('.quiz-opt').forEach((o) => {
                    const oi = Number(o.dataset.quizOpt);
                    if (oi === answer) o.classList.add('is-correct');
                    else if (oi === chosen) o.classList.add('is-wrong');
                    o.disabled = true;
                });
                if (feedback) {
                    feedback.textContent = chosen === answer ? 'Correct!' : 'Not quite — the highlighted answer is right.';
                    feedback.classList.add(chosen === answer ? 'is-right' : 'is-wrong');
                }
            });
        });
    }

    /* ---------- glossary ---------- */
    function renderGlossary() {
        const list = typeof GLOSSARY !== 'undefined' ? GLOSSARY : [];
        const rows = list.slice().sort((a, b) => a.term.localeCompare(b.term)).map((g) => `
            <div class="glossary-row">
                <dt class="glossary-term">${esc(g.term)}</dt>
                <dd class="glossary-meaning">${esc(g.meaning)}</dd>
            </div>`).join('');
        view.innerHTML = `
            <section class="section section--page">
                <div class="container">
                    <div class="section-head page-head">
                        <a class="back back--inline" href="#/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Home</a>
                        <h1 class="section-title">Know the terms</h1>
                        <p class="section-sub">A quick reference for the words you'll meet across the guide —
                            temple rituals, architecture and Bengaluru's food.</p>
                    </div>
                    <dl class="glossary">${rows}</dl>
                </div>
            </section>`;
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- map view (Leaflet + OpenStreetMap, loaded on demand) ---------- */
    let mapInstance = null;
    function renderMap() {
        view.innerHTML = `
            <section class="section section--page">
                <div class="container">
                    <div class="section-head page-head">
                        <a class="back back--inline" href="#/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Home</a>
                        <h1 class="section-title">Map</h1>
                        <p class="section-sub">Everything in the guide, pinned. Tap a marker to open the place.</p>
                    </div>
                    <div id="ooruly-map" class="map-canvas" role="application" aria-label="Map of places"></div>
                </div>
            </section>`;
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
        ensureLeaflet().then(() => initMap()).catch(() => {
            const el = document.getElementById('ooruly-map');
            if (el) el.innerHTML = '<p class="map-fail">Map couldn\'t load. Check your connection and try again.</p>';
        });
    }

    function initMap() {
        const el = document.getElementById('ooruly-map');
        if (!el || typeof L === 'undefined') return;
        if (mapInstance) { mapInstance.remove(); mapInstance = null; }
        mapInstance = L.map(el, { scrollWheelZoom: false }).setView([12.9716, 77.5946], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance);

        const idx = F ? F.buildIndex() : [];
        const bounds = [];
        idx.forEach((e) => {
            const item = e.item || {};
            if (typeof item.lat !== 'number' || typeof item.lng !== 'number') return;
            const m = L.marker([item.lat, item.lng]).addTo(mapInstance);
            m.bindPopup(`<strong>${esc(e.name)}</strong><br>${esc(e.area || e.label)}<br>
                <a href="${esc(e.route)}">Open in Ooruly</a>`);
            bounds.push([item.lat, item.lng]);
        });
        if (bounds.length) mapInstance.fitBounds(bounds, { padding: [40, 40] });
    }

    let leafletPromise = null;
    function ensureLeaflet() {
        if (typeof L !== 'undefined') return Promise.resolve();
        if (leafletPromise) return leafletPromise;
        leafletPromise = new Promise((resolve, reject) => {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(css);
            const s = document.createElement('script');
            s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
        return leafletPromise;
    }

    /* ---------- Kannada phrasebook view ---------- */
    function renderPhrases() {
        const list = typeof PHRASES !== 'undefined' ? PHRASES : [];
        const groups = list.map((g) => `
            <section class="phrase-group">
                <h2>${esc(g.group)}</h2>
                <div class="phrase-list">
                    ${g.items.map((p) => `
                        <div class="phrase-row">
                            <span class="phrase-en">${esc(p.en)}</span>
                            <span class="phrase-roman">${esc(p.roman)}</span>
                            <span class="phrase-kn" lang="kn">${esc(p.kn)}</span>
                        </div>`).join('')}
                </div>
            </section>`).join('');
        view.innerHTML = `
            <section class="section section--page">
                <div class="container">
                    <div class="section-head page-head">
                        <a class="back back--inline" href="#/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Home</a>
                        <h1 class="section-title">Kannada phrases</h1>
                        <p class="section-sub">A few words go a long way. Say the middle column out loud; show the Kannada if needed.</p>
                    </div>
                    <div class="phrase-wrap">${groups}</div>
                </div>
            </section>`;
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- tiny toast ---------- */
    let toastTimer = null;
    function toast(msg) {
        let el = document.getElementById('ooruly-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ooruly-toast';
            el.className = 'toast';
            el.setAttribute('role', 'status');
            el.setAttribute('aria-live', 'polite');
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
    }

    /* ---------- router ---------- */

    // Section anchors on the home page should scroll, not re-render the home view.
    const HOME_ANCHORS = ['#city', '#temples', '#cafes', '#eats', '#do', '#nearby'];

    let currentView = null; // 'home' | 'place' | 'city' | 'cafe' | 'eat' | 'do'

    function route() {
        const hash = location.hash || '#/';

        // Stop any audio narration when navigating to a new view.
        if (F && F.stopSpeech) F.stopSpeech();

        // In-page anchor while already on the home view: just scroll to the section.
        if (HOME_ANCHORS.includes(hash)) {
            if (currentView !== 'home') { renderHome(); currentView = 'home'; }
            const target = document.getElementById(hash.slice(1));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        // Standalone pages.
        if (hash === '#/saved') { renderSaved(); currentView = 'saved'; return; }
        if (hash === '#/plan' || hash.indexOf('#/plan/') === 0) { renderPlan(); currentView = 'plan'; return; }
        if (hash === '#/map') { renderMap(); currentView = 'map'; return; }
        if (hash === '#/phrases') { renderPhrases(); currentView = 'phrases'; return; }
        if (hash === '#/itineraries') { renderItineraries(); currentView = 'itineraries'; return; }
        if (hash === '#/themes') { renderThemes(); currentView = 'themes'; return; }
        if (hash === '#/glossary') { renderGlossary(); currentView = 'glossary'; return; }
        const themeMatch = hash.match(/^#\/theme\/(.+)$/);
        if (themeMatch) { renderThemeDetail(themeMatch[1]); currentView = 'theme'; return; }

        const placeMatch = hash.match(/^#\/place\/(.+)$/);
        const cityMatch = hash.match(/^#\/city\/(.+)$/);
        const templeMatch = hash.match(/^#\/temple\/(.+)$/);
        const cafeMatch = hash.match(/^#\/cafe\/(.+)$/);
        const eatMatch = hash.match(/^#\/eat\/(.+)$/);
        const doMatch = hash.match(/^#\/do\/(.+)$/);

        if (placeMatch) {
            renderDetail(placeMatch[1]);
            currentView = 'place';
        } else if (cityMatch) {
            renderCityDetail(cityMatch[1]);
            currentView = 'city';
        } else if (templeMatch) {
            renderTempleDetail(templeMatch[1]);
            currentView = 'temple';
        } else if (cafeMatch) {
            renderCafeDetail(cafeMatch[1]);
            currentView = 'cafe';
        } else if (eatMatch) {
            renderEatDetail(eatMatch[1]);
            currentView = 'eat';
        } else if (doMatch) {
            renderActivityDetail(doMatch[1]);
            currentView = 'do';
        } else {
            renderHome();
            currentView = 'home';
        }
    }

    window.addEventListener('hashchange', route);
    window.addEventListener('DOMContentLoaded', route);

    /* ---------- theme toggle + back-to-top (mirrors the portfolio) ---------- */

    document.addEventListener('DOMContentLoaded', function () {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                const root = document.documentElement;
                const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                root.setAttribute('data-theme', next);
                try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
            });
        }

        const toTop = document.getElementById('to-top');

        /* Header goes solid + a scroll-progress bar fills, both on scroll (mirrors the portfolio). */
        const header = document.getElementById('site-header');
        const bar = document.getElementById('scroll-bar');
        function onScroll() {
            const y = window.scrollY;
            // Detail views (place/city/cafe/eat/do) open on a full-bleed photo that the fixed header
            // sits over. A transparent header there makes the brand + hamburger illegible against the
            // image, so force the solid treatment on every non-home view regardless of scroll.
            const forceSolid = currentView && currentView !== 'home';
            if (header) header.classList.toggle('is-stuck', forceSolid || y > 8);
            if (toTop) toTop.classList.toggle('is-visible', y > 500);
            if (bar) {
                const h = document.documentElement.scrollHeight - window.innerHeight;
                bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        // After a route change the view (and so the header treatment) may change even without scroll.
        window.addEventListener('hashchange', () => requestAnimationFrame(onScroll));
        // Defer the first run to the next frame: document's DOMContentLoaded handlers fire before
        // window's, so route() (a window handler) hasn't set currentView yet on a direct detail load.
        requestAnimationFrame(onScroll);

        if (toTop) {
            toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }

        /* Mobile drawer: hamburger opens, close button / backdrop / Escape / a link tap closes it. */
        const nav = document.getElementById('primary-nav');
        const openBtn = document.getElementById('nav-open');
        const closeBtn = nav && nav.querySelector('.nav-close');
        const backdrop = document.getElementById('nav-backdrop');

        let releaseDrawerTrap = null;
        function openMenu() {
            if (!nav) return;
            nav.classList.add('is-open');
            if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
            if (backdrop) { backdrop.hidden = false; requestAnimationFrame(() => backdrop.classList.add('is-open')); }
            document.body.style.overflow = 'hidden';
            if (F && F.trapFocus) releaseDrawerTrap = F.trapFocus(nav, closeBtn);
        }
        function closeMenu() {
            if (!nav) return;
            nav.classList.remove('is-open');
            if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
            if (backdrop) {
                backdrop.classList.remove('is-open');
                setTimeout(() => { backdrop.hidden = true; }, 280);
            }
            document.body.style.overflow = '';
            if (releaseDrawerTrap) { releaseDrawerTrap(); releaseDrawerTrap = null; }
        }

        if (openBtn) openBtn.addEventListener('click', openMenu);
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        if (backdrop) backdrop.addEventListener('click', closeMenu);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) closeMenu();
        });

        /*
         * Nav clicks are handled explicitly, because relying on the hash alone breaks two cases:
         *  - "Home" (#/) when the hash is already "#/" fires no hashchange, so nothing scrolls.
         *  - A section link (#city, …) when that hash is already current also fires no hashchange.
         * Driving the scroll here makes every nav item work every time. The brand logo is Home too.
         */
        function goHome() {
            const wasDetail = currentView !== 'home';
            if (wasDetail) { renderHome(); currentView = 'home'; }
            if (location.hash !== '#/' && location.hash !== '') {
                history.replaceState(null, '', location.pathname + location.search + '#/');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // replaceState fires no hashchange, so refresh the header treatment ourselves.
            requestAnimationFrame(onScroll);
        }
        function goSection(id) {
            // If we're on a route page (e.g. #/map), normalise the hash back to home first so the
            // URL and view stay coherent, then render home and scroll to the section.
            if (currentView !== 'home') {
                renderHome();
                currentView = 'home';
                if (location.hash.indexOf('#/') === 0) {
                    history.replaceState(null, '', location.pathname + location.search + '#/');
                }
            }
            const target = document.getElementById(id);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            requestAnimationFrame(onScroll);
        }

        function handleNavClick(e, href) {
            if (href === '#/' || href === '#') {
                e.preventDefault();
                goHome();
                closeMenu();
            } else if (href && href.indexOf('#/') === 0) {
                // A hash ROUTE (e.g. #/saved, #/plan, #/map, #/phrases): let the browser's default
                // anchor behaviour set the hash and the router handle it. Just close any open menu.
                closeMenu();
            } else if (href && href.charAt(0) === '#') {
                // A same-page SECTION anchor (e.g. #city): smooth-scroll on the home view.
                e.preventDefault();
                goSection(href.slice(1));
                closeMenu();
            }
            // external / other links fall through to default behaviour
        }

        // Wire the desktop nav, the mobile drawer links, and the Explore mega-menu links.
        document.querySelectorAll('.nav-links a, .nav-mega a').forEach((a) => {
            a.addEventListener('click', (e) => handleNavClick(e, a.getAttribute('href')));
        });
        const brand = document.querySelector('.brand');
        if (brand) brand.addEventListener('click', (e) => handleNavClick(e, brand.getAttribute('href')));

        // The drawer's portfolio link opens a new tab; close the drawer behind it.
        const drawerPortfolio = document.querySelector('.nav-drawer-portfolio');
        if (drawerPortfolio) drawerPortfolio.addEventListener('click', closeMenu);

        /* Desktop "Explore" mega-menu. Toggles on click; closes on outside click, Escape, or
           picking an item. Hover also opens it on pointer-capable screens for quick access. */
        const exploreBtn = document.getElementById('explore-btn');
        const exploreMenu = document.getElementById('explore-menu');
        if (exploreBtn && exploreMenu) {
            const wrap = exploreBtn.closest('.nav-drop');
            const openMenu2 = () => { exploreMenu.hidden = false; exploreBtn.setAttribute('aria-expanded', 'true'); };
            const closeMenu2 = () => { exploreMenu.hidden = true; exploreBtn.setAttribute('aria-expanded', 'false'); };
            exploreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                exploreMenu.hidden ? openMenu2() : closeMenu2();
            });
            document.addEventListener('click', (e) => {
                if (!exploreMenu.hidden && !exploreMenu.contains(e.target) && e.target !== exploreBtn) closeMenu2();
            });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu2(); });
            exploreMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu2));
            // Open on hover for mouse users (pointer:fine), a common mega-menu convenience.
            if (wrap && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                let ht;
                wrap.addEventListener('mouseenter', () => { clearTimeout(ht); openMenu2(); });
                wrap.addEventListener('mouseleave', () => { ht = setTimeout(closeMenu2, 160); });
            }
        }

        /*
         * Hero CTAs (and any future in-page # link inside the rendered view) are delegated here so
         * they smooth-scroll like the nav — and still work when the target hash is already current.
         * Delegation on #view survives re-renders without re-binding.
         */
        if (view) {
            view.addEventListener('click', (e) => {
                // Favourite toggle (heart). Sits inside <a> cards, so stop the navigation.
                const favBtn = e.target.closest('.fav-btn');
                if (favBtn && view.contains(favBtn)) {
                    e.preventDefault();
                    e.stopPropagation();
                    const key = favBtn.dataset.favKey, slug = favBtn.dataset.favSlug;
                    const nowOn = F.toggleFav(key, slug);
                    favBtn.classList.toggle('is-on', nowOn);
                    favBtn.setAttribute('aria-pressed', nowOn ? 'true' : 'false');
                    favBtn.setAttribute('aria-label', nowOn ? 'Remove from saved' : 'Save this place');
                    const icon = favBtn.querySelector('i');
                    if (icon) icon.className = (nowOn ? 'fa-solid' : 'fa-regular') + ' fa-heart';
                    toast(nowOn ? 'Saved' : 'Removed from saved');
                    return;
                }

                // Add/remove from plan.
                const planBtn = e.target.closest('.plan-btn');
                if (planBtn && view.contains(planBtn)) {
                    e.preventDefault();
                    const key = planBtn.dataset.planKey, slug = planBtn.dataset.planSlug;
                    const nowOn = F.togglePlan(key, slug);
                    planBtn.classList.toggle('is-on', nowOn);
                    planBtn.setAttribute('aria-pressed', nowOn ? 'true' : 'false');
                    const icon = planBtn.querySelector('i');
                    if (icon) icon.className = 'fa-solid ' + (nowOn ? 'fa-check' : 'fa-plus');
                    planBtn.lastChild.textContent = ' ' + (nowOn ? 'In your plan' : 'Add to plan');
                    toast(nowOn ? 'Added to your plan' : 'Removed from plan');
                    return;
                }

                // Plan reorder / remove (only present on the plan page).
                const moveBtn = e.target.closest('.plan-move');
                if (moveBtn && view.contains(moveBtn)) {
                    e.preventDefault();
                    F.movePlan(moveBtn.dataset.planId, moveBtn.dataset.planMove === 'up' ? -1 : 1);
                    renderPlan();
                    return;
                }
                const rmBtn = e.target.closest('.plan-remove');
                if (rmBtn && view.contains(rmBtn)) {
                    e.preventDefault();
                    F.removeFromPlan(rmBtn.dataset.planId);
                    renderPlan();
                    return;
                }

                // "Listen to this place": toggle speech narration of the description.
                const listenBtn = e.target.closest('[data-listen]');
                if (listenBtn && view.contains(listenBtn)) {
                    e.preventDefault();
                    const label = listenBtn.querySelector('.listen-label');
                    const icon = listenBtn.querySelector('i');
                    if (F.isSpeaking()) {
                        F.stopSpeech();
                        listenBtn.classList.remove('is-playing');
                        if (label) label.textContent = 'Listen to this place';
                        if (icon) icon.className = 'fa-solid fa-volume-high';
                    } else {
                        const text = decodeURIComponent(listenBtn.dataset.listen || '');
                        const reset = () => {
                            listenBtn.classList.remove('is-playing');
                            if (label) label.textContent = 'Listen to this place';
                            if (icon) icon.className = 'fa-solid fa-volume-high';
                        };
                        const started = F.speak(text, { onend: reset });
                        if (started) {
                            listenBtn.classList.add('is-playing');
                            if (label) label.textContent = 'Stop';
                            if (icon) icon.className = 'fa-solid fa-stop';
                        } else {
                            toast('Audio isn\'t available on this browser');
                        }
                    }
                    return;
                }

                // "Use this plan" on a ready-made itinerary: replace the working plan and open it.
                const useItin = e.target.closest('[data-use-itin]');
                if (useItin && view.contains(useItin)) {
                    e.preventDefault();
                    const it = itinerariesData().find((x) => x.slug === useItin.dataset.useItin);
                    if (it) {
                        const n = F.setPlan(it.stops || []);
                        toast(`Added ${n} stops to your plan`);
                        location.hash = '#/plan';
                    }
                    return;
                }

                // Share button on detail pages.
                const shareBtn = e.target.closest('[data-share]');
                if (shareBtn && view.contains(shareBtn)) {
                    e.preventDefault();
                    F.share({ title: shareBtn.dataset.shareTitle || document.title, url: location.href })
                        .then((res) => toast(res === 'copied' ? 'Link copied' : res === 'shared' ? 'Shared' : 'Could not share'));
                    return;
                }

                const a = e.target.closest('a[href^="#"]');
                if (!a || !view.contains(a)) return;
                const href = a.getAttribute('href');
                // Only intercept home + the home-section anchors; leave #/place/... etc. to the router.
                if (href === '#/' || href === '#' || HOME_ANCHORS.includes(href)) {
                    handleNavClick(e, href);
                }
            });
        }

        /*
         * Scroll-spy: highlight the nav link for the section currently in view. Runs on scroll
         * (cheap: a handful of getBoundingClientRect calls) and only while the home view is shown.
         */
        const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));
        function syncActiveLink() {
            if (currentView !== 'home' || !navAnchors.length) {
                navAnchors.forEach((a) => a.classList.remove('is-active'));
                return;
            }
            const ids = ['city', 'temples', 'cafes', 'eats', 'do', 'nearby'];
            const mark = window.innerHeight * 0.35;
            let active = '#/';
            // If we're near the very top, Home is active; otherwise the last section whose top passed the mark.
            if (window.scrollY > 40) {
                ids.forEach((id) => {
                    const el = document.getElementById(id);
                    if (el && el.getBoundingClientRect().top <= mark) active = '#' + id;
                });
            }
            navAnchors.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === active));
        }
        window.addEventListener('scroll', syncActiveLink, { passive: true });
        window.addEventListener('hashchange', () => setTimeout(syncActiveLink, 50));
        setTimeout(syncActiveLink, 60);

        /* ---------- header badges (saved + plan counts) ---------- */
        function refreshBadges() {
            const favBadge = document.getElementById('fav-badge');
            const planBadge = document.getElementById('plan-badge');
            if (favBadge) {
                const n = F ? F.favCount() : 0;
                favBadge.textContent = n;
                favBadge.hidden = n === 0;
            }
            if (planBadge) {
                const n = F ? F.planCount() : 0;
                planBadge.textContent = n;
                planBadge.hidden = n === 0;
            }
        }
        if (F) { F.on('favschange', refreshBadges); F.on('planchange', refreshBadges); }
        refreshBadges();

        /* ---------- "near me" — sort getaways by real distance (button lives in the Getaways
           section now, and is re-created on each home render, so it's wired via delegation). ---- */
        if (F) {
            document.addEventListener('click', async (e) => {
                const nearBtn = e.target.closest('#near-me-inline');
                if (!nearBtn) return;
                nearBtn.classList.add('is-loading');
                try {
                    await F.getPosition();
                    toast('Sorted by distance from you');
                    if (currentView !== 'home') { location.hash = '#nearby'; }
                    else { renderHome(); const n = document.getElementById('nearby'); if (n) n.scrollIntoView({ behavior: 'smooth' }); }
                } catch (err) {
                    toast('Couldn\'t get your location');
                } finally {
                    nearBtn.classList.remove('is-loading');
                }
            });
        }

        /* ---------- global search palette ---------- */
        const overlay = document.getElementById('search-overlay');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const searchOpen = document.getElementById('search-open');
        const searchClose = document.getElementById('search-close');
        const searchBackdrop = document.getElementById('search-backdrop');
        let activeResult = -1;
        let results = [];

        let releaseSearchTrap = null;
        function openSearch() {
            if (!overlay) return;
            overlay.hidden = false;
            requestAnimationFrame(() => {
                overlay.classList.add('is-open');
                if (searchInput) { searchInput.value = ''; searchInput.focus(); }
                renderResults('');
                // Trap focus inside the palette; focus starts on the input.
                if (F && F.trapFocus) releaseSearchTrap = F.trapFocus(overlay, searchInput);
            });
            document.body.style.overflow = 'hidden';
        }
        function closeSearch() {
            if (!overlay) return;
            overlay.classList.remove('is-open');
            setTimeout(() => { overlay.hidden = true; }, 220);
            document.body.style.overflow = '';
            activeResult = -1;
            if (releaseSearchTrap) { releaseSearchTrap(); releaseSearchTrap = null; }
        }
        const searchStatus = document.getElementById('search-status');
        function announce(msg) { if (searchStatus) searchStatus.textContent = msg; }
        function renderResults(q) {
            if (!F || !searchResults) return;
            results = F.search(q);
            if (searchInput) searchInput.setAttribute('aria-expanded', results.length ? 'true' : 'false');
            if (!q) {
                searchResults.innerHTML = `<li class="search-empty">Try “dosa”, “Indiranagar”, “sunrise”, “work-friendly”…</li>`;
                announce('');
                return;
            }
            if (!results.length) {
                searchResults.innerHTML = `<li class="search-empty">No matches for “${escHtml(q)}”.</li>`;
                announce('No matches found');
                return;
            }
            announce(results.length + (results.length === 1 ? ' result' : ' results'));
            searchResults.innerHTML = results.map((r, i) => `
                <li role="option" id="search-opt-${i}" class="search-result ${i === activeResult ? 'is-active' : ''}"
                    data-route="${escHtml(r.route)}">
                    <span class="search-result-icon"><i class="fa-solid ${escHtml(r.icon)}" aria-hidden="true"></i></span>
                    <span class="search-result-text">
                        <span class="search-result-name">${escHtml(r.name)}</span>
                        <span class="search-result-meta">${escHtml(r.label)}${r.area ? ' · ' + escHtml(r.area) : ''}</span>
                    </span>
                    <i class="fa-solid fa-arrow-right search-result-go" aria-hidden="true"></i>
                </li>`).join('');
        }
        function escHtml(s) {
            return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
        }
        function goToResult(i) {
            const r = results[i];
            if (!r) return;
            closeSearch();
            location.hash = r.route;
        }
        function moveActive(delta) {
            if (!results.length) return;
            activeResult = (activeResult + delta + results.length) % results.length;
            const opts = searchResults.querySelectorAll('.search-result');
            opts.forEach((o, i) => o.classList.toggle('is-active', i === activeResult));
            const el = opts[activeResult];
            if (el) el.scrollIntoView({ block: 'nearest' });
            if (searchInput) searchInput.setAttribute('aria-activedescendant', 'search-opt-' + activeResult);
        }

        if (searchOpen) searchOpen.addEventListener('click', openSearch);
        if (searchClose) searchClose.addEventListener('click', closeSearch);
        if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
        if (searchInput) {
            searchInput.addEventListener('input', () => { activeResult = -1; renderResults(searchInput.value); });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
                else if (e.key === 'Enter') { e.preventDefault(); goToResult(activeResult === -1 ? 0 : activeResult); }
            });
        }
        if (searchResults) {
            searchResults.addEventListener('click', (e) => {
                const li = e.target.closest('.search-result');
                if (!li) return;
                closeSearch();
                location.hash = li.dataset.route;
            });
        }
        // Global shortcuts: ⌘K / Ctrl-K open, Esc closes, "/" opens when not typing.
        document.addEventListener('keydown', (e) => {
            const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '');
            if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
                e.preventDefault(); openSearch();
            } else if (e.key === '/' && !typing && overlay && overlay.hidden) {
                e.preventDefault(); openSearch();
            } else if (e.key === 'Escape' && overlay && !overlay.hidden) {
                closeSearch();
            }
        });

        /* ---------- first-visit onboarding nudge ---------- */
        const onboard = document.getElementById('onboard-overlay');
        if (onboard && F) {
            let releaseOnboardTrap = null;
            const closeOnboard = (markDone) => {
                onboard.classList.remove('is-open');
                setTimeout(() => { onboard.hidden = true; }, 220);
                document.body.style.overflow = '';
                if (releaseOnboardTrap) { releaseOnboardTrap(); releaseOnboardTrap = null; }
                if (markDone) F.markSeen('onboarding');
            };
            const openOnboard = () => {
                onboard.hidden = false;
                requestAnimationFrame(() => {
                    onboard.classList.add('is-open');
                    const first = onboard.querySelector('.onboard-choice');
                    releaseOnboardTrap = F.trapFocus(onboard, first);
                });
                document.body.style.overflow = 'hidden';
            };

            // Show once, only on a fresh landing at home, and never on a shared deep link.
            const freshLanding = !location.hash || location.hash === '#/' || location.hash === '';
            if (!F.flagSeen('onboarding') && freshLanding) {
                // Small delay so the page paints first — feels less abrupt.
                setTimeout(openOnboard, 700);
            }

            onboard.querySelectorAll('.onboard-choice').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const dest = btn.dataset.onboard;
                    closeOnboard(true);
                    if (dest.indexOf('#/') === 0) { location.hash = dest; }
                    else { goSection(dest.slice(1)); }
                });
            });
            const skip = document.getElementById('onboard-skip');
            const oClose = document.getElementById('onboard-close');
            const oBackdrop = document.getElementById('onboard-backdrop');
            if (skip) skip.addEventListener('click', () => closeOnboard(true));
            if (oClose) oClose.addEventListener('click', () => closeOnboard(true));
            if (oBackdrop) oBackdrop.addEventListener('click', () => closeOnboard(true));
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !onboard.hidden) closeOnboard(true);
            });
        }
    });
})();
