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

        const cityList = (typeof CITY_ATTRACTIONS !== 'undefined' ? CITY_ATTRACTIONS : [])
            .map(cityCardHTML)
            .join('');

        const cafeList = (typeof CAFES !== 'undefined' ? CAFES : [])
            .map(cafeCardHTML)
            .join('');

        const eatList = (typeof EATERIES !== 'undefined' ? EATERIES : [])
            .map(eatCardHTML)
            .join('');

        const doList = (typeof ACTIVITIES !== 'undefined' ? ACTIVITIES : [])
            .map(activityCardHTML)
            .join('');

        // Counts for the hero stat row (proof of how much is inside).
        const cityCount = (typeof CITY_ATTRACTIONS !== 'undefined' ? CITY_ATTRACTIONS : []).length;
        const cafeCount = (typeof CAFES !== 'undefined' ? CAFES : []).length;
        const eatCount = (typeof EATERIES !== 'undefined' ? EATERIES : []).length;
        const doCount = (typeof ACTIVITIES !== 'undefined' ? ACTIVITIES : []).length;
        const totalCount = DESTINATIONS.length + cityCount + cafeCount + eatCount + doCount;

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
                            <li>cafes, eats &amp; things to do</li>
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

            <section class="section section--city" id="city">
                <div class="container">
                    <div class="section-head">
                        <h2 class="section-title">Inside Bengaluru</h2>
                        <p class="section-sub">No trip needed — city sights you can do in a few hours.
                            Tap any place for how to reach it, the best time to go, and travel tips.</p>
                    </div>
                    <div class="grid">${cityList}</div>
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
                    <div class="grid">${cafeList}</div>
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
                    <div class="grid">${eatList}</div>
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
                    <div class="grid">${doList}</div>
                </div>
            </section>

            <section class="section" id="nearby">
                <div class="container">
                    <div class="section-head">
                        <h2 class="section-title">Nearby Bengaluru</h2>
                        <p class="section-sub">Weekend and long-weekend getaways, sorted by distance from the city.</p>
                    </div>
                    <div class="filters" role="tablist" aria-label="Filter by type">${filters}</div>
                    <div class="grid" id="grid">${list}</div>
                </div>
            </section>`;

        view.querySelectorAll('.chip').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeType = btn.dataset.type;
                renderHome();
                // keep the user anchored at the getaways section after re-render
                const nearby = document.getElementById('nearby');
                if (nearby) nearby.scrollIntoView({ behavior: 'instant' in window ? 'instant' : 'auto', block: 'start' });
            });
        });
    }

    function cardHTML(d) {
        return `
            <a class="card" href="#/place/${d.slug}">
                <div class="card-media">
                    <img src="${esc(d.image)}" alt="${esc(d.name)}, ${esc(d.state)}"
                        loading="lazy" decoding="async"
                        onerror="this.classList.add('img-fallback')">
                    <span class="card-type">${esc(typeLabel(d.type))}</span>
                </div>
                <div class="card-body">
                    <div class="card-head">
                        <h3>${esc(d.name)}</h3>
                        <span class="card-dist">${d.distanceKm} km</span>
                    </div>
                    <p class="card-tag">${esc(d.tagline)}</p>
                    <p class="card-meta">
                        <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
                        Best: ${esc(d.bestMonths)}
                    </p>
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
                </div>
                <div class="card-body">
                    <div class="card-head">
                        <h3>${esc(e.name)}</h3>
                    </div>
                    <p class="card-tag">${esc(e.tagline)}</p>
                    <p class="card-meta">
                        <i class="fa-solid fa-star" aria-hidden="true"></i>
                        ${esc(e.signature)}
                    </p>
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
                    </div>
                </div>

                <div class="container detail-body">
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

    /* ---------- city detail view ---------- */

    function renderCityDetail(slug) {
        const p = byCitySlug(slug);
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
                        <a class="back" href="#city"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Inside Bengaluru</a>
                        <span class="detail-type">${esc(p.category)}</span>
                        <h1>${esc(p.name)}</h1>
                        <p class="detail-tag">${esc(p.tagline)}</p>
                        <ul class="detail-facts">
                            <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${esc(p.area)}</li>
                            <li><i class="fa-solid fa-clock" aria-hidden="true"></i> Best time: ${esc(p.bestTime)}</li>
                        </ul>
                    </div>
                </div>

                <div class="container detail-body">
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
                    </div>
                </div>

                <div class="container detail-body">
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
                    </div>
                </div>

                <div class="container detail-body">
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
                    </div>
                </div>

                <div class="container detail-body">
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

    /* ---------- router ---------- */

    // Section anchors on the home page should scroll, not re-render the home view.
    const HOME_ANCHORS = ['#city', '#cafes', '#eats', '#do', '#nearby'];

    let currentView = null; // 'home' | 'place' | 'city' | 'cafe' | 'eat' | 'do'

    function route() {
        const hash = location.hash || '#/';

        // In-page anchor while already on the home view: just scroll to the section.
        if (HOME_ANCHORS.includes(hash)) {
            if (currentView !== 'home') { renderHome(); currentView = 'home'; }
            const target = document.getElementById(hash.slice(1));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        const placeMatch = hash.match(/^#\/place\/(.+)$/);
        const cityMatch = hash.match(/^#\/city\/(.+)$/);
        const cafeMatch = hash.match(/^#\/cafe\/(.+)$/);
        const eatMatch = hash.match(/^#\/eat\/(.+)$/);
        const doMatch = hash.match(/^#\/do\/(.+)$/);

        if (placeMatch) {
            renderDetail(placeMatch[1]);
            currentView = 'place';
        } else if (cityMatch) {
            renderCityDetail(cityMatch[1]);
            currentView = 'city';
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

        function openMenu() {
            if (!nav) return;
            nav.classList.add('is-open');
            if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
            if (backdrop) { backdrop.hidden = false; requestAnimationFrame(() => backdrop.classList.add('is-open')); }
            document.body.style.overflow = 'hidden';
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
            if (currentView !== 'home') { renderHome(); currentView = 'home'; }
            const target = document.getElementById(id);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            requestAnimationFrame(onScroll);
        }

        function handleNavClick(e, href) {
            if (href === '#/' || href === '#') {
                e.preventDefault();
                goHome();
                closeMenu();
            } else if (href && href.charAt(0) === '#') {
                e.preventDefault();
                goSection(href.slice(1));
                closeMenu();
            }
            // external / other links fall through to default behaviour
        }

        // Wire BOTH the desktop nav and the mobile drawer links (two separate .nav-links lists).
        document.querySelectorAll('.nav-links a').forEach((a) => {
            a.addEventListener('click', (e) => handleNavClick(e, a.getAttribute('href')));
        });
        const brand = document.querySelector('.brand');
        if (brand) brand.addEventListener('click', (e) => handleNavClick(e, brand.getAttribute('href')));

        /*
         * Hero CTAs (and any future in-page # link inside the rendered view) are delegated here so
         * they smooth-scroll like the nav — and still work when the target hash is already current.
         * Delegation on #view survives re-renders without re-binding.
         */
        if (view) {
            view.addEventListener('click', (e) => {
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
            const ids = ['city', 'cafes', 'eats', 'do', 'nearby'];
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
    });
})();
