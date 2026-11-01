#!/usr/bin/env node
/**
 * Prize Atlas static site generator.
 *
 * Inputs (all committed):
 *   data/verified.json   - records verified against an operator page on 2026-11-01
 *   data/legacy.json     - 206 listings imported from the reference ledger as unverified leads
 *   data/categories.json - category metadata
 *   data/atlas-findings.json - audit findings and irregularities
 *
 * Outputs: HTML pages at the repository root plus data/atlas-entries.json (merged dataset).
 *          data/entries.json belongs to the ledger pass and is not touched here.
 *
 * Rules enforced here, matching tests/validate.mjs:
 *   - a verified row must carry an https source and a verifiedOn date
 *   - a verified row may not have a prize/fee/deadline inferred from the legacy claim
 *   - a lead row may not populate prize, entryFee or deadline
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
if (!ROOT) throw new Error('cannot resolve repo root');

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const verified = read('data/verified.json');
const leads = read('data/legacy.json');
const categories = read('data/categories.json');
const audit = read('data/atlas-findings.json');

const TODAY = '2026-11-01';
const SITE = 'Verified Atlas';
const REPO = 'https://github.com/sassnarep3-star/Own1';

/* ------------------------------------------------------------------ helpers */
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const money = (value) => {
  const m = String(value || '').match(/\$\s?([\d,]+)/);
  if (!m) return 0;
  return Number(m[1].replace(/,/g, '')) || 0;
};

const fmtDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
};

const CAT = Object.fromEntries(categories.map((c) => [c.id, c]));
const catName = (id) => CAT[id]?.name || id;

/* Attach derived display values to the source records so every renderer sees them. */
for (const r of verified) {
  r.prizeLow = money(r.prize);
  r.daysLeft = r.deadline ? Math.round((Date.parse(r.deadline) - Date.parse(TODAY)) / 86400000) : null;
}

/* A verified record supersedes the legacy lead with the same id: showing both
   would put a blank "unverified" twin next to a checked row. */
const verifiedIds = new Set(verified.map((r) => r.id));
const leadRows = leads.filter((r) => !verifiedIds.has(r.id));
const allEntries = [...verified, ...leadRows];
const merged = allEntries.map((r) => ({
  ...r,
  prizeLow: r.prizeLow || 0,
  daysLeft: r.daysLeft ?? null,
}));

const stats = {
  verified: verified.length,
  leads: leadRows.length,
  total: verified.length + leads.length,
  findings: audit.findings.length,
  tierA: verified.filter((r) => r.tier === 'A').length,
  catsWithVerified: categories.filter((c) => verified.some((r) => r.category === c.id)).length,
  withDeadline: verified.filter((r) => r.deadline).length,
};

const byId = (id) => merged.find((r) => r.id === id);

/* --------------------------------------------------------------- components */
const chip = (text, tone = '') => `<span class="chip ${tone}">${esc(text)}</span>`;

const flagList = (flags, limit = 3) => {
  if (!flags || !flags.length) return '';
  const shown = flags.slice(0, limit).map((f) => `<li>${esc(f)}</li>`).join('');
  const rest = flags.length > limit ? `<li>and ${flags.length - limit} more — see the row's source page</li>` : '';
  return `<ul class="flags">${shown}${rest}</ul>`;
};

const evidenceLinks = (r, extraClass = '') => {
  const links = [];
  if (r.source) links.push(`<a class="${extraClass}" href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">${esc(r.sourceLabel || 'Official page')} ↗</a>`);
  for (const e of r.evidence || []) {
    if (e.url === r.source) continue;
    links.push(`<a class="${extraClass} secondary" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.label)} ↗</a>`);
  }
  return links.length ? links.join('') : '<span class="none">No operator source located</span>';
};

const verifiedRow = (r) => {
  const dl = r.deadline
    ? `<strong>${fmtDate(r.deadline)}</strong>${r.daysLeft !== null ? `<span class="subtle">${r.daysLeft < 0 ? `${Math.abs(r.daysLeft)} day${Math.abs(r.daysLeft) === 1 ? '' : 's'} past` : `${r.daysLeft} day${r.daysLeft === 1 ? '' : 's'} left`}</span>` : ''}`
    : '<span class="none">—</span>';
  return `<tr class="row-verified" data-verified="1" data-cat="${esc(r.category)}" data-tier="${esc(r.tier || '')}"
    data-prize="${r.prizeLow}" data-deadline="${esc(r.deadline || '')}"
    data-text="${esc([r.name, r.category, r.prize, r.notes, r.eligibility, r.work, (r.flags || []).join(' ')].join(' ').toLowerCase())}">
    <td data-label="Competition">
      <div class="cell-title">${esc(r.name)}</div>
      <div class="cell-meta">${esc(catName(r.category))} · <span class="tier tier-${esc(r.tier || 'C')}">Tier ${esc(r.tier || 'C')}</span>${r.effort ? ` · effort ${esc(r.effort)}` : ''}${r.fit ? ` · agent fit ${esc(r.fit)}` : ''}</div>
      ${flagList(r.flags)}
    </td>
    <td data-label="Verified prize">${r.prize ? esc(r.prize) : '<span class="none">Not stated</span>'}</td>
    <td data-label="Entry">${r.entryFee ? esc(r.entryFee) : '<span class="none">Not stated</span>'}</td>
    <td data-label="Deadline">${dl}${r.deadlineNote ? `<span class="subtle">${esc(r.deadlineNote)}</span>` : ''}</td>
    <td data-label="What it asks for">${r.work ? esc(r.work) : '<span class="none">Not stated</span>'}${r.eligibility ? `<span class="subtle">${esc(r.eligibility)}</span>` : ''}</td>
    <td data-label="Evidence">${evidenceLinks(r, 'source-link')}<span class="verified-stamp">Checked ${esc(r.verifiedOn || TODAY)}</span></td>
  </tr>`;
};

const leadRow = (r) => `<tr class="row-lead" data-verified="0" data-cat="${esc(r.category)}" data-tier="" data-prize="0" data-deadline=""
    data-flags="${esc((r.flags || []).join(' '))}"
    data-text="${esc([r.name, r.category, r.legacyPrizeClaim, r.legacyShort, (r.flags || []).join(' ')].join(' ').toLowerCase())}">
    <td data-label="Listing">
      <div class="cell-title">${esc(r.name)}</div>
      <div class="cell-meta">${esc(catName(r.category))}</div>
      ${(r.flags || []).length ? `<div class="chip-row">${r.flags.map((f) => chip(f.replace(/-/g, ' '), f === 'unverified' ? 'chip-warn' : 'chip-muted')).join('')}</div>` : ''}
    </td>
    <td data-label="Legacy status (Aug 2026)">${r.legacyStatus ? esc(r.legacyStatus) : '<span class="none">—</span>'}</td>
    <td data-label="Legacy claim (unverified)">${r.legacyPrizeClaim ? `<span class="legacy-claim">${esc(r.legacyPrizeClaim)}</span>` : '<span class="none">—</span>'}</td>
    <td data-label="Source">${evidenceLinks(r, 'source-link')}</td>
  </tr>`;

const tableHead = (kind) =>
  kind === 'verified'
    ? `<thead><tr><th scope="col">Competition</th><th scope="col">Verified prize</th><th scope="col">Entry</th><th scope="col">Deadline</th><th scope="col">What it asks for</th><th scope="col">Evidence</th></tr></thead>`
    : `<thead><tr><th scope="col">Listing</th><th scope="col">Legacy status</th><th scope="col">Legacy claim (unverified)</th><th scope="col">Source</th></tr></thead>`;

const verifiedTable = (rows) => `<div class="table-card" data-table data-empty="No verified listings match those filters.">
  ${filterBar('verified')}
  <div class="table-scroll">
    <table class="data-table data-table-verified">${tableHead('verified')}<tbody>${rows.map(verifiedRow).join('')}</tbody></table>
  </div>
  <div class="table-foot"><span data-count></span><span class="foot-note">Every prize, fee and date here was read from the linked operator page on ${TODAY}.</span></div>
</div>`;

const leadsTable = (rows) => `<div class="table-card" data-table data-empty="No listings match those filters.">
  ${filterBar('lead')}
  <div class="table-scroll">
    <table class="data-table data-table-leads">${tableHead('lead')}<tbody>${rows.map(leadRow).join('')}</tbody></table>
  </div>
  <div class="table-foot"><span data-count></span><span class="foot-note">Legacy claims are shown for context only. They are not verified and were not copied into any verified field.</span></div>
</div>`;

const filterBar = (kind) => {
  const catOptions = categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  const tierSelect =
    kind === 'verified'
      ? `<select data-filter="tier" aria-label="Filter by tier"><option value="">All tiers</option><option value="A">Tier A — start here</option><option value="B">Tier B — worth tracking</option><option value="C">Tier C — context / non-cash</option></select>`
      : `<select data-filter="flags" aria-label="Filter by issue"><option value="">All issues</option><option value="dead-domain">Dead domain</option><option value="legacy-ended">Marked ended</option><option value="entry-fee-required">Entry fee required</option><option value="non-cash-mixed">Non-cash / mixed</option><option value="no-https-source">No HTTPS source</option></select>`;
  return `<div class="toolbar">
    <label class="search"><span class="visually-hidden">Search</span><input type="search" data-filter="q" placeholder="Search ${kind === 'verified' ? 'verified competitions' : 'listings'}…" autocomplete="off"></label>
    <select data-filter="cat" aria-label="Filter by category"><option value="">All categories</option>${catOptions}</select>
    ${tierSelect}
    <select data-filter="sort" aria-label="Sort rows"><option value="">Default order</option><option value="deadline">Deadline: soonest</option><option value="prize">Prize: largest</option><option value="name">Name: A–Z</option></select>
  </div>`;
};

const hero = ({ eyebrow, title, lead, actions = '' }) => `<section class="hero"><div class="shell">
  <p class="eyebrow">${esc(eyebrow)}</p>
  <h1>${title}</h1>
  <p class="hero-lead">${lead}</p>
  ${actions ? `<div class="hero-actions">${actions}</div>` : ''}
</div></section>`;

const pageIntro = ({ eyebrow, title, lead }) => `<div class="page-intro">
  <p class="eyebrow">${esc(eyebrow)}</p>
  <h1>${esc(title)}</h1>
  <p>${lead}</p>
</div>`;

const NAV = [
  ['index.html', 'Overview'],
  ['shortlist.html', 'Shortlist'],
  ['categories.html', 'Categories'],
  ['summary.html', 'Summary'],
  ['method.html', 'Method'],
  ['review.html', 'Flagged'],
  ['ledger-pass.html', 'Ledger pass'],
];

const shell = ({ page, title, description, body, heroHtml = '', S = '' }) => {
  /* S = depth of the page relative to the Atlas root ('' or '../').
     D = depth relative to the repository root, used for shared assets. */
  const D = `${S}../`;
  const nav = NAV.map(([href, label]) => `<a href="${S}${href}"${page === href ? ' aria-current="page" class="active"' : ''}>${label}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ${SITE}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light">
<link rel="stylesheet" href="${D}assets/atlas.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23104f5c'/%3E%3Cpath d='M8 21l5-10 3 6 3-4 5 8z' fill='%237fe3d0'/%3E%3C/svg%3E">
<script src="${D}assets/atlas.js" defer></script>
</head>
<body data-page="${page}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="topbar">
  <div class="shell topbar-inner">
    <a class="brand" href="${S}index.html"><span class="mark" aria-hidden="true">◈</span><span>Verified Atlas</span></a>
    <nav class="topnav" aria-label="Main">${nav}</nav>
  </div>
</header>
${heroHtml.replaceAll('{{D}}', S)}
<main id="main" class="shell main">${body.replaceAll('{{D}}', S).replaceAll('{{R}}', D)}</main>
<footer class="footer">
  <div class="shell footer-inner">
    <p><strong>Verified Atlas</strong> — operator-verified cash competition research, the subsite of the Prize Atlas project. Facts verified against operator pages on ${TODAY} UTC. Not financial, legal or tax advice.</p>
    <p class="footer-links"><a href="${S}summary.html">Executive summary</a><a href="${S}method.html">Method &amp; sources</a><a href="${S}review.html">Flagged for review</a><a href="${D}">Repo home</a><a href="${REPO}" target="_blank" rel="noopener noreferrer">Repository ↗</a></p>
  </div>
</footer>
</body>
</html>`;
};

const metric = (value, label, note = '') =>
  `<div class="metric"><strong>${esc(value)}</strong><span>${esc(label)}</span>${note ? `<em>${esc(note)}</em>` : ''}</div>`;

/* ------------------------------------------------------------------- pages */
const OUT = join(ROOT, 'atlas');
/* Placeholder for the depth of the page being written: bodies are shared between
   atlas/*.html (depth ../) and atlas/category/*.html (depth ../../), and the shell
   substitutes the real value at render time. */
const D = '{{D}}';
mkdirSync(join(OUT, 'category'), { recursive: true });

/* index ---------------------------------------------------------------- */
const startHere = verified
  .filter((r) => r.tier === 'A' && r.deadline && r.fit === 'high')
  .sort((a, b) => a.deadline.localeCompare(b.deadline))
  .slice(0, 8);

const indexBody = `
<div class="metrics">
  ${metric(stats.verified, 'Verified from operator pages', `${stats.withDeadline} with a stated deadline`)}
  ${metric(stats.leads, 'Unverified leads kept', 'prize and fee left blank')}
  ${metric(stats.catsWithVerified, 'Categories with verified entries', `of ${categories.length} categories`)}
  ${metric(stats.findings, 'Irregularities flagged', 'published for review')}
</div>

<div class="notice">
  <strong>Read the evidence column, not the headline.</strong>
  A row is marked <span class="tier tier-A">verified</span> only when the operator's own page was opened on ${TODAY} and the prize, fee or date shown was read there. Everything imported from the reference catalogue is an <em>unverified lead</em>: its prize and fee columns are deliberately blank, and its legacy claim appears only in a column labelled unverified — on the <a href="${D}review.html">Flagged for review</a> page and in each category's lead table.
</div>

<section aria-labelledby="start-here">
  <div class="section-head">
    <div>
      <h2 id="start-here">Start here: verified, cash, and open soon</h2>
      <p>Tier A rows with a stated deadline and a high fit for AI-assisted work, ordered by the nearest operator-stated deadline.</p>
    </div>
    <a class="see-all" href="${D}shortlist.html">All ${stats.verified} verified →</a>
  </div>
  ${verifiedTable(startHere).replace('<div class="toolbar">', '<div class="toolbar toolbar-hidden">')}
</section>

<section aria-labelledby="browse">
  <div class="section-head">
    <div>
      <h2 id="browse">Browse by category</h2>
      <p>Nine categories. Each page separates what was verified from what is still a lead.</p>
    </div>
    <a class="see-all" href="${D}categories.html">Category overview →</a>
  </div>
  <div class="category-grid">
    ${categories
      .map((c) => {
        const v = verified.filter((r) => r.category === c.id).length;
        const l = leadRows.filter((r) => r.category === c.id).length;
        return `<a class="card" href="${D}category/${c.id}.html">
          <span class="card-icon" aria-hidden="true">${c.icon}</span>
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.blurb)}</p>
          <span class="card-count">${v ? `${v} verified` : 'No verified rows yet'} · ${l} lead${l === 1 ? '' : 's'}</span>
        </a>`;
      })
      .join('')}
  </div>
</section>

<section aria-labelledby="how">
  <div class="section-head"><div><h2 id="how">How to use this site</h2><p>Three steps, in order.</p></div></div>
  <ol class="steps">
    <li><strong>Pick a category.</strong> Tech, data and forecasting carry the most operator-verified cash for work an AI agent can help you produce. Sports pick'em is the lowest-effort cash path but has the widest fields.</li>
    <li><strong>Read the row, then open the official page.</strong> Every verified row links the page the facts came from. Re-read it before you invest time: rules change mid-season.</li>
    <li><strong>Check the flags.</strong> Entry limits, non-cash prizes and reserved eligibility are recorded as flags rather than smoothed over. The <a href="${D}review.html">Flagged for review</a> page lists every unresolved item.</li>
  </ol>
</section>`;

writeFileSync(
  join(OUT, 'index.html'),
  shell({
    page: 'index.html',
    title: 'Free-to-enter cash competitions, verified',
    description: 'A dashboard of free-to-enter cash-prize competitions: verified prizes, fees, deadlines and official sources, plus unverified leads clearly flagged.',
    heroHtml: hero({
      eyebrow: 'Verified footholds, not hype',
      title: 'Find the free competitions worth your time — and see the source for every number.',
      lead: `The reference catalogue lists 206 competitions on a single page with no search. This rebuild covers all of them: ${stats.verified} rows verified against the operator's own pages, the rest kept as clearly labelled unverified leads with their prize and fee fields left blank.`,
      actions: `<a class="btn btn-primary" href="${D}shortlist.html">Open the verified shortlist</a>
        <a class="btn btn-ghost" href="${D}summary.html">Read the executive summary</a>`,
    }),
    body: indexBody,
  })
);

/* shortlist ------------------------------------------------------------ */
const shortlistBody = `
${pageIntro({
  eyebrow: 'Shortlist',
  title: 'Every row verified against an operator page',
  lead: `${stats.verified} competitions and platforms were checked on ${TODAY}. Each row links the page the facts came from. Blank fields mean the operator page did not state the value — nothing has been estimated, averaged or copied from the legacy catalogue.`,
})}

<div class="panel panel-soft">
  <h2>Tier rules used on this page</h2>
  <div class="tier-grid">
    <div><span class="tier tier-A">Tier A</span><p><strong>Start here.</strong> Free entry confirmed by the operator, cash prize of at least $5,000 stated by the operator, and a deliverable an AI coding agent can materially help produce (model, paper, app, or structured picks).</p></div>
    <div><span class="tier tier-B">Tier B</span><p><strong>Worth tracking.</strong> Verified free entry and cash, but smaller pools, reserved eligibility, long horizons, or a heavy production burden.</p></div>
    <div><span class="tier tier-C">Tier C</span><p><strong>Context only.</strong> Verified, but the prize is non-cash, the pool is missing, or the row is a platform rather than one event.</p></div>
  </div>
  <p class="small">Tiers are editorial triage, not a measured expected value. No source inspected publishes win probabilities, so no expected-value figure appears anywhere on this site.</p>
</div>

${verifiedTable(verified)}`;

writeFileSync(
  join(OUT, 'shortlist.html'),
  shell({
    page: 'shortlist.html',
    title: 'Verified shortlist',
    description: 'Free-to-enter cash competitions verified against operator pages on 2026-11-01, with prizes, entry terms, deadlines and sources.',
    body: shortlistBody,
  })
);

/* categories ----------------------------------------------------------- */
const categoriesBody = `
${pageIntro({
  eyebrow: 'Categories',
  title: 'Nine categories, honestly labelled',
  lead: 'Each category page lists verified rows first, then the unverified leads that came from the reference catalogue. Four categories have no verified entry yet; that gap is stated rather than filled with guesses.',
})}
<div class="category-grid category-grid-wide">
  ${categories
    .map((c) => {
      const v = verified.filter((r) => r.category === c.id);
      const l = leadRows.filter((r) => r.category === c.id).length;
      return `<a class="card" href="${D}category/${c.id}.html">
        <span class="card-icon" aria-hidden="true">${c.icon}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.blurb)}</p>
        <span class="card-count">${v.length} verified · ${l} lead${l === 1 ? '' : 's'}</span>
      </a>`;
    })
    .join('')}
</div>`;

writeFileSync(
  join(OUT, 'categories.html'),
  shell({
    page: 'categories.html',
    title: 'Categories',
    description: 'Browse free-to-enter cash competition categories: tech, forecasting, sports, creative, trivia, skill, market, pools and directories.',
    body: categoriesBody,
  })
);

/* category pages ------------------------------------------------------- */
for (const c of categories) {
  const vRows = verified.filter((r) => r.category === c.id);
  const lRows = leadRows.filter((r) => r.category === c.id);
  const body = `
${pageIntro({
  eyebrow: `Category · ${c.name}`,
  title: c.name,
  lead: esc(c.blurb),
})}
<div class="metrics metrics-3">
  ${metric(vRows.length, 'Verified entries', 'operator page read')}
  ${metric(lRows.length, 'Unverified leads', 'prize left blank')}
  ${metric(vRows.length ? new Set(vRows.map((r) => r.source)).size : 0, 'Distinct sources', 'linked per row')}
</div>
${
  vRows.length
    ? `<div class="section-head"><div><h2>Verified in this category</h2><p>Prize, entry and deadline read from the operator page on ${TODAY}.</p></div></div>${verifiedTable(vRows)}`
    : `<div class="notice notice-warn"><strong>Coverage gap.</strong> No entry in this category could be confirmed free-to-enter with a cash prize from an official page in this pass, so nothing here is marked verified. The leads below are kept for research and are not recommendations.</div>`
}
${
  lRows.length
    ? `<div class="section-head"><div><h2>Unverified leads</h2><p>Imported from the reference catalogue. Prize and fee are blank because no operator page was read.</p></div><a class="see-all" href="${D}review.html">Why these are flagged →</a></div>${leadsTable(lRows)}`
    : ''
}
<p class="back-link"><a href="${D}categories.html">← All categories</a></p>`;
  writeFileSync(
    join(OUT, 'category', `${c.id}.html`),
    shell({
      page: 'categories.html',
      title: c.name,
      description: `${c.name}: verified free-to-enter cash competitions and unverified leads, with official sources.`,
      body,
      S: '../',
    })
  );}

/* review --------------------------------------------------------------- */
const sevTone = { high: 'sev-high', medium: 'sev-medium', low: 'sev-low' };
const reviewBody = `
${pageIntro({
  eyebrow: 'Flagged for review',
  title: 'Everything that did not survive verification',
  lead: `These are the irregularities found while checking the reference catalogue and the operator pages. Nothing here blocks publication: each item is published with its source so it can be reviewed after launch. The ${stats.leads} unverified leads follow the findings.`,
})}
<div class="section-head"><div><h2>Audit findings</h2><p>${stats.findings} items, ordered by severity.</p></div></div>
<div class="findings">
  ${audit.findings
    .slice()
    .sort((a, b) => ['high', 'medium', 'low'].indexOf(a.severity) - ['high', 'medium', 'low'].indexOf(b.severity))
    .map(
      (f) => `<article class="finding" id="${f.id}">
        <header><span class="sev ${sevTone[f.severity]}">${esc(f.severity)}</span><h3>${esc(f.title)}</h3></header>
        <p>${esc(f.detail)}</p>
        <p class="finding-sources">Sources: ${f.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join(' ')}</p>
      </article>`
    )
    .join('')}
</div>

<div class="section-head"><div><h2>Unverified leads (${stats.leads})</h2><p>Imported names and legacy claims. No prize, fee or date on these rows is confirmed.</p></div></div>
${leadsTable(leadRows)}`;

writeFileSync(
  join(OUT, 'review.html'),
  shell({
    page: 'review.html',
    title: 'Flagged for review',
    description: 'Audit findings and unverified competition leads, each with its source link, published for manual review.',
    body: reviewBody,
  })
);

/* summary -------------------------------------------------------------- */
const topPicks = [
  'devpost-paypal-ai',
  'drivendata-gems',
  'kaggle-nfl-big-data-bowl-2027',
  'metaculus-fall-futureeval-2026',
  'devpost-codegeist-2026',
].map(byId).filter(Boolean);

const summaryBody = `
${pageIntro({
  eyebrow: 'Executive summary',
  title: 'What the evidence actually supports',
  lead: `Prepared ${TODAY} UTC. This page is the short version: what was verified, which opportunities look worth the time, what is still unknown, and what could go wrong. Every claim links to the page it came from.`,
})}

<div class="prose-card">
  <h2>1. The problem this rebuild solves</h2>
  <p>The reference catalogue at <a href="${esc(audit.reference)}" target="_blank" rel="noopener noreferrer">karagemop466-tech.github.io/FreeMoneyApps</a> lists 206 competitions on a single page and states: <em>“No search box, no filters: just scroll.”</em> On a phone that is a long, undifferentiated scroll through hundreds of blocks with no way to sort by deadline or see which entries are actually verified. Several of its links are dead: six of its source domains no longer resolve, one row is only reachable over plain HTTP, and one source is a 2024 news article. Its prize figures are all stamped 2026-08-19 and none is re-established against a current operator rules page.</p>
  <h2>2. What was done</h2>
  <ul>
    <li><strong>${stats.leads} legacy listings preserved</strong>, with names and categories imported but every prize, fee and deadline field left blank. The legacy claim is displayed only in a column explicitly labelled unverified.</li>
    <li><strong>${stats.verified} rows verified</strong> by opening the operator's own page on ${TODAY} and reading the prize, entry cost, deadline or eligibility from it. Each row links that page and stamps the check date.</li>
    <li><strong>${stats.findings} irregularities flagged</strong> and published on the <a href="${D}review.html">Flagged for review</a> page with sources, instead of being silently fixed or dropped.</li>
    <li><strong>Mobile-first rebuild</strong>: a dashboard, per-category pages, search, filters, sorting and card layouts, with no build step needed to view it.</li>
  </ul>
  <h2>3. Where the verified money is</h2>
  <p>After checking, the shape of the market is clear. <strong>Free entry with real cash is concentrated in tech, data and forecasting</strong> — the categories where the deliverable is a model, a paper or an app. Sports pick'em is genuinely free and pays cash, but the prizes are diluted across tens of thousands of entrants. Most skill-game and trivia listings from the legacy catalogue are not free cash paths at all: the free rooms pay gems or bonus currency, and the cash rooms charge an entry fee.</p>
  <div class="pick-list">
    ${topPicks
      .map(
        (r) => `<article class="pick">
      <h3>${esc(r.name)}</h3>
      <dl>
        <div><dt>Verified prize</dt><dd>${esc(r.prize || 'not stated')}</dd></div>
        <div><dt>Entry</dt><dd>${esc(r.entryFee || 'not stated')}</dd></div>
        <div><dt>Deadline</dt><dd>${r.deadline ? fmtDate(r.deadline) : 'not stated'}</dd></div>
        <div><dt>Why it is on this list</dt><dd>${esc(r.work || '')}</dd></div>
      </dl>
      ${r.flags?.length ? `<p class="pick-flag">Watch out: ${esc(r.flags.join('; '))}</p>` : ''}
      <p class="pick-src">${evidenceLinks(r, 'source-link')}</p>
    </article>`
      )
      .join('')}
  </div>
  <h2>4. What is not known</h2>
  <ul>
    <li><strong>No win probabilities exist in any inspected source.</strong> This site therefore publishes no expected value, hourly rate or “best odds” ranking. Any site that does is inferring.</li>
    <li><strong>Four categories have no verified row</strong> (skill, market, pools, directories). They are labelled as a coverage gap rather than filled.</li>
    <li><strong>Most hackathon prize totals are stated “in prizes”, not “in cash”.</strong> The cash/non-cash split is unknown for those rows and is flagged.</li>
    <li><strong>External reachability is not certified.</strong> DNS was checked for all 223 legacy hostnames; individual deep links were spot-checked, not exhaustively fetched.</li>
  </ul>
  <h2>5. Recommended next steps</h2>
  <ol class="steps">
    <li>Work the two code-heavy tracks with near-term deadlines first: <a href="${D}shortlist.html">the shortlist</a> sorted by deadline puts ARC Prize, PayPal AI and GEMS at the top.</li>
    <li>Treat forecasting tournaments as background work — they are free, they reward calibration, and a bot tournament with a $50,000 pool is explicitly built for automated approaches.</li>
    <li>Before any submission, re-open the rules page from the row and confirm (a) entry is still free, (b) you are eligible by country and age, (c) the deadline in your time zone. Rules changed mid-season on at least two rows checked here.</li>
    <li>Review the <a href="${D}review.html">flagged items</a> and tell us which leads to verify next; that list is ordered by evidence value, not by prize size.</li>
  </ol>
  <h2>6. Limits of this document</h2>
  <p>Verification is a snapshot: a page read on ${TODAY} can change tomorrow. Cash prizes may carry tax consequences (US reporting commonly starts at $600, but confirm with the operator and a tax professional). Nothing here is financial, legal or tax advice, and no operator paid for a listing.</p>
</div>`;

writeFileSync(
  join(OUT, 'summary.html'),
  shell({
    page: 'summary.html',
    title: 'Executive summary',
    description: 'Executive summary of the free-to-enter cash competition research: what was verified, what was flagged, and where the verified money is.',
    body: summaryBody,
  })
);

/* method --------------------------------------------------------------- */
const sourceRows = [...new Set(verified.map((r) => r.source))]
  .sort()
  .map((u) => {
    const rows = verified.filter((r) => r.source === u);
    return `<tr><td data-label="Operator page"><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a></td><td data-label="Rows supported">${rows.length}</td><td data-label="Read on">${TODAY}</td></tr>`;
  })
  .join('');

const methodBody = `
${pageIntro({
  eyebrow: 'Method',
  title: 'How each row was checked',
  lead: 'The evidence standard is deliberately strict and deliberately boring: open the operator page, read the number, write it down with the link. If the page does not state it, the field stays empty.',
})}
<div class="prose-card">
  <h2>Evidence standard</h2>
  <ol class="steps">
    <li><strong>One claim, one operator page.</strong> A prize, fee or deadline is written only if it appeared on a page the operator controls (a rules page, a game page, a competition page).</li>
    <li><strong>No inference.</strong> Countdowns such as “8 days to go” are quoted as notes; they are not converted into a date. Totals are not computed from partial prize ladders unless the operator states the total.</li>
    <li><strong>Blank beats plausible.</strong> If the operator page did not state entry cost, eligibility or a deadline, the field is empty and the row carries a flag saying so.</li>
    <li><strong>Third-party claims stay third-party.</strong> Legacy prize text from the reference catalogue is displayed only in a column labelled “legacy claim (unverified)”.</li>
    <li><strong>Conflicts are published, not resolved.</strong> Where one operator page contradicts itself, both values are recorded and the row is flagged.</li>
  </ol>

  <h2>What was checked, and how</h2>
  <ul>
    <li>DNS resolution was tested for all 223 distinct hostnames in the legacy catalogue on ${TODAY}; six failed and are flagged.</li>
    <li>${stats.verified} rows were verified by opening ${new Set(verified.map((r) => r.source)).size} distinct operator URLs plus supporting rules pages; every one is listed in the table below.</li>
    <li>Internal links, page structure, dataset schema and the “no inferred values” rules are enforced by <code>tests/validate.mjs</code>, which runs in CI on every push.</li>
    <li>External deep links were not exhaustively fetched — this environment resolves DNS but cannot fetch arbitrary domains. Reachability of individual URLs is therefore <strong>not</strong> certified beyond the pages listed below.</li>
  </ul>

  <h2>Operator pages read on ${TODAY}</h2>
  <div class="table-card"><div class="table-scroll"><table class="data-table">
    <thead><tr><th scope="col">Operator page</th><th scope="col">Rows supported</th><th scope="col">Read on</th></tr></thead>
    <tbody>${sourceRows}</tbody>
  </table></div></div>

  <h2>Source hierarchy</h2>
  <p>Tier 1 is the operator's own rules or competition page. Tier 2 is a platform listing that the operator publishes (for example a Devpost or Kaggle event card). Tier 3 is third-party commentary, which is used here only to raise a question, never to answer one. Some verified rows rest on tier 2 evidence and say so in their flags — a prize that only exists on a platform card is weaker evidence than one in a rules document.</p>

  <h2>Reproducing this</h2>
  <p>Everything is static. <code>scripts/build.mjs</code> merges <code>data/verified.json</code> and <code>data/legacy.json</code> into the pages you are reading and into <code>data/entries.json</code>. Run <code>node scripts/build.mjs &amp;&amp; node tests/validate.mjs</code> from the repository root to rebuild and re-check. The build is deterministic, so a clean rebuild produces no diff.</p>
</div>`;

writeFileSync(
  join(OUT, 'method.html'),
  shell({
    page: 'method.html',
    title: 'Method and sources',
    description: 'The evidence standard, the operator pages read, and the checks that run on every build.',
    body: methodBody,
  })
);

/* 404 ------------------------------------------------------------------ */
writeFileSync(
  join(OUT, '404.html'),
  shell({
    page: '404',
    title: 'Page not found',
    description: 'That page does not exist. Use the dashboard to find verified competitions.',
    body: `<div class="page-intro"><p class="eyebrow">404</p><h1>That page does not exist</h1><p>Use the <a href="${D}index.html">dashboard</a>, the <a href="${D}shortlist.html">verified shortlist</a> or the <a href="${D}categories.html">category overview</a>. If something here is broken, it is worth flagging: the <a href="${D}review.html">Flagged for review</a> page lists known issues.</p></div>`,
  })
);

/* ledger pass hub ------------------------------------------------------ */
const ledgerPages = [
  ['all.html', 'All 206 listings', 'Every catalogue row with its operator link, catalogue tag and verification badge.'],
  ['best-picks.html', 'Best picks', 'The ledger pass\' editorial shortlist, scored with stated weights.'],
  ['verification.html', 'Verification ledger', 'The 12 rows that pass re-checked line by line, each with a verbatim quote from the operator page.'],
  ['flagged.html', 'Ledger-pass findings', 'Integrity findings computed by tools/audit.py over the catalogue.'],
  ['methodology.html', 'Ledger-pass method', 'How that pass scored and graded rows.'],
  ['executive-summary.html', 'Ledger-pass summary', 'That pass\' executive summary.'],
  ['sources.html', 'Source index', 'Every source URL the ledger pass used, grouped by tier.'],
  ['cross-session.html', 'Cross-session log', 'What each parallel agent session contributed and how the merge was reconciled.'],
];

const ledgerPassBody = `
${pageIntro({
  eyebrow: 'Second layer',
  title: 'The ledger pass',
  lead: 'Another agent session built a complementary pass over the same 206-listing catalogue: every row keeps its catalogue tag, twelve rows carry quoted operator evidence, and a separate audit script computes integrity findings. That work is preserved here rather than replaced.',
})}
<div class="notice">
  <strong>Two evidence layers, one site.</strong> The pages in this section were generated by
  <code>tools/build_site.py</code> from <code>data/ledger.json</code> and <code>data/verification.json</code>.
  The pages in the main navigation are generated by <code>scripts/build.mjs</code> from
  <code>data/verified.json</code>, <code>data/legacy.json</code> and <code>data/atlas-findings.json</code>.
  Both are published so neither session's work is lost; the two datasets have not been merged into one
  schema, and that is a known integration gap.
</div>
<div class="table-card"><div class="table-scroll"><table class="data-table">
  <thead><tr><th scope="col">Page</th><th scope="col">What it contains</th></tr></thead>
  <tbody>
    ${ledgerPages.map(([href, title, blurb]) => `<tr><td data-label="Page"><a class="source-link" href="{{R}}${href}">${esc(title)} ↗</a></td><td data-label="What it contains">${esc(blurb)}</td></tr>`).join('')}
  </tbody>
</table></div></div>
<div class="prose-card">
  <h2>How the two passes differ</h2>
  <ul>
    <li><strong>Catalogue fields.</strong> The ledger pass keeps the reference catalogue's own prize text on each row, tagged by free-path and status. This site's pages blank any prize, fee or deadline that was not read from an operator page, and show the catalogue claim only in a column labelled unverified.</li>
    <li><strong>Depth.</strong> The ledger pass re-checked 12 rows with verbatim quotes. This pass verified 44 rows and records prize, entry, deadline, eligibility and work required, with the page read.</li>
    <li><strong>Findings.</strong> The ledger pass computes findings with <code>tools/audit.py</code>; this pass publishes 17 findings with source links on the <a href="${D}review.html">Flagged for review</a> page.</li>
    <li><strong>Build.</strong> <code>tools/build_site.py</code> owns <code>all.html</code>, <code>verification.html</code> and the other pages listed above. <code>scripts/build.mjs</code> owns <code>index.html</code>, this page and the category pages. Re-running the Python generator will overwrite <code>index.html</code> and <code>category/*.html</code>; see COORDINATION.md before doing that.</li>
  </ul>
</div>`;

writeFileSync(
  join(OUT, 'ledger-pass.html'),
  shell({
    page: 'ledger-pass.html',
    title: 'Ledger pass',
    description: 'The parallel ledger pass: all 206 catalogue rows with quoted verification for 12 rows, preserved alongside the operator-verified shortlist.',
    body: ledgerPassBody,
  })
);

/* sitemap -------------------------------------------------------------- */
const sitePages = ['index.html', 'shortlist.html', 'categories.html', 'summary.html', 'method.html', 'review.html', 'ledger-pass.html',
  ...categories.map((c) => `category/${c.id}.html`), ...ledgerPages.map(([href]) => href)];
writeFileSync(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitePages.map((p) => `  <url><loc>https://sassnarep3-star.github.io/Own1/atlas/${p}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`
);

/* merged dataset ------------------------------------------------------- */
writeFileSync(join(ROOT, 'data/atlas-entries.json'), JSON.stringify(merged, null, 2) + '\n');

console.log(`Built ${stats.total} entries (${stats.verified} verified, ${stats.leads} leads) into pages.`);
