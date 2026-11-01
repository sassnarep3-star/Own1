// Verification gate. Fails the build if the site ever asserts something it cannot source.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const entries = JSON.parse(read('data/entries.json'));
const stats = JSON.parse(read('data/stats.json'));
const CATS = stats.categories.map((c) => c.id);
const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

/* ---------------- 1. dataset integrity ---------------- */

check(entries.length >= 200, `expected the full inherited catalog, got ${entries.length} rows`);
check(new Set(entries.map((e) => e.id)).size === entries.length, 'duplicate entry ids');

for (const e of entries) {
  check(CATS.includes(e.category), `${e.id}: unknown category ${e.category}`);
  check(['verified', 'partial', 'unverified'].includes(e.status), `${e.id}: bad status ${e.status}`);

  // A URL, if present, must be https. Never http, never a relative path.
  if (e.officialUrl) check(/^https:\/\//.test(e.officialUrl), `${e.id}: non-https source ${e.officialUrl}`);

  // Unverified means nothing is asserted. No prize, no fee claim, no deadline, no fit score.
  if (e.status === 'unverified') {
    check(e.prize === '', `${e.id}: unverified row carries a prize claim`);
    check(e.deadline === null, `${e.id}: unverified row carries a deadline`);
    check(e.freeEntry === null, `${e.id}: unverified row carries a fee claim`);
    check(e.cashPrize === null, `${e.id}: unverified row carries a cash claim`);
    check(e.fit === null, `${e.id}: unverified row has a fit score`);
    check(e.evidence.length === 0, `${e.id}: unverified row has evidence`);
  }

  // Checked rows must be backed by quoted evidence from the page that is linked.
  if (e.status === 'verified' || e.status === 'partial') {
    check(e.evidence.length > 0, `${e.id}: checked row has no evidence`);
    check(!!e.officialUrl, `${e.id}: checked row has no official link`);
    check(e.readOn === stats.readOn, `${e.id}: missing read date`);
    for (const ev of e.evidence) {
      check(/^https:\/\//.test(ev.url), `${e.id}: evidence url not https (${ev.url})`);
      check(ev.fact && ev.fact.length > 3, `${e.id}: evidence without a fact label`);
      check(ev.quote && ev.quote.length > 15, `${e.id}: evidence without a quote`);
      const evHost = new URL(ev.url).hostname.replace(/^www\./, '');
      const offHost = new URL(e.officialUrl).hostname.replace(/^www\./, '');
      check(evHost === offHost, `${e.id}: quoted evidence comes from ${evHost}, but the row links ${offHost}`);
    }
  }

  // No free-text field may contain a placeholder that would render as a fake value.
  for (const k of ['prize', 'deadline', 'eligibility', 'cycle', 'notes', 'operator']) {
    const v = e[k];
    if (typeof v === 'string') check(!/^(tbd|unknown|n\/a|none|null|undefined)$/i.test(v.trim()), `${e.id}: placeholder in ${k}`);
  }
}

// The two known sourceless leads must stay flagged rather than being given a substitute link.
const noSource = entries.filter((e) => !e.officialUrl);
check(noSource.length === 2, `expected 2 sourceless leads, found ${noSource.length}`);
for (const e of noSource) check(e.flags.includes('no-source-link'), `${e.id}: missing no-source flag`);

// Category coverage must not silently drop inherited rows.
for (const c of CATS) check(entries.some((e) => e.category === c), `category ${c} is empty`);

/* ---------------- 2. stats must match the data ---------------- */

check(stats.total === entries.length, 'stats.total out of sync');
check(stats.verified === entries.filter((e) => e.status === 'verified').length, 'stats.verified out of sync');
check(stats.unverified === entries.filter((e) => e.status === 'unverified').length, 'stats.unverified out of sync');
check(stats.freeConfirmed === entries.filter((e) => e.freeEntry === true).length, 'stats.freeConfirmed out of sync');

/* ---------------- 3. every generated page exists and is internally sound ---------------- */

const pages = ['index.html', 'review.html', 'sources.html', 'playbook.html', 'supplemental/index.html',
  ...CATS.map((c) => `category/${c}.html`),
  ...entries.filter((e) => e.status !== 'unverified').map((e) => `entry/${e.id}.html`)];

const checkedPages = [];
for (const p of pages) {
  check(fs.existsSync(path.join(root, p)), `missing page ${p}`);
  const html = read(p);
  checkedPages.push(p);

  check(html.includes('name="viewport"'), `${p}: no mobile viewport`);
  check(/<html lang="en">/.test(html), `${p}: no lang attribute`);
  check(!/<(script|link)[^>]+(src|href)="\/\//.test(html), `${p}: protocol-relative asset`);

  // Duplicate element ids break the filter controls.
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  check(new Set(ids).size === ids.length, `${p}: duplicate element id`);

  // Every local reference resolves on disk.
  for (const m of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:)/.test(url) || url.startsWith('#')) continue;
    check(fs.existsSync(path.resolve(path.dirname(path.join(root, p)), url)), `${p}: broken local reference ${url}`);
  }

  // Table rows must never render an unlabelled empty source cell.
  check(!/Sources?<\/th>[\s\S]{0,4000}?<td[^>]*>\s*<\/td>/.test(html), `${p}: empty source cell`);
}

/* ---------------- 4. the client payload matches the dataset ---------------- */

const siteData = read('data/site-data.js');
check(siteData.includes('window.SITE'), 'site-data.js is not a client payload');
const payload = JSON.parse(siteData.slice(siteData.indexOf('window.SITE = ') + 14).trim().replace(/;$/, ''));
check(payload.entries.length === entries.length, 'client payload row count differs from dataset');
check(payload.categories.length === CATS.length, 'client payload categories differ');
check(
  payload.entries.filter((e) => e.status === 'unverified').every((e) => e.prize === '' && e.deadline === null),
  'client payload leaks an unverified prize or deadline'
);

/* ---------------- 5. the evidence file is self-consistent ---------------- */

const factsSrc = read('research/facts.mjs');
for (const e of entries.filter((x) => x.status !== 'unverified')) {
  check(factsSrc.includes(`  '${e.id}':`) || factsSrc.includes(`  ${e.id}:`), `${e.id}: checked row not present in research/facts.mjs`);
}

/* ---------------- report ---------------- */

if (fails.length) {
  console.error(`FAIL — ${fails.length} problem(s):`);
  for (const f of fails.slice(0, 60)) console.error('  • ' + f);
  if (fails.length > 60) console.error(`  …and ${fails.length - 60} more`);
  process.exit(1);
}
const evidenceCount = entries.reduce((n, e) => n + e.evidence.length, 0);
console.log(
  `OK — ${entries.length} rows (${stats.verified} page-checked, ${stats.partial} partly, ${stats.unverified} unverified), ` +
  `${evidenceCount} quoted facts, ${noSource.length} leads with no operator link, ${checkedPages.length} pages, ` +
  `all local references and ids valid.`
);
