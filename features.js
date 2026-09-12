/*
 * Ooruly feature layer — small, dependency-free utilities the UI (app.js) builds on:
 *   - a flat SEARCH INDEX across every collection (getaways, city, temples, cafes, eats, activities)
 *   - FAVORITES persisted in localStorage (same store the theme uses)
 *   - an ITINERARY / weekend plan encoded in the URL hash (stays static, shareable)
 *   - GEOLOCATION "near me" with a haversine distance helper
 *   - Web Share with a copy-link fallback
 *   - a season "good to go now?" helper off each getaway's `seasons`
 *
 * Everything here is pure/side-effect-light and attached to window.Ooruly so app.js can call it.
 * No build step, no framework — just functions over the data in data.js.
 */
(function () {
    'use strict';

    /* ---------- collection registry ---------- */
    /* One place that knows every collection, its route prefix, and how to read a card's fields.
       Adding a collection here makes it searchable, favouritable, mappable and plan-able at once. */
    /* Top-level `const` in a classic <script> is a lexical global, NOT a property of window, so we
       reference the identifiers directly (guarded) rather than via window['NAME']. */
    function collections() {
        return [
            { key: 'place', label: 'Getaway', icon: 'fa-mountain-sun', route: '#/place/', data: safe(typeof DESTINATIONS !== 'undefined' ? DESTINATIONS : null) },
            { key: 'city', label: 'City sight', icon: 'fa-city', route: '#/city/', data: safe(typeof CITY_ATTRACTIONS !== 'undefined' ? CITY_ATTRACTIONS : null) },
            { key: 'temple', label: 'Temple', icon: 'fa-gopuram', route: '#/temple/', data: safe(typeof TEMPLES !== 'undefined' ? TEMPLES : null) },
            { key: 'cafe', label: 'Cafe', icon: 'fa-mug-saucer', route: '#/cafe/', data: safe(typeof CAFES !== 'undefined' ? CAFES : null) },
            { key: 'eat', label: 'Eatery', icon: 'fa-utensils', route: '#/eat/', data: safe(typeof EATERIES !== 'undefined' ? EATERIES : null) },
            { key: 'do', label: 'Things to do', icon: 'fa-person-hiking', route: '#/do/', data: safe(typeof ACTIVITIES !== 'undefined' ? ACTIVITIES : null) },
        ];
    }

    function safe(v) {
        return Array.isArray(v) ? v : [];
    }

    /* ---------- flat search index ---------- */
    /* Each entry: { key, slug, route, name, area, category, tagline, tags, haystack } */
    let INDEX = null;
    function buildIndex() {
        if (INDEX) return INDEX;
        INDEX = [];
        collections().forEach((c) => {
            c.data.forEach((item) => {
                const area = item.area || item.state || '';
                const category = item.category || item.knownFor || item.signature || item.type || '';
                const tags = item.tags || [];
                const haystack = [
                    item.name, item.also, area, category, item.tagline, item.knownFor,
                    item.signature, item.priceHint, (tags || []).join(' '),
                ].filter(Boolean).join(' ').toLowerCase();
                INDEX.push({
                    key: c.key, label: c.label, icon: c.icon,
                    slug: item.slug, route: c.route + item.slug,
                    name: item.name, area, category, tagline: item.tagline || '',
                    tags, item, haystack,
                });
            });
        });
        return INDEX;
    }

    function search(query) {
        const q = String(query || '').trim().toLowerCase();
        const idx = buildIndex();
        if (!q) return [];
        const terms = q.split(/\s+/).filter(Boolean);
        return idx
            .map((e) => {
                let score = 0;
                terms.forEach((t) => {
                    if (!e.haystack.includes(t)) { score = -1; return; }
                    if (score < 0) return;
                    if (e.name.toLowerCase().startsWith(t)) score += 5;
                    else if (e.name.toLowerCase().includes(t)) score += 3;
                    if (e.area.toLowerCase().includes(t)) score += 2;
                    score += 1;
                });
                return { e, score };
            })
            .filter((r) => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12)
            .map((r) => r.e);
    }

    /* find any indexed entry by key+slug (used by favorites + itinerary to rehydrate) */
    function lookup(key, slug) {
        return buildIndex().find((e) => e.key === key && e.slug === slug) || null;
    }

    /* Nearby places to a given item (for detail-page cross-linking). Ranks other indexed entries
       by haversine distance from the source's coordinates. `opts.keys` optionally restricts the
       result to certain collections; `opts.limit` caps the count. Items without coords are skipped.
       Returns entries with an added `.km` (rounded) so the UI can show "1.2 km away". */
    function nearby(sourceKey, sourceSlug, opts) {
        opts = opts || {};
        const src = lookup(sourceKey, sourceSlug);
        if (!src || typeof src.item.lat !== 'number') return [];
        const from = { lat: src.item.lat, lng: src.item.lng };
        const limit = opts.limit || 4;
        return buildIndex()
            .filter((e) => !(e.key === sourceKey && e.slug === sourceSlug))
            .filter((e) => typeof e.item.lat === 'number')
            .filter((e) => !opts.keys || opts.keys.indexOf(e.key) !== -1)
            .map((e) => Object.assign({}, e, { km: Math.round(haversineKm(from, { lat: e.item.lat, lng: e.item.lng }) * 10) / 10 }))
            .sort((a, b) => a.km - b.km)
            .slice(0, limit);
    }

    /* ---------- favorites (localStorage) ---------- */
    const FAV_KEY = 'ooruly:favs';
    function readFavs() {
        try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
        catch (e) { return []; }
    }
    function writeFavs(list) {
        try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
        emit('favschange');
    }
    function favId(key, slug) { return key + ':' + slug; }
    function isFav(key, slug) { return readFavs().indexOf(favId(key, slug)) !== -1; }
    function toggleFav(key, slug) {
        const id = favId(key, slug);
        const list = readFavs();
        const at = list.indexOf(id);
        if (at === -1) list.push(id); else list.splice(at, 1);
        writeFavs(list);
        return at === -1; // true if now favourited
    }
    function favEntries() {
        return readFavs().map((id) => {
            const [key, slug] = id.split(':');
            return lookup(key, slug);
        }).filter(Boolean);
    }
    function favCount() { return readFavs().length; }

    /* ---------- itinerary / weekend plan (URL-encoded, shareable) ---------- */
    /* Stored as key:slug ids joined by ',' after "#/plan/". Kept in the hash so a plan is a link. */
    function planFromHash() {
        const m = (location.hash || '').match(/^#\/plan\/(.*)$/);
        if (!m || !m[1]) return [];
        return decodeURIComponent(m[1]).split(',').filter(Boolean);
    }
    const PLAN_KEY = 'ooruly:plan';
    function readPlan() {
        // Prefer an explicit hash plan (a shared link); otherwise the user's saved working plan.
        const fromHash = planFromHash();
        if (fromHash.length) return fromHash;
        try { return JSON.parse(localStorage.getItem(PLAN_KEY) || '[]'); }
        catch (e) { return []; }
    }
    function writePlan(list) {
        try { localStorage.setItem(PLAN_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
        emit('planchange');
    }
    function inPlan(key, slug) { return readPlan().indexOf(favId(key, slug)) !== -1; }
    function togglePlan(key, slug) {
        const id = favId(key, slug);
        const list = readPlan();
        const at = list.indexOf(id);
        if (at === -1) list.push(id); else list.splice(at, 1);
        writePlan(list);
        return at === -1;
    }
    function movePlan(id, dir) {
        const list = readPlan();
        const at = list.indexOf(id);
        if (at === -1) return;
        const to = at + dir;
        if (to < 0 || to >= list.length) return;
        const tmp = list[to]; list[to] = list[at]; list[at] = tmp;
        writePlan(list);
    }
    function removeFromPlan(id) {
        const list = readPlan().filter((x) => x !== id);
        writePlan(list);
    }
    /* Replace the whole working plan (used by "Use this plan" on a ready-made itinerary). Keeps
       only ids that resolve to a real place, so a stale itinerary entry can't poison the plan. */
    function setPlan(ids) {
        const clean = (ids || []).filter((id) => {
            const [key, slug] = String(id).split(':');
            return !!lookup(key, slug);
        });
        // Clear any shared-link hash plan so the saved working plan takes over.
        if ((location.hash || '').indexOf('#/plan/') === 0) {
            history.replaceState(null, '', location.pathname + location.search + '#/plan');
        }
        writePlan(clean);
        return clean.length;
    }
    function planEntries() {
        return readPlan().map((id) => {
            const [key, slug] = id.split(':');
            const e = lookup(key, slug);
            return e ? Object.assign({}, e, { id }) : null;
        }).filter(Boolean);
    }
    function planCount() { return readPlan().length; }
    function planShareUrl() {
        const ids = readPlan();
        const base = location.origin + location.pathname + location.search;
        return base + '#/plan/' + encodeURIComponent(ids.join(','));
    }

    /* ---------- geolocation + distance ---------- */
    let lastPos = null;
    function getPosition() {
        return new Promise((resolve, reject) => {
            if (!('geolocation' in navigator)) { reject(new Error('no-geo')); return; }
            navigator.geolocation.getCurrentPosition(
                (p) => { lastPos = { lat: p.coords.latitude, lng: p.coords.longitude }; resolve(lastPos); },
                (err) => reject(err),
                { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
            );
        });
    }
    function haversineKm(a, b) {
        const R = 6371;
        const dLat = toRad(b.lat - a.lat);
        const dLng = toRad(b.lng - a.lng);
        const s = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    }
    function toRad(d) { return (d * Math.PI) / 180; }

    /* ---------- season "good to go now?" ---------- */
    const MONTH_IDS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    function currentMonthId() { return MONTH_IDS[new Date().getMonth()]; }
    function isInSeason(seasons) {
        if (!Array.isArray(seasons) || !seasons.length) return null; // unknown
        return seasons.indexOf(currentMonthId()) !== -1;
    }

    /* ---------- open now? (for eats/cafes with structured hours) ---------- */
    /* closedOn is a lowercase day name e.g. 'tue'. Returns true/false/null(unknown). */
    const DAY_IDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    function isOpenToday(item) {
        if (!item || !item.closedOn) return null;
        return DAY_IDS[new Date().getDay()] !== String(item.closedOn).toLowerCase();
    }

    /* ---------- share ---------- */
    async function share(data) {
        const payload = {
            title: data.title || document.title,
            text: data.text || '',
            url: data.url || location.href,
        };
        if (navigator.share) {
            try { await navigator.share(payload); return 'shared'; }
            catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
        }
        // Fallback: copy the URL to the clipboard.
        try {
            await navigator.clipboard.writeText(payload.url);
            return 'copied';
        } catch (e) {
            // Last-resort fallback for very old browsers.
            const ta = document.createElement('textarea');
            ta.value = payload.url; ta.setAttribute('readonly', '');
            ta.style.position = 'absolute'; ta.style.left = '-9999px';
            document.body.appendChild(ta); ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
            document.body.removeChild(ta);
            return ok ? 'copied' : 'failed';
        }
    }

    /* ---------- focus trap (for modal dialogs: search palette, drawer, onboarding) ---------- */
    /* Keeps Tab/Shift+Tab cycling within `container` while a modal is open, and restores focus to
       the element that was focused before opening. Returns a release() function to tear it down. */
    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),' +
        ' textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    function trapFocus(container, initial) {
        if (!container) return function () {};
        const prevActive = document.activeElement;
        function nodes() {
            return Array.prototype.filter.call(
                container.querySelectorAll(FOCUSABLE),
                (el) => el.offsetParent !== null || el === document.activeElement
            );
        }
        function onKey(e) {
            if (e.key !== 'Tab') return;
            const items = nodes();
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        container.addEventListener('keydown', onKey);
        // Move focus into the dialog.
        const target = initial || nodes()[0];
        if (target && target.focus) setTimeout(() => target.focus(), 0);
        return function release() {
            container.removeEventListener('keydown', onKey);
            if (prevActive && prevActive.focus) setTimeout(() => prevActive.focus(), 0);
        };
    }

    /* ---------- audio narration (Web Speech API, no backend) ---------- */
    /* Reads text aloud using the browser's built-in speech synthesis. Returns whether it started.
       Only one narration plays at a time; call stopSpeech() to cancel. */
    function canSpeak() { return typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined'; }
    function speak(text, opts) {
        if (!canSpeak() || !text) return false;
        stopSpeech();
        const u = new SpeechSynthesisUtterance(String(text));
        u.rate = (opts && opts.rate) || 0.98;
        u.pitch = 1;
        u.lang = (opts && opts.lang) || 'en-IN';
        if (opts && opts.onend) u.onend = opts.onend;
        if (opts && opts.onstart) u.onstart = opts.onstart;
        window.speechSynthesis.speak(u);
        return true;
    }
    function stopSpeech() {
        if (canSpeak()) window.speechSynthesis.cancel();
    }
    function isSpeaking() { return canSpeak() && window.speechSynthesis.speaking; }

    /* ---------- one-time flags (onboarding "seen" etc.) ---------- */
    function flagSeen(key) {
        try { return localStorage.getItem('ooruly:seen:' + key) === '1'; } catch (e) { return false; }
    }
    function markSeen(key) {
        try { localStorage.setItem('ooruly:seen:' + key, '1'); } catch (e) { /* ignore */ }
    }

    /* ---------- tiny event bus (favs/plan changes -> UI badges) ---------- */
    const bus = document.createElement('span');
    function on(name, fn) { bus.addEventListener(name, fn); }
    function emit(name) { bus.dispatchEvent(new Event(name)); }

    /* ---------- public API ---------- */
    window.Ooruly = {
        collections, buildIndex, search, lookup,
        // favorites
        isFav, toggleFav, favEntries, favCount,
        // plan
        readPlan, inPlan, togglePlan, movePlan, removeFromPlan, setPlan, planEntries, planCount, planShareUrl, planFromHash,
        // discovery
        nearby,
        // geo
        getPosition, haversineKm, get lastPos() { return lastPos; },
        // season / open
        isInSeason, currentMonthId, isOpenToday,
        // share
        share,
        // audio narration
        canSpeak, speak, stopSpeech, isSpeaking,
        // a11y + one-time flags
        trapFocus, flagSeen, markSeen,
        // events
        on, emit,
    };
})();
