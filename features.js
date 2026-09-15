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

    /* ---------- compare (getaways) ---------- */
    /* A small in-memory + localStorage list of getaway slugs to compare side by side (max 3). */
    const CMP_KEY = 'ooruly:compare';
    const CMP_MAX = 3;
    function readCompare() {
        try { return JSON.parse(localStorage.getItem(CMP_KEY) || '[]'); } catch (e) { return []; }
    }
    function writeCompare(list) {
        try { localStorage.setItem(CMP_KEY, JSON.stringify(list.slice(0, CMP_MAX))); } catch (e) { /* ignore */ }
        emit('comparechange');
    }
    function inCompare(slug) { return readCompare().indexOf(slug) !== -1; }
    function compareCount() { return readCompare().length; }
    function compareFull() { return readCompare().length >= CMP_MAX; }
    function toggleCompare(slug) {
        const list = readCompare();
        const at = list.indexOf(slug);
        if (at !== -1) { list.splice(at, 1); writeCompare(list); return { on: false, full: false }; }
        if (list.length >= CMP_MAX) return { on: false, full: true }; // at capacity, not added
        list.push(slug); writeCompare(list); return { on: true, full: false };
    }
    function clearCompare() { writeCompare([]); }
    function compareSlugs() { return readCompare(); }

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

    /* ---------- preview ordering (home page previews) ---------- */
    /* Order a collection for a home preview without mutating the input:
         1. in-season / open-today first, off-season / closed last, unknown in between;
         2. within a rank, nearest-first when a position is supplied (missing coords sort last);
         3. finally stable — preserve the original input order.
       `opts.pos` is {lat,lng} or null. Returns a new array. */
    function previewOrder(list, opts) {
        const pos = opts && opts.pos;
        const idx = new Map(list.map((x, i) => [x, i]));
        const rank = (x) => {
            // 0 = in-season or open today; 2 = off-season / closed; 1 = unknown
            const s = isInSeason(x.seasons); // null if no seasons
            const o = isOpenToday(x);        // null if no hours
            if (s === true || o === true) return 0;
            if (s === false || o === false) return 2;
            return 1;
        };
        return list.slice().sort((a, b) => {
            const ra = rank(a), rb = rank(b);
            if (ra !== rb) return ra - rb;
            if (pos) {
                const da = typeof a.lat === 'number' ? haversineKm(pos, { lat: a.lat, lng: a.lng }) : Infinity;
                const db = typeof b.lat === 'number' ? haversineKm(pos, { lat: b.lat, lng: b.lng }) : Infinity;
                if (da !== db) return da - db;
            }
            return idx.get(a) - idx.get(b); // stable: original order
        });
    }
    function previewItems(list, opts) {
        return previewOrder(list, opts).slice(0, (opts && opts.limit) || 6);
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

    /* ---------- learning progress (explored places, quiz results, streaks, badges) ---------- */
    /* All progress lives in localStorage under one object, so it's private to the device and needs
       no backend. Shape:
         { explored: { 'key:slug': ts }, quizzes: { themeSlug: {score, total, ts} },
           streak: { count, lastDay }, seenFacts: [factHash...] }  */
    const PROG_KEY = 'ooruly:progress';
    function readProgress() {
        try {
            const p = JSON.parse(localStorage.getItem(PROG_KEY) || '{}');
            p.explored = p.explored || {};
            p.quizzes = p.quizzes || {};
            p.streak = p.streak || { count: 0, lastDay: null };
            return p;
        } catch (e) { return { explored: {}, quizzes: {}, streak: { count: 0, lastDay: null } }; }
    }
    function writeProgress(p) {
        try { localStorage.setItem(PROG_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ }
        emit('progresschange');
    }

    /* Mark a place explored (idempotent). Returns true if it was newly explored. */
    function markExplored(key, slug) {
        const p = readProgress();
        const id = key + ':' + slug;
        if (p.explored[id]) return false;
        p.explored[id] = Date.now();
        writeProgress(p);
        return true;
    }
    function isExplored(key, slug) { return !!readProgress().explored[key + ':' + slug]; }
    function exploredCount() { return Object.keys(readProgress().explored).length; }
    function exploredIn(ids) {
        const ex = readProgress().explored;
        return (ids || []).filter((id) => ex[id]).length;
    }

    /* Record a quiz result (keeps the best score for a theme). */
    function recordQuiz(themeSlug, score, total) {
        const p = readProgress();
        const prev = p.quizzes[themeSlug];
        if (!prev || score > prev.score) p.quizzes[themeSlug] = { score, total, ts: Date.now() };
        writeProgress(p);
    }
    function quizResult(themeSlug) { return readProgress().quizzes[themeSlug] || null; }
    function quizzesPassed() {
        const q = readProgress().quizzes;
        return Object.keys(q).filter((k) => q[k].score === q[k].total).length;
    }

    /* Daily streak: call touchStreak() once per session. Increments if consecutive days, resets if
       a day was missed, no-op if already counted today. Returns the current streak count. */
    function dayStamp(d) { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function touchStreak() {
        const p = readProgress();
        const today = dayStamp();
        if (p.streak.lastDay === today) return p.streak.count;
        const yesterday = dayStamp(new Date(Date.now() - 864e5));
        p.streak.count = (p.streak.lastDay === yesterday) ? (p.streak.count + 1) : 1;
        p.streak.lastDay = today;
        writeProgress(p);
        return p.streak.count;
    }
    function streakCount() { return readProgress().streak.count; }

    function resetProgress() { writeProgress({ explored: {}, quizzes: {}, streak: { count: 0, lastDay: null } }); }

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
        // compare
        readCompare, inCompare, compareCount, compareFull, toggleCompare, clearCompare, compareSlugs, CMP_MAX,
        // geo
        getPosition, haversineKm, get lastPos() { return lastPos; },
        // season / open
        isInSeason, currentMonthId, isOpenToday,
        // preview ordering
        previewOrder, previewItems,
        // share
        share,
        // audio narration
        canSpeak, speak, stopSpeech, isSpeaking,
        // learning progress + gamification
        readProgress, markExplored, isExplored, exploredCount, exploredIn,
        recordQuiz, quizResult, quizzesPassed, touchStreak, streakCount, resetProgress,
        // a11y + one-time flags
        trapFocus, flagSeen, markSeen,
        // events
        on, emit,
    };
})();
