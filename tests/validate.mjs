#!/usr/bin/env node
// Structural, data and link checks that must pass before the site is published.
//   node tests/validate.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const rows = readJson('data/entries.json');
const cats = readJson('data/categories.json');
const irregularities = readJson('data/irregularities.json');
const catIds = cats.map((c) => c.id);

const STATUS = ['verified', 'platform', 'lead'];
const ENTRY_COST = ['', 'free', 'conditional', 'paid', 'unknown'];
const EFFORT = ['', 'low', 'medium', 'high', 'very high'];
const FIELDS = ['id', 'name', 'category', 'source', 'status', 'verifiedOn', 'prize', 'entry', 'entryCost',
  'cash', 'deadline', 'deadlineNote', 'openNow', 'eligibility', 'effort', 'note', 'flags'];

// ---------- 1. schema ----------
assert.ok(Array.isArray(rows) && rows.length > 0, 'entries.json must be a non-empty array');
assert.equal(new Set(rows.map((r) => r.id)).size, rows.length, 'duplicate ids');
assert.equal(new Set(rows.map((r) => r.name)).size, rows.length, 'duplicate names');

for (const r of rows) {
  for (const f of FIELDS) assert.ok(f in r, `${r.id}: missing field ${f}`);
  assert.equal(typeof r.id, 'string');
  assert.ok(/^[a-z0-9-]+$/.test(r.id), `${r.id}: id must be a slug`);
  assert.ok(catIds.includes(r.category), `${r.id}: unknown category ${r.category}`);
  assert.ok(STATUS.includes(r.status), `${r.id}: bad status`);
  assert.ok(ENTRY_COST.includes(r.entryCost), `${r.id}: bad entryCost`);
  assert.ok(EFFORT.includes(r.effort), `${r.id}: bad effort`);
  assert.ok(r.cash === null || typeof r.cash === 'boolean', `${r.id}: cash must be boolean or null`);
  assert.ok(r.openNow === null || typeof r.openNow === 'boolean', `${r.id}: openNow must be boolean or null`);
  assert.ok(Array.isArray(r.flags) && r.flags.every((f) => typeof f === 'string'), `${r.id}: flags must be strings`);
  if (r.deadline) assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(r.deadline), `${r.id}: deadline must be YYYY-MM-DD`);
  if (r.source) assert.ok(/^https:\/\//.test(r.source), `${r.id}: source must be https`);
  if (r.verifiedOn) assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(r.verifiedOn), `${r.id}: verifiedOn must be YYYY-MM-DD`);
}

// ---------- 2. blank-field policy ----------
// Nothing may be filled in for a row that was never read against an official page.
for (const r of rows.filter((r) => r.status === 'lead')) {
  for (const f of ['prize', 'entry', 'entryCost', 'deadline', 'deadlineNote', 'eligibility', 'effort', 'verifiedOn']) {
    assert.equal(r[f], '', `${r.id}: unverified lead must leave ${f} blank`);
  }
  assert.equal(r.cash, null, `${r.id}: unverified lead must not assert a cash prize`);
  assert.equal(r.openNow, null, `${r.id}: unverified lead must not assert open status`);
}

// ---------- 3. evidence policy ----------
for (const r of rows.filter((r) => r.status !== 'lead')) {
  assert.ok(r.source, `${r.id}: checked row needs a source`);
  assert.ok(r.verifiedOn, `${r.id}: checked row needs a verification date`);
  assert.ok(
    r.prize || r.entry || r.deadline || r.deadlineNote || r.eligibility || r.note,
    `${r.id}: checked row records no fact`
  );
}
const withoutSource = rows.filter((r) => !r.source);
assert.equal(withoutSource.length, 2, `expected exactly 2 rows with no operator link, found ${withoutSource.length}`);
for (const r of withoutSource) assert.ok(r.flags.length, `${r.id}: a row without a source must be flagged`);

// A "free" entry cost may only be claimed with a source and a date.
for (const r of rows.filter((r) => r.entryCost === 'free')) {
  assert.ok(r.source && r.verifiedOn && r.status !== 'lead', `${r.id}: free entry asserted without verification`);
}

// ---------- 4. data quality report ----------
const counts = {
  total: rows.length,
  verified: rows.filter((r) => r.status === 'verified').length,
  platform: rows.filter((r) => r.status === 'platform').length,
  lead: rows.filter((r) => r.status === 'lead').length,
  freeCash: rows.filter((r) => r.entryCost === 'free' && r.cash === true && r.prize).length,
  flags: rows.reduce((n, r) => n + r.flags.length, 0),
};
assert.ok(counts.verified >= 28, `expected at least 28 verified rows, found ${counts.verified}`);
assert.ok(counts.freeCash >= 8, `expected at least 8 verified free+cash rows, found ${counts.freeCash}`);

// ---------- 5. generated pages are up to date ----------
execFileSync(process.execPath, [path.join(ROOT, 'scripts/build.mjs'), '--check'], { stdio: 'inherit' });

// ---------- 6. every page and internal link ----------
const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'src', 'scripts', 'tests', 'research', '.github'].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path.relative(ROOT, p));
  }
})(ROOT);

const expectedPages = [
  'index.html', 'shortlist.html', 'categories.html', 'summary.html', 'methodology.html',
  'review.html', 'all.html', '404.html', 'archive.html', ...catIds.map((c) => `category/${c}.html`),
];
for (const p of expectedPages) assert.ok(htmlFiles.includes(p), `missing page ${p}`);

// Pages generated by a parallel session's build and preserved on purpose.
// They are not part of this site's navigation, so only their links are checked.
const ARCHIVE_PAGES = [
  'best-picks.html', 'verification.html', 'flagged.html', 'sources.html',
  'executive-summary.html', 'cross-session.html', 'supplemental/index.html',
];
const isArchivePage = (f) =>
  ARCHIVE_PAGES.includes(f) || f.startsWith('ledger/') || f.startsWith('entry/') || f === 'playbook.html';
const unexpected = htmlFiles.filter((f) => !expectedPages.includes(f) && !isArchivePage(f));
assert.equal(unexpected.length, 0, `unexpected extra html pages: ${unexpected}`);

let linkCount = 0;
for (const page of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const dir = path.dirname(page);
  const isMine = !isArchivePage(page);
  if (isMine) {
    assert.ok(html.includes('name="viewport"'), `${page}: missing viewport meta`);
    assert.ok(html.includes('aria-label="Main"'), `${page}: missing main navigation`);
    assert.ok(html.includes('id="main"'), `${page}: missing main landmark`);
    assert.ok(html.includes('data-base='), `${page}: missing data-base`);
  }
  if (isMine && page !== '404.html') {
    for (const nav of ['index.html', 'shortlist.html', 'categories.html', 'summary.html', 'methodology.html', 'review.html']) {
      const base = dir === '.' ? './' : '../';
      assert.ok(html.includes(`href="${base}${nav}"`), `${page}: nav link to ${nav} missing`);
    }
  }
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|data:|#)/.test(url)) continue;
    linkCount++;
    const target = path.resolve(ROOT, dir, url.split('#')[0]);
    assert.ok(fs.existsSync(target), `${page}: broken internal link -> ${url}`);
  }
  if (isMine) {
    for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
      assert.ok(/^https:\/\//.test(m[1]), `${page}: insecure external link ${m[1]}`);
    }
  }
}

// ---------- 7. static table completeness ----------
const allHtml = fs.readFileSync(path.join(ROOT, 'all.html'), 'utf8');
for (const r of rows) assert.ok(allHtml.includes(`id="${r.id}"`), `all.html is missing ${r.id}`);

// ---------- 7b. sitemap ----------
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const p of [...expectedPages, 'archive.html']) {
  assert.ok(sitemap.includes('/Own1/' + p), `sitemap is missing ${p}`);
}

// ---------- 8. review page publishes the irregularities ----------
const reviewHtml = fs.readFileSync(path.join(ROOT, 'review.html'), 'utf8');
assert.ok(irregularities.length >= 10, 'expected at least 10 documented irregularities');
for (const i of irregularities) {
  assert.ok(i.sources.length > 0, `${i.id}: an irregularity needs a source link`);
  for (const s of i.sources) assert.ok(/^https:\/\//.test(s.url), `${i.id}: source must be https`);
  assert.ok(reviewHtml.includes(`id="flag-${i.id}"`), `review.html is missing irregularity ${i.id}`);
}

// ---------- 9. accessibility / UX invariants ----------
const css = fs.readFileSync(path.join(ROOT, 'assets/style.css'), 'utf8');
assert.ok(/@media\s*\(max-width:\s*759px\)/.test(css), 'styles must collapse tables for phones');
const js = fs.readFileSync(path.join(ROOT, 'assets/app.js'), 'utf8');
for (const token of ['entryCost === \'free\'', 'cash === true', 'openNow === true']) {
  assert.ok(js.includes(token), `score rubric drifted: ${token} missing from app.js`);
}

console.log(
  `OK · ${counts.total} entries (${counts.verified} verified, ${counts.platform} platform, ${counts.lead} leads) · ` +
  `${counts.freeCash} verified free+cash · ${counts.flags} flags · ${irregularities.length} irregularities published · ` +
  `${htmlFiles.length} pages and ${linkCount} internal links checked`
);
