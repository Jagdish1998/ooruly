/*
 * Yatra front-end: a tiny hash router over the DESTINATIONS data.
 *
 *   #/                 -> home: hero, type filters, destination grid
 *   #/place/<slug>     -> one destination: overview, how to reach, best months, precautions, booking
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

        view.innerHTML = `
            <section class="hero">
                <div class="hero-aura" aria-hidden="true"></div>
                <div class="container hero-inner">
                    <p class="eyebrow">Getaways near Bengaluru</p>
                    <h1 class="hero-title">Where to go, <span class="accent">how to reach</span>,
                        and when it's worth it.</h1>
                    <p class="hero-lede">A practical travel guide to India's getaways — the places, the
                        best months, the precautions that actually matter, and one tap to book the
                        flight, train, bus or hotel. Starting with the trips that are easy from
                        Bengaluru.</p>
                </div>
            </section>

            <section class="section container">
                <div class="filters" role="tablist" aria-label="Filter by type">${filters}</div>
                <div class="grid" id="grid">${list}</div>
            </section>`;

        view.querySelectorAll('.chip').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeType = btn.dataset.type;
                renderHome();
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
                        <p class="book-intro">One tap through to MakeMyTrip for each leg. Yatra doesn't
                            handle the booking — it just takes you to the right place to make it.</p>
                        <div class="book-grid">${links}</div>
                    </section>
                </div>
            </article>`;

        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------- router ---------- */

    function route() {
        const hash = location.hash || '#/';
        const placeMatch = hash.match(/^#\/place\/(.+)$/);
        if (placeMatch) {
            renderDetail(placeMatch[1]);
        } else {
            renderHome();
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
        if (toTop) {
            toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
            window.addEventListener('scroll', () => {
                toTop.classList.toggle('is-visible', window.scrollY > 500);
            }, { passive: true });
        }
    });
})();
