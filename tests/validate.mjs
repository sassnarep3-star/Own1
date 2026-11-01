#!/usr/bin/env node
/**
 * Prize Atlas validation.
 *
 * Checks the data contract and the built site. Run with `node tests/validate.mjs`.
 * Exits non-zero if anything fails, so CI and the merge gate fail loudly.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const entries = JSON.parse(read('data/entries.json'));
const triage = JSON.parse(read('data/triage.json'));
const CATEGORIES = ['sports', 'tech', 'forecasting', 'creative', 'market', 'skill', 'trivia', 'pools', 'directory'];
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
  return condition;
}

/* ---------- data contract ---------- */
expect(entries.length >= 208, `expected at least 208 rows, found ${entries.length}`);
expect(new Set(entries.map((r) => r.id)).size === entries.length, 'duplicate row ids');

for (const r of entries) {
  const where = r.id || JSON.stringify(r).slice(0, 60);
  expect(CATEGORIES.includes(r.category), `${where}: invalid category ${r.category}`);
  expect(['checked', 'unverified'].includes(r.sourceStatus), `${where}: invalid sourceStatus`);
  expect(typeof r.name === 'string' && r.name.length > 1, `${where}: missing name`);
  expect(['yes', 'no', ''].includes(r.entryFree || ''), `${where}: entryFree must be yes/no/blank`);
  if (r.source) expect(/^https:\/\//.test(r.source), `${where}: source must be https (${r.source})`);

  if (r.sourceStatus === 'unverified') {
    // A row that was never read must not display a value that was not read.
    for (const key of ['prize', 'entry', 'deadline', 'kind', 'eligibility', 'entryFree', 'deadlineISO']) {
      expect((r[key] ?? '') === '', `${where}: ${key} must stay blank while unverified`);
    }
  } else {
    expect(Boolean(r.source), `${where}: checked row needs a source`);
    const ev = r.evidence;
    if (expect(Boolean(ev) && typeof ev === 'object', `${where}: checked row needs an evidence block`)) {
      expect(/^https:\/\//.test(ev.url || ''), `${where}: evidence url must be https`);
      expect(/^\d{4}-\d{2}-\d{2}$/.test(ev.checkedAt || ''), `${where}: evidence needs a checkedAt date`);
      expect(Array.isArray(ev.confirmed) && ev.confirmed.length > 0, `${where}: evidence needs confirmed facts`);
      if (ev.by) {
        expect(ev.by !== '181b7279-own1', `${where}: attribute a parallel read to its own session`);
        expect(exists('data/verification/batchA.jsonl') || exists('data/verification.json'), `${where}: attributed read needs its evidence file on disk`);
      }
    }
    if (r.entryFree === 'yes') {
      expect(/free|no fee|not required to pay/i.test(r.entry || ''), `${where}: free entry needs wording that says free`);
    }
    if (r.entryFree === 'no') {
      expect(/\$|fee|paid/i.test(r.entry || ''), `${where}: paid entry needs the fee wording`);
    }
    if (r.deadlineISO) expect(/^\d{4}-\d{2}-\d{2}$/.test(r.deadlineISO), `${where}: deadlineISO format`);
  }

  for (const f of r.flags || []) expect(f.length > 20, `${where}: flag text too short`);
}

/* ---------- triage inputs ---------- */
for (const [id, t] of Object.entries(triage)) {
  if (id === '_readme') continue;
  expect(Boolean(entries.find((r) => r.id === id)), `triage: ${id} is not a row`);
  expect([0, 1, 2, 3].includes(t.scale), `triage: ${id} scale must be 0-3`);
  expect(['low', 'medium', 'high'].includes(t.effort), `triage: ${id} effort must be low/medium/high`);
  expect((t.rationale || '').length > 30, `triage: ${id} needs a rationale`);
}

/* ---------- built pages ---------- */
const pages = ['index.html', 'analysis.html', 'methodology.html', 'review.html', 'supplemental/index.html',
  ...CATEGORIES.map((c) => `category/${c}.html`)];

for (const page of pages) {
  if (!expect(exists(page), `missing page ${page}`)) continue;
  const html = read(page);
  expect(html.includes('<meta name="viewport" content="width=device-width, initial-scale=1"'), `${page}: viewport meta`);
  expect(html.includes('<html lang="en">'), `${page}: lang attribute`);
  expect(html.includes('assets/style.css'), `${page}: stylesheet link`);
  if (page !== 'supplemental/index.html') expect(html.includes('assets/app.js'), `${page}: script link`);
  expect(/<table[ >]/.test(html), `${page}: table`);
  if (page !== 'supplemental/index.html') expect(html.includes('data-label="'), `${page}: mobile cell labels`);

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (url.startsWith('#') || url.startsWith('mailto:')) continue;
    if (/^https?:\/\//.test(url)) {
      expect(/^https:\/\//.test(url), `${page}: external link must be https (${url})`);
      continue;
    }
    const target = path.resolve(path.dirname(path.join(ROOT, page)), url.split('#')[0]);
    expect(fs.existsSync(target), `${page}: broken local reference ${url}`);
  }
}

/* ---------- archived pages from the parallel build must not 404 ---------- */
const archivedPages = ['404.html', 'archive/all.html', 'archive/best-picks.html', 'archive/verification.html',
  'archive/flagged.html', 'archive/sources.html', 'archive/executive-summary.html', 'archive/cross-session.html',
  'archive/method.html', 'sources.html', 'playbook.html'];
for (const dir of ['ledger', 'entry']) {
  if (exists(dir)) for (const f of fs.readdirSync(path.join(ROOT, dir), { recursive: true })) {
    const name = String(f);
    if (name.endsWith('.html')) archivedPages.push(`${dir}/${name}`);
  }
}
for (const page of archivedPages) {
  if (!expect(exists(page), `missing archived page ${page}`)) continue;
  const html = read(page);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('data:')) continue;
    if (/^https?:\/\//.test(url)) continue;
    const target = path.resolve(path.dirname(path.join(ROOT, page)), url.split('#')[0]);
    expect(fs.existsSync(target), `${page}: broken local reference ${url}`);
  }
}

/* ---------- every row must be published ---------- */
const indexHtml = read('index.html');
for (const r of entries) expect(indexHtml.includes(`id="${r.id}"`), `index.html: row missing ${r.id}`);
for (const c of CATEGORIES) {
  const html = read(`category/${c}.html`);
  for (const r of entries.filter((row) => row.category === c)) {
    expect(html.includes(`id="${r.id}"`), `category/${c}.html: row missing ${r.id}`);
  }
}

/* ---------- every source link must be rendered ---------- */
const htmlEscape = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
for (const r of entries) {
  if (!r.source) continue;
  expect(indexHtml.includes(htmlEscape(r.source)), `index.html: source link missing for ${r.id}`);
}
expect(indexHtml.includes('data-label="Triage score"'), 'index.html: triage column missing');
expect(read('analysis.html').length > 2000, 'analysis.html: page looks empty');

/* ---------- blank is never free ---------- */
for (const r of entries) {
  if (r.sourceStatus === 'unverified') {
    expect(!indexHtml.includes(`id="${r.id}"`) || new RegExp(`id="${r.id}"[^>]*data-free="yes"`).test(indexHtml) === false,
      `index.html: unverified row ${r.id} must not be marked free`);
  }
  if (r.entryFree === 'yes') {
    expect(r.sourceStatus === 'checked', `${r.id}: only a checked row may be marked free`);
    expect(new RegExp(`id="${r.id}"[^>]*data-free="yes"`).test(indexHtml), `index.html: ${r.id} should be filterable as free`);
  }
}

/* ---------- supplemental page keeps its own official-source rows ---------- */
const supp = read('supplemental/index.html');
expect(supp.includes('data-label="Official source"'), 'supplemental: source label missing');
expect((supp.match(/https:\/\//g) || []).length > 5, 'supplemental: expected several https sources');

/* ---------- mobile: no forced-wide tables ---------- */
for (const page of pages) {
  expect(!/min-width:\s*(6\d\d|7\d\d|8\d\d|9\d\d)px/.test(read(page)), `${page}: hard-coded min-width breaks mobile`);
}
const css = read('assets/style.css');
expect(css.includes('@media (max-width: 760px)'), 'css: missing mobile stacking breakpoint');
expect(!/table\s*\{\s*min-width/.test(css), 'css: tables must not be forced wide');
expect(css.includes('data-label'), 'css: mobile labels not styled');

if (failures.length) {
  console.error(`FAILED ${failures.length} check(s):`);
  for (const f of failures.slice(0, 60)) console.error(' - ' + f);
  process.exit(1);
}

console.log(
  `OK: ${entries.length} unique rows · ` +
  `${entries.filter((r) => r.sourceStatus === 'checked').length} checked against an official page · ` +
  `${entries.filter((r) => r.entryFree === 'yes').length} free entry confirmed · ` +
  `${entries.filter((r) => !r.source).length} rows without an operator link · ` +
  `${pages.length} pages, all local references and assets resolve.`
);
