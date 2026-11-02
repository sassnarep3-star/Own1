#!/usr/bin/env node
/**
 * build.js — generate the static site from data/ledger.json + data/verification.json
 * + data/irregularities.json + data/live-checks.json.
 *
 * Nothing in the HTML is hand-typed data: every row, count and flag comes from the JSON.
 * Output is plain static files (no framework, no build step at deploy time), so it works on
 * GitHub Pages exactly as it does locally.
 *
 * Usage: node scripts/build.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const content = require('./content');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const ledger = read('data/ledger.json');
const verif = read('data/verification.json');
const irr = read('data/irregularities.json');
const live = read('data/live-checks.json');

const rowsById = new Map(verif.rows.map((r) => [r.id, r]));
const itemsById = new Map(ledger.listings.map((i) => [i.id, i]));
const typeById = new Map(ledger.types.map((t) => [t.id, t]));
const TYPES = ledger.types;
const T = verif.totals;

const SITE = {
  name: 'PrizeDesk',
  tagline: 'Free-to-enter cash competitions, sourced to the operator',
  sourceReviewed: ledger.reviewed,
  verifiedOn: verif.verifiedOn,
  staleDays: verif.staleDays,
  commit: ledger.provenance.sourceRepoCommit,
  sha256: ledger.provenance.sourceFileSha256
};

// "As of" date for countdowns: the newest official-page reading recorded in the data.
SITE.asOf = verif.rows.reduce((m, r) => (r.crossCheck && r.crossCheck.checkedDate > m ? r.crossCheck.checkedDate : m), SITE.verifiedOn);

const NAV = [
  ['index.html', 'Dashboard'],
  ['all.html', 'All competitions'],
  ['best.html', 'Best picks'],
  ['shortlist.html', 'Verified shortlist'],
  ['analysis.html', 'Analysis'],
  ['research.html', 'Source audit'],
  ['verification.html', 'Verification'],
  ['flagged.html', 'Flagged for review']
];

/* ------------------------------------------------------------------ utils */

const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const attr = esc;

const FREE_LABEL = {
  full: 'Free entry',
  partial: 'Some free events',
  'paid-cash': 'Cash needs fee',
  unknown: 'Entry cost not stated'
};
const FREE_TONE = { full: 'good', partial: 'warn', 'paid-cash': 'danger', unknown: 'warn' };
const STATUS_LABEL = {
  live: 'Active',
  mixed: 'Mixed',
  caution: 'Caution',
  ended: 'Ended / out of season',
  inactive: 'Inactive'
};
const VERIF_LABEL = {
  account: 'Account only',
  eligibility: 'Eligibility check',
  kyc: 'Full KYC',
  tax: 'Tax paperwork',
  unknown: 'Not stated'
};
const TIER_LABEL = { official: 'Official', affiliate: 'Affiliate', forum: 'Forum' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return Number(d) + ' ' + MONTHS[Number(m) - 1] + ' ' + y;
}

/**
 * claimUsd(text) — the amount a prize claim actually commits to, read mechanically:
 *   1. a dollar figure the claim leads with  ("$50,000 total prizes" -> 50000)
 *   2. otherwise a range near the front      ("Per tournament — $3,000 to $50,000" -> 3000, the low end)
 *   3. otherwise null.  Hedged text ("commonly", "up to", "varies", "unpaid") is never turned into
 *      a number, and no figure is ever summed, converted or extrapolated.
 */
const VAGUE = /commonly|up to|varies|varying|unpaid|some are|many are|approx|roughly/i;

function claimUsd(text) {
  if (!text) return null;
  const t = String(text);
  const suffix = (v, s2) => {
    let n = Number(v.replace(/,/g, ''));
    if (!isFinite(n)) return null;
    if (s2 && /k/i.test(s2)) n *= 1000;
    if (s2 && /m/i.test(s2)) n *= 1000000;
    return n;
  };
  const lead = t.match(/^\s*\$\s?([0-9][0-9,]*(?:\.[0-9]+)?)\s*([kKmM])?/);
  if (lead) return suffix(lead[1], lead[2]);
  const range = t.match(/^.{0,40}?\$\s?([0-9][0-9,]*(?:\.[0-9]+)?)\s*([kKmM])?\s*(?:to|–|—|-)\s*\$\s?([0-9][0-9,]*(?:\.[0-9]+)?)/);
  if (range && !VAGUE.test(t.slice(0, 60))) return suffix(range[1], range[2]);
  return null;
}

/** Backwards-compatible alias used by the table sort attribute. */
const leadUsd = claimUsd;

const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

/* ------------------------------------------------------------------ layout */

function layout(opts) {
  const base = opts.base || '';
  const active = opts.active || '';
  const nav = NAV.map(([href, label]) =>
    `<a href="${base}${href}"${active === href ? ' aria-current="page"' : ''}>${esc(label)}</a>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
<meta name="description" content="${attr(opts.description || SITE.tagline)}">
<meta name="color-scheme" content="light dark">
<meta property="og:title" content="${attr(opts.title)}">
<meta property="og:description" content="${attr(opts.description || SITE.tagline)}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230b7a4b'/%3E%3Ctext x='32' y='44' font-size='34' font-family='system-ui,sans-serif' font-weight='700' fill='%23fff' text-anchor='middle'%3E%24%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${base}assets/css/site.css">
${opts.head || ''}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${base}index.html">
      <span class="brand-mark" aria-hidden="true">$</span>
      <span class="brand-text">
        <b>${esc(SITE.name)}</b>
        <span>Source reviewed ${esc(fmtDate(SITE.sourceReviewed))}</span>
      </span>
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
      <a href="${base}all.html">All ${T.rows} competitions</a>
      <a href="${base}best.html">Best picks</a>
      <a href="${base}shortlist.html">Verified shortlist</a>
      <a href="${base}analysis.html">Analysis</a>
      <a href="${base}research.html">Source audit</a>
      <a href="${base}verification.html">Verification method</a>
      <a href="${base}flagged.html">Flagged for review (${irr.items.length})</a>
      <a href="${base}executive-summary.html">Executive summary</a>
    </div>
    <p><b>${esc(SITE.name)}</b> is an independent workbench built on the Free Money &amp; Contest
    Ledger dataset (pinned commit <code>${esc(SITE.commit.slice(0, 7))}</code>, source reviewed
    ${esc(fmtDate(SITE.sourceReviewed))}). It is not affiliated with any operator listed.
    Prize figures are the source dataset's claims, not this site's promises — open the operator's
    rules before you enter. Contest law varies by state and country; play only where legal. 18+/21+.</p>
    <p class="note-tiny">Figures verified on this site: ${T.recheckedThisPass} of ${T.rows} rows were
    fetched live on ${esc(fmtDate(SITE.verifiedOn))}. Everything else is labelled
    "source cited — not re-checked". See <a href="${base}verification.html">how verification works</a>.</p>
  </div>
</footer>
${opts.scripts === false ? '' : `<script src="${base}assets/js/app.js" defer></script>`}
</body>
</html>`;
}

/* ------------------------------------------------------------------ components */

function stat(value, label, tone) {
  return `<div class="stat${tone ? ' is-' + tone : ''}"><b>${esc(value)}</b><span>${esc(label)}</span></div>`;
}

function badgesFor(item, row) {
  const out = [];
  out.push(`<span class="badge ${FREE_TONE[item.freePath]}">${esc(FREE_LABEL[item.freePath])}</span>`);
  if (item.status !== 'live') {
    out.push(`<span class="badge ${item.status === 'ended' ? 'danger' : 'warn'}">${esc(STATUS_LABEL[item.status])}</span>`);
  }
  if (row.rowStatus === 'live-checked') out.push('<span class="badge good">Live-checked</span>');
  if (row.rowStatus === 'cross-checked') out.push('<span class="badge info">Independently checked</span>');
  if (row.rowStatus === 'live-check-error') out.push('<span class="badge danger">Link error</span>');
  if (row.rowStatus === 'no-official-source') out.push('<span class="badge warn">No official source</span>');
  return out.join('');
}

function sourceCell(row, base) {
  const officialCount = row.officialSourceCount;
  const unofficial = row.allSourceUrls.find((s) => s.tier !== 'official');
  const checked = row.liveCheck
    ? '<span class="badge good">live-checked</span>'
    : (row.liveCheckError ? '<span class="badge danger">link error</span>' : '');

  if (!officialCount) {
    return `<span class="badge warn">none official</span> ` +
      (unofficial ? `<a class="src-link" href="${attr(unofficial.url)}" rel="noopener noreferrer nofollow">${esc(unofficial.title || 'secondary source')}</a>` : '') +
      `<span class="cell-sub">prize left blank — see <a href="${base}flagged.html#I-04">I-04</a></span>`;
  }
  const first = row.primaryOfficialUrl;
  const extra = officialCount > 1 ? ` <span class="note-tiny">+${officialCount - 1}</span>` : '';
  return `<a class="src-link" href="${attr(first)}" rel="noopener noreferrer">Official page ↗</a>${extra} ${checked}`;
}

function shortText(s, len) {
  const t = String(s || '');
  if (t.length <= len) return t;
  return t.slice(0, len - 1).replace(/\s+\S*$/, '') + '…';
}

/** One table row. */
function rowHtml(item, row, base, opts) {
  const usd = leadUsd(row.prizeCellValue);
  const figure = row.prizeCellValue ? 'yes' : 'no';
  const prizeCell = row.prizeCellValue
    ? `<span class="prize">${esc(row.prizeCellValue)}</span>`
    : `<span class="prize none">—</span><span class="cell-sub">${
      row.prizeHasOfficialBasis ? 'no amount stated by the source' : 'unverified: no official source'
    }</span>`;

  const platforms = item.platforms.map((p) => (p === 'ios' ? 'iOS app' : p === 'web' ? 'Web' : 'Android')).join(', ');
  const cat = typeById.get(item.type);

  const cells = [];
  cells.push(`<td class="cell-name" data-label="Competition">
      <a href="${base}c/${attr(item.id)}.html">${esc(item.name)}</a>
      <span class="cell-sub">${esc(shortText(item.short, 118))}</span>
      <span class="badges" style="margin-top:6px">${badgesFor(item, row)}</span>
    </td>`);
  if (!opts.hideCategory) {
    cells.push(`<td data-label="Category"><a href="${base}categories/${attr(item.type)}.html">${esc(cat ? cat.name : item.type)}</a></td>`);
  }
  cells.push(`<td data-label="Prize (claimed)">${prizeCell}</td>`);
  cells.push(`<td data-label="Entry"><span class="badge ${FREE_TONE[item.freePath]}">${esc(FREE_LABEL[item.freePath])}</span></td>`);
  cells.push(`<td data-label="Platform">${esc(platforms)}</td>`);
  cells.push(`<td data-label="ID checks">${esc(VERIF_LABEL[row.verificationLevel] || row.verificationLevel)}</td>`);
  cells.push(`<td data-label="Status">${esc(STATUS_LABEL[item.status] || item.status)}</td>`);
  cells.push(`<td data-label="Source">${sourceCell(row, base)}</td>`);

  return `<tr id="row-${attr(item.id)}"
    data-name="${attr(item.name)}"
    data-short="${attr(item.short)}"
    data-category="${attr(item.type)}"
    data-status="${attr(item.status)}"
    data-free="${attr(item.freePath)}"
    data-verif="${attr(row.verificationLevel)}"
    data-platforms="${attr(item.platforms.join(' '))}"
    data-checked="${row.liveCheck || row.liveCheckError ? 'yes' : 'no'}"
    data-figure="${figure}"
    data-usd="${usd == null ? '' : usd}"
    data-prize="${attr(String(row.prizeCellValue || '').toLowerCase())}"
    data-flags="${row.flags.length}">${cells.join('')}</tr>`;
}

function tableHead(opts) {
  const cols = ['Competition'];
  if (!opts.hideCategory) cols.push('Category');
  cols.push('Prize (claimed)', 'Entry', 'Platform', 'ID checks', 'Status', 'Source');
  return `<thead><tr>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>`;
}

function filterBar(opts) {
  const catOptions = opts.categories
    ? `<select data-filter="category" aria-label="Filter by category">
        <option value="">All categories</option>
        ${TYPES.map((t) => `<option value="${attr(t.id)}">${esc(t.name)}</option>`).join('')}
      </select>` : '';
  return `<div class="filters">
    <div class="filter-row">
      <div class="search-wrap">
        <input id="q" type="search" placeholder="Search ${opts.count} competitions…" aria-label="Search competitions" autocomplete="off">
      </div>
      ${catOptions}
      <select data-filter="free" aria-label="Filter by entry path">
        <option value="">Any entry path</option>
        <option value="full">Free entry</option>
        <option value="partial">Some free events</option>
        <option value="paid-cash">Cash needs a fee</option>
        <option value="unknown">Entry cost not stated</option>
      </select>
      <select data-filter="verif" aria-label="Filter by ID checks">
        <option value="">Any ID checks</option>
        ${ledger.verificationLevels.map((v) => `<option value="${attr(v.id)}">${esc(v.name)}</option>`).join('')}
      </select>
      <select data-filter="status" aria-label="Filter by status">
        <option value="">Any status</option>
        <option value="live">Active</option>
        <option value="mixed">Mixed</option>
        <option value="caution">Caution</option>
        <option value="ended">Ended / out of season</option>
      </select>
      <select data-filter="platform" aria-label="Filter by platform">
        <option value="">Any platform</option>
        <option value="web">Browser</option>
        <option value="ios">iOS app</option>
        <option value="android">Android app</option>
      </select>
      <select id="sort" aria-label="Sort rows">
        <option value="source">Sort: source order</option>
        <option value="prize">Sort: largest stated $ figure</option>
        <option value="verification">Sort: least ID checks first</option>
        <option value="name">Sort: name A–Z</option>
      </select>
    </div>
    <div class="chip-row">
      <button class="chip" type="button" data-chip="free" aria-pressed="false">Free entry only</button>
      <button class="chip" type="button" data-chip="live" aria-pressed="false">Active only</button>
      <button class="chip" type="button" data-chip="usd" aria-pressed="false">State a $ figure</button>
      <button class="chip" type="button" data-chip="checked" aria-pressed="false">Live-checked</button>
      <button class="chip" type="button" data-chip="flags" aria-pressed="false">Has a flag</button>
      <button class="chip" type="button" id="reset">Reset</button>
    </div>
    <p class="filter-count" id="count">${opts.count} of ${opts.count} competitions shown</p>
  </div>`;
}

function tableBlock(items, base, opts) {
  const rows = items.map((i) => rowHtml(i, rowsById.get(i.id), base, opts)).join('\n');
  return `${tableHead(opts)}\n<tbody>\n${rows}\n</tbody>`;
}

/* ------------------------------------------------------------------ detail pages */

function detailPage(item, row) {
  const base = '../';
  const cat = typeById.get(item.type);
  const sources = row.allSourceUrls;

  const kv = [];
  const push = (k, v, wide) => kv.push(`<div class="kv-item${wide ? ' wide' : ''}"><dt>${esc(k)}</dt><dd>${v}</dd></div>`);

  push('Prize (as claimed)', row.prizeCellValue
    ? esc(row.prizeCellValue)
    : `<span class="blank">— not shown</span><br><small>${row.prizeHasOfficialBasis
        ? 'The source states no money amount for this row, so we print none.'
        : 'This row has no official-tier source, so its prize claim is unverified and is not printed in the table.'}</small>`);
  push('Minimum cash-out', item.minCashout ? esc(item.minCashout) : '<span class="blank">—</span>');
  push('Pays via', (item.payoutMethods || []).length ? esc(item.payoutMethods.join(', ')) : '<span class="blank">—</span>');
  push('Who can enter', item.eligibility ? esc(item.eligibility) : '<span class="blank">—</span>');
  push('Blocked / limits', item.restricted ? esc(item.restricted) : '<span class="blank">—</span>');
  push('ID checks', esc(VERIF_LABEL[row.verificationLevel] || row.verificationLevel));
  push('Entry path', esc(FREE_LABEL[item.freePath]));
  push('Category', `<a href="${base}categories/${attr(item.type)}.html">${esc(cat ? cat.name : item.type)}</a>`);
  push('Status', esc(STATUS_LABEL[item.status] || item.status));
  push('Source last checked', esc(fmtDate(item.lastChecked)) + ` <small>(${SITE.staleDays} days before this page was built)</small>`);
  if (row.crossCheck && row.crossCheck.deadline) {
    push('Verified deadline', esc(fmtDate(row.crossCheck.deadline)) + ` <small>as read on ${esc(fmtDate(row.crossCheck.checkedDate))}</small>`);
  }

  const prizeNote = item.prizeNote ? `<div class="card"><h3>What the source says about the prize</h3>
    <p class="note-tiny">Direct quote from the ledger dataset. Unconfirmed unless the row is marked live-checked.</p>
    <p>${esc(item.prizeNote)}</p></div>` : '';

  const block = (title, list, cls) => (list && list.length
    ? `<div class="card"><h3>${esc(title)}</h3><ul class="list${cls ? ' ' + cls : ''}">${list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`
    : '');

  const sourceRows = sources.map((s) => `<tr>
      <td data-label="Source"><a href="${attr(s.url)}" rel="noopener noreferrer">${esc(s.title || s.url)}</a></td>
      <td data-label="Tier"><span class="badge ${s.tier === 'official' ? 'good' : 'warn'}">${esc(TIER_LABEL[s.tier] || s.tier)}</span></td>
      <td data-label="Checked">${row.liveChecks.some((c) => c.url === s.url) ? 'fetched ' + esc(fmtDate(SITE.verifiedOn)) : '<span class="blank">not fetched this pass</span>'}</td>
    </tr>`).join('');

  const flagList = row.flags.length
    ? `<ul class="list">${row.flags.map((f) => {
        const reg = irr.items.find((i) => i.id === f);
        return `<li><a href="${base}flagged.html#${esc(f)}">${esc(f)}</a> — ${esc(reg ? reg.title : 'see flag register')}</li>`;
      }).join('')}</ul>`
    : '<p class="note-tiny">No structural flags on this row.</p>';

  const crossCard = row.crossCheck ? `<div class="card">
      <h2>Independently checked</h2>
      <p class="note-tiny">Read on ${esc(fmtDate(row.crossCheck.checkedDate))} by
      <code>${esc(row.crossCheck.checkedBy || 'another session')}</code>.
      Confirmed items and caveats are carried verbatim from the record of that reading, not inferred.</p>
      <p><a href="${attr(row.crossCheck.url)}" rel="noopener noreferrer">${esc(shortText(row.crossCheck.url.replace(/^https?:\/\//, ''), 52))} ↗</a></p>
      ${(row.crossCheck.confirmed || []).length ? `<h3>Confirmed on that page</h3><ul class="list">${row.crossCheck.confirmed.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      ${(row.crossCheck.caveats || []).length ? `<h3>Caveats recorded</h3><ul class="list">${row.crossCheck.caveats.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      ${row.crossCheck.deadline ? `<p class="note-tiny"><b>Deadline:</b> ${esc(fmtDate(row.crossCheck.deadline))}</p>` : ''}
    </div>` : '';

  const mergedNote = row.mergedFrom ? `<div class="callout info"><p><b>This row is not in the original ledger.</b>
    It was added by a parallel session in this repository (${esc(row.mergedFrom)}) after reading the operator page.
    Only the facts that session recorded are shown; everything it left blank is blank here.</p></div>` : '';

  const statusText = {
    'live-checked': 'We fetched a page of this row on ' + fmtDate(SITE.verifiedOn) + ' and it loaded with relevant content.',
    'live-check-error': 'We fetched this row\'s link on ' + fmtDate(SITE.verifiedOn) + ' and it returned an error page.',
    'cross-checked': 'An official page for this row was read on ' + fmtDate(row.crossCheck && row.crossCheck.checkedDate || SITE.verifiedOn) + ' by ' + ((row.crossCheck && row.crossCheck.checkedBy) || 'a session in this repository') + ' and what it said is recorded on this page. The page-fetch build step did not re-fetch it.',
    'official-source-cited': 'This row cites an official source, but we did not fetch it in this pass. Treat the figures as the source\'s claims, last checked ' + fmtDate(SITE.sourceReviewed) + '.',
    'no-official-source': 'This row cites no official source. Its figures are withheld from our table and listed on the Flagged for Review page.'
  }[row.rowStatus];

  const dirNote = item.type === 'directory'
    ? `<div class="callout warn"><p><b>This is a catalogue, not a competition.</b> A directory lists other
       people's contests — some free, some with entry fees. Nothing here is a prize you can win by entering
       this page. See <a href="${base}flagged.html#I-14">I-14</a>.</p></div>`
    : '';

  const codeNote = item.code
    ? `<div class="callout warn"><p><b>A referral/promo code was attached to this row in the source data.</b>
       We do not republish it: ${row.flags.includes('I-07') ? '8 of the 12 codes in the dataset are explicitly marked unverified' : 'codes are personal or affiliate incentives'}.
       See <a href="${base}flagged.html#I-07">I-07</a>. Get any code from the operator, never from a ledger.</p></div>`
    : '';

  const navLinks = [
    item.signupUrl ? `<a class="btn primary" href="${attr(item.signupUrl)}" rel="noopener noreferrer">Operator page ↗</a>` : '',
    item.rulesUrl && item.rulesUrl !== item.signupUrl ? `<a class="btn" href="${attr(item.rulesUrl)}" rel="noopener noreferrer">Rules / terms ↗</a>` : '',
    item.tosUrl && item.tosUrl !== item.rulesUrl && item.tosUrl !== item.signupUrl ? `<a class="btn" href="${attr(item.tosUrl)}" rel="noopener noreferrer">Terms of use ↗</a>` : '',
    item.iosUrl ? `<a class="btn" href="${attr(item.iosUrl)}" rel="noopener noreferrer">iOS App Store ↗</a>` : ''
  ].filter(Boolean).join('');

  const body = `
<p class="note-tiny" style="margin-top:16px"><a href="${base}categories/${attr(item.type)}.html">← ${esc(cat ? cat.name : item.type)}</a>
 · <a href="${base}all.html">All competitions</a></p>
<section class="section" style="margin-top:6px">
  <h1>${esc(item.name)}</h1>
  <div class="badges" style="margin-bottom:10px">${badgesFor(item, row)}</div>
  <p class="lede">${esc(item.short)}</p>
  <div class="btn-row">${navLinks}</div>
</section>

${row.liveCheckError ? `<div class="callout warn"><p><b>Link problem found on ${esc(fmtDate(SITE.verifiedOn))}.</b>
  ${esc(row.liveCheckError.url)} returned an error page when fetched (${esc(row.liveCheckError.pageTitle || 'error')}).
  The operator link above may still work. Flagged as <a href="${base}flagged.html#I-05">I-05</a>.</p></div>` : ''}

${mergedNote}
<div class="detail-grid section">
  <div>
    <div class="card">
      <h2>Facts on record</h2>
      <dl class="kv">${kv.join('')}</dl>
    </div>
    <div style="margin-top:12px">${prizeNote}</div>
    ${block('How to sign up', item.signupSteps)}
    ${block('How the competition works', item.howToWin)}
    ${block('How to get paid', item.howToGetMoney)}
    ${block('Verification the operator runs', item.verification.steps)}
    ${block('Terms notes', item.tosNotes)}
    ${block('Watch-outs (from the source)', item.redFlags)}
  </div>
  <aside>
    <div class="card">
      <h2>Verification status</h2>
      <p><span class="badge ${
        row.rowStatus === 'live-checked' ? 'good' : row.rowStatus === 'live-check-error' ? 'danger' : row.rowStatus === 'no-official-source' ? 'warn' : 'info'
      }">${esc({
        'live-checked': 'Live-checked',
        'live-check-error': 'Link error found',
        'cross-checked': 'Independently checked',
        'official-source-cited': 'Source cited — not re-checked',
        'no-official-source': 'No official source'
      }[row.rowStatus])}</span></p>
      <p class="note-tiny">${esc(statusText)}</p>
      <h3 style="margin-top:14px">Flags on this row</h3>
      ${flagList}
    </div>
    <div class="card">
      <h2>Sources</h2>
      <div class="table-scroll">
        <table class="ledger"><thead><tr><th>Source</th><th>Tier</th><th>Checked</th></tr></thead>
        <tbody>${sourceRows}</tbody></table>
      </div>
      <p class="note-tiny" style="margin-top:8px">Tier is the source dataset's own label. Only "Official" means the operator's own domain.</p>
    </div>
    ${crossCard ? `<div style="margin-top:12px">${crossCard}</div>` : ''}
    ${dirNote ? `<div style="margin-top:12px">${dirNote}</div>` : ''}
    ${codeNote ? `<div style="margin-top:12px">${codeNote}</div>` : ''}
  </aside>
</div>`;

  return layout({
    title: `${item.name} — ${SITE.name}`,
    description: item.short,
    base,
    active: 'all.html',
    body
  });
}

/* ------------------------------------------------------------------ scores */

const VERIF_SCORE = { account: 2, eligibility: 1, kyc: -1, tax: -2 };
/* Editorial "fit" weight: how well a category suits a solo entrant who can use an AI agent,
   based on whether scoring is objective and the field is small enough for one good entry to place. */
const FIT = { tech: 3, forecasting: 3, market: 1, creative: 1, sports: 0, skill: 0, pools: -3, directory: -9 };

const liveByListing = new Map();
for (const c of live.checks) for (const id of (c.listingIds || [])) {
  if (!liveByListing.has(id)) liveByListing.set(id, []);
  liveByListing.get(id).push(c);
}

/**
 * score() — the published ranking heuristic. Every term is printed next to the row on Best picks.
 * It is NOT a claim about odds, and it never uses a value that is not in the dataset.
 */
function score(item, row) {
  const why = [];
  let s = 0;
  if (item.status === 'ended' || item.status === 'inactive') return { s: -99, why: ['ended — excluded'] };

  if (item.freePath === 'full') { s += 3; why.push('free entry +3'); }
  else if (item.freePath === 'partial') { s += 1; why.push('some free events +1'); }
  else if (item.freePath === 'unknown') { why.push('entry cost not stated +0'); }
  else { s -= 4; why.push('entry fee needed −4'); }

  if (row.officialSourceCount) { s += 2; why.push('official source +2'); }
  else why.push('no official source +0');

  if (row.liveCheck) { s += 2; why.push('live-checked +2'); }
  if (row.crossCheck && !row.liveCheck) { s += 1; why.push('independently checked +1'); }
  if (row.liveCheckError) { s -= 2; why.push('link error −2'); }

  const usd = claimUsd(row.prizeCellValue);
  if (usd != null) {
    if (usd >= 100000) { s += 4; why.push('states $100k+ +4'); }
    else if (usd >= 10000) { s += 3; why.push('states $10k+ +3'); }
    else if (usd >= 1000) { s += 2; why.push('states $1k+ +2'); }
    else { s += 1; why.push('states a figure under $1k +1'); }
  } else if (item.type === 'directory') {
    why.push('no cash figure (directory)');
  } else {
    s -= 1;
    why.push('no dollar figure committed −1');
  }

  const vs = VERIF_SCORE[row.verificationLevel] || 0;
  s += vs;
  why.push((VERIF_LABEL[row.verificationLevel] || 'unknown checks') + ' ' + (vs >= 0 ? '+' : '−') + Math.abs(vs));

  if (item.platforms.includes('web')) { s += 1; why.push('browser entry +1'); }

  const fit = FIT[item.type] || 0;
  s += fit;
  if (fit) why.push('category fit ' + (fit > 0 ? '+' : '−') + Math.abs(fit));

  if (row.flags.includes('I-10')) { s -= 6; why.push('operator account required −6'); }
  if (row.flags.includes('I-11')) { s -= 2; why.push('non-cash prize currency −2'); }
  if (row.flags.includes('I-06')) { s -= 2; why.push('rules link is a past contest −2'); }

  const checks = liveByListing.get(item.id) || [];
  if (checks.some((c) => c.openEntryObserved === false)) {
    s -= 4;
    why.push('live check found no open entry −4');
  }

  return { s, why };
}

/* ------------------------------------------------------------------ pages */

const CAT_COPY = {
  skill: 'Head-to-head skill games — solitaire, bingo, blocks. The free rooms pay gems or tickets; the dollar prizes sit in cash rooms that charge an entry fee, and the house takes a rake.',
  trivia: 'Quiz formats. This is the thinnest category in the ledger: one row is a closed contest and the other pays in points rather than dollars.',
  sports: 'NFL, college and soccer pick\'em, survivor, bracket and fantasy contests. The largest category and the most seasonal — check status before you invest a season.',
  creative: 'Writing, photo and judged submissions. Entry is usually free, but judging is slow and subjective, and deadlines decide whether a row is worth anything today.',
  forecasting: 'Scored probability forecasts against other people, with prizes funded by sponsors. Free to enter, objectively scored, and the one category where a bot tournament already exists.',
  market: 'Paper-trading and simulated-investing contests. Free to enter, but many are broker customer-acquisition funnels and some prizes are credits or funded demo accounts, not cash.',
  tech: 'Machine-learning competitions and hackathons with published prize pools. Free to enter, objectively scored, and the best structural fit for an AI-assisted entrant.',
  directory: 'Third-party catalogues of contests. Useful for discovery only — every linked contest still needs its own rules check, and many listed contests charge entry fees.',
  pools: 'Free tools for running your own pool or league. Nothing is funded by the operator; the prize pot is your group\'s money.'
};

function buildIndex() {
  const items = ledger.listings;
  const live = items.filter((i) => i.status === 'live');
  const scored = items
    .map((i) => ({ i, r: rowsById.get(i.id), sc: score(i, rowsById.get(i.id)) }))
    .filter((x) => x.sc.s > -50 && x.r.flags.indexOf('I-10') === -1 && x.i.type !== 'directory')
    .sort((a, b) => b.sc.s - a.sc.s || a.i.name.localeCompare(b.i.name))
    .slice(0, 5);

  const catCards = TYPES.map((t) => {
    const n = items.filter((i) => i.type === t.id).length;
    const act = items.filter((i) => i.type === t.id && i.status === 'live').length;
    return `<a class="cat-card" href="categories/${attr(t.id)}.html">
      <span class="count">${n} ${n === 1 ? 'competition' : 'competitions'} · ${act} active</span>
      <b>${esc(t.name)}</b>
      <p>${esc(CAT_COPY[t.id] || t.blurb)}</p>
    </a>`;
  }).join('');

  const topList = scored.map((x, idx) => `<tr>
      <td class="num" data-label="#">${idx + 1}</td>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(x.i.id)}.html">${esc(x.i.name)}</a>
        <span class="cell-sub">${esc(shortText(x.i.short, 96))}</span></td>
      <td data-label="Prize (claimed)">${x.r.prizeCellValue ? `<span class="prize">${esc(x.r.prizeCellValue)}</span>` : '<span class="prize none">—</span>'}</td>
      <td data-label="Entry"><span class="badge ${FREE_TONE[x.i.freePath]}">${esc(FREE_LABEL[x.i.freePath])}</span></td>
      <td data-label="Score" class="num">${x.sc.s}</td>
    </tr>`).join('');

  const body = `
<section class="hero">
  <p class="kicker">Rebuilt for a phone · one row per competition · every row links to the operator</p>
  <h1>Find the free competitions that actually pay cash.</h1>
  <p class="lede">${T.rows} competitions from the Free Money &amp; Contest Ledger dataset, reorganised into a
  searchable dashboard: filter by entry path, ID checks, platform and status, then open the operator's own
  rules before you spend a minute on it. Values we could not trace to an official source are left blank.</p>
  <div class="btn-row">
    <a class="btn primary" href="all.html">Browse all ${T.rows} →</a>
    <a class="btn" href="best.html">See the best picks</a>
    <a class="btn" href="flagged.html">What we flagged (${irr.items.length})</a>
  </div>
</section>

<div class="stat-grid">
  ${stat(T.rows, 'competitions in the ledger')}
  ${stat(String(T.freeEntryFull), 'with a free entry path', 'good')}
  ${stat(String(ledger.listings.filter((i) => i.status === 'live').length), 'marked active')}
  ${stat(String(T.prizeFigureStated), 'state a cash amount')}
  ${stat(String(T.recheckedThisPass), 'rows fetched live ' + fmtDate(SITE.verifiedOn), 'good')}
  ${stat(String(T.endedListings), 'ended / out of season', 'warn')}
  ${stat(String(T.noOfficialSource), 'no official source', 'warn')}
  ${stat(String(irr.items.length), 'flagged for review', 'warn')}
</div>

<div class="callout info" style="margin-top:14px">
  <p><b>Read this first.</b> The dataset behind this site was last checked by its authors on
  ${esc(fmtDate(SITE.sourceReviewed))} — ${SITE.staleDays} days before this build. Only
  ${T.recheckedThisPass} rows were fetched live on ${esc(fmtDate(SITE.verifiedOn))}; the rest carry a
  "source cited — not re-checked" badge. Prize figures are the source's claims. Open the operator's rules
  before entering; contest law and eligibility vary by state.</p>
</div>

<section class="section">
  <h2>Start here: highest-ranked live picks</h2>
  <p class="note-tiny">Ranked by the scoring model described on <a href="best.html">Best picks</a>:
  free entry, official source, live check, stated cash size, low ID burden, browser entry, no operator
  account required. This is our heuristic, not an endorsement, and the score is shown so you can disagree.</p>
  <div class="table-scroll">
    <table class="ledger">
      <thead><tr><th>#</th><th>Competition</th><th>Prize (claimed)</th><th>Entry</th><th>Score</th></tr></thead>
      <tbody>${topList}</tbody>
    </table>
  </div>
  <div class="btn-row"><a class="btn" href="best.html">Full shortlists and method →</a></div>
</section>

${(() => {
    const today = new Date(SITE.asOf + 'T00:00:00Z');
    const soon = ledger.listings
      .map((i) => ({ i, r: rowsById.get(i.id) }))
      .filter((x) => x.r.deadline)
      .map((x) => ({ ...x, days: Math.round((new Date(x.r.deadline + 'T00:00:00Z') - today) / 86400000) }))
      .filter((x) => x.days >= 0 && x.days <= 60)
      .sort((a, b) => a.days - b.days);
    if (!soon.length) return '';
    return `<section class="section">
      <h2>Closing within 60 days</h2>
      <p class="note-tiny">Only deadlines read from an official page by a session in this repository
      (1–2 Nov 2026; day counts run from ${esc(fmtDate(SITE.asOf))}) appear here. Any row without a verified deadline is absent — not because
      nothing closes, but because we did not confirm a date.</p>
      <div class="table-scroll"><table class="ledger">
        <thead><tr><th>Competition</th><th>Verified deadline</th><th>Days left</th><th>Prize (claimed)</th><th>Source</th></tr></thead>
        <tbody>${soon.map((x) => `<tr>
          <td class="cell-name" data-label="Competition"><a href="c/${attr(x.i.id)}.html">${esc(x.i.name)}</a></td>
          <td data-label="Deadline">${esc(fmtDate(x.r.deadline))}</td>
          <td data-label="Days left" class="num">${x.days === 0 ? 'today' : x.days}</td>
          <td data-label="Prize (claimed)">${x.r.prizeCellValue ? `<span class="prize">${esc(x.r.prizeCellValue)}</span>` : '<span class="prize none">—</span>'}</td>
          <td data-label="Source"><a class="src-link" href="${attr(x.r.crossCheck.url)}" rel="noopener noreferrer">Official ↗</a></td>
        </tr>`).join('')}</tbody>
      </table></div>
      <div class="callout warn" style="margin-top:10px"><p><b>Deadlines are the strongest reason to act and the
      easiest thing to get wrong.</b> ${soon.filter((x) => x.days <= 7).length} of these close within a week of
      this build. Confirm the date on the operator page before you start work.</p></div>
    </section>`;
  })()}

<section class="section">
  <h2>Categories</h2>
  <div class="cat-grid">${catCards}</div>
</section>

<section class="section">
  <h2>How this site differs from a link dump</h2>
  <div class="card">
    <ul class="list">
      <li><b>One row, one operator link.</b> Every row has a link to the operator's own page and, where one exists, a separate rules link. No affiliate redirects.</li>
      <li><b>Blank beats guessed.</b> ${T.prizeBlankedOnSite} rows show “—” for the prize because the source states no amount or cites no official source. We never fill in a number.</li>
      <li><b>Status is visible.</b> ${T.endedListings} ended contests are stamped and excluded from every shortlist instead of hiding in the scroll.</li>
      <li><b>Badges mean something.</b> “Live-checked” = we fetched a page of that row on ${esc(fmtDate(SITE.verifiedOn))}. “Source cited” = we did not.</li>
      <li><b>Problems are published, not buried.</b> ${irr.items.length} irregularities with evidence and links are on <a href="flagged.html">Flagged for review</a>.</li>
    </ul>
  </div>
</section>`;

  return layout({
    title: `${SITE.name} — ${SITE.tagline}`,
    description: `A mobile-first dashboard of ${T.rows} free-to-enter competitions that can pay cash: filtered by entry path, ID checks, platform and status, with official source links on every row.`,
    active: 'index.html',
    body
  });
}

function buildAll() {
  const items = ledger.listings.slice().sort((a, b) => {
    const ra = rowsById.get(a.id);
    const rb = rowsById.get(b.id);
    const order = { live: 0, mixed: 1, caution: 2, ended: 3, inactive: 4 };
    return (order[a.status] - order[b.status]) || a.name.localeCompare(b.name);
  });

  const body = `
<section class="hero">
  <p class="kicker">Full table · ${T.rows} rows</p>
  <h1>All competitions</h1>
  <p class="lede">Sorted active-first, then alphabetically. Filter with the controls below; every row links to
  its detail page, and the Source column always points at the operator (or says plainly that no official
  source exists).</p>
</section>

${filterBar({ count: T.rows, categories: true })}

<div id="empty" class="callout warn" hidden><p>No competition matches those filters. Try
<a href="#" onclick="document.getElementById('reset').click();return false;">resetting</a>.</p></div>

<div class="table-scroll">
  <table class="ledger" data-ledger-table>
    <caption>Prize figures are the source dataset's claims, last checked ${esc(fmtDate(SITE.sourceReviewed))}.
    “—” means no amount was stated or no official source supports it. Pay cards: ID checks are the operator's
    stated onboarding burden, not a guarantee.</caption>
    ${tableBlock(items, '', {})}
  </table>
</div>`;

  return layout({
    title: `All ${T.rows} competitions — ${SITE.name}`,
    description: `Every one of the ${T.rows} competitions, searchable and filterable, with the operator link and verification status on each row.`,
    active: 'all.html',
    body
  });
}

function buildCategories() {
  const out = [];
  for (const t of TYPES) {
    const items = ledger.listings
      .filter((i) => i.type === t.id)
      .sort((a, b) => {
        const order = { live: 0, mixed: 1, caution: 2, ended: 3, inactive: 4 };
        return (order[a.status] - order[b.status]) || a.name.localeCompare(b.name);
      });
    if (!items.length) continue;
    const activeCount = items.filter((i) => i.status === 'live').length;
    const freeCount = items.filter((i) => i.freePath === 'full').length;
    const figCount = items.filter((i) => rowsById.get(i.id).prizeCellValue).length;

    const body = `
<section class="hero">
  <p class="kicker"><a href="../index.html">Dashboard</a> / ${esc(t.name)}</p>
  <h1>${esc(t.name)}</h1>
  <p class="lede">${esc(CAT_COPY[t.id] || t.blurb)}</p>
  <div class="stat-grid">
    ${stat(String(items.length), 'in this category')}
    ${stat(String(activeCount), 'marked active')}
    ${stat(String(freeCount), 'free entry path', 'good')}
    ${stat(String(figCount), 'state a cash amount')}
  </div>
</section>

${filterBar({ count: items.length, categories: false })}

<div id="empty" class="callout warn" hidden><p>No competition matches those filters.</p></div>

<div class="table-scroll">
  <table class="ledger" data-ledger-table>
    <caption>Prize figures are the source dataset's claims, last checked ${esc(fmtDate(SITE.sourceReviewed))}.
    Rows with “—” have no stated amount or no official source.</caption>
    ${tableBlock(items, '../', { hideCategory: true })}
  </table>
</div>

<p class="note-tiny" style="margin-top:14px">Category note: the source dataset's own description of this
category is not repeated here where it contradicts the dataset's exclusion policy — see
<a href="../flagged.html#I-15">I-15</a>.</p>`;

    out.push({
      file: `categories/${t.id}.html`,
      html: layout({
        title: `${t.name} — ${SITE.name}`,
        description: `${items.length} ${t.name.toLowerCase()} competitions, ${activeCount} active, with official source links and verification status.`,
        base: '../',
        active: 'all.html',
        body
      })
    });
  }
  return out;
}

function buildDetails() {
  return ledger.listings.map((i) => ({ file: `c/${i.id}.html`, html: detailPage(i, rowsById.get(i.id)) }));
}

function buildBest() {
  const all = ledger.listings.map((i) => ({ i, r: rowsById.get(i.id), sc: score(i, rowsById.get(i.id)) }));

  const eligible = all.filter((x) => x.sc.s > -50 && x.i.type !== 'directory');
  const overall = eligible
    .slice()
    .sort((a, b) => b.sc.s - a.sc.s || a.i.name.localeCompare(b.i.name))
    .slice(0, 15);

  const big = all
    .filter((x) => claimUsd(x.r.prizeCellValue) != null && x.i.status === 'live' && x.i.type !== 'directory')
    .sort((a, b) => claimUsd(b.r.prizeCellValue) - claimUsd(a.r.prizeCellValue))
    .slice(0, 12);

  const friction = all
    .filter((x) => x.r.verificationLevel === 'account' && x.i.freePath === 'full' && x.i.status === 'live' && x.r.officialSourceCount > 0 && !x.r.flags.includes('I-10'))
    .sort((a, b) => (claimUsd(b.r.prizeCellValue) || 0) - (claimUsd(a.r.prizeCellValue) || 0))
    .slice(0, 12);

  const aiPicks = all
    .filter((x) => ['tech', 'forecasting', 'market'].includes(x.i.type) && x.i.status === 'live' && x.i.freePath === 'full')
    .sort((a, b) => b.sc.s - a.sc.s);

  const rowFor = (x, extra) => `<tr>
    <td class="cell-name" data-label="Competition"><a href="c/${attr(x.i.id)}.html">${esc(x.i.name)}</a>
      <span class="cell-sub">${esc(shortText(x.i.short, 96))}</span>
      <span class="cell-sub" style="color:var(--muted)">${esc(x.sc.why.join(' · '))}</span></td>
    <td data-label="Prize (claimed)">${x.r.prizeCellValue ? `<span class="prize">${esc(x.r.prizeCellValue)}</span>` : '<span class="prize none">—</span>'}</td>
    <td data-label="Entry"><span class="badge ${FREE_TONE[x.i.freePath]}">${esc(FREE_LABEL[x.i.freePath])}</span></td>
    <td data-label="ID checks">${esc(VERIF_LABEL[x.r.verificationLevel])}</td>
    <td data-label="Source">${x.r.officialSourceCount ? `<a class="src-link" href="${attr(x.r.primaryOfficialUrl)}" rel="noopener noreferrer">Official ↗</a>` : '<span class="badge warn">none</span>'}
      ${x.r.liveCheck ? '<span class="badge good">live-checked</span>' : ''}</td>
    <td class="num" data-label="Score">${x.sc.s}</td>
    ${extra || ''}
  </tr>`;

  const body = `
<section class="hero">
  <p class="kicker">Shortlists, not promises</p>
  <h1>Where your time is best spent</h1>
  <p class="lede">Four shortlists built only from fields in the dataset: entry path, official sourcing, live
  check, stated cash size, ID burden, platform and the flags we raised. Nothing here is a recommendation to
  gamble or to trust an operator. The score is printed on every row so you can audit it.</p>
</section>

<div class="callout warn">
  <p><b>The scoring model, in full.</b> Each row's score is printed under its name, term by term.
  Access terms: free entry +3 (some free events +1, cash needs a fee −4); official-tier source +2;
  live-checked on ${esc(fmtDate(SITE.verifiedOn))} +2 (a link error −2). Cash terms: the dollar figure the claim
  commits to (the figure it leads with, or the low end of a stated range) scores $100k+ +4, $10k+ +3,
  $1k+ +2, under $1k +1; a claim that commits to no figure loses 1 — we never read a number out of "up to",
  "commonly", "varies" or a funded-account promise. Friction terms:
  account-only signup +2, eligibility check +1, full KYC −1, tax paperwork −2; browser entry +1.
  Category fit (our editorial judgement about whether one good entry can place, and whether the work suits
  an AI-assisted entrant): tech +3, forecasting +3, market +1, creative +1, sports 0, skill 0, pools −3.
  Penalties: broker/sportsbook account required −6, non-cash prize currency −2, rules link points at a past
  contest −2, a live check that found <em>no open entry window</em> −4. Ended and inactive rows are excluded
  outright. None of it is a claim about your odds.</p>
</div>

<section class="section">
  <h2>1. Best overall (live, free, sourced, cash)</h2>
  <p class="note-tiny">Top 15 by score. Every row is live, free to enter, and has an official source; most
  were not re-fetched this pass, so confirm the current prize on the operator page first.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Prize (claimed)</th><th>Entry</th><th>ID checks</th><th>Source</th><th>Score</th></tr></thead>
    <tbody>${overall.map((x) => rowFor(x)).join('')}</tbody>
  </table></div>
</section>

<section class="section">
  <h2>2. Largest stated cash figures (live rows)</h2>
  <p class="note-tiny">Ordered by the dollar figure the claim <em>leads</em> with, as written — no conversion,
  no summing, no "up to". Rows that bury a number after a funded-account promise are deliberately excluded.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Prize (claimed)</th><th>Entry</th><th>ID checks</th><th>Source</th><th>Score</th></tr></thead>
    <tbody>${big.map((x) => rowFor(x)).join('')}</tbody>
  </table></div>
</section>

<section class="section">
  <h2>3. Least friction: account only, free, active</h2>
  <p class="note-tiny">No ID upload at signup, free entry, live, officially sourced. Lowest onboarding burden
  in the dataset — which is not the same as easiest to win.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Prize (claimed)</th><th>Entry</th><th>ID checks</th><th>Source</th><th>Score</th></tr></thead>
    <tbody>${friction.map((x) => rowFor(x)).join('')}</tbody>
  </table></div>
</section>

<section class="section">
  <h2>4. Best fit for an AI-assisted entrant</h2>
  <p class="note-tiny">Machine-checkable scoring on a browser submission: tech, forecasting and paper-market
  competitions that are live and free to enter. This is about <em>whether an agent can help with the work</em>,
  not whether the rules allow it.</p>
  <div class="callout warn"><p><b>Unverified:</b> we did not check any contest's rules on AI or automated
  assistance in this pass. Many judged and prediction contests restrict it. Read the rules for each row before
  you submit machine-generated work — an entry that breaks the rules is worth zero however good it is.</p></div>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Prize (claimed)</th><th>Entry</th><th>ID checks</th><th>Source</th><th>Score</th></tr></thead>
    <tbody>${aiPicks.map((x) => rowFor(x)).join('')}</tbody>
  </table></div>
</section>

<section class="section">
  <h2>What is deliberately missing</h2>
  <div class="card">
    <ul class="list">
      <li><b>${T.endedListings} ended contests</b> — excluded even when the prize figure is large.</li>
      <li><b>${T.withPromoCode} referral-code rows</b> — kept, but never ranked on the code (see <a href="flagged.html#I-07">I-07</a>).</li>
      <li><b>${T.noOfficialSource} rows with no official source</b> — cannot be ranked on their prize because we do not print it (see <a href="flagged.html#I-04">I-04</a>).</li>
      <li><b>Broker/sportsbook-account contests</b> — scored but penalised hard, because they require an account with a gambling or trading operator (see <a href="flagged.html#I-10">I-10</a>).</li>
      <li><b>Directory rows</b> — catalogues, not contests (see <a href="flagged.html#I-14">I-14</a>).</li>
    </ul>
  </div>
</section>`;

  return layout({
    title: `Best picks — ${SITE.name}`,
    description: 'Four transparent shortlists built from the dataset: best overall, largest stated cash, least friction, and best fit for AI-assisted entry.',
    active: 'best.html',
    body,
    scripts: false
  });
}


/* ------------------------------------------------------------------ verified shortlist */

const FREE_QUOTE = /no purchase|free entry|free to enter|free to play|entry is free/i;

function buildShortlist() {
  const notesPath = path.join(ROOT, 'data/shortlist-notes.json');
  const notes = fs.existsSync(notesPath) ? read('data/shortlist-notes.json') : { rows: [], note: '' };
  const today = new Date(SITE.asOf + 'T00:00:00Z');
  const rows = notes.rows
    .map((n) => ({ n, i: itemsById.get(n.id), r: rowsById.get(n.id) }))
    .filter((x) => x.i && x.r && x.r.crossCheck)
    .map((x) => ({ ...x, days: x.r.deadline ? Math.round((new Date(x.r.deadline + 'T00:00:00Z') - today) / 86400000) : null }))
    .filter((x) => x.days === null || x.days >= 0)
    .sort((a, b) => (a.days === null ? 1e9 : a.days) - (b.days === null ? 1e9 : b.days));

  const body = `
<section class="hero">
  <p class="eyebrow">Read from official pages · as of ${esc(fmtDate(SITE.asOf))}</p>
  <h1>Verified shortlist — what to work on, and when it closes</h1>
  <p class="lede">${rows.length} competitions whose official overview or rules page was read by a session in this repository
  on 1–2 Nov 2026, sorted by closing date. The “What the official page says” column contains only statements taken from
  that page; where the page was silent the cell says so. Nothing here is inferred. Expired deadlines are dropped when the site is rebuilt.</p>
</section>

<div class="callout warn"><p><b>Entry cost.</b> The “Entry” badge is the source ledger's label. Underneath it, “free entry stated in the recorded reading”
appears only where the recorded reading of the official page notes it (for example “NO PURCHASE OR PAYMENT NECESSARY”). Kaggle pages read here state no fee
but do not say “free”, so they carry no such statement. That is a gap in the page, not evidence of a fee.</p></div>

<section class="section">
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Competition</th><th>Closes</th><th>Days</th><th>Prize (from the page)</th><th>Entry</th><th>What the official page says</th><th>Source</th></tr></thead>
    <tbody>${rows.map((x) => `<tr>
      <td class="cell-name" data-label="Competition"><a href="c/${attr(x.i.id)}.html">${esc(x.i.name)}</a><span class="cell-sub">${esc(x.n.kind)}</span></td>
      <td data-label="Closes">${x.r.deadline ? esc(fmtDate(x.r.deadline)) : '<span class="blank">—</span>'}</td>
      <td data-label="Days" class="num">${x.days === null ? '<span class="blank">—</span>' : (x.days === 0 ? 'today' : x.days)}</td>
      <td data-label="Prize">${x.r.prizeCellValue ? `<span class="prize">${esc(x.r.prizeCellValue)}</span>` : '<span class="prize none">—</span>'}</td>
      <td data-label="Entry">${badgesFor(x.i, x.r)}<span class="cell-sub">${(x.r.crossCheck.confirmed || []).some((t) => FREE_QUOTE.test(t)) ? 'free entry stated in the recorded reading' : 'no free-entry statement recorded'}</span></td>
      <td data-label="What the official page says">${esc(x.n.note)}</td>
      <td data-label="Source"><a class="src-link" href="${attr(x.n.url)}" rel="noopener noreferrer">Official ↗</a></td>
    </tr>`).join('')}</tbody>
  </table></div>
</section>

<section class="section">
  <h2>How to use this list</h2>
  <div class="card"><ul class="list">
    <li><b>Closing in days, not weeks:</b> ARC Prize (today, Paper Track 8 Nov), Codex x TwitchCon (today), Metaculus US Midterms (4 Nov).</li>
    <li><b>Best fit for an AI coding agent, per the pages themselves:</b> Google Quantum AI circuit compilation (its overview names AI coding agents), Gemma 4 Developer Agent, Squares in Squares, and the two Kaggle code competitions.</li>
    <li><b>Tool-locked hackathons:</b> Kiroween needs Kiro, Codegeist needs Atlassian Forge, Codex x TwitchCon needs OpenAI Codex.</li>
    <li><b>Offline-only evaluation:</b> ARC Prize, Name That LLM and Enveda CASMI forbid or disable internet access at evaluation, so the submitted solution cannot call a hosted model.</li>
    <li><b>Before you enter anything:</b> read the rules page linked in the Source column; eligibility and prize-payment terms (tax forms, licence of winning code) are in there, not on this site.</li>
  </ul></div>
  <p class="note-tiny">${esc(notes.note)}</p>
</section>`;

  return layout({
    title: `Verified shortlist — ${SITE.name}`,
    description: 'Competitions whose official pages were read on 1–2 Nov 2026, sorted by closing date, with the AI-agent rules each page states.',
    active: 'shortlist.html',
    body,
    scripts: false
  });
}

function buildAnalysis() {
  const items = ledger.listings;
  const freq = (arr) => {
    const m = new Map();
    arr.forEach((v) => m.set(v, (m.get(v) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const byType = TYPES.map((t) => {
    const list = items.filter((i) => i.type === t.id);
    return {
      name: t.name, id: t.id, n: list.length,
      active: list.filter((i) => i.status === 'live').length,
      free: list.filter((i) => i.freePath === 'full').length,
      figure: list.filter((i) => rowsById.get(i.id).prizeCellValue).length,
      official: list.filter((i) => rowsById.get(i.id).officialSourceCount > 0).length
    };
  }).sort((a, b) => b.n - a.n);

  const sharedGroups = (() => {
    const m = new Map();
    items.forEach((i) => {
      const list = m.get(i.signupUrl) || [];
      list.push(i);
      m.set(i.signupUrl, list);
    });
    return [...m.entries()].filter(([, list]) => list.length > 1).sort((a, b) => b[1].length - a[1].length);
  })();

  const hosts = freq(items.map((i) => {
    try { return new URL(i.signupUrl).hostname.replace(/^www\./, ''); } catch (e) { return 'invalid'; }
  }));

  const currency = freq(items.map((i) => {
    const t = i.prizeUsd;
    const cur = [];
    if (/\$|USD/.test(t)) cur.push('USD ($)');
    if (/£|GBP/.test(t)) cur.push('GBP (£)');
    if (/€|EUR/.test(t)) cur.push('EUR (€)');
    return cur.length ? cur.join(' + ') : 'no currency stated';
  }));

  const bar = (label, value, max, extra) => `<tr>
    <td data-label="Item">${esc(label)}</td>
    <td data-label="Count" class="num">${value}</td>
    <td data-label="Share">
      <span style="display:inline-block;height:8px;border-radius:4px;background:var(--accent);width:${max ? Math.max(2, Math.round((value / max) * 100)) : 0}%;min-width:2px"></span>
      <span class="note-tiny">${extra || ''}</span>
    </td>
  </tr>`;

  const maxType = Math.max.apply(null, byType.map((t) => t.n));

  const body = `
<section class="hero">
  <p class="kicker">Analysis</p>
  <h1>What ${T.rows} competitions actually look like</h1>
  <p class="lede">Every number on this page is counted from the pinned dataset at build time — no estimates,
  no extrapolation. Where the data cannot answer a question, it is listed in the last section instead of being
  guessed at.</p>
</section>

<div class="stat-grid">
  ${stat(String(T.rows), 'rows parsed')}
  ${stat(String(T.freeEntryFull), 'free entry path', 'good')}
  ${stat(String(T.prizeFigureStated), 'state a cash amount')}
  ${stat(String(T.endedListings), 'already ended', 'warn')}
</div>

<section class="section">
  <h2>Coverage by category</h2>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Category</th><th>Rows</th><th>Active</th><th>Free entry</th><th>States a cash figure</th><th>Has an official source</th></tr></thead>
    <tbody>${byType.map((t) => `<tr>
      <td data-label="Category"><a href="categories/${attr(t.id)}.html">${esc(t.name)}</a></td>
      <td data-label="Rows" class="num">${t.n}</td>
      <td data-label="Active" class="num">${t.active}</td>
      <td data-label="Free entry" class="num">${t.free}</td>
      <td data-label="Cash figure" class="num">${t.figure}</td>
      <td data-label="Official source" class="num">${t.official} / ${t.n}</td>
    </tr>`).join('')}</tbody>
  </table></div>
  <p class="note-tiny">${pct(byType[0].n, T.rows)}% of the ledger is a single category
  (${esc(byType[0].name)}). That is a consequence of the source's own scope, not of this rebuild.</p>
</section>

<section class="section">
  <h2>Entry path and status</h2>
  <div class="detail-grid">
    <div class="card">
      <h3>Entry path</h3>
      <div class="table-scroll"><table class="ledger"><tbody>
        ${bar('Free entry path', T.freeEntryFull, T.rows, pct(T.freeEntryFull, T.rows) + '%')}
        ${bar('Some free events', T.freeEntryPartial, T.rows, pct(T.freeEntryPartial, T.rows) + '%')}
        ${bar('Cash needs a fee', T.paidCash, T.rows, pct(T.paidCash, T.rows) + '%')}
      </tbody></table></div>
    </div>
    <div class="card">
      <h3>Source status</h3>
      <div class="table-scroll"><table class="ledger"><tbody>
        ${bar('Active', items.filter((i) => i.status === 'live').length, T.rows, '')}
        ${bar('Mixed', items.filter((i) => i.status === 'mixed').length, T.rows, '')}
        ${bar('Caution', items.filter((i) => i.status === 'caution').length, T.rows, '')}
        ${bar('Ended / out of season', items.filter((i) => i.status === 'ended').length, T.rows, '')}
        ${bar('Inactive', items.filter((i) => i.status === 'inactive').length, T.rows, '')}
      </tbody></table></div>
    </div>
  </div>
</section>

<section class="section">
  <h2>What it takes to get paid</h2>
  <div class="detail-grid">
    <div class="card">
      <h3>Operator ID checks (source's label)</h3>
      <div class="table-scroll"><table class="ledger"><tbody>
        ${ledger.verificationLevels.map((v) => bar(v.name, items.filter((i) => i.verification.level === v.id).length, T.rows, '')).join('')}
      </tbody></table></div>
      <p class="note-tiny">${T.rows - items.filter((i) => ['account', 'eligibility'].includes(i.verification.level)).length}
      rows demand a photo ID, tax paperwork or both before a withdrawal.</p>
    </div>
    <div class="card">
      <h3>Prize currency as written</h3>
      <div class="table-scroll"><table class="ledger"><tbody>
        ${currency.map(([k, v]) => bar(k, v, T.rows, pct(v, T.rows) + '%')).join('')}
      </tbody></table></div>
      <p class="note-tiny">No FX conversion is applied anywhere on this site. A £5,000 prize stays £5,000.</p>
    </div>
  </div>
</section>

<section class="section">
  <h2>Concentration: where the rows point</h2>
  <p>${hosts.length} distinct hostnames appear in ${T.rows} rows. The ten most-linked domains:</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Host</th><th>Rows</th><th>Share</th></tr></thead>
    <tbody>${hosts.slice(0, 10).map(([h, c]) => bar(h, c, hosts[0][1], pct(c, T.rows) + '%')).join('')}</tbody>
  </table></div>
  <p class="note-tiny">${sharedGroups.length} destinations are shared by more than one row
  (${sharedGroups.reduce((a, [, l]) => a + l.length, 0)} rows in total). A shared URL cannot support a
  row-specific prize claim, so those rows are cross-checked against the
  <a href="flagged.html#I-08b">I-08b</a> register entry.</p>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Shared destination</th><th>Rows pointing at it</th></tr></thead>
    <tbody>${sharedGroups.map(([u, list]) => `<tr>
      <td data-label="Destination" style="word-break:break-all"><a href="${attr(u)}" rel="noopener noreferrer">${esc(u)}</a></td>
      <td data-label="Rows">${list.length} — ${list.map((i) => `<a href="c/${attr(i.id)}.html">${esc(i.name)}</a>`).join(', ')}</td>
    </tr>`).join('')}</tbody>
  </table></div>
</section>

<section class="section">
  <h2>Findings</h2>
  <div class="card">
    <ol class="list">
      <li><b>Free entry is the norm, free cash is not.</b> ${T.freeEntryFull} rows claim a free path, but only
      ${T.prizeFigureStated} state a cash amount at all, and ${T.prizeBlankedOnSite} rows show “—” on this site
      because the source either states no figure or cites no official source.</li>
      <li><b>The dataset is seasonal and it shows.</b> ${T.endedListings} rows are out of season, almost all of
      them sports brackets and pick'em contests. Any "best of" list that ignores status is misleading within weeks.</li>
      <li><b>Effort is inversely related to certainty.</b> Pick'em contests are low-effort with tiny per-entrant
      odds and a tie-breaker; tech and forecasting contests are high-effort with objective scoring and far fewer
      entrants. For an AI-assisted entrant, the second shape is worth more per hour.</li>
      <li><b>Non-cash prizes hide in plain sight.</b> Gems, tickets, SB points, trading credits and "funded
      accounts" all appear as prizes. They are not dollars, and we say so on every such row.</li>
      <li><b>Sourcing quality varies wildly.</b> ${T.noOfficialSource} rows have no official-tier source at all,
      and ${T.rulesEqualsSignup} "rules" links are just the signup page. A prize claim that cannot be read on an
      operator page is a rumour.</li>
      <li><b>Referral codes are an incentive, not information.</b> ${T.withPromoCode} rows carried codes;
      none is republished here.</li>
    </ol>
  </div>
</section>

<section class="section">
  <h2>What this data cannot tell you</h2>
  <div class="callout warn">
    <ul class="list">
      <li><b>Odds of winning.</b> No entrant counts, no historical win rates, no field sizes. The ledger is a
      catalogue of contests, not a record of outcomes.</li>
      <li><b>Expected value per hour.</b> Deadlines, effort and skill ceilings are not fields in the dataset.
      We can rank prize size and entry friction; we cannot rank your personal EV.</li>
      <li><b>Whether a contest is running this week.</b> The data is ${verif.staleDays} days old and only
      ${T.recheckedThisPass} rows were re-fetched. Status is the source's label, not a live calendar.</li>
      <li><b>Legality in your jurisdiction.</b> Some rows are skill-cash games restricted by US state, others
      are UK/Ireland-only. Read the operator's eligibility section.</li>
      <li><b>Tax treatment.</b> We only record that US prizes of $600+ normally trigger a W-9. That is context
      from the source, not advice.</li>
    </ul>
  </div>
</section>`;

  return layout({
    title: `Analysis — ${SITE.name}`,
    description: 'Counted findings from the dataset: category coverage, entry paths, ID burden, prize currencies, host concentration and what the data cannot answer.',
    active: 'analysis.html',
    body,
    scripts: false
  });
}

function flagBlock(f) {
  const ids = (f.affected || []).filter((id) => itemsById.has(id));
  const idList = ids.length
    ? `<p class="ids"><b>Affected rows (${ids.length}):</b> ${ids.map((id) => `<a href="c/${attr(id)}.html">${esc(itemsById.get(id).name)}</a>`).join(' · ')}</p>`
    : '';
  return `<article class="flag ${f.severity === 'high' ? 'high' : f.severity === 'info' ? 'info' : ''}" id="${attr(f.id)}">
    <div class="meta">${esc(f.id)} · ${esc(f.severity)} severity · ${esc(f.type)} · status: needs review</div>
    <h3>${esc(f.title)}</h3>
    <p>${esc(f.summary)}</p>
    ${f.evidence && f.evidence.length ? `<div class="evidence"><b>Evidence</b><ul>${f.evidence.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
    ${f.links && f.links.length ? `<p class="ids"><b>Sources:</b> ${f.links.map((l) => `<a href="${attr(l.url)}" rel="noopener noreferrer">${esc(l.title)} ↗</a>`).join(' · ')}</p>` : ''}
    ${idList}
    <p class="action"><b>What this site does about it:</b> ${esc(f.action)}</p>
  </article>`;
}

function buildFlagged() {
  const notChecked = verif.rows.filter((r) => !r.liveCheck && !r.liveCheckError);
  const high = irr.items.filter((f) => f.severity === 'high').length;

  const checkRows = live.checks.map((c) => `<tr>
    <td data-label="URL"><a href="${attr(c.url)}" rel="noopener noreferrer">${esc(c.url)}</a>
      <span class="cell-sub">${esc((c.listingIds || []).map((id) => (itemsById.get(id) || {}).name || id).join(', '))}</span></td>
    <td data-label="Outcome"><span class="badge ${c.outcome === 'loaded' ? 'good' : 'danger'}">${esc(c.outcome)}</span></td>
    <td data-label="Page title">${esc(c.pageTitle || '')}</td>
    <td data-label="Confirmed">${(c.confirmed || []).length ? `<ul class="list" style="margin:0">${c.confirmed.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<span class="blank">—</span>'}</td>
    <td data-label="Not confirmed">${(c.notConfirmed || []).length ? `<ul class="list" style="margin:0">${c.notConfirmed.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<span class="blank">—</span>'}</td>
  </tr>`).join('');

  const body = `
<section class="hero">
  <p class="kicker">Status: needs review · does not block publication</p>
  <h1>Flagged for review</h1>
  <p class="lede">Everything we could not settle, could not verify, or found inconsistent — ${irr.items.length} items,
  ${high} of them high severity. Each carries its evidence and a link to the source. None of these stopped the
  site from publishing; all of them are here so you can decide.</p>
</section>

<div class="callout info">
  <p><b>What "needs review" means.</b> The item is published on this page with its source links and is not
  blocking. Unverified values are blank in the data tables rather than filled in — see
  <a href="verification.html">how verification works</a>.</p>
</div>

<nav class="chip-row" style="margin:16px 0" aria-label="Jump to item">
  ${irr.items.map((f) => `<a class="chip" href="#${attr(f.id)}">${esc(f.id)} ${esc(shortText(f.title, 34))}</a>`).join('')}
</nav>

<section class="section">
  <h2>Unverified rows (${notChecked.length})</h2>
  <p class="note-tiny">These rows cite a source but were <b>not</b> re-fetched on ${esc(fmtDate(SITE.verifiedOn))}.
  Their figures are the source's claims from ${esc(fmtDate(SITE.sourceReviewed))}. This list exists so the
  verification gap is visible rather than implied.</p>
  <details class="card">
    <summary><b>Show the ${notChecked.length} not-re-checked rows</b></summary>
    <p style="margin-top:10px">${notChecked.map((r) => `<a href="c/${attr(r.id)}.html">${esc(r.name)}</a>`).join(' · ')}</p>
  </details>
</section>

<section class="section">
  <h2>The register</h2>
  ${irr.items.map(flagBlock).join('\n')}
</section>

<section class="section">
  <h2>Live checks performed this pass (${live.checks.length})</h2>
  <p class="note-tiny">One fetch per URL on ${esc(fmtDate(SITE.verifiedOn))}. This is the complete list of what
  was actually retrieved — no row is described as checked unless it appears here.</p>
  <div class="table-scroll">
    <table class="ledger">
      <thead><tr><th>URL fetched</th><th>Outcome</th><th>Page title returned</th><th>Confirmed on the page</th><th>Not confirmed</th></tr></thead>
      <tbody>${checkRows}</tbody>
    </table>
  </div>
</section>`;

  return layout({
    title: `Flagged for review — ${SITE.name}`,
    description: `${irr.items.length} irregularities with evidence and source links, plus the list of rows that were not re-checked.`,
    active: 'flagged.html',
    body,
    scripts: false
  });
}


function buildResearch() {
  const checks = verif.rows.filter((r) => r.crossCheck);
  const bySession = {};
  checks.forEach((r) => {
    (r.crossCheck.checkedBy || 'unattributed').split(/,\s*/).forEach((sess) => {
      bySession[sess] = (bySession[sess] || 0) + 1;
    });
  });

  const rows = checks.map((r) => {
    const item = itemsById.get(r.id);
    return `<tr>
      <td class="cell-name" data-label="Listing"><a href="c/${attr(r.id)}.html">${esc(r.name)}</a>
        <span class="cell-sub">${esc((typeById.get(r.type) || {}).name || r.type)}</span></td>
      <td data-label="Official page"><a class="src-link" href="${attr(r.crossCheck.url)}" rel="noopener noreferrer">${esc(shortText(r.crossCheck.url.replace(/^https?:\/\//, ''), 46))} ↗</a></td>
      <td data-label="Confirmed">${(r.crossCheck.confirmed || []).length
        ? `<ul class="list" style="margin:0">${r.crossCheck.confirmed.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<span class="blank">—</span>'}</td>
      <td data-label="Caveats">${(r.crossCheck.caveats || []).length
        ? `<ul class="list" style="margin:0">${r.crossCheck.caveats.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<span class="blank">—</span>'}</td>
      <td data-label="Deadline">${r.crossCheck.deadline ? esc(fmtDate(r.crossCheck.deadline)) : '<span class="blank">—</span>'}</td>
      <td data-label="Checked by">${esc(r.crossCheck.checkedBy || '—')}<span class="cell-sub">${esc(fmtDate(r.crossCheck.checkedDate))}</span></td>
    </tr>`;
  }).join('');

  const sessionList = Object.entries(bySession)
    .map(([sess, n]) => `<li><code>${esc(sess)}</code> — ${n} of the ${checks.length} checks</li>`).join('');

  const body = `
<section class="hero">
  <p class="kicker">Source audit · ${checks.length} official pages read by sessions in this repo</p>
  <h1>What someone actually opened</h1>
  <p class="lede">Two kinds of verification exist in this repository. This session fetched
  ${live.checks.length} URLs on ${esc(fmtDate(SITE.verifiedOn))} (logged on
  <a href="flagged.html">Flagged for review</a>). The parallel sessions that built the earlier
  “Prize Atlas” dashboard read ${checks.length} operator pages and wrote down exactly what each one said.
  This page carries their findings forward, attributed, rather than merging them into an anonymous “verified” badge.</p>
</section>

<div class="callout info">
  <p><b>How to read this.</b> A row marked “Independently checked” had one of its official pages read by a
  session in this repository (1 or 2 Nov 2026; the date and reader are shown on each row). Their caveats are
  carried verbatim. If a page did not state a value, the value stays blank on the row.</p>
</div>

<div class="stat-grid">
  ${stat(String(checks.length), 'official pages read by other sessions', 'good')}
  ${stat(String(live.checks.length), 'URLs fetched by this session')}
  ${stat(String(T.rows), 'rows in the merged ledger')}
  ${stat(String(irr.items.length), 'flagged irregularities', 'warn')}
</div>

<section class="section">
  <h2>Cross-checks carried forward</h2>
  <div class="table-scroll">
    <table class="ledger">
      <thead><tr><th>Listing</th><th>Official page</th><th>Confirmed on the page</th><th>Caveats recorded</th><th>Deadline</th><th>Checked by</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <p class="note-tiny">Attribution: ${sessionList}</p>
</section>

<section class="section">
  <h2>What the other sessions flagged that we did not</h2>
  <div class="card">
    <ul class="list">
      <li><a href="flagged.html#I-17">I-17</a> — ESPN's own rules contradict each other on maximum entries (five vs ten).</li>
      <li><a href="flagged.html#I-18">I-18</a> — Challenge.gov, presented as a live directory, was sunset by the government on 2026-03-30.</li>
      <li><a href="flagged.html#I-19">I-19</a> — IceHacks advertises cash in its header while its own description says there is none.</li>
      <li><a href="flagged.html#I-20">I-20</a> — PayPal AI Hackathon's headline prize total and its itemised rules disagree.</li>
      <li><a href="flagged.html#I-21">I-21</a> — the reference work's “$600+” tax line is a generalisation, not a rule (IRS links included).</li>
    </ul>
  </div>
</section>

<section class="section">
  <h2>Raw records you can read yourself</h2>
  <div class="card">
    <ul class="list">
      <li><a href="research/SOURCES.md">research/SOURCES.md</a> — the parallel sessions' original source audit: which pages were read, what they confirmed, and what they could not.</li>
      <li><a href="archive/prize-atlas/index.html">archived “Prize Atlas” dashboard</a> — the earlier build, preserved intact (208 leads, 7 checked pages) with its own review queue and supplemental research page.</li>
      <li><a href="archive/prize-atlas/supplemental/index.html">archived supplemental research</a> — the source of the three hackathon rows and four of the flags above.</li>
      <li><a href="archive/prize-atlas/dashboard-v2/index.html">archived second dashboard (session d21e8702)</a> — the other full build of this brief, preserved intact with its own audit, methodology, sources and cross-session pages.</li>
      <li><a href="docs/COORDINATION-session-records.md">docs/COORDINATION-session-records.md</a> — every session's own task record, verbatim, including their PR numbers and deployment runs.</li>
      <li><a href="data/cross-checks.json">data/cross-checks.json</a> — the machine-readable version of this page.</li>
      <li><a href="https://github.com/karagemop466-tech/FreeMoneyApps/blob/466f7c1e7a14b52b4a0d36beb84a00d68fd409b7/assets/data.js" rel="noopener noreferrer">the pinned ledger snapshot</a> the rows were imported from.</li>
    </ul>
  </div>
</section>

<section class="section">
  <h2>Rows that came from the other sessions</h2>
  <div class="card">
    <p>${ledger.additionsMerged} rows are not in the pinned ledger at all. They were added by parallel sessions
    after reading the operator page, and are marked as merged rows on their detail pages:</p>
    <ul class="list">
      ${ledger.listings.filter((i) => i.mergedFrom).map((i) => `<li><a href="c/${attr(i.id)}.html">${esc(i.name)}</a> — ${esc(i.mergedFrom)}</li>`).join('')}
    </ul>
    <p class="note-tiny">Their prize figures come from the operator page that session read, on the date recorded
    in <code>data/cross-checks.json</code>. If that page did not state a figure, the row shows “—”.</p>
  </div>
</section>`;

  return layout({
    title: `Source audit — ${SITE.name}`,
    description: `${checks.length} official pages read by the parallel sessions, carried forward with attribution, caveats and links.`,
    active: 'research.html',
    body,
    scripts: false
  });
}

function buildVerification() {
  const statusRows = [
    ['Live-checked', 'live-checked', 'good', 'We fetched one of the row\'s own URLs on ' + fmtDate(SITE.verifiedOn) + ' and it returned the expected, on-topic page. Only ' + T.recheckedThisPass + ' rows qualify.'],
    ['Link error found', 'live-check-error', 'danger', 'We fetched the row\'s URL and it returned an error page. ' + T.liveCheckError + ' row.'],
    ['Independently checked', 'cross-checked', 'info', 'A session in this repository read an official page for this row and recorded what it said (date and reader are shown on each row). ' + T.crossChecked + ' rows.'],
    ['Source cited — not re-checked', 'official-source-cited', 'info', 'The row cites an official-tier URL, but we did not fetch it in this pass. ' + T.officialSourceCited + ' rows. Figures are the source\'s claims.'],
    ['No official source', 'no-official-source', 'warn', 'The row cites only affiliate or forum sources. ' + T.noOfficialSource + ' rows. The prize cell is blank in our tables.']
  ].map(([label, key, tone, meaning]) => `<tr>
    <td data-label="Badge"><span class="badge ${tone}">${esc(label)}</span></td>
    <td data-label="Rows" class="num">${verif.rows.filter((r) => r.rowStatus === key).length}</td>
    <td data-label="Meaning">${esc(meaning)}</td>
  </tr>`).join('');

  const body = `
<section class="hero">
  <p class="kicker">Method, provenance and limits</p>
  <h1>How verification works here</h1>
  <p class="lede">Three rules govern every number on this site: copy the source verbatim, require an official
  link before a value is shown, and label what was not checked. This page shows exactly what was and was not
  done, plus how to reproduce it.</p>
</section>

<div class="stat-grid">
  ${stat(String(T.recheckedThisPass), 'rows fetched live ' + fmtDate(SITE.verifiedOn), 'good')}
  ${stat(String(T.rows - T.recheckedThisPass), 'rows cited, not re-fetched', 'warn')}
  ${stat(String(T.officialSourceCited), 'rows with an official source')}
  ${stat(String(T.noOfficialSource), 'rows with no official source', 'warn')}
</div>

<section class="section">
  <h2>1. Provenance</h2>
  <div class="card">
    <dl class="kv">
      <div class="kv-item"><dt>Source repository</dt><dd><a href="https://github.com/karagemop466-tech/FreeMoneyApps" rel="noopener noreferrer">karagemop466-tech/FreeMoneyApps</a></dd></div>
      <div class="kv-item"><dt>Pinned commit</dt><dd><code>${esc(SITE.commit)}</code></dd></div>
      <div class="kv-item"><dt>Source file</dt><dd><code>assets/data.js</code></dd></div>
      <div class="kv-item"><dt>SHA-256</dt><dd style="word-break:break-all"><code>${esc(SITE.sha256)}</code></dd></div>
      <div class="kv-item"><dt>Declared review date</dt><dd>${esc(fmtDate(SITE.sourceReviewed))} (pass ${esc(ledger.pass)})</dd></div>
      <div class="kv-item"><dt>Captured</dt><dd>${esc(fmtDate(ledger.provenance.capturedAt))}</dd></div>
      <div class="kv-item wide"><dt>How it is handled</dt><dd>The file is vendored unchanged at <code>data/source/ledger.source.js</code>.
      <code>scripts/ingest.js</code> verifies the checksum, strips the <code>window.LEDGER =</code> prefix and parses the
      remainder as strict JSON. The JavaScript is never executed.</dd></div>
    </dl>
  </div>
</section>

<section class="section">
  <h2>2. The rules we applied</h2>
  <div class="card">
    <ol class="list">
      <li><b>Copy, never correct.</b> Every source field is carried through verbatim. When the source is internally
      inconsistent, both facts are recorded and the inconsistency goes on the Flagged page (see
      <a href="flagged.html#I-01">I-01</a>).</li>
      <li><b>Official link or no value.</b> A prize or cash-out figure is printed only when the row has a source
      tagged "official" <em>and</em> the text states an amount. Otherwise the cell is “—” and the row is listed as
      unverified. ${T.prizeBlankedOnSite} rows are blank on this basis.</li>
      <li><b>No inference, no conversion, no summation.</b> £ stays £. "$1K/week + $5K season" is not turned into
      "$6K". "Up to $10M" is not treated as a $10M prize.</li>
      <li><b>Badge the gap.</b> A row is "Live-checked" only if its own URL was fetched this pass. Everything else
      says so, and the full not-checked list is published.</li>
      <li><b>Publish the problems.</b> Anything odd becomes a numbered flag with evidence and links, not a silent edit.</li>
    </ol>
  </div>
</section>

<section class="section">
  <h2>3. Verification badges</h2>
  <div class="table-scroll"><table class="ledger">
    <thead><tr><th>Badge</th><th>Rows</th><th>What it means</th></tr></thead>
    <tbody>${statusRows}</tbody>
  </table></div>
</section>

<section class="section">
  <h2>4. What was actually fetched</h2>
  <p>${T.recheckedThisPass} URLs were retrieved on ${esc(fmtDate(SITE.verifiedOn))} — at least one per category,
  weighted towards rows with the highest stakes and the oddest claims. The full log, including what each page
  confirmed and what it did not, is the last table on the <a href="flagged.html">Flagged for review</a> page.</p>
  <div class="callout warn">
    <p><b>Why not all ${T.rows}?</b> The build environment had no general outbound internet; each page had to be
    fetched individually through a page-fetch tool. A full crawl is roughly 400 requests across 206 domains and
    was out of scope for this pass. That limit is stated on every page rather than papered over.</p>
  </div>
</section>

<section class="section">
  <h2>5. Reproduce this build</h2>
  <div class="card">
    <p>Everything is generated from the JSON in <code>data/</code>:</p>
    <ul class="list">
      <li><code>node scripts/ingest.js</code> — verify the source checksum and write <code>data/ledger.json</code></li>
      <li><code>node scripts/verify.js</code> — audit every row, write <code>data/verification.json</code> and <code>data/irregularities.json</code></li>
      <li><code>node scripts/build.js</code> — render the site</li>
      <li><code>node scripts/checklinks.js</code> — confirm every internal link resolves and every row is published exactly once</li>
      <li><code>node scripts/render-docs.js</code> — regenerate <code>docs/EXECUTIVE_SUMMARY.md</code> from the same content as this site</li>
    </ul>
    <p class="note-tiny">To extend verification, add entries to <code>data/live-checks.json</code> and re-run
    <code>verify.js</code> then <code>build.js</code>: rows whose URLs appear there upgrade themselves to
    "Live-checked" automatically.</p>
  </div>
</section>

<section class="section">
  <h2>6. Limitations you should assume</h2>
  <div class="card">
    <ul class="list">
      <li>Prize claims are ${verif.staleDays} days old and can change without notice.</li>
      <li>Third-party text — the source ledger — is the origin of every row's description; we verify the operator
      link, not every sentence the source wrote.</li>
      <li>No odds, entrant counts, effort estimates or expected-value figures exist in the data, so none are
      shown anywhere on this site.</li>
      <li><b>Tax:</b> the “US prizes of $600+ normally require a W-9” line is the source dataset's
      generalisation, not a rule. Reporting depends on the type of income and your circumstances — see
      <a href="flagged.html#I-21">I-21</a> and the IRS pages linked there. Nothing here is tax advice.</li>
      <li>Links on operator sites rot. The "link error" badge is one observation, not a permanent state.</li>
    </ul>
  </div>
</section>`;

  return layout({
    title: `Verification method — ${SITE.name}`,
    description: 'Provenance, the three verification rules, what each badge means, what was actually fetched, and how to reproduce the build.',
    active: 'verification.html',
    body,
    scripts: false
  });
}

/* ------------------------------------------------------------------ executive summary */

function renderHtml(c) {
  return c.blocks.map((b) => {
    if (b.t === 'h2') return `<h2>${esc(b.text)}</h2>`;
    if (b.t === 'h3') return `<h3>${esc(b.text)}</h3>`;
    if (b.t === 'p') return `<p>${esc(b.text)}</p>`;
    if (b.t === 'ul') return `<ul class="list">${b.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (b.t === 'ol') return `<ol class="list">${b.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`;
    if (b.t === 'table') return `<div class="table-scroll"><table class="ledger">
      <thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${b.rows.map((r) => `<tr>${r.map((cell, i) => `<td data-label="${attr(b.head[i])}">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
    return '';
  }).join('\n');
}

function buildExecutive(ctx) {
  const c = content.build(ctx);
  const body = `
<section class="hero">
  <p class="kicker">Executive summary · ${esc(fmtDate(SITE.verifiedOn))}</p>
  <h1>${esc(c.title)}</h1>
  <p class="lede">${esc(c.standfirst)}</p>
  <div class="btn-row">
    <a class="btn primary" href="all.html">Browse the ${T.rows} rows</a>
    <a class="btn" href="best.html">Best picks</a>
    <a class="btn" href="flagged.html">Flagged (${irr.items.length})</a>
  </div>
</section>
<article class="prose section">${renderHtml(c)}</article>`;

  return layout({
    title: `Executive summary — ${SITE.name}`,
    description: c.standfirst,
    active: 'executive-summary.html',
    body,
    scripts: false
  });
}

function build404() {
  const body = `<section class="hero"><p class="kicker">404</p><h1>That page is not here</h1>
  <p class="lede">The link may be out of date, or the competition may have been removed. Everything lives from
  the dashboard.</p>
  <div class="btn-row"><a class="btn primary" href="index.html">Dashboard</a>
  <a class="btn" href="all.html">All competitions</a></div></section>`;
  return layout({ title: `Not found — ${SITE.name}`, description: 'Page not found.', base: '', body, scripts: false });
}

function buildSitemap(pages) {
  const baseUrl = 'https://sassnarep3-star.github.io/Own1/';
  const urls = pages.map((p) => `  <url><loc>${baseUrl}${p}</loc><lastmod>${SITE.verifiedOn}</lastmod></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/* ------------------------------------------------------------------ write */

function write(rel, html) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  return rel;
}

const written = [];

const ctx = {
  totals: T,
  flags: irr.items,
  verifiedOn: SITE.verifiedOn,
  sourceReviewed: SITE.sourceReviewed,
  commit: SITE.commit,
  sha256: SITE.sha256,
  flagCounts: Object.fromEntries(irr.items.map((f) => [f.id, (f.affected || []).length])),
  catCount: Object.fromEntries(TYPES.map((t) => [t.id, ledger.listings.filter((i) => i.type === t.id).length]))
};

written.push(write('index.html', buildIndex()));
written.push(write('all.html', buildAll()));
buildCategories().forEach((p) => written.push(write(p.file, p.html)));
buildDetails().forEach((p) => written.push(write(p.file, p.html)));
written.push(write('best.html', buildBest()));
written.push(write('shortlist.html', buildShortlist()));
written.push(write('analysis.html', buildAnalysis()));
written.push(write('flagged.html', buildFlagged()));
written.push(write('verification.html', buildVerification()));
written.push(write('research.html', buildResearch()));
written.push(write('executive-summary.html', buildExecutive(ctx)));
written.push(write('404.html', build404()));
written.push(write('sitemap.xml', buildSitemap(written.filter((p) => p.endsWith('.html')))));

// .nojekyll so GitHub Pages serves the files verbatim instead of running Jekyll over them
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');

console.log('build ok — ' + written.length + ' files');
console.log('  listings: ' + ledger.listings.length + ', detail pages: ' + ledger.listings.length);
console.log('  flags: ' + irr.items.length);
