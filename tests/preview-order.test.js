/*
 * Property-based test — preview ordering (P3)
 * Spec: .kiro/specs/section-pages-and-card-refinement/design.md  (Correctness properties P3)
 * Validates: Requirements 2.2, 2.1
 *
 * No test framework is installed (static vanilla JS, no package.json). Matching the project's
 * ad-hoc pattern, this loads features.js into a Node `vm` context with a minimal DOM / localStorage
 * / navigator stub so `window.Ooruly` is available, then runs a small hand-rolled property loop
 * (no external libs) over randomized synthetic item lists.
 *
 * Run:  node tests/preview-order.test.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

/* ---------- load features.js into a sandbox with minimal stubs ---------- */
function loadOoruly() {
    const store = {};
    const localStorageStub = {
        getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    };
    // A tiny DOM element stub sufficient for features.js's event bus (document.createElement('span')).
    function makeEl() {
        return {
            addEventListener() {},
            removeEventListener() {},
            dispatchEvent() { return true; },
            appendChild() {}, removeChild() {},
            setAttribute() {}, focus() {}, select() {},
            style: {}, querySelectorAll() { return []; },
        };
    }
    const documentStub = {
        createElement: () => makeEl(),
        body: makeEl(),
        title: 'test',
        activeElement: null,
        execCommand: () => true,
    };
    const sandbox = {
        console,
        Date, Math, JSON, Array, Object, Map, Set, Promise, Event: function Event() {},
        localStorage: localStorageStub,
        navigator: { geolocation: undefined },
        location: { href: '', hash: '' },
        setTimeout, clearTimeout,
    };
    sandbox.window = sandbox;   // window === self
    sandbox.self = sandbox;
    sandbox.document = documentStub;

    const code = fs.readFileSync(path.join(__dirname, '..', 'features.js'), 'utf8');
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { filename: 'features.js' });
    if (!sandbox.window.Ooruly) throw new Error('features.js did not attach window.Ooruly');
    return sandbox.window.Ooruly;
}

/* ---------- deterministic PRNG (seeded) so counterexamples are reproducible ---------- */
function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const MONTH_IDS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAY_IDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/* ---------- synthetic item generator ---------- */
function genItem(rnd, curMonth, id) {
    const it = { id };
    // seasons: absent | contains current month (in-season) | excludes it (off-season) | empty
    const seasonPick = Math.floor(rnd() * 4);
    if (seasonPick === 1) {
        // in-season: include current month plus maybe some others
        const s = new Set([curMonth]);
        const extra = Math.floor(rnd() * 3);
        for (let i = 0; i < extra; i++) s.add(MONTH_IDS[Math.floor(rnd() * 12)]);
        it.seasons = Array.from(s);
    } else if (seasonPick === 2) {
        // off-season: pick months excluding the current one (non-empty)
        const others = MONTH_IDS.filter((m) => m !== curMonth);
        const n = 1 + Math.floor(rnd() * 2);
        const s = new Set();
        while (s.size < n) s.add(others[Math.floor(rnd() * others.length)]);
        it.seasons = Array.from(s);
    } else if (seasonPick === 3) {
        it.seasons = []; // present-but-empty -> unknown
    }
    // closedOn: absent | some day (may be today -> closed, or not -> open)
    const closedPick = Math.floor(rnd() * 3);
    if (closedPick > 0) {
        it.closedOn = DAY_IDS[Math.floor(rnd() * 7)];
    }
    // coords: present or absent
    if (rnd() < 0.7) {
        it.lat = (rnd() * 180) - 90;
        it.lng = (rnd() * 360) - 180;
    }
    return it;
}

function genList(rnd, curMonth) {
    const n = Math.floor(rnd() * 12); // 0..11 items
    const list = [];
    for (let i = 0; i < n; i++) list.push(genItem(rnd, curMonth, i));
    return list;
}

/* ---------- reference helpers mirroring the spec's rank definition ---------- */
function isInSeasonRef(seasons, curMonth) {
    if (!Array.isArray(seasons) || !seasons.length) return null;
    return seasons.indexOf(curMonth) !== -1;
}
function isOpenTodayRef(item, today) {
    if (!item || !item.closedOn) return null;
    return DAY_IDS[today] !== String(item.closedOn).toLowerCase();
}
function rankOf(x, curMonth, today) {
    const s = isInSeasonRef(x.seasons, curMonth);
    const o = isOpenTodayRef(x, today);
    if (s === true || o === true) return 0;
    if (s === false || o === false) return 2;
    return 1;
}

/* ---------- assertion helper ---------- */
class PropFail extends Error {
    constructor(msg, context) { super(msg); this.context = context; }
}
function fail(msg, context) { throw new PropFail(msg, context); }

/* ---------- run ---------- */
function main() {
    const O = loadOoruly();
    const curMonth = O.currentMonthId();
    const today = new Date().getDay();

    const RUNS = 200;
    const rnd = mulberry32(0xC0FFEE);
    let checked = 0;

    for (let run = 0; run < RUNS; run++) {
        // Randomly decide whether a position is supplied this run.
        const withPos = rnd() < 0.6;
        const pos = withPos ? { lat: (rnd() * 180) - 90, lng: (rnd() * 360) - 180 } : null;
        const list = genList(rnd, curMonth);
        const opts = { pos };
        const limit = 1 + Math.floor(rnd() * 8); // 1..8

        const ordered = O.previewOrder(list, opts);
        const caseInfo = { run, withPos, pos, list, ordered: ordered.map((x) => x.id) };

        // sanity: previewOrder is a permutation of the input (no mutation, same members)
        if (ordered.length !== list.length) {
            fail('previewOrder changed list length', caseInfo);
        }
        {
            const seen = new Set(ordered.map((x) => x.id));
            for (const x of list) if (!seen.has(x.id)) fail('previewOrder dropped an item', caseInfo);
            // input must not be mutated
            for (let i = 0; i < list.length; i++) if (list[i].id !== i) fail('previewOrder mutated input order', caseInfo);
        }

        const ranks = ordered.map((x) => rankOf(x, curMonth, today));

        // P3.1 — rank sequence is non-decreasing (in-season/open(0) < unknown(1) < off/closed(2))
        for (let i = 1; i < ranks.length; i++) {
            if (ranks[i] < ranks[i - 1]) {
                fail(`P3.1 rank not non-decreasing at index ${i} (ranks=${ranks.join(',')})`, caseInfo);
            }
        }

        // Distances used for tie-break (Infinity when no coords or when no pos supplied).
        const distOf = (x) => {
            if (!pos) return null;
            return (typeof x.lat === 'number') ? O.haversineKm(pos, { lat: x.lat, lng: x.lng }) : Infinity;
        };

        // P3.2 — within the SAME rank group, distances are non-decreasing (when pos supplied).
        // P3.3 — stability: identical rank AND identical distance preserve original input order.
        for (let i = 1; i < ordered.length; i++) {
            if (ranks[i] !== ranks[i - 1]) continue; // group boundary
            if (withPos) {
                const dPrev = distOf(ordered[i - 1]);
                const dCur = distOf(ordered[i]);
                if (dCur < dPrev) {
                    fail(`P3.2 distance not non-decreasing within rank ${ranks[i]} at index ${i} (${dPrev} -> ${dCur})`, caseInfo);
                }
                if (dCur === dPrev && ordered[i].id < ordered[i - 1].id) {
                    fail(`P3.3 stability violated (equal rank & distance) at index ${i}: id ${ordered[i - 1].id} before ${ordered[i].id}`, caseInfo);
                }
            } else {
                // No pos: within a rank, order must be exactly the original input order.
                if (ordered[i].id < ordered[i - 1].id) {
                    fail(`P3.3 stability violated (no pos) at index ${i}: id ${ordered[i - 1].id} before ${ordered[i].id}`, caseInfo);
                }
            }
        }

        // P3.4 — previewItems returns exactly min(limit, length) items == first `limit` of previewOrder.
        const items = O.previewItems(list, { pos, limit });
        const expectN = Math.min(limit, list.length);
        if (items.length !== expectN) {
            fail(`P3.4 previewItems length ${items.length} != min(limit=${limit}, len=${list.length})=${expectN}`, { ...caseInfo, limit });
        }
        for (let i = 0; i < items.length; i++) {
            if (items[i].id !== ordered[i].id) {
                fail(`P3.4 previewItems[${i}] id=${items[i].id} != previewOrder[${i}] id=${ordered[i].id}`, { ...caseInfo, limit, items: items.map((x) => x.id) });
            }
        }

        // Also exercise the default limit (6) path.
        const def = O.previewItems(list, { pos });
        if (def.length !== Math.min(6, list.length)) {
            fail(`P3.4 default limit expected ${Math.min(6, list.length)}, got ${def.length}`, caseInfo);
        }

        checked++;
    }

    console.log('PASS — preview ordering (P3)');
    console.log(`  runs: ${checked}/${RUNS}`);
    console.log(`  in-season month id: ${curMonth}, today: ${DAY_IDS[today]}`);
    console.log('  properties verified: P3.1 rank order, P3.2 nearest-first, P3.3 stability, P3.4 previewItems size/prefix');
    process.exit(0);
}

try {
    main();
} catch (err) {
    if (err instanceof PropFail) {
        console.error('FAIL — preview ordering (P3)');
        console.error('  ' + err.message);
        console.error('  counterexample:');
        console.error(JSON.stringify(err.context, null, 2));
    } else {
        console.error('ERROR while running preview-order test:');
        console.error(err && err.stack ? err.stack : err);
    }
    process.exit(1);
}
