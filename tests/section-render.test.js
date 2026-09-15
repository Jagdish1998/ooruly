/*
 * Property/structure test — section pages (P1 + section structure + P6 negative).
 * Spec: .kiro/specs/section-pages-and-card-refinement/design.md  (Correctness properties P1, P6)
 * Tasks: 3.1 (P1 — section renders full grid) and 3.2 (consistent structure + compare placement).
 * Validates: Requirements 1.1, 5.2  (task 3.1)  and  Requirements 1.9, 1.6, 3.5  (task 3.2)
 *
 * No test framework is installed (static vanilla JS, no package.json). Matching the harness in
 * tests/preview-order.test.js, this loads the real app into a Node `vm` context — data.js AND
 * features.js AND app.js — behind a DOM/window stub rich enough that app.js's IIFE loads without
 * throwing. app.js keeps renderSection + COLLECTIONS IIFE-private, so we inject a tiny test hook
 * right before the IIFE closes (in the evaluated code string only, NOT on disk) to expose them on
 * `window.__test`. renderSection writes into #view; the view stub records `innerHTML` so we can read
 * the rendered HTML and assert against the real collection data.
 *
 * Run:  node tests/section-render.test.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/* ---------- DOM / window stub ---------- */
/* Generic element stub. `view` needs a real innerHTML setter that records the last HTML string. */
function makeEl(opts) {
    const el = {
        _html: '',
        style: {},
        classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
        dataset: {},
        hidden: false,
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() { return true; },
        appendChild() {}, removeChild() {}, append() {}, prepend() {},
        setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
        focus() {}, blur() {}, select() {}, click() {},
        scrollIntoView() {},
        closest() { return null; },
        contains() { return false; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
    };
    Object.defineProperty(el, 'innerHTML', {
        get() { return this._html; },
        set(v) { this._html = String(v); },
    });
    if (opts && opts.id) el.id = opts.id;
    return el;
}

function loadApp() {
    const store = {};
    const localStorageStub = {
        getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    };

    const view = makeEl({ id: 'view' });

    // getElementById returns the shared view for 'view', a throwaway element otherwise.
    const elCache = { view };
    const documentStub = {
        getElementById: (id) => {
            if (id === 'view') return view;
            if (!elCache[id]) elCache[id] = makeEl({ id });
            return elCache[id];
        },
        createElement: () => makeEl(),
        createTextNode: () => makeEl(),
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        body: makeEl(),
        documentElement: makeEl(),
        head: makeEl(),
        title: 'test',
        activeElement: null,
        execCommand: () => true,
        hidden: false,
        visibilityState: 'visible',
    };

    const sandbox = {
        console,
        Date, Math, JSON, Array, Object, Map, Set, Promise, RegExp, String, Number, Boolean,
        parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
        Event: function Event() {}, CustomEvent: function CustomEvent() {},
        localStorage: localStorageStub,
        sessionStorage: localStorageStub,
        navigator: { geolocation: undefined, userAgent: 'node', language: 'en', share: undefined, clipboard: undefined },
        location: { href: 'http://localhost/', hash: '', replace() {}, assign() {} },
        history: { replaceState() {}, pushState() {}, back() {} },
        matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
        setTimeout, clearTimeout, setInterval, clearInterval,
        requestAnimationFrame: (fn) => setTimeout(() => fn(Date.now()), 0),
        cancelAnimationFrame: (id) => clearTimeout(id),
        performance: { now: () => Date.now() },
        scrollTo: () => {},
        scrollBy: () => {},
        FontAwesomeConfig: {},
        IntersectionObserver: function () { return { observe() {}, unobserve() {}, disconnect() {} }; },
        speechSynthesis: { cancel() {}, speak() {}, getVoices() { return []; } },
        SpeechSynthesisUtterance: function () {},
        alert: () => {}, confirm: () => true, prompt: () => null,
    };
    sandbox.window = sandbox;
    sandbox.self = sandbox;
    sandbox.globalThis = sandbox;
    sandbox.document = documentStub;
    sandbox.window.addEventListener = () => {};
    sandbox.window.removeEventListener = () => {};

    vm.createContext(sandbox);

    // Load data.js first (defines the collection consts as lexical globals in the context),
    // then features.js (window.Ooruly), then app.js.
    const dataCode = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
    const featuresCode = fs.readFileSync(path.join(ROOT, 'features.js'), 'utf8');
    let appCode = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

    // Expose the IIFE-private renderSection + COLLECTIONS for testing. app.js ends with `})();`.
    // Inject the hook just before that final close so it runs inside the IIFE scope.
    const hook = `
        try {
            window.__test = {
                renderSection: (typeof renderSection !== 'undefined') ? renderSection : null,
                COLLECTIONS: (typeof COLLECTIONS !== 'undefined') ? COLLECTIONS : null,
            };
        } catch (e) { window.__test = { error: String(e) }; }
    `;
    const lastIdx = appCode.lastIndexOf('})();');
    if (lastIdx === -1) throw new Error('Could not find the closing "})();" of the app.js IIFE to inject the test hook');
    appCode = appCode.slice(0, lastIdx) + hook + '\n' + appCode.slice(lastIdx);

    vm.runInContext(dataCode, sandbox, { filename: 'data.js' });
    vm.runInContext(featuresCode, sandbox, { filename: 'features.js' });
    vm.runInContext(appCode, sandbox, { filename: 'app.js' });

    if (!sandbox.window.__test) throw new Error('test hook did not attach window.__test (app.js may have thrown)');
    if (sandbox.window.__test.error) throw new Error('test hook capture failed: ' + sandbox.window.__test.error);
    if (typeof sandbox.window.__test.renderSection !== 'function') throw new Error('renderSection not exposed by the hook');
    if (!sandbox.window.__test.COLLECTIONS) throw new Error('COLLECTIONS not exposed by the hook');

    return { sandbox, view, hook: sandbox.window.__test };
}

/* ---------- assertion helper ---------- */
class TestFail extends Error {
    constructor(msg, context) { super(msg); this.context = context; }
}
function fail(msg, context) { throw new TestFail(msg, context); }

function countOccurrences(hay, needle) {
    if (!needle) return 0;
    let n = 0, i = 0;
    while ((i = hay.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
    return n;
}

/* The six section collections keyed by their COLLECTIONS id, with the detail-href prefix each
   card renderer emits (used to count card anchors) and the data variable name in data.js. */
const SECTIONS = [
    { id: 'city',     hrefPrefix: 'href="#/city/',   dataVar: 'CITY_ATTRACTIONS', getaways: false },
    { id: 'temples',  hrefPrefix: 'href="#/temple/', dataVar: 'TEMPLES',          getaways: false },
    { id: 'cafes',    hrefPrefix: 'href="#/cafe/',   dataVar: 'CAFES',            getaways: false },
    { id: 'eats',     hrefPrefix: 'href="#/eat/',    dataVar: 'EATERIES',         getaways: false },
    { id: 'do',       hrefPrefix: 'href="#/do/',     dataVar: 'ACTIVITIES',       getaways: false },
    { id: 'getaways', hrefPrefix: 'href="#/place/',  dataVar: 'DESTINATIONS',     getaways: true },
];

/* ---------- run ---------- */
function main() {
    const { sandbox, view, hook } = loadApp();
    const renderSection = hook.renderSection;
    const COLLECTIONS = hook.COLLECTIONS;

    // Render each section fresh (default filter state = all/all/default, so every card shows).
    // We snapshot the HTML per section by calling renderSection and reading view.innerHTML.
    const rendered = {};
    for (const s of SECTIONS) {
        // Reset any getaway type filter so the getaways grid shows the full list.
        sandbox.activeType = 'all';
        renderSection(s.id);
        rendered[s.id] = view.innerHTML;
        if (!rendered[s.id]) fail(`renderSection('${s.id}') produced empty HTML`, { section: s.id });
    }

    /* ---------------- Task 3.1 / P1 — section renders full grid ---------------- */
    // For every collection, the rendered HTML contains exactly `collection.length` card anchors,
    // counted by the collection's detail-href prefix. Compared to the real array from data.js.
    for (const s of SECTIONS) {
        const html = rendered[s.id];
        const expected = COLLECTIONS[s.id].data().length;
        const realArr = sandbox[s.dataVar];
        if (!Array.isArray(realArr)) fail(`data.js is missing array ${s.dataVar}`, { section: s.id });
        if (realArr.length !== expected) {
            fail(`COLLECTIONS['${s.id}'].data().length (${expected}) != ${s.dataVar}.length (${realArr.length})`,
                { section: s.id });
        }
        const actual = countOccurrences(html, s.hrefPrefix);
        if (actual !== expected) {
            fail(`P1: section '${s.id}' rendered ${actual} card anchors ('${s.hrefPrefix}') but collection has ${expected}`,
                { section: s.id, expected, actual, htmlSnippet: html.slice(0, 400) });
        }
    }

    /* ---------------- Task 3.2 — consistent section structure (Req 1.9) ---------------- */
    // Every section's HTML shares the structural markers: page container class, page-header
    // pattern, grid, and the section title text.
    for (const s of SECTIONS) {
        const html = rendered[s.id];
        const title = COLLECTIONS[s.id].title;
        const markers = [
            'class="section section--page"',
            'section-head page-head',
            'class="grid',
        ];
        for (const m of markers) {
            if (html.indexOf(m) === -1) {
                fail(`structure: section '${s.id}' is missing marker: ${m}`, { section: s.id, htmlSnippet: html.slice(0, 500) });
            }
        }
        if (html.indexOf(title) === -1) {
            fail(`structure: section '${s.id}' HTML does not contain its title "${title}"`, { section: s.id });
        }
        // A live result count is part of the shared pattern (filter-count status line).
        if (html.indexOf('filter-count') === -1) {
            fail(`structure: section '${s.id}' is missing the live result count (filter-count)`, { section: s.id });
        }
    }

    /* ---------------- Task 3.2 / P6 — compare only on getaways section ---------------- */
    // Compare wiring/relocation is task 7 (not yet done). At this point cardHTML still emits a
    // compare control for getaways, so we can only reliably assert the NEGATIVE half of P6 now:
    // the five non-getaway sections contain NO compare control. We also confirm the getaways
    // section renders without error. The POSITIVE assertion (getaways section MUST contain a
    // compare control, and ONLY there) is validated after task 7 refines cardHTML(d, {compare}).
    for (const s of SECTIONS) {
        const html = rendered[s.id];
        const hasCompare = html.indexOf('data-compare') !== -1;
        if (!s.getaways && hasCompare) {
            fail(`P6: non-getaway section '${s.id}' unexpectedly contains a compare control (data-compare)`,
                { section: s.id });
        }
    }
    // Getaways renders (non-empty) — already asserted above; note compare positive check pending task 7.
    const getawaysHasCompare = rendered.getaways.indexOf('data-compare') !== -1;

    console.log('PASS — section pages (P1 + structure + P6 negative)');
    console.log('  tasks covered: 3.1 (P1 full grid) and 3.2 (structure + compare placement)');
    for (const s of SECTIONS) {
        console.log(`  ${s.id.padEnd(9)} cards=${countOccurrences(rendered[s.id], s.hrefPrefix)} (expected ${COLLECTIONS[s.id].data().length})`);
    }
    console.log(`  P6 (negative): no non-getaway section contains data-compare — OK`);
    console.log(`  P6 (positive, pending task 7): getaways section currently contains data-compare = ${getawaysHasCompare}`);
    process.exit(0);
}

try {
    main();
} catch (err) {
    if (err instanceof TestFail) {
        console.error('FAIL — section pages (P1 + structure + P6)');
        console.error('  ' + err.message);
        if (err.context) {
            console.error('  context:');
            console.error(JSON.stringify(err.context, null, 2));
        }
    } else {
        console.error('ERROR while running section-render test:');
        console.error(err && err.stack ? err.stack : err);
    }
    process.exit(1);
}
