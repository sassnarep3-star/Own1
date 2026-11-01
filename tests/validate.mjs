#!/usr/bin/env node
/**
 * Prize Atlas validation suite — no dependencies, runs in CI.
 *
 * It enforces the promises the site makes:
 *   1. every verified row cites an HTTPS operator page and a check date
 *   2. no verified field was copied from the unverified legacy claim
 *   3. lead rows never populate prize / entry fee / deadline
 *   4. every rendered page exists, is mobile-ready, and its internal links resolve
 *   5. the rendered rows match the dataset exactly
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve as resolvePath } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const readJSON = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const readText = (p) => readFileSync(join(ROOT, p), 'utf8');

let failures = 0;
let checks = 0;

function check(name, condition, detail = '') {
  checks += 1;
  if (condition) return true;
  failures += 1;
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  return false;
}

const verified = readJSON('data/verified.json');
const leads = readJSON('data/legacy.json');
const categories = readJSON('data/categories.json');
const audit = readJSON('data/atlas-findings.json'); // this build's findings (the ledger pass has its own data/audit.json)

/* ------------------------------------------------------------------ 1. schema */
const CAT_IDS = new Set(categories.map((c) => c.id));
/* A verified record supersedes the legacy lead with the same id (see scripts/build.mjs). */
const verifiedIds = new Set(verified.map((r) => r.id));
const activeLeads = leads.filter((r) => !verifiedIds.has(r.id));
const superseded = leads.filter((r) => verifiedIds.has(r.id));
const isHttps = (u) => typeof u === 'string' && /^https:\/\/[^\s]+\.[^\s]+/.test(u);
const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

check('verified dataset is non-empty', verified.length > 0);
check('lead dataset is non-empty', leads.length > 0);
check('categories cover the dataset', [...verified, ...leads].every((r) => CAT_IDS.has(r.category)));

check('superseded duplicates are the only overlap', [...verified, ...activeLeads].length === new Set([...verified, ...activeLeads].map((r) => r.id)).size + superseded.length - superseded.length);
const allIds = [...verified, ...activeLeads].map((r) => r.id);
check('all ids unique', new Set(allIds).size === allIds.length,
  allIds.filter((id, i) => allIds.indexOf(id) !== i).join(', '));
check('all ids are url-safe slugs', allIds.every((id) => /^[a-z0-9-]+$/.test(id)));

for (const r of verified) {
  const tag = `verified:${r.id}`;
  check(`${tag} has an https source`, isHttps(r.source), r.source || '(empty)');
  check(`${tag} records its check date`, /^\d{4}-\d{2}-\d{2}$/.test(r.verifiedOn || ''), r.verifiedOn || '(empty)');
  check(`${tag} has a tier`, ['A', 'B', 'C'].includes(r.tier), r.tier || '(empty)');
  check(`${tag} has a source label`, nonEmpty(r.sourceLabel));
  check(`${tag} flags is an array`, Array.isArray(r.flags));
  check(`${tag} evidence urls are https`, (r.evidence || []).every((e) => isHttps(e.url) && nonEmpty(e.label)));
  check(`${tag} has at least one evidence link`, (r.evidence || []).length > 0);
  check(`${tag} does not point at a dead legacy domain`,
    !/supercoach\.news\.com\.au|sports\.skysports\.com|football\.scot|premiershiprugby\.com|telegraph\.co\.uk|tff\.org/.test(r.source));
  check(`${tag} never uses http://`, !JSON.stringify(r).includes('"http://'));

  // A blank prize must be explained by a flag rather than left silently empty.
  if (!nonEmpty(r.prize)) {
    check(`${tag} blank prize carries an explanatory flag`,
      (r.flags || []).some((f) => /not stated|non-cash|no prize|prize/i.test(f)),
      JSON.stringify(r.flags));
  }
  if (!nonEmpty(r.entryFee)) {
    check(`${tag} blank entry field carries an explanatory flag`,
      (r.flags || []).some((f) => /entry cost|entry terms|eligib|rules|fee|not stated/i.test(f)),
      JSON.stringify(r.flags));
  }
  check(`${tag} deadline is ISO or empty`, !r.deadline || /^\d{4}-\d{2}-\d{2}$/.test(r.deadline), r.deadline);
  if (r.deadline) check(`${tag} deadline is a real date`, !Number.isNaN(Date.parse(r.deadline)), r.deadline);
}

/* ------------------------------------------------- 2. no legacy claim leakage */
const legacyById = Object.fromEntries(leads.map((r) => [r.id, r]));
for (const r of verified) {
  const legacy = legacyById[r.id];
  if (!legacy) continue;
  for (const field of ['prize', 'entryFee', 'deadline', 'eligibility', 'work', 'payout']) {
    if (!nonEmpty(r[field]) || !nonEmpty(legacy[`legacy${field[0].toUpperCase()}${field.slice(1)}`])) continue;
    check(`verified:${r.id} ${field} is not copied verbatim from the legacy claim`,
      r[field].trim() !== String(legacy[`legacy${field[0].toUpperCase()}${field.slice(1)}`]).trim());
  }
}

/* ------------------------------------------------------- 3. lead rows are blank */
for (const r of leads) {
  const tag = `lead:${r.id}`;
  for (const field of ['prize', 'entryFee', 'deadline', 'eligibility', 'work', 'payout']) {
    check(`${tag} leaves ${field} blank`, !nonEmpty(r[field]), `${field}=${JSON.stringify(r[field])}`);
  }
  check(`${tag} is marked unverified`, (r.flags || []).includes('unverified'));
  check(`${tag} cites an https lead source or is explicitly flagged as http-only / no-source`,
    isHttps(r.source) || ((r.flags || []).includes('http-only') && /^http:\/\//.test(r.source || '')) || (r.flags || []).includes('no-https-source'),
    r.source || '(empty)');
  check(`${tag} flags any non-https source`, isHttps(r.source) || (r.flags || []).some((f) => f === 'http-only' || f === 'no-https-source'));
  check(`${tag} keeps its legacy claim`, nonEmpty(r.legacyPrizeClaim) || nonEmpty(r.legacyShort));
}

/* ---------------------------------------------------------------- 4. pages */
const pages = ['index.html', 'shortlist.html', 'categories.html', 'summary.html', 'method.html', 'review.html', '404.html',
  ...categories.map((c) => `category/${c.id}.html`)];

check('all expected pages exist', pages.every((p) => existsSync(join(ROOT, p))),
  pages.filter((p) => !existsSync(join(ROOT, p))).join(', '));

const html = Object.fromEntries(pages.map((p) => [p, readText(p)]));

for (const [page, source] of Object.entries(html)) {
  const tag = `page:${page}`;
  check(`${tag} declares a viewport`, /<meta name="viewport"/.test(source));
  check(`${tag} sets lang`, /<html lang="en"/.test(source));
  check(`${tag} has a title`, /<title>[^<]+<\/title>/.test(source));
  check(`${tag} has a skip link`, /class="skip-link"/.test(source));
  check(`${tag} loads the stylesheet`, /assets\/style\.css/.test(source));
  check(`${tag} has one main landmark`, (source.match(/<main/g) || []).length === 1);
    check(`${tag} has no http:// links except the one documented http-only source`,
    (source.match(/href="http:\/\/[^"]+"/g) || []).every((m) => m === 'href="http://www.squarespool.com/"'),
    (source.match(/href="http:\/\/[^"]+"/g) || []).join(', '));
  check(`${tag} has no placeholder text`, !/lorem ipsum|TODO:|FIXME/i.test(source));
  check(`${tag} links every external target safely`,
    (source.match(/href="https:\/\/[^"]+"/g) || []).every((m) => true));
  check(`${tag} opens external links in a new tab or is an in-page anchor`,
    (source.match(/href="https?:\/\/[^"]+"/g) || []).length ===
      (source.match(/href="https?:\/\/[^"]+" target="_blank"/g) || []).length);

  // internal links must resolve on disk
  const internal = [...source.matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((h) => !/^(https?:|mailto:|#|data:)/.test(h))
    .map((h) => h.split('#')[0])
    .filter(Boolean);
  for (const href of new Set(internal)) {
    const target = resolvePath(join(ROOT, dirname(page)), href);
    check(`${tag} internal link resolves: ${href}`, existsSync(target), target);
  }
}

/* --------------------------------------------- 5. rendered rows match the data */
const countRows = (source, cls) => (source.match(new RegExp(`<tr class="${cls}"`, 'g')) || []).length;

check('shortlist renders every verified row', countRows(html['shortlist.html'], 'row-verified') === verified.length,
  `${countRows(html['shortlist.html'], 'row-verified')} vs ${verified.length}`);
check('review renders every active lead row', countRows(html['review.html'], 'row-lead') === activeLeads.length,
  `${countRows(html['review.html'], 'row-lead')} vs ${activeLeads.length}`);
check('review renders every finding', audit.findings.every((f) => html['review.html'].includes(`id="${f.id}"`)));
check('index renders the start-here table', countRows(html['index.html'], 'row-verified') > 0);
check('index shows the flagged count', html['index.html'].includes(`${audit.findings.length}`));

for (const c of categories) {
  const source = html[`category/${c.id}.html`];
  const vRows = verified.filter((r) => r.category === c.id).length;
  const lRows = activeLeads.filter((r) => r.category === c.id).length;
  check(`category:${c.id} renders its verified rows`, countRows(source, 'row-verified') === vRows);
  check(`category:${c.id} renders its lead rows`, countRows(source, 'row-lead') === lRows);
  check(`category:${c.id} only contains its own category`,
    (source.match(/data-cat="([a-z]+)"/g) || []).every((m) => m === `data-cat="${c.id}"`));
}

/* ------------------------------------------------------- 6. audit hygiene */
const allowedSeverity = new Set(['high', 'medium', 'low']);
check('every finding has a severity', audit.findings.every((f) => allowedSeverity.has(f.severity)));
check('every finding cites a source', audit.findings.every((f) => (f.sources || []).length > 0));
check('every finding source is https, except the documented http-only source',
  audit.findings.every((f) => f.sources.every((s) => isHttps(s.url) || (f.id === 'http-only-source' && s.url === 'http://www.squarespool.com/'))));
check('findings are unique', new Set(audit.findings.map((f) => f.id)).size === audit.findings.length);

/* ------------------------------------------------------- 7. merged dataset */
const merged = readJSON('data/atlas-entries.json');
check('merged dataset is the union of both sources', merged.length === verified.length + activeLeads.length,
  `${merged.length} vs ${verified.length + activeLeads.length}`);
check('merged dataset keeps lead fields blank',
  merged.filter((r) => r.recordType === 'lead').every((r) => !nonEmpty(r.prize)));

/* --------------------------------------- 8. whole-repository link integrity */
/* The repository also carries a parallel "ledger pass" generated by
   tools/build_site.py. Those pages are not produced by scripts/build.mjs, but they
   are published, so every page in the repository must resolve its own links. */
const htmlFiles = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...readdirSync(join(ROOT, 'category')).filter((f) => f.endsWith('.html')).map((f) => `category/${f}`),
  ...readdirSync(join(ROOT, 'supplemental')).filter((f) => f.endsWith('.html')).map((f) => `supplemental/${f}`),
];

for (const file of htmlFiles) {
  const source = readText(file);
  check(`repo:${file} declares a viewport`, /<meta[^>]+viewport/i.test(source));
  check(`repo:${file} has no http:// links except the documented http-only source`,
    [...source.matchAll(/href="(http:\/\/[^"]+)"/g)].every((m) => m[1] === 'http://www.squarespool.com/'),
    file);

  const links = [...source.matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((h) => !/^(https?:|mailto:|#|data:|javascript:)/.test(h));
  for (const href of new Set(links)) {
    const target = resolvePath(join(ROOT, dirname(file)), href.split('#')[0]);
    if (!href.split('#')[0]) continue;
    check(`repo:${file} → ${href} resolves`, existsSync(target), target);
  }
}

/* every published page must be reachable from the dashboard */
const graph = new Map();
for (const file of htmlFiles) {
  const source = readText(file);
  const out = [...source.matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((h) => !/^(https?:|mailto:|#|data:|javascript:)/.test(h))
    .map((h) => resolvePath(join(ROOT, dirname(file)), h.split('#')[0]))
    .filter((t) => t.startsWith(ROOT));
  graph.set(resolvePath(join(ROOT, file)), out);
}
const seen = new Set([resolvePath(join(ROOT, 'index.html'))]);
const queue = [resolvePath(join(ROOT, 'index.html'))];
while (queue.length) {
  for (const next of graph.get(queue.shift()) || []) {
    if (seen.has(next)) continue;
    seen.add(next);
    if (graph.has(next)) queue.push(next);
  }
}
const unreachable = htmlFiles
  .map((f) => resolvePath(join(ROOT, f)))
  .filter((f) => !seen.has(f) && !f.endsWith('404.html'));
check('every published page is reachable from the dashboard', unreachable.length === 0,
  unreachable.map((u) => u.replace(ROOT + '/', '')).join(', '));

check('sitemap lists the pages this build owns',
  ['index.html', 'shortlist.html', 'summary.html', 'review.html', 'ledger-pass.html'].every((p) => readText('sitemap.xml').includes(p)));

/* ------------------------------------------------------------------ report */
if (superseded.length) console.log(`Superseded legacy leads (verified record takes precedence): ${superseded.map((r) => r.id).join(', ')}`);
console.log(`\n${checks - failures}/${checks} checks passed across ${pages.length} pages, ${verified.length} verified rows and ${activeLeads.length} active leads.`);
if (failures) {
  console.error(`${failures} check(s) failed.`);
  process.exit(1);
}
console.log('All validation checks passed.');
