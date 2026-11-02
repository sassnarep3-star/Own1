#!/usr/bin/env node
/**
 * build.js — deterministic, evidence-first generator for the published site.
 *
 * Inputs (all committed JSON):
 *   data/ledger.json                  the pinned 211-row reference ledger
 *   data/verification.json           per-row sourcing / historical flags
 *   data/irregularities.json         the historical irregularity register
 *   data/verification-2026-11-02.json  dated official-page reads and verbatim quotes
 *   data/review-2026-11-02.json      repo review and new irregularities
 *   data/link-health.json            dated automated link observation
 *
 * Rule enforced here: a value is printed ONLY when an official operator page read on
 * 2026-11-02 states it. Anything else is blank and flagged unverified. The reference
 * ledger supplies only the competition name, its category grouping and where to look.
 * No network access, no clock, no randomness: CI can rebuild and diff byte-for-byte.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const summary = require('./summary-content');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const ledger = read('data/ledger.json');
const verif = read('data/verification.json');
const irr = read('data/irregularities.json');
const fresh = read('data/verification-2026-11-02.json');
const review = read('data/review-2026-11-02.json');
const linkHealth = read('data/link-health.json');
const shortlistNotes = read('data/shortlist-notes.json');
const crossChecks = read('data/cross-checks.json');

const TODAY = fresh.checkedAt;                       // 2026-11-02
const SOURCE_REVIEWED = ledger.reviewed;            // 2026-08-19
const LIVE = 'https://sassnarep3-star.github.io/Own1/';
const SOURCE_SITE = 'https://karagemop466-tech.github.io/FreeMoneyApps/';
const SOURCE_REPO = 'https://github.com/karagemop466-tech/FreeMoneyApps';

const items = ledger.listings;
const TYPES = ledger.types;
const typeById = new Map(TYPES.map((t) => [t.id, t]));
const itemsById = new Map(items.map((i) => [i.id, i]));
const verifById = new Map(verif.rows.map((r) => [r.id, r]));
const freshById = new Map(fresh.rows.map((r) => [r.id, r]));
const newFlags = review.irregularities;
const allFlags = irr.items.concat(newFlags);
const flagById = new Map(allFlags.map((f) => [f.id, f]));

const S = summary.stats;
const noOfficial = verif.rows.filter((r) => r.officialSourceCount === 0);
const unverifiedItems = items.filter((i) => !freshById.has(i.id));

const NAV = [
  ['index.html', 'Dashboard'],
  ['all.html', 'All competitions'],
  ['best.html', 'Best picks'],
  ['shortlist.html', 'Verified shortlist'],
  ['verified.html', 'Verified 2 Nov'],
  ['analysis.html', 'Analysis'],
  ['verification.html', 'Verification'],
  ['repo-review.html', 'Repo review'],
  ['research.html', 'Source audit'],
  ['flagged.html', 'Flagged for review'],
  ['executive-summary.html', 'Executive summary']
];

const CAT_COPY = {
  skill: 'Head-to-head skill games. Official pages read today separate free Gems/ticket rooms from cash rooms, and one operator says its free prize is Bonus Cash that cannot be withdrawn.',
  trivia: 'Quiz formats. The trivia rows we checked pay in SB points or describe a crowdfunding queue rather than a skill prize.',
  sports: 'Pick\'em, survivor and season-long prediction contests. Official rules confirm large cash pools, but several also prohibit automated entries and some contests have closed.',
  creative: 'Writing and photography contests. Official rules confirm free and paid entries, cash prize ladders, and strict limits on AI-generated text.',
  forecasting: 'Scored probability forecasts. The official tournament index says participation is free and lists per-tournament pools, including a bot-only tournament.',
  market: 'Paper-trading and demo competitions. Official pages confirm free entry and cash prize ladders, with full account verification required to withdraw.',
  tech: 'Machine-learning competitions and hackathons with published prize pools — the clearest structural fit for an AI-assisted entrant where the rules permit it.',
  directory: 'Catalogues of other people\'s contests. These are not competitions you can win by entering the page.',
  pools: 'Tools for running your own pool or league. Nothing here is funded by the operator.'
};

/* ------------------------------------------------------------------ utils */

const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const attr = esc;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return Number(d) + ' ' + MONTHS[Number(m) - 1] + ' ' + y;
}
function shortText(s, len) {
  const t = String(s || '');
  if (t.length <= len) return t;
  return t.slice(0, len - 1).replace(/\s+\S*$/, '') + '…';
}
function daysUntil(iso) {
  return Math.round((new Date(iso + 'T00:00:00Z') - new Date(TODAY + 'T00:00:00Z')) / 86400000);
}
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

/**
 * Two mechanical readings of the official wording, both printed on the Best picks page.
 * Neither adds a value: it only decides whether a row belongs in an "open now" shortlist.
 *  - statusBucket: does the operator's status wording say closed / ended / 404 / no games?
 *  - isCashPrize: does the operator's prize wording say Bonus Cash, Gems, points, credits,
 *    subscriptions or crowdfunding instead of cash?
 */
function statusBucket(f) {
  const s = f && f.facts && f.facts.status ? String(f.facts.status.value).toLowerCase() : '';
  if (/closed|ended|404|no active|not found|returns no verifiable|currently closed/i.test(s)) return 'closed';
  if (/window|timeline|submissions open|regular season/i.test(s)) return 'seasonal';
  return 'open';
}
function isCashPrize(f) {
  const v = f && f.facts && f.facts.prize ? String(f.facts.prize.value).toLowerCase() : '';
  if (!v) return false;
  return !/bonus cash|gems|sb points|crowdfunding|not withdrawable|credits|3-month subscription|non-cash/i.test(v);
}
function bestEligible() {
  return fresh.rows
    .filter((r) => r.facts && r.facts.prize && r.freeConfirmed === 'yes' && r.amountUsd != null)
    .filter((r) => isCashPrize(r) && statusBucket(r) === 'open')
    .filter((r) => !r.facts.deadline || !/^\d{4}-\d{2}-\d{2}$/.test(r.facts.deadline.value) || daysUntil(r.facts.deadline.value) >= 0)
    .sort((a, b) => b.amountUsd - a.amountUsd);
}

function officialUrl(item) {
  const f = freshById.get(item.id);
  if (f && f.sourceUrl) return f.sourceUrl;
  const r = verifById.get(item.id);
  if (r && r.primaryOfficialUrl) return r.primaryOfficialUrl;
  const s = (item.sources || []).find((x) => x.tier === 'official');
  return s ? s.url : '';
}
function hasOfficial(item) {
  const r = verifById.get(item.id);
  return r ? r.officialSourceCount > 0 : Boolean(officialUrl(item));
}
function citedUrl(item) {
  const r = verifById.get(item.id);
  const u = (r && r.allSourceUrls && r.allSourceUrls[0] && r.allSourceUrls[0].url) ||
    item.signupUrl || SOURCE_SITE;
  return /^https:\/\//.test(u) ? u : SOURCE_SITE;
}
function flagsFor(item) {
  const r = verifById.get(item.id);
  const hist = r ? (r.flags || []) : [];
  const now = newFlags.filter((f) => (f.affected || []).includes(item.id)).map((f) => f.id);
  const mine = (freshById.get(item.id) || {}).flags || [];
  return { ids: [...new Set(hist.concat(now))], texts: mine, count: hist.length + now.length + mine.length };
}

/* ------------------------------------------------------------------ layout */

const EXTRA_CSS = `
.callout.warn { border-left-color: var(--warn, #b26b00); }
.evidence-box { border:1px solid var(--line); border-radius:10px; padding:10px 12px; margin:8px 0; background:var(--card,#fff); }
.fact-quote { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.86rem; color:var(--muted); white-space:pre-wrap; word-break:break-word; }
.verified-article { border-top:1px solid var(--line); padding:14px 0; }
.mini-links a { margin-right:10px; }
.tag-row { margin:6px 0; }
.stat-grid .stat b { font-size:1.4rem; }
.src-list { margin:4px 0 0; padding-left:18px; }
`;

function layout(opts) {
  const base = opts.base || '';
  const active = opts.active || '';
  const nav = NAV.map(([href, label]) =>
    `<a href="${base}${href}"${active === href ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');
  const footerLinks = NAV.map(([href, label]) =>
    `<a href="${base}${href}">${esc(label)}</a>`).join('\n      ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
<meta name="description" content="${attr(opts.description || 'Free-to-enter cash competitions, verified against the operator')}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230b7a4b'/%3E%3Ctext x='32' y='44' font-size='34' font-family='system-ui,sans-serif' font-weight='700' fill='%23fff' text-anchor='middle'%3E$%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${base}assets/css/site.css">
<style>${EXTRA_CSS}</style>
${opts.head || ''}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${base}index.html">
      <span class="brand-mark" aria-hidden="true">$</span>
      <span class="brand-text"><b>PrizeDesk</b><span>Official-page verification ${esc(fmtDate(TODAY))}</span></span>
    </a>
    <nav class="nav" aria-label="Main">${nav}</nav>
  </div>
</header>
<main id="main" class="wrap">
${opts.body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-links">
      ${footerLinks}
    </div>
    <p><b>PrizeDesk</b> is an independent workbench. Its ${S.rows} rows come from the third-party
    <a href="${SOURCE_SITE}" rel="noopener noreferrer">Free Money &amp; Contest Ledger</a>
    (pinned commit <code>${esc(ledger.provenance.sourceRepoCommit.slice(0, 7))}</code>, source reviewed
    ${esc(fmtDate(SOURCE_REVIEWED))}). Only values read on an official operator page on
    ${esc(fmtDate(TODAY))} are published; everything else is blank and
    <a href="${base}flagged.html">flagged for review</a>. Prize figures are the operator's wording, not
    this site's promise. Contest law and eligibility vary by state and country; read the rules before you enter.</p>
    <p class="note-tiny">${S.checked} of ${S.rows} rows were checked against ${S.pages} official pages on
    ${esc(fmtDate(TODAY))}. See <a href="${base}verification.html">how verification works</a> and
    <a href="${base}verified.html">the line-by-line evidence</a>.</p>
  </div>
</footer>
${opts.scripts === false ? '' : `<script src="${base}assets/js/app.js" defer></script>`}
</body>
</html>`;
}

function stat(value, label, tone) {
  return `<div class="stat${tone ? ' is-' + tone : ''}"><b>${esc(value)}</b><span>${esc(label)}</span></div>`;
}
function blankCell() {
  return '<span class="prize none">—</span><span class="cell-sub">blank: unverified</span>';
}
function valueCell(fact, isDate) {
  if (!fact || !fact.value) return blankCell();
  const shown = isDate ? fmtDate(fact.value) : fact.value;
  return `<span class="prize">${esc(shown)}</span>` +
    `<span class="cell-sub"><a href="${attr(fact.url)}" rel="noopener noreferrer">operator wording ↗</a> · ${esc(fmtDate(TODAY))}</span>`;
}
function badgesFor(item) {
  const f = freshById.get(item.id);
  const out = [];
  if (f) out.push('<span class="badge good">Verified 2 Nov</span>');
  else out.push('<span class="badge warn">Unverified</span>');
  if (f && f.freeConfirmed === 'yes') out.push('<span class="badge good">Free entry confirmed</span>');
  if (f && f.freeConfirmed === 'no') out.push('<span class="badge danger">Paid entry confirmed</span>');
  if (f && f.freeConfirmed === 'partial') out.push('<span class="badge warn">Mixed free path</span>');
  if (!hasOfficial(item)) out.push('<span class="badge warn">No official source</span>');
  return out.join('');
}
function sourceCell(item, base) {
  if (hasOfficial(item)) {
    const r = verifById.get(item.id);
    const extra = r && r.officialSourceCount > 1 ? ` <span class="note-tiny">+${r.officialSourceCount - 1}</span>` : '';
    return `<a class="src-link" href="${attr(officialUrl(item))}" rel="noopener noreferrer">Official page ↗</a>${extra}` +
      `<span class="cell-sub">operator's own page</span>`;
  }
  return `<span class="badge warn">none official</span>` +
    `<span class="cell-sub"><a href="${attr(citedUrl(item))}" rel="noopener noreferrer">Cited page (not an operator) ↗</a> · ` +
    `<a href="${base}flagged.html#no-official-source">flagged</a></span>`;
}

/* ------------------------------------------------------------------ tables */

function rowHtml(item, base, opts) {
  const f = freshById.get(item.id);
  const facts = f ? (f.facts || {}) : {};
  const fl = flagsFor(item);
  const cat = typeById.get(item.type);
  const cells = [];
  cells.push(`<td class="cell-name" data-label="Competition">
      <a href="${base}c/${attr(item.id)}.html">${esc(item.name)}</a>
      <span class="cell-sub">${esc(shortText(item.short, 118))}</span>
      <span class="badges tag-row" style="margin-top:6px">${badgesFor(item)}</span>
    </td>`);
  if (!opts.hideCategory) {
    cells.push(`<td data-label="Category"><a href="${base}categories/${attr(item.type)}.html">${esc(cat ? cat.name : item.type)}</a></td>`);
  }
  cells.push(`<td data-label="Verified prize">${valueCell(facts.prize)}</td>`);
  cells.push(`<td data-label="Verified entry">${valueCell(facts.entry)}</td>`);
  cells.push(`<td data-label="Verified deadline">${valueCell(facts.deadline, true)}</td>`);
  cells.push(`<td data-label="Verified status">${valueCell(facts.status)}</td>`);
  cells.push(`<td data-label="Official source">${sourceCell(item, base)}</td>`);
  cells.push(`<td data-label="Verification">${f
    ? `<a class="src-link" href="${base}verified.html#${attr(item.id)}">Evidence ↗</a><span class="cell-sub">${esc(TODAY)}</span>`
    : `<a class="src-link" href="${base}flagged.html#unverified-rows">Unverified ↗</a><span class="cell-sub">${fl.count} flags</span>`}</td>`);
  const figure = facts.prize ? 'yes' : 'no';
  const free = f && f.freeConfirmed === 'yes' ? 'full' : f && f.freeConfirmed === 'no' ? 'paid-cash'
    : f && f.freeConfirmed === 'partial' ? 'partial' : 'unknown';
  return `<tr id="row-${attr(item.id)}"
    data-name="${attr(item.name)}"
    data-short="${attr(item.short)}"
    data-category="${attr(item.type)}"
    data-status=""
    data-free="${free}"
    data-verif="${f ? 'verified' : 'unverified'}"
    data-figure="${figure}"
    data-usd="${f && f.amountUsd != null ? f.amountUsd : ''}"
    data-prize="${attr(String(facts.prize ? facts.prize.value : '').toLowerCase())}"
    data-checked="${f ? 'yes' : 'no'}"
    data-flags="${fl.count}">${cells.join('')}</tr>`;
}

function tableHead(opts) {
  const cols = ['Competition'];
  if (!opts.hideCategory) cols.push('Category');
  cols.push('Verified prize', 'Verified entry', 'Verified deadline', 'Verified status', 'Official source', 'Verification');
  return `<thead><tr>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>`;
}
function tableBlock(list, base, opts) {
  return `${tableHead(opts)}\n<tbody>\n${list.map((i) => rowHtml(i, base, opts)).join('\n')}\n</tbody>`;
}
function filterBar(count) {
  return `<div class="filters">
    <div class="filter-row">
      <div class="search-wrap"><input id="q" type="search" placeholder="Search ${count} competitions…" aria-label="Search competitions" autocomplete="off"></div>
      <select data-filter="category" aria-label="Filter by category">
        <option value="">All categories</option>
        ${TYPES.map((t) => `<option value="${attr(t.id)}">${esc(t.name)}</option>`).join('')}
      </select>
      <select data-filter="free" aria-label="Filter by entry evidence">
        <option value="">Any entry evidence</option>
        <option value="full">Confirmed free</option>
        <option value="paid-cash">Confirmed paid</option>
        <option value="partial">Mixed free path</option>
        <option value="unknown">Blank / unverified</option>
      </select>
      <select data-filter="verif" aria-label="Filter by verification">
        <option value="">Any verification</option>
        <option value="verified">Verified 2 Nov</option>
        <option value="unverified">Unverified</option>
      </select>
      <select data-filter="figure" aria-label="Filter by confirmed prize figure">
        <option value="">Any prize evidence</option>
        <option value="yes">Prize figure confirmed</option>
        <option value="no">Prize blank</option>
      </select>
      <select id="sort" aria-label="Sort rows">
        <option value="source">Sort: source order</option>
        <option value="prize">Sort: largest stated figure</option>
        <option value="name">Sort: name A–Z</option>
      </select>
    </div>
    <div class="chip-row">
      <button class="chip" type="button" data-chip="free" aria-pressed="false">Confirmed free</button>
      <button class="chip" type="button" data-chip="checked" aria-pressed="false">Verified 2 Nov</button>
      <button class="chip" type="button" data-chip="usd" aria-pressed="false">Prize figure</button>
      <button class="chip" type="button" data-chip="flags" aria-pressed="false">Has a flag</button>
      <button class="chip" type="button" id="reset">Reset</button>
    </div>
    <p class="filter-count" id="count">${count} of ${count} competitions shown</p>
  </div>`;
}
const TABLE_CAPTION = `Only values stated on an official operator page read on ${TODAY} are printed. A blank cell means the value could not be confirmed from an official source and is flagged unverified. Categories are this site's grouping of the reference ledger, not an operator claim.`;

/* ------------------------------------------------------------------ detail pages */

function detailPage(item) {
  const base = '../';
  const f = freshById.get(item.id);
  const r = verifById.get(item.id);
  const cat = typeById.get(item.type);
  const fl = flagsFor(item);
  const facts = f ? (f.facts || {}) : {};
  const factRows = Object.keys(facts).map((k) => {
    const x = facts[k];
    const label = { prize: 'Prize', entry: 'Entry cost', deadline: 'Deadline', status: 'Status', eligibility: 'Eligibility', aiAgent: 'AI-agent rules' }[k] || k;
    return `<tr>
      <td data-label="Field">${esc(label)}</td>
      <td data-label="Confirmed value"><span class="prize">${esc(k === 'deadline' ? fmtDate(x.value) : x.value)}</span></td>
      <td data-label="Verbatim quote"><span class="fact-quote">${esc(x.quote)}</span></td>
      <td data-label="Official source"><a class="src-link" href="${attr(x.url)}" rel="noopener noreferrer">Official page ↗</a></td>
    </tr>`;
  }).join('');
  const sourceRows = (r ? r.allSourceUrls : (item.sources || [])).map((s) => `<tr>
      <td data-label="Source"><a href="${attr(s.url)}" rel="noopener noreferrer">${esc(s.title || s.url)}</a></td>
      <td data-label="Tier"><span class="badge ${s.tier === 'official' ? 'good' : 'warn'}">${esc(s.tier || 'unlabelled')}</span></td>
      <td data-label="Read on 2 Nov 2026"><a href="${base}verified.html">${f && (f.pages || []).includes(s.url) ? 'yes — see evidence' : 'not read this pass'}</a></td>
    </tr>`).join('');
  const flagLinks = fl.ids.length
    ? `<ul class="list">${fl.ids.map((id) => `<li><a href="${base}flagged.html#${attr(id)}">${esc(id)}</a> — ${esc(flagById.get(id) ? flagById.get(id).title : 'see flag register')}</li>`).join('')}</ul>`
    : '<p class="note-tiny">No register item is attached to this row.</p>';
  const navLinks = [
    hasOfficial(item) ? `<a class="btn primary" href="${attr(officialUrl(item))}" rel="noopener noreferrer">Official page ↗</a>` : '',
    item.rulesUrl && item.rulesUrl !== officialUrl(item) && /^https:\/\//.test(item.rulesUrl) ? `<a class="btn" href="${attr(item.rulesUrl)}" rel="noopener noreferrer">Rules ↗</a>` : '',
    `<a class="btn" href="${SOURCE_SITE}" rel="noopener noreferrer">Reference ledger ↗</a>`,
    f ? `<a class="btn" href="${base}verified.html#${attr(item.id)}">Line-by-line evidence ↗</a>` : ''
  ].filter(Boolean).join('');

  const body = `
<p class="note-tiny" style="margin-top:16px"><a href="${base}categories/${attr(item.type)}.html">← ${esc(cat ? cat.name : item.type)}</a> · <a href="${base}all.html">All competitions</a></p>
<section class="section" style="margin-top:6px">
  <h1>${esc(item.name)}</h1>
  <div class="badges" style="margin-bottom:10px">${badgesFor(item)}</div>
  <p class="lede">${esc(item.short)}</p>
  <p class="note-tiny">The paragraph above is this site's short description from the reference ledger. It is not an operator claim.</p>
  <div class="btn-row">${navLinks}</div>
</section>

<div class="callout ${f ? 'info' : 'warn'}">
  <p><b>${f ? 'Verified 2 Nov 2026' : 'Unverified'}.</b> ${f
    ? 'The values below were read on the official page linked in each row. Fields the page did not state are listed as blank.'
    : 'No official page for this row was read on 2 Nov 2026. Every prize, entry, deadline and status cell is blank, and the row is published on the Flagged for Review page.'}</p>
</div>

<div class="detail-grid section">
  <div>
    <div class="card">
      <h2>Confirmed facts (2 Nov 2026)</h2>
      ${factRows ? `<div class="table-scroll"><table class="ledger">
        <thead><tr><th>Field</th><th>Confirmed value</th><th>Verbatim quote from the official page</th><th>Source</th></tr></thead>
        <tbody>${factRows}</tbody></table></div>` : '<p class="note-tiny">No field could be confirmed from an official page. All values are blank.</p>'}
      <p class="note-tiny">A confirmed value is copied from the operator's wording. No number is converted, summed or rounded.</p>
    </div>
    ${f && (f.notStated || []).length ? `<div class="card" style="margin-top:12px"><h2>Not stated on the pages read</h2>
      <ul class="list">${f.notStated.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="note-tiny">Each of these fields is blank in the tables and flagged unverified.</p></div>` : ''}
    ${f && (f.flags || []).length ? `<div class="card" style="margin-top:12px"><h2>Irregularities on this row</h2>
      <ul class="list">${f.flags.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="note-tiny"><a href="${base}flagged.html">Full register with source links ↗</a></p></div>` : ''}
  </div>
  <aside>
    <div class="card">
      <h2>Verification status</h2>
      <p><span class="badge ${f ? 'good' : 'warn'}">${f ? 'Verified 2 Nov 2026' : 'Unverified'}</span></p>
      <p class="note-tiny">${f ? `${esc((f.pages || []).length)} official page(s) fetched on ${esc(fmtDate(TODAY))}.` : 'This row was not re-read on 2 Nov 2026.'}
        <a href="${base}verification.html">How verification works ↗</a></p>
      <h3 style="margin-top:14px">Register items</h3>
      ${flagLinks}
    </div>
    <div class="card" style="margin-top:12px">
      <h2>Sources</h2>
      <div class="table-scroll"><table class="ledger">
        <thead><tr><th>Source</th><th>Tier</th><th>Read this pass</th></tr></thead>
        <tbody>${sourceRows || '<tr><td data-label="Source" colspan="3">No source recorded.</td></tr>'}</tbody>
      </table></div>
      <p class="note-tiny">${hasOfficial(item) ? 'At least one official-tier link exists for this row.' : 'This row has no official-tier link: it is published with blank values and flagged. See <a href="' + base + 'flagged.html#no-official-source">no official source</a>.'}</p>
    </div>
    <div class="card" style="margin-top:12px">
      <h2>Blank beats guessed</h2>
      <p class="note-tiny">The pinned reference ledger contains its own prize, entry, status and eligibility labels. They are deliberately not republished here, because they were not read on an operator page on ${esc(fmtDate(TODAY))}. See <a href="${base}research.html">the source audit</a>.</p>
    </div>
  </aside>
</div>`;
  return layout({
    title: `${item.name} — PrizeDesk`, description: item.short, base,
    active: 'all.html', body, scripts: false
  });
}

/* ------------------------------------------------------------------ index */

function buildIndex() {
  const best = bestEligible().slice(0, 10);
  const bestRows = best.map((r) => `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(r.id)}.html">${esc(r.name)}</a>
        <span class="cell-sub">${esc(typeById.get(r.category) ? typeById.get(r.category).name : r.category)}</span></td>
      <td data-label="Verified prize"><span class="prize">${esc(r.facts.prize.value)}</span></td>
      <td data-label="Verified deadline">${r.facts.deadline ? esc(fmtDate(r.facts.deadline.value)) : '<span class="blank">—</span>'}</td>
      <td data-label="Verified status">${r.facts.status ? esc(r.facts.status.value) : '<span class="blank">—</span>'}</td>
      <td data-label="Official source"><a class="src-link" href="${attr(r.facts.prize.url)}" rel="noopener noreferrer">Official page ↗</a></td>
      <td data-label="Evidence"><a href="verified.html#${attr(r.id)}">Quote ↗</a></td>
    </tr>`).join('');
  const soon = fresh.rows
    .filter((r) => r.facts && r.facts.deadline && /^\d{4}-\d{2}-\d{2}$/.test(r.facts.deadline.value))
    .map((r) => ({ r, d: daysUntil(r.facts.deadline.value) }))
    .filter((x) => x.d >= 0 && x.d <= 60)
    .sort((a, b) => a.d - b.d);
  const soonRows = soon.map(({ r, d }) => `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(r.id)}.html">${esc(r.name)}</a></td>
      <td data-label="Verified deadline">${esc(fmtDate(r.facts.deadline.value))}</td>
      <td data-label="Days left" class="num">${d === 0 ? 'today' : d}</td>
      <td data-label="Official wording"><span class="fact-quote">${esc(shortText(r.facts.deadline.quote, 150))}</span></td>
      <td data-label="Official source"><a class="src-link" href="${attr(r.facts.deadline.url)}" rel="noopener noreferrer">Official page ↗</a></td>
    </tr>`).join('');
  const catCards = TYPES.map((t) => {
    const n = items.filter((i) => i.type === t.id).length;
    const v = items.filter((i) => i.type === t.id && freshById.has(i.id)).length;
    return `<a class="cat-card" href="categories/${attr(t.id)}.html">
      <span class="count">${n} competitions · ${v} verified 2 Nov</span>
      <b>${esc(t.name)}</b><p>${esc(CAT_COPY[t.id] || t.blurb)}</p></a>`;
  }).join('');
  const body = `
<section class="hero">
  <p class="kicker">Mobile-first · one row per competition · verified against the operator ${esc(fmtDate(TODAY))}</p>
  <h1>Find free competitions that actually pay cash — with the evidence attached.</h1>
  <p class="lede">${S.rows} competitions from the reference ledger, rebuilt as a searchable dashboard with
  category subpages and one detail page each. A value appears only when an official operator page says it.
  Anything we could not confirm is <b>blank and flagged unverified</b> — never inferred, never filled in.</p>
  <div class="btn-row">
    <a class="btn primary" href="all.html">Browse all ${S.rows} →</a>
    <a class="btn" href="best.html">Best picks</a>
    <a class="btn" href="verified.html">Line-by-line evidence</a>
    <a class="btn" href="flagged.html">Flagged for review (${allFlags.length})</a>
  </div>
</section>

<div class="stat-grid">
  ${stat(String(S.rows), 'competitions in the ledger')}
  ${stat(String(S.pages), 'official pages read 2 Nov', 'good')}
  ${stat(String(S.checked), 'rows with confirmed values', 'good')}
  ${stat(String(S.confirmedFree), 'free-entry statements confirmed', 'good')}
  ${stat(String(S.confirmedCash), 'prize figures confirmed')}
  ${stat(String(S.unverified), 'rows blank + flagged', 'warn')}
  ${stat(String(S.noOfficial), 'rows with no official source', 'warn')}
  ${stat(String(allFlags.length), 'irregularities published', 'warn')}
</div>

<div class="callout info" style="margin-top:14px">
  <p><b>Read this first.</b> The reference ledger was last reviewed by its authors on
  ${esc(fmtDate(SOURCE_REVIEWED))}. On ${esc(fmtDate(TODAY))} this session fetched ${S.pages} official
  operator pages and confirmed values for ${S.checked} rows. The other ${S.unverified} rows keep their
  names, categories and links but have <b>blank</b> prize, entry, deadline and status cells.
  The pinned ledger is third-party research, so its own labels are not published as facts.
  Open the operator's rules before you spend time on any competition.</p>
</div>

<section class="section">
  <h2>Best documented opportunities</h2>
  <p class="note-tiny">Rows where an official page states a cash figure, free/no-purchase entry and an open
  status, ordered by the literal figure on that page. Excluded: rows the operator says are closed, ended or
  seasonal; rows whose verified deadline has passed; and prizes the operator describes as Bonus Cash, Gems,
  points, credits or crowdfunding. This is a reading of the rules, not an odds estimate or an endorsement.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Verified prize</th><th>Verified deadline</th><th>Verified status</th><th>Official source</th><th>Evidence</th></tr></thead>
    <tbody>${bestRows}</tbody>
  </table></div>
  <p class="note-tiny">Headline figures can be annuities, contingencies or totals across many awards — the
  verbatim wording is one click away. Closed and seasonal rows are still published, with their official
  status, on <a href="best.html">Best picks</a>.</p>
  <div class="btn-row"><a class="btn" href="best.html">Full shortlist and AI-agent notes →</a></div>
</section>

${soon.length ? `<section class="section">
  <h2>Closing within 60 days</h2>
  <p class="note-tiny">Only dates read on an official page on ${esc(fmtDate(TODAY))} appear here.
  ${soon.filter((x) => x.d <= 7).length} close within a week — two close <b>today</b>. Confirm on the operator page.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Verified deadline</th><th>Days left</th><th>Official wording</th><th>Official source</th></tr></thead>
    <tbody>${soonRows}</tbody>
  </table></div>
</section>` : ''}

<section class="section">
  <h2>Categories</h2>
  <div class="cat-grid">${catCards}</div>
</section>

<section class="section">
  <h2>What we found</h2>
  <div class="card"><ul class="list">
    <li><b>Free entry is not the same as free cash.</b> Official pages confirm free-to-play contests, but GamerSaloon's $10 is Bonus Cash "not eligible for withdrawal" and Papaya's free rooms pay Gems. See <a href="analysis.html">Analysis</a>.</li>
    <li><b>The best structural fit for an AI-assisted entrant is tech / forecasting.</b> Codex x TwitchCon permits AI coding assistants; Metaculus runs a bot-only tournament. ESPN and CBS prohibit automated entries, and Winning Writers prohibits AI-generated text. Every rule is quoted with a link on <a href="analysis.html">Analysis</a>.</li>
    <li><b>Links rot and statuses drift.</b> Challenge.gov was sunset on 2026-03-30; HeroX and RoboForex contest URLs return 404; several "live" ledger rows are closed on the operator's own page. All ${allFlags.length} items are on <a href="flagged.html">Flagged for Review</a>.</li>
    <li><b>Review the work.</b> <a href="repo-review.html">Repo review</a> links every file we checked on GitHub; <a href="verified.html">Verified 2 Nov</a> shows every quote and URL we read.</li>
  </ul></div>
</section>`;
  return layout({
    title: 'PrizeDesk — free-to-enter cash competitions, verified against the operator',
    description: `${S.rows} competitions, ${S.checked} verified against ${S.pages} official pages on ${TODAY}; blank where a value cannot be confirmed.`,
    active: 'index.html', body
  });
}

/* ------------------------------------------------------------------ all + categories */

function buildAll() {
  const body = `
<section class="hero"><p class="kicker">Full table · ${S.rows} rows</p>
  <h1>All competitions</h1>
  <p class="lede">Every row in the pinned ledger, with a link to its detail page and its operator source.
  Filters use only confirmed values: "confirmed free" means an official page says free/no purchase.</p></section>
${filterBar(S.rows)}
<div id="empty" class="callout warn" hidden><p>No competition matches those filters. Try
<a href="#" onclick="document.getElementById('reset').click();return false;">resetting</a>.</p></div>
<div class="table-scroll"><table class="ledger" data-ledger-table>
  <caption>${TABLE_CAPTION}</caption>
  ${tableBlock(items, '', {})}
</table></div>`;
  return layout({ title: `All ${S.rows} competitions — PrizeDesk`, active: 'all.html', body });
}

function buildCategories() {
  const out = [];
  for (const t of TYPES) {
    const list = items.filter((i) => i.type === t.id);
    const verified = list.filter((i) => freshById.has(i.id)).length;
    const body = `
<section class="hero"><p class="kicker">Category · ${list.length} competitions</p>
  <h1>${esc(t.name)}</h1>
  <p class="lede">${esc(CAT_COPY[t.id] || t.blurb)} <b>This description is editorial, not an operator claim.</b></p>
  <div class="btn-row"><a class="btn" href="../all.html">All competitions</a>
  <a class="btn" href="../flagged.html">Flagged for review</a></div></section>
<div class="stat-grid">
  ${stat(String(list.length), 'rows in this category')}
  ${stat(String(verified), 'verified 2 Nov', 'good')}
  ${stat(String(list.length - verified), 'blank + flagged', 'warn')}
  ${stat(String(list.filter((i) => !hasOfficial(i)).length), 'no official source', 'warn')}
</div>
${filterBar(list.length)}
<div id="empty" class="callout warn" hidden><p>No competition matches those filters. Try
<a href="#" onclick="document.getElementById('reset').click();return false;">resetting</a>.</p></div>
<div class="table-scroll"><table class="ledger" data-ledger-table>
  <caption>${TABLE_CAPTION}</caption>
  ${tableBlock(list, '../', { hideCategory: true })}
</table></div>`;
    out.push({
      file: `categories/${t.id}.html`,
      html: layout({ title: `${t.name} — PrizeDesk`, description: CAT_COPY[t.id] || t.blurb,
        base: '../', active: 'all.html', body })
    });
  }
  return out;
}
function buildDetails() {
  return items.map((i) => ({ file: `c/${i.id}.html`, html: detailPage(i) }));
}

/* ------------------------------------------------------------------ best + analysis */

function buildBest() {
  const best = bestEligible();
  const rows2 = best.map((r) => `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(r.id)}.html">${esc(r.name)}</a>
        <span class="cell-sub">${esc(typeById.get(r.category) ? typeById.get(r.category).name : r.category)}</span></td>
      <td data-label="Verified prize"><span class="prize">${esc(r.facts.prize.value)}</span></td>
      <td data-label="Verified entry">${r.facts.entry ? esc(r.facts.entry.value) : '<span class="blank">—</span>'}</td>
      <td data-label="Verified deadline">${r.facts.deadline ? esc(fmtDate(r.facts.deadline.value)) : '<span class="blank">—</span>'}</td>
      <td data-label="Verified status">${r.facts.status ? esc(r.facts.status.value) : '<span class="blank">—</span>'}</td>
      <td data-label="Official source"><a class="src-link" href="${attr(r.facts.prize.url)}" rel="noopener noreferrer">Official page ↗</a></td>
    </tr>`).join('');
  const eligibleIds = new Set(best.map((r) => r.id));
  const excluded = fresh.rows
    .filter((r) => r.facts && r.facts.prize && r.freeConfirmed === 'yes' && !eligibleIds.has(r.id))
    .map((r) => {
      const reasons = [];
      if (statusBucket(r) === 'closed') reasons.push('official page says closed / ended / 404');
      if (statusBucket(r) === 'seasonal') reasons.push('official page ties the window to a season or timeline');
      if (!isCashPrize(r)) reasons.push('operator wording says Bonus Cash, points, credits or crowdfunding');
      if (r.facts.deadline && /^\d{4}-\d{2}-\d{2}$/.test(r.facts.deadline.value) && daysUntil(r.facts.deadline.value) < 0) reasons.push('verified deadline has passed');
      if (!reasons.length) reasons.push('no single stated dollar figure to sort by');
      return { r, reason: reasons.join(' · ') };
    });
  const excludedRows = excluded.map(({ r, reason }) => `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(r.id)}.html">${esc(r.name)}</a></td>
      <td data-label="Verified prize"><span class="prize">${esc(r.facts.prize.value)}</span></td>
      <td data-label="Verified status">${r.facts.status ? esc(r.facts.status.value) : '<span class="blank">—</span>'}</td>
      <td data-label="Why it is not in the open shortlist">${esc(reason)}</td>
      <td data-label="Official source"><a class="src-link" href="${attr(r.facts.prize.url)}" rel="noopener noreferrer">Official page ↗</a></td>
    </tr>`).join('');
  const ai = fresh.rows.filter((r) => r.facts && r.facts.aiAgent);
  const aiRows = ai.map((r) => `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(r.id)}.html">${esc(r.name)}</a></td>
      <td data-label="What the official rules say"><span class="fact-quote">${esc(r.facts.aiAgent.quote)}</span></td>
      <td data-label="Confirmed value">${esc(r.facts.aiAgent.value)}</td>
      <td data-label="Official source"><a class="src-link" href="${attr(r.facts.aiAgent.url)}" rel="noopener noreferrer">Official page ↗</a></td>
    </tr>`).join('');
  const leads = fresh.newLeads.map((l) => `<tr>
      <td class="cell-name" data-label="Lead">${esc(l.name)}<span class="cell-sub">${esc(l.category)} · ${esc(l.note)}</span></td>
      <td data-label="Prize (official wording)">${esc(l.prize)}</td>
      <td data-label="Deadline">${l.deadline ? esc(fmtDate(l.deadline)) : '<span class="blank">—</span>'}</td>
      <td data-label="Official source"><a class="src-link" href="${attr(l.url)}" rel="noopener noreferrer">Official page ↗</a></td>
    </tr>`).join('');
  const body = `
<section class="hero"><p class="kicker">Shortlist, not a promise</p>
  <h1>Where the verified evidence is strongest</h1>
  <p class="lede">These are the competitions where an official page read on ${esc(fmtDate(TODAY))} states a
  cash figure and free/no-purchase entry. No odds, entrant counts, effort estimates or expected-value
  figures exist in the evidence, so none appear here. This is a reading of the rules, not advice.</p></section>
<div class="callout warn"><p><b>Read the caveats.</b> A large headline figure may be an annuity, a
contingency prize, a total across many awards, or a prize that is paid in credits rather than cash.
The Verified 2 Nov page carries the verbatim wording for each figure. Two of these deadlines close today.</p></div>

<section class="section"><h2>1. Open now: confirmed cash + confirmed free entry</h2>
  <p class="note-tiny">A row appears here only when the official page states a cash figure, free/no-purchase
  entry and an open status, the verified deadline has not passed, and the prize wording does not say Bonus
  Cash, Gems, points, credits or crowdfunding. These are mechanical readings of the quoted wording, printed
  so you can disagree with them.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Verified prize</th><th>Verified entry</th><th>Verified deadline</th><th>Verified status</th><th>Official source</th></tr></thead>
    <tbody>${rows2}</tbody></table></div>
</section>

<section class="section"><h2>2. Confirmed prizes we did not shortlist, and why</h2>
  <p class="note-tiny">These rows also have confirmed prize and free-entry wording, but the operator's own
  status, deadline or prize currency makes them a poor use of time right now. They remain in the full table.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Verified prize</th><th>Verified status</th><th>Why not shortlisted</th><th>Official source</th></tr></thead>
    <tbody>${excludedRows}</tbody></table></div>
</section>

<section class="section" id="ai-agent"><h2>3. What the rules say about AI assistance</h2>
  <p class="note-tiny">Technology is not a loophole. These are direct quotes from official pages read on
  ${esc(fmtDate(TODAY))}; an entry that breaks the rules is worth nothing however good it is.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Verbatim rule</th><th>Reading</th><th>Official source</th></tr></thead>
    <tbody>${aiRows}</tbody></table></div>
</section>

<section class="section"><h2>4. New official leads found on 2 Nov 2026</h2>
  <p class="note-tiny">These opportunities were seen on an official index page today but are not rows in the
  pinned ${S.rows}-row ledger. They are listed separately so nothing is invented into the dataset.
  A blank cell means the official index did not state that value.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Lead</th><th>Prize (official wording)</th><th>Deadline</th><th>Official source</th></tr></thead>
    <tbody>${leads}</tbody></table></div>
</section>

<section class="section"><h2>5. What this shortlist cannot tell you</h2>
  <div class="callout warn"><ul class="list">
    <li>Odds of winning, field sizes and historical win rates are not published on the pages we read.</li>
    <li>Effort per entry, expected value per hour and your personal eligibility are not in the evidence.</li>
    <li>Whether a contest is open this week can change; every status here was read on ${esc(fmtDate(TODAY))}.</li>
    <li>Nothing here is legal, tax or financial advice — see <a href="flagged.html#R-15">R-15</a>.</li>
  </ul></div>
</section>`;
  return layout({ title: 'Best picks — PrizeDesk', description: 'Confirmed cash and free-entry competitions with their official wording.', active: 'best.html', body, scripts: false });
}

function buildAnalysis() {
  const byType = TYPES.map((t) => {
    const list = items.filter((i) => i.type === t.id);
    return {
      t, n: list.length,
      v: list.filter((i) => freshById.has(i.id)).length,
      cash: list.filter((i) => { const f = freshById.get(i.id); return f && f.facts && f.facts.prize; }).length,
      free: list.filter((i) => { const f = freshById.get(i.id); return f && f.freeConfirmed === 'yes'; }).length,
      noOff: list.filter((i) => !hasOfficial(i)).length
    };
  }).sort((a, b) => b.n - a.n);
  const catRows = byType.map((x) => `<tr>
      <td data-label="Category"><a href="categories/${attr(x.t.id)}.html">${esc(x.t.name)}</a></td>
      <td data-label="Rows" class="num">${x.n}</td>
      <td data-label="Verified 2 Nov" class="num">${x.v}</td>
      <td data-label="Prize confirmed" class="num">${x.cash}</td>
      <td data-label="Free confirmed" class="num">${x.free}</td>
      <td data-label="No official source" class="num">${x.noOff}</td>
    </tr>`).join('');
  const flagsRows = fresh.rows.filter((r) => (r.flags || []).length).map((r) => `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(r.id)}.html">${esc(r.name)}</a></td>
      <td data-label="Irregularity"><ul class="list" style="margin:0">${r.flags.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></td>
      <td data-label="Official source"><a class="src-link" href="${attr(r.sourceUrl)}" rel="noopener noreferrer">Official page ↗</a></td>
      <td data-label="Evidence"><a href="verified.html#${attr(r.id)}">Quote ↗</a></td>
    </tr>`).join('');
  const deadlineRows = fresh.rows.filter((r) => r.facts && r.facts.deadline).map((r) => ({
    r, d: /^\d{4}-\d{2}-\d{2}$/.test(r.facts.deadline.value) ? daysUntil(r.facts.deadline.value) : ''
  })).sort((a, b) => (Number(a.d) || 9999) - (Number(b.d) || 9999)).map(({ r, d }) => `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(r.id)}.html">${esc(r.name)}</a></td>
      <td data-label="Verified deadline">${esc(fmtDate(r.facts.deadline.value))}</td>
      <td data-label="Days from 2 Nov" class="num">${d === '' ? '—' : d}</td>
      <td data-label="Official source"><a class="src-link" href="${attr(r.facts.deadline.url)}" rel="noopener noreferrer">Official page ↗</a></td>
    </tr>`).join('');
  const body = `
<section class="hero"><p class="kicker">Analysis &amp; findings</p>
  <h1>What ${S.rows} rows and ${S.pages} official pages actually show</h1>
  <p class="lede">Every count on this page is computed at build time. Where the evidence cannot answer a
  question, the answer is stated as unknown rather than estimated.</p></section>
<div class="stat-grid">
  ${stat(String(S.rows), 'rows parsed')}
  ${stat(String(S.checked), 'rows checked 2 Nov', 'good')}
  ${stat(String(S.confirmedFree), 'free statements confirmed', 'good')}
  ${stat(String(S.confirmedCash), 'prize figures confirmed')}
  ${stat(String(S.unverified), 'rows blank + flagged', 'warn')}
  ${stat(String(allFlags.length), 'irregularities published', 'warn')}
</div>

<section class="section"><h2>1. Coverage by category</h2>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Category</th><th>Rows</th><th>Verified 2 Nov</th><th>Prize confirmed</th><th>Free confirmed</th><th>No official source</th></tr></thead>
    <tbody>${catRows}</tbody></table></div>
  <p class="note-tiny">${pct(byType[0].n, S.rows)}% of the ledger sits in a single category (${esc(byType[0].t.name)}). That is the reference ledger's scope, not a judgement by this site.</p>
</section>

<section class="section" id="ai-agent"><h2>2. AI-agent compatibility: what the rules actually say</h2>
  <div class="detail-grid">
    <div class="card"><h3>Allowed or required</h3><ul class="list">
      <li>Codex x TwitchCon: "Participants may use standard development tools, including frameworks, libraries, starter templates, and AI coding assistants." <a href="https://twitchcon-codex.devpost.com/rules" rel="noopener noreferrer">Official rules ↗</a></li>
      <li>PayPal AI Hackathon: "along with an AI tool, model, or platform of their choice". <a href="https://paypalaihackathon.devpost.com/rules" rel="noopener noreferrer">Official rules ↗</a></li>
      <li>Global Virtual Hackathon: "Building with AI tools is allowed and expected." <a href="https://gvhackathon.com/" rel="noopener noreferrer">Official page ↗</a></li>
      <li>Metaculus FutureEval: "a bot-only competition where bot-makers attempt to push AI to its limits in predicting future events." <a href="https://www.metaculus.com/tournament/fall-futureeval-2026/" rel="noopener noreferrer">Official page ↗</a></li>
      <li>GEMS Prize official rules §3.2: "Using generative AI technology in the development of your prize submission is allowed. However, you must indicate in the narrative ... the extent to which, if any, you used generative AI technology and how you used it". <a href="https://www.nlr.gov/docs/fy26osti/96647.pdf" rel="noopener noreferrer">Official rules ↗</a></li>
    </ul></div>
    <div class="card"><h3>Restricted or prohibited</h3><ul class="list">
      <li>Metaculus platform rules: "Unless otherwise specifically permitted in the Competition-specific rules, automated systems, bots, artificial intelligence, or user accounts which are officially registered as bot accounts, are ineligible for tournament prizes. However, human participants are allowed to use AI tools or systems to assist in their forecasting, as long as the final submissions reflect their own decisions and understanding." <a href="https://www.metaculus.com/tournament-rules/" rel="noopener noreferrer">Official rules ↗</a> The bot-only FutureEval tournament is a competition-specific exception, not a general permission.</li>
      <li>Winning Writers: "may not contain any AI-generated text". <a href="https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free" rel="noopener noreferrer">Official page ↗</a></li>
      <li>ESPN: "Entries must be manually key-stroked by the entrant; use of automated entry devices or programs, or entries by third parties are prohibited." <a href="https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay" rel="noopener noreferrer">Official rules ↗</a></li>
      <li>CBS: may disqualify "accumulating points through methods such as automated computer scripts". <a href="https://www.cbssports.com/fantasy/football/games/pickem/rules" rel="noopener noreferrer">Official rules ↗</a></li>
      <li>ARC Prize: "Internet access is not available during Kaggle evaluation (no API-based systems like GPT/Claude/etc.)" and code must be open source. <a href="https://arcprize.org/competitions/2026" rel="noopener noreferrer">Official page ↗</a></li>
      <li>TradingView: scripts with excessively high transaction activity "will lead to a ban". <a href="https://www.tradingview.com/the-leap/tradestation-july-2026/rules/" rel="noopener noreferrer">Official rules ↗</a></li>
    </ul></div>
  </div>
  <p class="note-tiny">Reading: an AI coding agent is a genuine fit for objective-scoring tech/forecasting events whose rules invite it, and a liability in pick'em or judged-writing contests. Metaculus is the clearest example of a split rule: AI assistance is allowed for human forecasts, but bots cannot win prizes by default — only a competition with explicit permission (such as FutureEval) changes that. This is analysis of the quoted rules, not a claim about any operator's enforcement. See <a href="flagged.html#R-18">R-18</a> and <a href="flagged.html#R-17">R-17</a>.</p>
</section>

<section class="section"><h2>3. Verified deadlines</h2>
  <p class="note-tiny">Only deadlines stated on an official page read on ${esc(fmtDate(TODAY))}. A zero means the date is today.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Verified deadline</th><th>Days from 2 Nov</th><th>Official source</th></tr></thead>
    <tbody>${deadlineRows}</tbody></table></div>
</section>

<section class="section"><h2>4. Per-row irregularities found on official pages</h2>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Irregularity</th><th>Official source</th><th>Evidence</th></tr></thead>
    <tbody>${flagsRows}</tbody></table></div>
  <p class="note-tiny">The full register, including repository-level findings, is on <a href="flagged.html">Flagged for Review</a>.</p>
</section>

<section class="section"><h2>5. Findings</h2>
  <div class="card"><ol class="list">
    <li><b>Confirmed free entry is common; confirmed free cash is narrower.</b> ${S.confirmedFree} rows quote a free/no-purchase statement, ${S.confirmedCash} quote a prize figure, and ${S.confirmedPaid} quote a fee. Non-withdrawable Bonus Cash, Gems and SB points are labelled as such.</li>
    <li><b>Headline figures need their wording.</b> MLB's $5,600,000 is a 57-streak annuity ($3,000,000 lump sum); CBS's $100,000 is a perfect-week contingency; PayPal's $67,500 total includes Render credits. We publish the wording, not a single invented number.</li>
    <li><b>The data is seasonal and it shows.</b> ESPN Survivor entry has closed, FOX Super 6 has no active games, Tom Howard is closed and TradingView's July edition ended 14 August 2026 — each confirmed on the operator's own page.</li>
    <li><b>Sourcing quality is uneven.</b> ${S.noOfficial} rows cite only forums, blogs or old articles. Their values are blank, not guessed.</li>
    <li><b>Verification is deliberately incomplete.</b> ${S.unverified} of ${S.rows} rows were not re-read on ${esc(fmtDate(TODAY))}. That gap is published rather than hidden.</li>
  </ol></div>
</section>

<section class="section"><h2>6. What this evidence cannot tell you</h2>
  <div class="callout warn"><ul class="list">
    <li>Odds of winning, field sizes, historical win rates and expected value per hour.</li>
    <li>Whether a contest is running beyond the moment its page was read on ${esc(fmtDate(TODAY))}.</li>
    <li>Legality in your jurisdiction, identity requirements, and the tax treatment of a prize.</li>
    <li>The current value of any figure on the ${S.unverified} rows we did not re-read.</li>
  </ul></div>
</section>`;
  return layout({ title: 'Analysis — PrizeDesk', description: 'Counted findings from the pinned ledger and the official pages read on 2 Nov 2026.', active: 'analysis.html', body, scripts: false });
}

/* ------------------------------------------------------------------ verified evidence page */

function buildVerified() {
  const pageRows = fresh.pages.map((p) => `<tr>
      <td data-label="Official URL"><a href="${attr(p.url)}" rel="noopener noreferrer">${esc(p.url)}</a></td>
      <td data-label="Page title">${esc(p.title)}</td>
      <td data-label="Outcome"><span class="badge ${/404|no usable|sunset/i.test(p.outcome) ? 'warn' : 'good'}">${esc(p.outcome)}</span></td>
      <td data-label="Rows">${(p.rows || []).map((id) => `<a href="c/${attr(id)}.html">${esc((itemsById.get(id) || {}).name || id)}</a>`).join(', ')}</td>
    </tr>`).join('');
  const articles = fresh.rows.map((r) => {
    const facts = r.facts || {};
    const factRows = Object.keys(facts).map((k) => {
      const x = facts[k];
      const label = { prize: 'Prize', entry: 'Entry cost', deadline: 'Deadline', status: 'Status', eligibility: 'Eligibility', aiAgent: 'AI-agent rules' }[k] || k;
      return `<tr>
        <td data-label="Field">${esc(label)}</td>
        <td data-label="Confirmed value"><span class="prize">${esc(k === 'deadline' ? fmtDate(x.value) : x.value)}</span></td>
        <td data-label="Verbatim quote"><span class="fact-quote">${esc(x.quote)}</span></td>
        <td data-label="Official source"><a class="src-link" href="${attr(x.url)}" rel="noopener noreferrer">Official page ↗</a></td>
      </tr>`;
    }).join('');
    const blanks = (r.notStated || []).map((x) => `<li>${esc(x)}</li>`).join('');
    const flags = (r.flags || []).map((x) => `<li>${esc(x)}</li>`).join('');
    return `<article class="verified-article" id="${attr(r.id)}">
      <h3>${esc(r.name)} <span class="note-tiny">· ${esc(typeById.get(r.category) ? typeById.get(r.category).name : r.category)}</span></h3>
      <p class="mini-links"><a class="src-link" href="${attr(r.sourceUrl)}" rel="noopener noreferrer">${esc(r.sourceLabel)} ↗</a>
        <a href="c/${attr(r.id)}.html">Detail page ↗</a></p>
      ${factRows ? `<div class="table-scroll"><table class="ledger">
        <thead><tr><th>Field</th><th>Confirmed value</th><th>Verbatim quote from the official page</th><th>Official source</th></tr></thead>
        <tbody>${factRows}</tbody></table></div>` : '<p class="note-tiny">No field could be confirmed. All value cells are blank and flagged.</p>'}
      ${blanks ? `<div class="evidence-box"><b>Left blank (not stated on the pages read)</b><ul class="src-list">${blanks}</ul></div>` : ''}
      ${flags ? `<div class="evidence-box"><b>Flags on this row</b><ul class="src-list">${flags}</ul></div>` : ''}
    </article>`;
  }).join('\n');
  const leads = fresh.newLeads.map((l) => `<tr>
      <td class="cell-name" data-label="Lead">${esc(l.name)}<span class="cell-sub">${esc(l.note)}</span></td>
      <td data-label="Official wording"><span class="fact-quote">${esc(l.quote)}</span></td>
      <td data-label="Official source"><a class="src-link" href="${attr(l.url)}" rel="noopener noreferrer">Official page ↗</a></td>
    </tr>`).join('');
  const body = `
<section class="hero"><p class="kicker">Line-by-line verification · ${esc(fmtDate(TODAY))}</p>
  <h1>Exactly what we read, and what each value rests on</h1>
  <p class="lede">Every confirmed value below is a verbatim reading from an official operator page fetched on
  ${esc(fmtDate(TODAY))}. A field the page did not state is listed as blank. Nothing is inferred, converted,
  summed or carried over from the reference ledger.</p></section>
<div class="stat-grid">
  ${stat(String(fresh.pages.length), 'official pages fetched', 'good')}
  ${stat(String(fresh.rows.length), 'rows with evidence', 'good')}
  ${stat(String(S.unverified), 'rows blank + flagged', 'warn')}
  ${stat(String(fresh.newLeads.length), 'new official leads')}
</div>
<div class="callout info"><p><b>How to audit a row.</b> Open the official page, find the quoted wording, and
compare it with the value. If a value is missing from the official page, it is absent here too and appears
under "Left blank".</p></div>

<section class="section"><h2>1. Pages fetched on ${esc(fmtDate(TODAY))}</h2>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Official URL</th><th>Page title returned</th><th>Outcome</th><th>Rows</th></tr></thead>
    <tbody>${pageRows}</tbody></table></div>
</section>

<section class="section"><h2>2. Row-by-row evidence</h2>
  ${articles}
</section>

<section class="section"><h2>3. New official leads (not ledger rows)</h2>
  <p class="note-tiny">Seen on an official index page on ${esc(fmtDate(TODAY))}. They are not merged into the
  pinned dataset, so every blank field stays blank.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Lead</th><th>Official wording</th><th>Official source</th></tr></thead>
    <tbody>${leads}</tbody></table></div>
</section>

<section class="section"><h2>4. Rows not re-read</h2>
  <p>The other ${S.unverified} rows retain their names, categories and links, but every value cell is blank.
  They are listed individually on the <a href="flagged.html#unverified-rows">Flagged for Review page</a>.</p>
</section>`;
  return layout({ title: `Verified ${fmtDate(TODAY)} — PrizeDesk`, description: 'Verbatim quotes and official URLs behind every published value.', active: 'verified.html', body, scripts: false });
}

/* ------------------------------------------------------------------ verification method */

function buildVerification() {
  const body = `
<section class="hero"><p class="kicker">Method, provenance and limits</p>
  <h1>How verification works here</h1>
  <p class="lede">One rule governs every number on this site: a value is published only when an official
  operator page fetched on ${esc(fmtDate(TODAY))} states it. Everything else is blank and flagged.</p></section>

<div class="stat-grid">
  ${stat(String(S.pages), 'official pages fetched', 'good')}
  ${stat(String(S.checked), 'rows with confirmed values', 'good')}
  ${stat(String(S.unverified), 'rows blank + flagged', 'warn')}
  ${stat(String(S.noOfficial), 'rows with no official source', 'warn')}
</div>

<section class="section"><h2>1. Provenance</h2>
  <div class="card"><dl class="kv">
    <div class="kv-item"><dt>Reference site</dt><dd><a href="${SOURCE_SITE}" rel="noopener noreferrer">Free Money &amp; Contest Ledger</a></dd></div>
    <div class="kv-item"><dt>Reference repository</dt><dd><a href="${SOURCE_REPO}" rel="noopener noreferrer">karagemop466-tech/FreeMoneyApps</a></dd></div>
    <div class="kv-item"><dt>Pinned commit</dt><dd><code>${esc(ledger.provenance.sourceRepoCommit)}</code></dd></div>
    <div class="kv-item"><dt>Source file</dt><dd><code>assets/data.js</code>, vendored as <code>data/source/ledger.source.js</code></dd></div>
    <div class="kv-item wide"><dt>SHA-256</dt><dd style="word-break:break-all"><code>${esc(ledger.provenance.sourceFileSha256)}</code></dd></div>
    <div class="kv-item"><dt>Ledger's own review date</dt><dd>${esc(fmtDate(SOURCE_REVIEWED))} (pass ${esc(ledger.pass)})</dd></div>
    <div class="kv-item"><dt>Our verification date</dt><dd>${esc(fmtDate(TODAY))}</dd></div>
    <div class="kv-item wide"><dt>How the file is handled</dt><dd><code>scripts/ingest.js</code> verifies the checksum, strips the <code>window.LEDGER =</code> prefix and parses the remainder as strict JSON. The JavaScript is never executed.</dd></div>
  </dl></div>
</section>

<section class="section"><h2>2. The five rules</h2>
  <div class="card"><ol class="list">
    <li><b>Official wording or blank.</b> A prize, entry cost, deadline, status or eligibility value is printed only when a page fetched on ${esc(fmtDate(TODAY))} states it verbatim. Each such value carries its quote and URL on the <a href="verified.html">Verified 2 Nov</a> page.</li>
    <li><b>No inference, no conversion, no summation.</b> An annuity is not turned into a lump sum we did not read; "up to" is not a promise; multi-award tables are not totalled.</li>
    <li><b>The ledger is a pointer, not a source of values.</b> It supplies the competition name, its category grouping and where to look. Its own prize/status/free labels are deliberately not republished.</li>
    <li><b>Publish the gap.</b> ${S.unverified} rows were not re-read. They are listed one by one on <a href="flagged.html#unverified-rows">Flagged for Review</a> rather than hidden.</li>
    <li><b>Publish the problems.</b> ${allFlags.length} irregularities carry evidence and source links; none is silently corrected.</li>
  </ol></div>
</section>

<section class="section"><h2>3. What the badges mean</h2>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Badge</th><th>Meaning</th></tr></thead><tbody>
      <tr><td data-label="Badge"><span class="badge good">Verified 2 Nov</span></td><td data-label="Meaning">At least one official page for this row was fetched on ${esc(fmtDate(TODAY))} and a confirmed value is shown.</td></tr>
      <tr><td data-label="Badge"><span class="badge warn">Unverified</span></td><td data-label="Meaning">No official page for this row was read on ${esc(fmtDate(TODAY))}. All value cells are blank.</td></tr>
      <tr><td data-label="Badge"><span class="badge danger">Paid entry confirmed</span></td><td data-label="Meaning">The operator's own page states a fee.</td></tr>
      <tr><td data-label="Badge"><span class="badge warn">none official</span></td><td data-label="Meaning">The ledger cites only affiliate or forum pages. Values are blank and the row is flagged.</td></tr>
    </tbody></table></div>
</section>

<section class="section"><h2>4. What was actually fetched</h2>
  <p>${S.pages} official pages were fetched once on ${esc(fmtDate(TODAY))}, covering ${S.checked} ledger rows.
  The complete list with URLs, titles and outcomes is the first table on the <a href="verified.html">Verified 2 Nov</a> page.</p>
  <div class="callout warn"><p><b>Why not all ${S.rows} rows?</b> A complete re-read would require roughly one
  official rules page per row, some behind anti-bot systems. This pass prioritised the highest-value and
  most questionable rows across all nine categories. The remaining ${S.unverified} rows are published as
  unverified with blank values — the gap is stated on every page.</p></div>
</section>

<section class="section"><h2>5. Reproduce this build</h2>
  <div class="card"><ul class="list">
    <li><code>node scripts/ingest.js</code> — verify the checksum and write <code>data/ledger.json</code></li>
    <li><code>node scripts/verify.js</code> — rebuild per-row sourcing and the historical flag register</li>
    <li><code>node scripts/build.js</code> — render all pages, category pages and detail pages</li>
    <li><code>node scripts/checklinks.js</code> — every internal link/anchor, and a source link on every table row</li>
    <li><code>node tests/validate.mjs</code> and <code>node tests/validate-prize-atlas.mjs</code> — data and archive checks</li>
    <li><code>node scripts/render-docs.js</code> — regenerate <code>docs/EXECUTIVE_SUMMARY.md</code> from the same content as the site</li>
  </ul>
  <p class="note-tiny">The generator reads only committed JSON, performs no network requests and uses no clock,
  so CI can rebuild the site and fail if any generated file changes.</p></div>
</section>

<section class="section"><h2>6. Limitations you should assume</h2>
  <div class="card"><ul class="list">
    <li>The pinned ledger's own labels are ${Math.round((new Date(TODAY + 'T00:00:00Z') - new Date(SOURCE_REVIEWED + 'T00:00:00Z')) / 86400000)} days old as of ${esc(fmtDate(TODAY))} and are not used as values.</li>
    <li>Operator pages change without notice; a date read today is one observation, not a permanent state.</li>
    <li>No odds, entrant counts, effort estimates or expected-value figures exist in the evidence, so none are shown.</li>
    <li>"US tax forms apply at $600+" is the reference site's generalisation, not a rule. See <a href="flagged.html#R-15">R-15</a> and the linked official rules. Nothing here is tax advice.</li>
  </ul></div>
</section>`;
  return layout({ title: 'Verification method — PrizeDesk', description: 'Provenance, the verification rules, badge meanings and how to reproduce the build.', active: 'verification.html', body, scripts: false });
}

/* ------------------------------------------------------------------ flagged page */

function flagArticle(f, historical) {
  const links = (f.links || []).map((l) => `<a href="${attr(l.url)}" rel="noopener noreferrer">${esc(l.title)} ↗</a>`).join(' · ');
  const evidence = (f.evidence || []).map((e) => `<li>${esc(e)}</li>`).join('');
  const affected = (f.affected || []).filter((id) => itemsById.has(id))
    .map((id) => `<a href="c/${attr(id)}.html">${esc(itemsById.get(id).name)}</a>`).join(' · ');
  return `<article class="flag ${f.severity === 'high' ? 'high' : ''}" id="${attr(f.id)}">
    <div class="meta">${esc(f.id)} · ${esc(f.severity)} severity · ${esc(f.type || 'register item')} · status: needs review</div>
    <h3>${esc(f.title)}</h3>
    <p>${esc(f.summary)}</p>
    ${evidence ? `<div class="evidence"><b>Evidence</b><ul>${evidence}</ul></div>` : ''}
    ${links ? `<p class="ids"><b>Source links for manual review:</b> ${links}</p>` : ''}
    ${affected ? `<p class="ids"><b>Affected rows:</b> ${affected}</p>` : ''}
    <p class="action"><b>What this site does about it:</b> ${esc(f.action)}</p>
  </article>`;
}
function buildFlagged() {
  const failing = Object.entries(linkHealth.results || {}).filter(([, v]) => v && v.ok === false);
  const hard = failing.filter(([, v]) => Number(v.status) >= 400 && Number(v.status) !== 403);
  const blocked = failing.filter(([, v]) => Number(v.status) === 403);
  const other = failing.filter(([, v]) => Number(v.status) < 400 && Number(v.status) !== 403);
  const linkRows = (arr, note) => arr.map(([url, v]) => `<tr>
      <td data-label="URL"><a href="${attr(url)}" rel="noopener noreferrer">${esc(url)}</a></td>
      <td data-label="HTTP status" class="num">${esc(v.status)}</td>
      <td data-label="Interpretation">${esc(note)}</td>
      <td data-label="Checked at">${esc(v.checkedAt || linkHealth.generated)}</td>
    </tr>`).join('');
  const unverifiedRows = unverifiedItems.map((i) => `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(i.id)}.html">${esc(i.name)}</a></td>
      <td data-label="Category"><a href="categories/${attr(i.type)}.html">${esc(typeById.get(i.type) ? typeById.get(i.type).name : i.type)}</a></td>
      <td data-label="Source link">${hasOfficial(i)
        ? `<a class="src-link" href="${attr(officialUrl(i))}" rel="noopener noreferrer">Official page ↗</a>`
        : `<a href="${attr(citedUrl(i))}" rel="noopener noreferrer">Cited page (not official) ↗</a>`}</td>
      <td data-label="Why it is blank">No official page was read on ${esc(fmtDate(TODAY))}; all value cells are unverified.</td>
    </tr>`).join('');
  const noOffRows = noOfficial.map((r) => {
    const i = itemsById.get(r.id);
    return `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(r.id)}.html">${esc(i ? i.name : r.id)}</a></td>
      <td data-label="Cited source"><a href="${attr(r.allSourceUrls[0] ? r.allSourceUrls[0].url : SOURCE_SITE)}" rel="noopener noreferrer">${esc(r.allSourceUrls[0] ? (r.allSourceUrls[0].title || r.allSourceUrls[0].url) : 'reference ledger')} ↗</a></td>
      <td data-label="Label"><span class="badge warn">none official</span></td>
      <td data-label="Action">All values blank; flagged for manual review.</td>
    </tr>`;
  }).join('');
  const body = `
<section class="hero"><p class="kicker">Status: needs review · does not block publication</p>
  <h1>Flagged for Review</h1>
  <p class="lede">Everything we could not verify, could not settle, or found inconsistent — ${allFlags.length}
  items (${newFlags.length} new on ${esc(fmtDate(TODAY))}, ${irr.items.length} from the earlier review),
  plus ${unverifiedItems.length} unverified rows. Each carries its evidence and a source link so you can
  review it after the site is live and request changes.</p></section>
<div class="callout info"><p><b>What "needs review" means.</b> The item is published here with its source
links and does not block the site or the merge. Unverified values stay <b>blank</b> in every table rather
than being filled in. See <a href="verification.html">how verification works</a>.</p></div>
<nav class="chip-row" style="margin:16px 0" aria-label="Jump to item">
  ${allFlags.map((f) => `<a class="chip" href="#${attr(f.id)}">${esc(f.id)}</a>`).join('')}
  <a class="chip" href="#unverified-rows">Unverified rows</a>
  <a class="chip" href="#no-official-source">No official source</a>
  <a class="chip" href="#link-health">Link health</a>
</nav>

<section class="section"><h2>New irregularities (${esc(fmtDate(TODAY))})</h2>
  ${newFlags.map((f) => flagArticle(f, false)).join('\n')}
</section>

<section class="section"><h2>Earlier register (${esc(fmtDate('2026-11-01'))})</h2>
  <p class="note-tiny">These items came from the earlier repo review and are kept verbatim with their ids so
  existing links continue to resolve. Their dates are their own, not today's.</p>
  ${irr.items.map((f) => flagArticle(f, true)).join('\n')}
</section>

<section class="section" id="unverified-rows"><h2>Unverified rows (${unverifiedItems.length})</h2>
  <p class="note-tiny">No official page for these rows was read on ${esc(fmtDate(TODAY))}. Their prize,
  entry, deadline and status cells are blank. Every row still links to a source so you can check it yourself.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Category</th><th>Source link</th><th>Why it is blank</th></tr></thead>
    <tbody>${unverifiedRows}</tbody></table></div>
</section>

<section class="section" id="no-official-source"><h2>Rows with no official source (${noOfficial.length})</h2>
  <p class="note-tiny">The reference ledger cites only affiliate, forum or news pages for these rows.
  No operator page could be linked, so every value is blank and the row is labelled "none official".</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Cited source (not official)</th><th>Label</th><th>Action</th></tr></thead>
    <tbody>${noOffRows}</tbody></table></div>
</section>

<section class="section" id="link-health"><h2>Automated link health (observation dated ${esc(String(linkHealth.generated).slice(0, 10))})</h2>
  <p class="note-tiny">${linkHealth.total} URLs checked, ${linkHealth.ok} ok, ${linkHealth.failing} reported
  as failing: ${hard.length} hard failures (4xx/5xx other than 403) and ${blocked.length} HTTP 403 responses.
  A 403 is usually an anti-bot block, not a broken page — several of these pages loaded normally when fetched
  with a page tool on ${esc(fmtDate(TODAY))}. This table is an observation, not a verdict.</p>
  <h3>Hard failures</h3>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>URL</th><th>Status</th><th>Interpretation</th><th>Checked at</th></tr></thead>
    <tbody>${linkRows(hard, 'request failed in the automated check')}</tbody></table></div>
  <h3>HTTP 403 (likely bot blocks)</h3>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>URL</th><th>Status</th><th>Interpretation</th><th>Checked at</th></tr></thead>
    <tbody>${linkRows(blocked, 'automated client blocked; page may still work in a browser')}</tbody></table></div>
  <h3>Other non-ok responses (redirects, TLS or network errors)</h3>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>URL</th><th>Status</th><th>Interpretation</th><th>Checked at</th></tr></thead>
    <tbody>${linkRows(other, 'automated request did not complete; not proof of a broken page')}</tbody></table></div>
  <p class="note-tiny">Full machine-readable record: <a href="https://github.com/sassnarep3-star/Own1/blob/main/data/link-health.json" rel="noopener noreferrer">data/link-health.json ↗</a>. See also <a href="#R-12">R-12</a>.</p>
</section>`;
  return layout({ title: 'Flagged for Review — PrizeDesk', description: `${allFlags.length} irregularities with source links, plus every unverified row.`, active: 'flagged.html', body, scripts: false });
}

/* ------------------------------------------------------------------ repo review / research */

function buildRepoReview() {
  const repoRows = review.repoFiles.map((f) => `<tr>
      <td data-label="File"><a href="${attr(f.url)}" rel="noopener noreferrer"><code>${esc(f.path)}</code> ↗</a></td>
      <td data-label="What it is / why to review it">${esc(f.note)}</td>
    </tr>`).join('');
  const refRows = review.referenceFiles.map((f) => `<tr>
      <td data-label="Reference file"><a href="${attr(f.url)}" rel="noopener noreferrer"><code>${esc(f.path)}</code> ↗</a></td>
      <td data-label="Note">${esc(f.note)}</td>
    </tr>`).join('');
  const flagRows = newFlags.map((f) => `<tr>
      <td data-label="Item"><a href="flagged.html#${attr(f.id)}">${esc(f.id)}</a></td>
      <td data-label="Finding">${esc(f.title)}</td>
      <td data-label="Severity">${esc(f.severity)}</td>
      <td data-label="Source links">${(f.links || []).slice(0, 2).map((l) => `<a href="${attr(l.url)}" rel="noopener noreferrer">${esc(l.title)} ↗</a>`).join(' · ')}</td>
    </tr>`).join('');
  const body = `
<section class="hero"><p class="kicker">Repo review · links for manual review</p>
  <h1>Review the repository line by line</h1>
  <p class="lede">This page is the manual-review index for the ${esc(fmtDate(TODAY))} integration. Every file
  we checked is linked to its GitHub copy; every irregularity carries its evidence and official source links
  on the <a href="flagged.html">Flagged for Review</a> page.</p></section>
<div class="callout info"><p><b>What we did.</b> Read <a href="${SOURCE_SITE}" rel="noopener noreferrer">the
reference site</a> and its own GitHub files; verified the pinned dataset's checksum; compared the published
site's data contract, generator, tests and CI workflow; then re-read ${S.pages} official operator pages.
Full written findings: <a href="https://github.com/sassnarep3-star/Own1/blob/main/REPO_REVIEW.md" rel="noopener noreferrer">REPO_REVIEW.md ↗</a>.</p></div>

<section class="section"><h2>1. Files in this repository</h2>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>File</th><th>What it is / why to review it</th></tr></thead>
    <tbody>${repoRows}</tbody></table></div>
</section>

<section class="section"><h2>2. Reference-site files reviewed</h2>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Reference file</th><th>Note</th></tr></thead>
    <tbody>${refRows}</tbody></table></div>
  <p class="note-tiny">Also reviewed: <a href="https://github.com/karagemop466-tech/FreeMoneyApps" rel="noopener noreferrer">the reference repository tree ↗</a> and its GitHub Pages build at <a href="${SOURCE_SITE}" rel="noopener noreferrer">${SOURCE_SITE}</a>.</p>
</section>

<section class="section"><h2>3. Irregularities flagged</h2>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Item</th><th>Finding</th><th>Severity</th><th>Source links</th></tr></thead>
    <tbody>${flagRows}</tbody></table></div>
  <p class="note-tiny">The earlier ${irr.items.length}-item register is on <a href="flagged.html">Flagged for Review</a>. All items are status "needs review" and do not block publication.</p>
</section>

<section class="section"><h2>4. Manual-review checklist</h2>
  <div class="card"><ol class="list">
    <li>Open <a href="verified.html">Verified 2 Nov</a> and check any quote against its official URL.</li>
    <li>Open <a href="flagged.html#unverified-rows">the unverified rows</a> and tell us which rows to verify next.</li>
    <li>Open <a href="flagged.html#no-official-source">the no-official-source rows</a> and supply an operator link if you have one.</li>
    <li>Compare <a href="executive-summary.html">the executive summary</a> with <a href="https://github.com/sassnarep3-star/Own1/blob/main/EXECUTIVE_SUMMARY.md" rel="noopener noreferrer">EXECUTIVE_SUMMARY.md ↗</a> and <a href="https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md" rel="noopener noreferrer">COORDINATION.md ↗</a>.</li>
    <li>Check the build: <a href="https://github.com/sassnarep3-star/Own1/blob/main/.github/workflows/validate.yml" rel="noopener noreferrer">validate.yml ↗</a>, <a href="https://github.com/sassnarep3-star/Own1/blob/main/scripts/checklinks.js" rel="noopener noreferrer">checklinks.js ↗</a>.</li>
  </ol></div>
</section>`;
  return layout({ title: 'Repo review — PrizeDesk', description: 'Line-by-line repository review with GitHub links for manual review.', active: 'repo-review.html', body, scripts: false });
}

function buildResearch() {
  const body = `
<section class="hero"><p class="kicker">Source audit</p>
  <h1>What the reference site is, and what we changed</h1>
  <p class="lede">The starting point is <a href="${SOURCE_SITE}" rel="noopener noreferrer">Free Money &amp; Contest Ledger</a>.
  It is a third-party research catalogue, not an operator. We pinned its maintained dataset and then checked
  the operator's own pages before printing any value.</p></section>
<div class="stat-grid">
  ${stat('206', 'listings claimed by the reference README')}
  ${stat(String(S.rows), 'rows in the pinned + merged dataset')}
  ${stat(String(S.pages), 'official pages read 2 Nov', 'good')}
  ${stat(String(S.unverified), 'rows still unverified', 'warn')}
</div>
<div class="callout warn"><p><b>Headline counts disagree.</b> The reference README declares 206 listings
across 9 categories. The pinned dataset plus five merged additions and cross-checks in this repository
contains ${S.rows} rows. Both figures are published here rather than reconciled by guesswork; see
<a href="flagged.html#I-01">I-01</a> and <a href="flagged.html#R-11">R-11</a>.</p></div>

<section class="section"><h2>1. What makes the reference site hard to use on a phone</h2>
  <div class="card"><ul class="list">
    <li>Its own landing page says: "No search box, no filters: just scroll, or tap a section to jump to it." With 206 cards that is a very long scroll.</li>
    <li>All listings and the four headline counts are injected by <code>assets/js/app.js</code>. With scripts blocked the page shows an empty grid and four zeroes.</li>
    <li>The stylesheet has a single 760px breakpoint and no table view, so comparing prize/entry/status across rows means scrolling back and forth.</li>
    <li>Its <code>100_VERIFIED_CONTESTS.md</code> and <code>index.md</code> are both marked superseded by their own authors; the first documents prize claims that did not exist.</li>
    <li>Some operator links have rotted (Challenge.gov sunset, HeroX and RoboForex 404s), and its blanket "US tax forms apply at $600+" line is a generalisation.</li>
  </ul>
  <p class="note-tiny">Manual review: <a href="https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/index.html" rel="noopener noreferrer">reference index.html ↗</a> · <a href="https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/js/app.js" rel="noopener noreferrer">app.js ↗</a> · <a href="https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/100_VERIFIED_CONTESTS.md" rel="noopener noreferrer">100_VERIFIED_CONTESTS.md ↗</a> · <a href="https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/README.md" rel="noopener noreferrer">README.md ↗</a></p></div>
</section>

<section class="section"><h2>2. What this site does differently</h2>
  <div class="card"><ol class="list">
    <li>Pre-rendered static tables with labelled mobile cells; search/filter/sort is progressive enhancement and works with JavaScript off.</li>
    <li>A dashboard, category subpages, a detail page per row, an analysis page, a verification page and a clearly labelled Flagged for Review page.</li>
    <li>Only values read on an official page on ${esc(fmtDate(TODAY))} are printed, with the verbatim quote and URL on <a href="verified.html">Verified 2 Nov</a>.</li>
    <li>Unverified rows keep their name, category and links but have blank value cells, and are listed one by one on <a href="flagged.html#unverified-rows">Flagged for Review</a>.</li>
    <li>Every table row links to a source; rows without an official operator page are labelled "none official" rather than given a made-up one.</li>
  </ol></div>
</section>

<section class="section"><h2>3. Provenance of the pinned file</h2>
  <div class="card"><dl class="kv">
    <div class="kv-item"><dt>Source commit</dt><dd><code>${esc(ledger.provenance.sourceRepoCommit)}</code></dd></div>
    <div class="kv-item"><dt>Source file</dt><dd><code>assets/data.js</code></dd></div>
    <div class="kv-item wide"><dt>SHA-256</dt><dd style="word-break:break-all"><code>${esc(ledger.provenance.sourceFileSha256)}</code></dd></div>
    <div class="kv-item"><dt>Vendored as</dt><dd><code>data/source/ledger.source.js</code></dd></div>
    <div class="kv-item"><dt>Declared review date</dt><dd>${esc(fmtDate(SOURCE_REVIEWED))}</dd></div>
  </dl>
  <p class="note-tiny">See <a href="https://github.com/sassnarep3-star/Own1/blob/main/data/source/PROVENANCE.json" rel="noopener noreferrer">PROVENANCE.json ↗</a> and <a href="https://github.com/sassnarep3-star/Own1/blob/main/scripts/ingest.js" rel="noopener noreferrer">ingest.js ↗</a>. The file is parsed as JSON; its JavaScript is never executed.</p></div>
</section>

<section class="section"><h2>4. Sources used in the 2 Nov pass</h2>
  <p class="note-tiny">All ${S.pages} official URLs are listed with titles and outcomes on
  <a href="verified.html">Verified 2 Nov</a>. The most consequential ones:</p>
  <div class="card"><ul class="list">
    <li><a href="https://www.kaggle.com/competitions" rel="noopener noreferrer">Kaggle Competitions ↗</a> · <a href="https://www.kaggle.com/docs/competitions" rel="noopener noreferrer">Kaggle competition docs ↗</a></li>
    <li><a href="https://arcprize.org/competitions/2026" rel="noopener noreferrer">ARC Prize 2026 ↗</a> · <a href="https://www.drivendata.org/competitions/306/competition-doe-gems/" rel="noopener noreferrer">DrivenData GEMS ↗</a> · <a href="https://www.metaculus.com/tournaments/" rel="noopener noreferrer">Metaculus Tournaments ↗</a></li>
    <li><a href="https://twitchcon-codex.devpost.com/rules" rel="noopener noreferrer">Codex x TwitchCon rules ↗</a> · <a href="https://paypalaihackathon.devpost.com/rules" rel="noopener noreferrer">PayPal AI Hackathon rules ↗</a> · <a href="https://devpost.com/hackathons" rel="noopener noreferrer">Devpost hackathons ↗</a></li>
    <li><a href="https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay" rel="noopener noreferrer">ESPN Pick'em rules ↗</a> · <a href="https://www.cbssports.com/fantasy/football/games/pickem/rules" rel="noopener noreferrer">CBS rules ↗</a> · <a href="https://www.mlb.com/apps/beat-the-streak/official-rules" rel="noopener noreferrer">MLB Beat the Streak rules ↗</a></li>
    <li><a href="https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free" rel="noopener noreferrer">Winning Writers ↗</a> · <a href="https://www.worldphoto.org/sony-world-photography-awards" rel="noopener noreferrer">Sony World Photography Awards ↗</a> · <a href="https://www.challenge.gov/" rel="noopener noreferrer">Challenge.gov sunset notice ↗</a></li>
  </ul></div>
</section>`;
  return layout({ title: 'Source audit — PrizeDesk', description: 'Analysis of the reference site, its defects, and the provenance of the pinned dataset.', active: 'research.html', body, scripts: false });
}

/* ------------------------------------------------------------------ verified shortlist (from PR #35) */

function buildShortlist() {
  const notes = new Map((shortlistNotes.rows || []).map((n) => [n.id, n]));
  const checks = new Map();
  for (const c of (crossChecks.checks || [])) {
    if (!checks.has(c.id)) checks.set(c.id, []);
    checks.get(c.id).push(c);
  }
  const ids = [...new Set([...notes.keys(), ...checks.keys()])].filter((id) => itemsById.has(id));
  const rows2 = ids.map((id) => {
    const item = itemsById.get(id);
    const n = notes.get(id) || {};
    const cs = checks.get(id) || [];
    const f = freshById.get(id);
    const deadline = (f && f.facts && f.facts.deadline && f.facts.deadline.value) ||
      (cs.find((c) => c.deadline) || {}).deadline || '';
    return { item, n, cs, f, deadline };
  }).sort((a, b) => {
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return a.item.name.localeCompare(b.item.name);
  });
  const tableRows = rows2.map(({ item, n, cs, f, deadline }) => {
    const url = n.url || (cs[0] && cs[0].url) || officialUrl(item);
    const caveats = cs.flatMap((c) => c.caveats || []);
    return `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(item.id)}.html">${esc(item.name)}</a>
        <span class="cell-sub">${esc(n.kind || (f ? 'Verified 2 Nov' : 'Official-page check'))}</span></td>
      <td data-label="Verified deadline">${/^\d{4}-\d{2}-\d{2}$/.test(deadline) ? esc(fmtDate(deadline)) : '<span class="blank">—</span>'}</td>
      <td data-label="Days from 2 Nov" class="num">${/^\d{4}-\d{2}-\d{2}$/.test(deadline) ? daysUntil(deadline) : '—'}</td>
      <td data-label="Official source"><a class="src-link" href="${attr(url)}" rel="noopener noreferrer">Official page ↗</a></td>
      <td data-label="Sourced note">${n.note ? esc(n.note) : '<span class="blank">—</span>'}</td>
      <td data-label="Caveats">${caveats.length ? `<ul class="list" style="margin:0">${caveats.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<span class="blank">—</span>'}</td>
    </tr>`;
  }).join('');
  const body = `
<section class="hero"><p class="kicker">Verified shortlist · deadline order</p>
  <h1>Official-page checks, sorted by the dates recorded</h1>
  <p class="lede">This page carries forward the Verified shortlist introduced by the parallel session
  <code>7a477419-own1</code> (PR #35). Its per-row notes come from
  <code>data/shortlist-notes.json</code> and its dated official-page reads from
  <code>data/cross-checks.json</code>; no note was rewritten and no value was inferred. Rows this session
  re-read on ${esc(fmtDate(TODAY))} also show their new evidence on <a href="verified.html">Verified 2 Nov</a>.</p>
  <div class="btn-row"><a class="btn primary" href="best.html">Best picks →</a>
  <a class="btn" href="verified.html">Line-by-line evidence</a>
  <a class="btn" href="flagged.html">Flagged for review</a></div></section>
<div class="callout info"><p><b>Two audits, one dataset.</b> The earlier sessions recorded
${(crossChecks.checks || []).length} official-page check records and
<a href="https://github.com/sassnarep3-star/Own1/blob/main/data/verification/current-state-2026-11-02.md" rel="noopener noreferrer">a targeted current-state audit ↗</a>
(<a href="https://github.com/sassnarep3-star/Own1/blob/main/docs/SESSION-7a477419.md" rel="noopener noreferrer">integration log ↗</a>).
This session added ${fresh.pages.length} further official reads. Dates on this page belong to the check that
recorded them; a blank deadline means the official page did not state one.</p></div>
<div class="stat-grid">
  ${stat(String(rows2.length), 'shortlisted rows')}
  ${stat(String((crossChecks.checks || []).length), 'dated check records', 'good')}
  ${stat(String(fresh.pages.length), 'pages read 2 Nov', 'good')}
  ${stat(String(S.unverified), 'rows still unverified', 'warn')}
</div>
<section class="section"><h2>Deadline-sorted shortlist</h2>
  <p class="note-tiny">A zero in "Days from 2 Nov" means the date is today. Every row links to its
  official page and to its detail page. Notes are quoted verbatim from the earlier session's record.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Verified deadline</th><th>Days from 2 Nov</th><th>Official source</th><th>Sourced note</th><th>Caveats</th></tr></thead>
    <tbody>${tableRows}</tbody></table></div>
</section>
<section class="section"><h2>Interpretation limits</h2>
  <div class="callout warn"><ul class="list">
    <li>A large prize pool is not a win estimate; no odds, expected return or effort estimate is published.</li>
    <li>Bots and AI accounts are generally ineligible for Metaculus tournament prizes unless the specific competition permits them — see <a href="flagged.html#R-18">R-18</a>.</li>
    <li>No Singapore-specific eligibility conclusion is established; confirm geographic and age terms on the operator's rules page.</li>
    <li>The GEMS entry fee is not stated on the pages read, so its entry-cost cell stays blank — see <a href="flagged.html#R-17">R-17</a>.</li>
  </ul></div>
</section>`;
  return layout({ title: 'Verified shortlist — PrizeDesk', description: 'Deadline-sorted official-page checks with sourced notes and caveats.', active: 'shortlist.html', body, scripts: false });
}

/* ------------------------------------------------------------------ executive / 404 / sitemap */

function renderHtml(c) {
  return c.blocks.map((b) => {
    if (b.t === 'h2') return `<h2>${esc(b.text)}</h2>`;
    if (b.t === 'h3') return `<h3>${esc(b.text)}</h3>`;
    if (b.t === 'p') return `<p>${esc(b.text)}</p>`;
    if (b.t === 'ul') return `<ul class="list">${b.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (b.t === 'ol') return `<ol class="list">${b.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`;
    if (b.t === 'table') return `<div class="table-scroll"><table class="ledger">
      <thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${b.rows.map((r) => `<tr>${r.map((cell, i) => `<td data-label="${attr(b.head[i])}">${/^https:\/\//.test(String(cell))
        ? `<a href="${attr(cell)}" rel="noopener noreferrer">Official source ↗</a>` : esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
    return '';
  }).join('\n');
}
function buildExecutive() {
  const c = summary.build();
  const latestCrossCheck = verif.rows.reduce((latest, r) =>
    r.crossCheck && r.crossCheck.checkedDate > latest ? r.crossCheck.checkedDate : latest, verif.verifiedOn);
  const upstream = verif.totals.rows - verif.totals.addedByParallelSessions;
  const body = `
<section class="hero"><p class="kicker">Executive summary · updated ${esc(fmtDate(latestCrossCheck))} · base verification ${esc(fmtDate(verif.verifiedOn))}</p>
  <h1>${esc(c.title)}</h1><p class="lede">${esc(c.standfirst)}</p>
  <p class="note-tiny">The pinned source file has ${upstream} listings. The combined dataset reconciles as
  ${upstream} pinned upstream rows + ${verif.totals.addedByParallelSessions} attributed additions =
  ${verif.totals.rows} rows. Read the
  <a href="https://github.com/sassnarep3-star/Own1/blob/main/data/verification/current-state-2026-11-02.md" rel="noopener noreferrer">targeted current-state audit ↗</a>
  and the <a href="shortlist.html">Verified shortlist</a>, including the
  <a href="https://www.metaculus.com/tournament/fall-futureeval-2026/" rel="noopener noreferrer">official FutureEval bot-tournament page ↗</a>.
  No Singapore-specific eligibility conclusion is established.</p>
  <div class="btn-row"><a class="btn primary" href="all.html">Browse the ${S.rows} rows</a>
  <a class="btn" href="verified.html">Evidence</a>
  <a class="btn" href="flagged.html">Flagged (${allFlags.length})</a></div></section>
<article class="prose section">${renderHtml(c)}</article>`;
  return layout({ title: 'Executive summary — PrizeDesk', description: c.standfirst, active: 'executive-summary.html', body, scripts: false });
}
function build404() {
  const body = `<section class="hero"><p class="kicker">404</p><h1>That page is not here</h1>
  <p class="lede">The link may be out of date, or the competition may have been removed. Everything starts from the dashboard.</p>
  <div class="btn-row"><a class="btn primary" href="index.html">Dashboard</a>
  <a class="btn" href="all.html">All competitions</a></div></section>`;
  return layout({ title: 'Not found — PrizeDesk', description: 'Page not found.', body, scripts: false });
}
function buildSitemap(pages) {
  const urls = pages.map((p) => `  <url><loc>${LIVE}${p}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/* ------------------------------------------------------------------ write */

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
  return rel;
}
const written = [];
written.push(write('index.html', buildIndex()));
written.push(write('all.html', buildAll()));
buildCategories().forEach((p) => written.push(write(p.file, p.html)));
buildDetails().forEach((p) => written.push(write(p.file, p.html)));
written.push(write('best.html', buildBest()));
written.push(write('shortlist.html', buildShortlist()));
written.push(write('analysis.html', buildAnalysis()));
written.push(write('verified.html', buildVerified()));
written.push(write('verification.html', buildVerification()));
written.push(write('flagged.html', buildFlagged()));
written.push(write('repo-review.html', buildRepoReview()));
written.push(write('research.html', buildResearch()));
written.push(write('executive-summary.html', buildExecutive()));
written.push(write('404.html', build404()));
written.push(write('sitemap.xml', buildSitemap(written.filter((p) => p.endsWith('.html')))));
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');

console.log(`build ok — ${written.length} files`);
console.log(`  rows: ${S.rows}, detail pages: ${items.length}, categories: ${TYPES.length}`);
console.log(`  official pages read ${TODAY}: ${fresh.pages.length}, rows with confirmed values: ${S.checked}`);
console.log(`  unpublished/unverified rows: ${S.unverified}, flags: ${allFlags.length}`);
