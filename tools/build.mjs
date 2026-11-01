#!/usr/bin/env node
/**
 * Prize Atlas static site builder.
 *
 * Reads data/entries.json (facts) and data/triage.json (editorial inputs) and writes
 * pre-rendered HTML for GitHub Pages. No dependencies, no runtime fetch: every table
 * is real markup, so the site works with JavaScript disabled and from the local
 * filesystem. assets/app.js only filters rows that are already in the DOM.
 *
 * Usage: node tools/build.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const READ_DATE = '2026-11-01';
const entries = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/entries.json'), 'utf8'));
const triage = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/triage.json'), 'utf8'));
// A parallel session verified 12 rows with verbatim quotes; its file is rendered here
// so both bodies of evidence are published in one place instead of competing pages.
let parallelVerify = { entries: [] };
let parallelAudit = null;
let batchA = [];
try {
  batchA = fs.readFileSync(path.join(ROOT, 'data/verification/batchA.jsonl'), 'utf8')
    .split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
} catch { /* optional */ }
try { parallelAudit = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/audit.json'), 'utf8')); } catch { /* optional */ }
try {
  parallelVerify = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/verification.json'), 'utf8'));
} catch { /* optional: the file is only present when that session's work is merged */ }

const CATEGORIES = [
  {
    id: 'sports', name: 'Fantasy & sports picks', short: 'Sports picks',
    blurb: 'NFL, college and global football pick \u2018em, brackets and fantasy games.',
    detail:
      'This is the largest category (129 leads) and also the least verified. Most rows were imported from the reference ledger and their links go to team sites or news articles rather than to prize rules, so no prize or deadline is shown. ESPN\u2019s NFL Pick\u2019em is the one sports game here whose free entry and $102,000 prize list were read on the operator\u2019s own page.',
    pays: 'Operator-run free pick \u2018em games with published prize tables.'
  },
  {
    id: 'tech', name: 'Build something', short: 'Tech & data',
    blurb: 'Machine-learning competitions, research prizes and hackathons.',
    detail:
      'Benchmark-led contests with the largest documented prizes in the dataset. They are free to enter in practice but demand real modelling or research work, and some require open-sourcing your solution. Platforms mix prize events with practice events, so only the specific event page is authoritative.',
    pays: 'Prize pools attached to a competition leaderboard, paid by the organiser.'
  },
  {
    id: 'forecasting', name: 'Forecasting', short: 'Forecasting',
    blurb: 'Probability tournaments where accuracy is scored and paid.',
    detail:
      'The cleanest free-entry, low-labour cash path found in this research. Metaculus states plainly that participation is free and that accurate forecasters win cash, and each tournament card prints its own prize pool \u2014 including the ones that pay nothing.',
    pays: 'Fixed prize pools per tournament, ranked by forecasting score.'
  },
  {
    id: 'creative', name: 'Writing & photography', short: 'Creative',
    blurb: 'Poetry, short fiction, photo awards and creator challenges.',
    detail:
      'A mix of genuinely free contests and paid-entry competitions that are often marketed next to them. Every row marked "Free entry" was read on the organiser\u2019s rules page; the paid ones are kept visible and labelled instead of being deleted.',
    pays: 'Judged prizes paid by the organiser, sometimes with publication.'
  },
  {
    id: 'market', name: 'Market simulations', short: 'Market sims',
    blurb: 'Paper-trading and virtual-funds contests.',
    detail:
      'Virtual-funds tournaments where the headline reward is often a share of a prize pool rather than a fixed cash award. None of these 19 leads could be verified against an operator rules page in this pass, and several are broker marketing.',
    pays: 'Prize pools for simulated trading performance; terms vary widely.'
  },
  {
    id: 'skill', name: 'Skill tournaments', short: 'Skill games',
    blurb: 'Cash-room mobile game tournaments.',
    detail:
      'Every lead here is a paid-entry cash room, or a free room that pays in gems or bonus cash. That is the opposite of a free-to-enter cash prize, so this category is present as a warning list, not a shortlist.',
    pays: 'Entry fees fund the prize pool; free rooms usually pay in non-cash currency.'
  },
  {
    id: 'trivia', name: 'Trivia & quiz', short: 'Trivia',
    blurb: 'Quiz apps and question-based contests.',
    detail:
      'Only two leads, neither a straightforward free cash quiz. Givling is a crowdfunding queue rather than a judged contest, so it is flagged rather than recommended.',
    pays: 'Varies; no verified free cash quiz in this pass.'
  },
  {
    id: 'pools', name: 'Pool tools', short: 'Pools',
    blurb: 'Software for running office pools.',
    detail:
      'These are tools, not prize sources. Money in a pool comes from the other participants, which is not operator-funded prize money and is legally different in many places.',
    pays: 'Nothing \u2014 participants fund each other.'
  },
  {
    id: 'directory', name: 'Directories', short: 'Directories',
    blurb: 'Official lists of live contests to browse yourself.',
    detail:
      'Not contests. These pages are where new contests are announced, and USA.gov is the official replacement for the retired Challenge.gov portal.',
    pays: 'Nothing directly; they point to contests that do.'
  }
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const host = (u) => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return u ? String(u) : ''; } };
const checked = entries.filter((r) => r.sourceStatus === 'checked');
const unverified = entries.filter((r) => r.sourceStatus !== 'checked');
const freeVerified = checked.filter((r) => r.entryFree === 'yes');
const DAYS = (d) => Math.round((new Date(d + 'T00:00:00Z') - new Date(READ_DATE + 'T00:00:00Z')) / 86400000);
const daysTo = (r) => (r.deadlineISO ? DAYS(r.deadlineISO) : null);

function score(r) {
  const t = triage[r.id];
  if (r.sourceStatus !== 'checked' || !t) return null;
  const parts = [];
  let s = 0;
  if (r.entryFree === 'yes') { s += 3; parts.push('+3 free entry confirmed'); }
  if (r.entryFree === 'no') { s -= 3; parts.push('\u22123 paid entry'); }
  const scale = Number(t.scale) || 0;
  if (scale) { s += scale; parts.push(`+${scale} documented prize size`); }
  if (t.effort === 'low') { s += 1; parts.push('+1 low effort to enter'); }
  if (t.effort === 'high') { s -= 1; parts.push('\u22121 high effort to enter'); }
  const d = daysTo(r);
  if (d !== null && d >= 0 && d <= 30) { s += 1; parts.push('+1 deadline within 30 days'); }
  return { score: s, parts };
}

/* ------------------------------------------------------------------ */
/* shared chrome                                                       */
/* ------------------------------------------------------------------ */
const PAGES = [
  { href: 'index.html', label: 'Overview', key: 'home' },
  { href: 'index.html#categories', label: 'Categories', key: 'cats' },
  { href: 'index.html#best-bets', label: 'Best bets', key: 'bets' },
  { href: 'analysis.html', label: 'Analysis', key: 'analysis' },
  { href: 'methodology.html', label: 'Method', key: 'method' },
  { href: 'supplemental/index.html', label: 'Supplemental', key: 'supp' },
  { href: 'review.html', label: 'Flagged for review', key: 'review' }
];

function chrome(prefix, active, title, description, body, extraHead = '') {
  const nav = PAGES.map((p) => {
    const isActive = p.key === active ? ' aria-current="page"' : '';
    return `<a href="${prefix}${p.href}"${isActive}>${esc(p.label)}</a>`;
  }).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${prefix}assets/style.css">
${extraHead}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${prefix}index.html">
      <span class="brand-mark" aria-hidden="true">&#10022;</span>
      <span>Prize Atlas<small>Free-to-enter cash competitions</small></span>
    </a>
    <nav class="nav" aria-label="Main">${nav}</nav>
  </div>
</header>
${body}
<footer class="site-footer">
  <div class="wrap">
    <span>Prize Atlas \u00b7 Research, not financial, legal or tax advice \u00b7 Sources re-read ${READ_DATE}</span>
    <span><a href="${prefix}methodology.html">Method &amp; sources</a> \u00b7 <a href="${prefix}review.html">Flagged for review</a> \u00b7 <a href="${prefix}archive/all.html">Archived builds</a> \u00b7 <a href="${prefix}ledger/index.html">Verified ledger</a> \u00b7 <a href="https://github.com/sassnarep3-star/Own1">Repository</a></span>
  </div>
</footer>
<script src="${prefix}assets/app.js" defer></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* rows and tables                                                     */
/* ------------------------------------------------------------------ */
function sourceCell(r) {
  if (!r.source) {
    return `<span class="blank">No operator link located</span><span class="cell-sub">Link withheld rather than substituting a third-party page</span>`;
  }
  const label = r.sourceStatus === 'checked' ? 'Official page' : 'Lead link';
  const note = r.sourceStatus === 'checked' ? `read ${esc(r.evidence?.checkedAt || READ_DATE)}` : 'unverified';
  return `<a class="src" href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">${esc(host(r.source))} \u2197<small>${label} \u00b7 ${note}</small></a>`;
}

function row(r) {
  const cat = CATEGORIES.find((c) => c.id === r.category);
  const s = score(r);
  const evidenceTag = r.sourceStatus === 'checked'
    ? '<span class="tag tag-ok">Page checked</span>'
    : '<span class="tag tag-warn">Unverified</span>';
  const freeTag = r.entryFree === 'yes' ? '<span class="tag tag-free">Free entry</span>'
    : r.entryFree === 'no' ? '<span class="tag tag-paid">Paid entry</span>' : '';
  const blank = (v) => (v ? esc(v) : '<span class="blank">Not confirmed</span>');
  const flags = (r.flags || []).map((f) => `<span class="flagline">\u2691 ${esc(f)}</span>`).join('');
  const scoreCell = s
    ? `<span class="score">${s.score}</span><span class="cell-sub">${esc(s.parts.join(' \u00b7 '))}</span>`
    : '<span class="blank">Not ranked</span>';
  const search = [r.name, r.category, cat?.name, r.prize, r.entry, r.deadline, r.note, r.source, (r.flags || []).join(' ')]
    .join(' ').toLowerCase().replace(/"/g, '\u201d');
  return `<tr id="${esc(r.id)}" data-status="${r.sourceStatus}" data-category="${esc(r.category)}" data-free="${esc(r.entryFree || '')}" data-search="${esc(search)}">
  <td data-label="Listing">
    <span class="cell-name">${esc(r.name)}</span>
    <span class="cell-sub">${esc(cat?.short || r.category)}${r.kind ? ' \u00b7 ' + esc(r.kind) : ''}</span>
    ${flags}
  </td>
  <td data-label="Evidence"><div class="badge-list">${evidenceTag}${freeTag}</div></td>
  <td data-label="Prize">${blank(r.prize)}</td>
  <td data-label="Entry cost">${blank(r.entry)}</td>
  <td data-label="Deadline">${blank(r.deadline)}</td>
  <td data-label="Source">${sourceCell(r)}${r.note ? `<span class="row-note">${esc(r.note)}</span>` : ''}</td>
  <td data-label="Triage score">${scoreCell}</td>
</tr>`;
}

function filters({ category = false, wide = false } = {}) {
  const catSelect = category
    ? `<div><label for="f-cat">Category</label><select id="f-cat"><option value="">All categories</option>${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>`
    : '';
  return `<div class="filters${wide ? ' wide' : ''}">
    <div><label for="f-q">Search</label><input id="f-q" type="search" placeholder="Search any listing, prize, source or note" autocomplete="off"></div>
    ${catSelect}
    <div><label for="f-evidence">Evidence</label><select id="f-evidence"><option value="">All rows</option><option value="checked">Page checked</option><option value="unverified">Unverified only</option></select></div>
    <div><label for="f-free">Entry cost</label><select id="f-free"><option value="">Any</option><option value="yes">Free confirmed</option><option value="no">Paid</option><option value="blank">Not confirmed</option></select></div>
  </div>
  <div class="table-meta" id="table-meta" aria-live="polite"><b>${entries.length}</b> rows shown</div>`;
}

function table(rows, { withScore = true } = {}) {
  return `<div class="table-scroll"><table data-filterable>
  <thead><tr>
    <th scope="col">Listing</th><th scope="col">Evidence</th><th scope="col">Cash prize</th>
    <th scope="col">Entry cost</th><th scope="col">Deadline</th><th scope="col">Official source</th>
    ${withScore ? '<th scope="col">Triage</th>' : ''}
  </tr></thead>
  <tbody>${rows.map(row).join('\n')}</tbody>
</table></div>`;
}

/* ------------------------------------------------------------------ */
/* pages                                                               */
/* ------------------------------------------------------------------ */
const ranked = checked
  .map((r) => ({ r, s: score(r) }))
  .filter((x) => x.s)
  .sort((a, b) => b.s.score - a.s.score || a.r.name.localeCompare(b.r.name));

const nextDeadlines = checked
  .filter((r) => r.deadlineISO && DAYS(r.deadlineISO) >= 0)
  .sort((a, b) => DAYS(a.deadlineISO) - DAYS(b.deadlineISO));

const upcoming = nextDeadlines[0];
const irregularRows = entries.filter((r) => (r.flags || []).length);
const newsLike = entries.filter((r) => /\/news\/|\/blog\/|news-story|\/article\//i.test(r.source || ''));
const sharedSources = (() => {
  const map = new Map();
  for (const r of entries) if (r.source) map.set(r.source, (map.get(r.source) || []).concat(r));
  return [...map.entries()].filter(([, rs]) => rs.length > 1).sort((a, b) => b[1].length - a[1].length);
})();

const bestBetsTable = ranked.map(({ r, s }) => ({
  ...r,
  __html: `<tr>
  <td data-label="Listing"><span class="cell-name">${esc(r.name)}</span><span class="cell-sub">${esc(CATEGORIES.find((c) => c.id === r.category)?.short)}</span></td>
  <td data-label="Why it ranks">${esc(triage[r.id]?.rationale || '')}</td>
  <td data-label="Prize">${esc(r.prize || '')}</td>
  <td data-label="Entry">${esc(r.entry || '')}</td>
  <td data-label="Deadline">${esc(r.deadline || '')}</td>
  <td data-label="Score"><span class="score">${s.score}</span><span class="cell-sub">${esc(s.parts.join(' \u00b7 '))}</span></td>
  <td data-label="Source"><a class="src" href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">${esc(host(r.source))} \u2197</a></td>
</tr>`
})).map((x) => x.__html).join('\n');

const kpi = (n, label) => `<div class="kpi"><b>${n}</b><span>${label}</span></div>`;

const indexBody = `<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Source-first dashboard \u00b7 ${READ_DATE}</p>
    <h1>Find free-to-enter competitions that pay real cash.</h1>
    <p class="lede">${entries.length} competition leads, each linked to the operator\u2019s own page. ${checked.length} have had their prize, entry cost and deadline read on that page. The other ${unverified.length} are listed with blank fields and flagged \u2014 never filled in from memory.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#best-bets">See the verified shortlist</a>
      <a class="btn btn-ghost" href="#all-rows">Browse all ${entries.length} rows</a>
    </div>
  </div>
</section>
<main id="main">
  <div class="wrap">
    <section aria-label="Key figures">
      <div class="kpis">
        ${kpi(entries.length, 'Total leads')}
        ${kpi(checked.length, 'Rows checked against an official page')}
        ${kpi(freeVerified.length, 'Free entry confirmed')}
        ${kpi(unverified.length, 'Unverified, published blank')}
      </div>
    </section>

    <section>
      <div class="callout">
        <strong>How to read this site.</strong> A row marked <em>Page checked</em> means the linked operator page was opened on ${READ_DATE} and the values shown were copied from it. Blank cells mean the value was <em>not</em> confirmed \u2014 not that it is zero. A lead link is a research pointer, not evidence that a prize exists today. Nobody legitimate asks you to pay a fee to receive a prize, and US tax reporting generally starts at $600 of winnings.
      </div>
    </section>

    <section id="best-bets">
      <div class="section-head">
        <div><h2>Where to spend your time first</h2><p>Editorial triage of the ${checked.length} checked rows, using only verified facts: free entry confirmed (+3), paid entry (\u22123), documented prize size (0\u20133), effort to enter (\u00b11), deadline inside 30 days (+1). It is a planning aid, not a win probability.</p></div>
        <a href="analysis.html">Read the analysis \u2192</a>
      </div>
      <div class="panel">
        <div class="table-scroll"><table>
          <thead><tr><th scope="col">Listing</th><th scope="col">Why it ranks here</th><th scope="col">Prize</th><th scope="col">Entry</th><th scope="col">Deadline</th><th scope="col">Score</th><th scope="col">Official source</th></tr></thead>
          <tbody>${bestBetsTable}</tbody>
        </table></div>
        <div class="panel-note">Scores are re-derived every build from <code>data/triage.json</code>; the arithmetic is printed under each score so you can disagree with it.</div>
      </div>
    </section>

    <section id="categories">
      <div class="section-head"><div><h2>Browse by category</h2><p>Each category page carries the same table, filtered to that category, plus notes on what actually pays there.</p></div></div>
      <div class="cards">
        ${CATEGORIES.map((c) => {
          const all = entries.filter((r) => r.category === c.id);
          const ok = all.filter((r) => r.sourceStatus === 'checked').length;
          const free = all.filter((r) => r.entryFree === 'yes').length;
          return `<a class="card" href="category/${c.id}.html">
            <h3>${esc(c.name)} <span>${all.length} leads</span></h3>
            <p>${esc(c.blurb)}</p>
            <div class="meta"><span class="tag tag-quiet">${ok} checked</span>${free ? `<span class="tag tag-free">${free} free</span>` : ''}</div>
          </a>`;
        }).join('\n        ')}
      </div>
    </section>

    <section id="all-rows">
      <div class="section-head">
        <div><h2>Every row, in one table</h2><p>All ${entries.length} leads. Filter, search, or jump to a category page. Unverified rows keep their financial cells blank on purpose.</p></div>
      </div>
      <div class="panel">
        ${filters({ wide: true })}
        ${table(entries)}
      </div>
    </section>

    <section>
      <div class="section-head"><div><h2>Executive summary</h2><p>What ${READ_DATE} evidence actually supports.</p></div><a href="https://github.com/sassnarep3-star/Own1/blob/main/EXECUTIVE_SUMMARY.md">Full document \u2192</a></div>
      <div class="panel"><div class="panel-body prose">
        <p><strong>Biggest documented, verified cash paths:</strong> ARC Prize 2026 ($2,000,000 across three tracks, but submissions closed 2026-11-02), the GEMS Prize Challenge run by DrivenData for the US Department of Energy ($300,000, closes 2026-12-03), and Kaggle\u2019s featured competitions ($450,000 on the ARC paper track alone on the day this was read).</p>
        <p><strong>Best free-entry-to-effort ratio:</strong> ESPN NFL Pick\u2019em (free, $102,000 across 58 prizes, ten entries) and Metaculus tournaments (free entry stated by the platform, pools up to $50,000), because both pay for knowledge and judgement instead of a modelling pipeline.</p>
        <p><strong>Best judged creative prizes with no fee:</strong> the Wergle Flomp humor poetry contest ($5,100, no fee, open to 2027-04-01) and the Sony World Photography Awards (free entry, $25,000 overall Series prize, closes 2027-01-12).</p>
        <p><strong>What the ledger got wrong:</strong> the reference site\u2019s HeroX row pointed at Challenge.gov, which was retired on 2026-03-30; its Tom Howard poetry row is a $27-per-entry contest, not free; and eight different football leads share a single Fantasy Premier League link that cannot document eight separate prize offers. All are listed on <a href="review.html">Flagged for review</a>.</p>
        ${upcoming ? `<p><strong>Nearest verified deadline:</strong> ${esc(upcoming.name)} closes ${esc(upcoming.deadline)} (${DAYS(upcoming.deadlineISO)} days from ${READ_DATE}).</p>` : ''}
      </div></div>
    </section>
  </div>
</main>`;

fs.writeFileSync(path.join(ROOT, 'index.html'), chrome('./', 'home',
  'Free-to-enter cash competitions, verified against official sources \u00b7 Prize Atlas',
  'A source-first dashboard of free-to-enter cash prize competitions: ' + entries.length + ' leads, ' + checked.length + ' checked against the operator\u2019s own page, everything else flagged as unverified.',
  indexBody));

/* ---- category pages ---- */
fs.mkdirSync(path.join(ROOT, 'category'), { recursive: true });
for (const c of CATEGORIES) {
  const rows = entries.filter((r) => r.category === c.id);
  const okRows = rows.filter((r) => r.sourceStatus === 'checked');
  const freeRows = rows.filter((r) => r.entryFree === 'yes');
  const body = `<main id="main">
  <div class="wrap">
    <p class="crumbs"><a href="../index.html">Overview</a> / Categories / ${esc(c.short)}</p>
    <section>
      <p class="eyebrow">Category</p>
      <h1>${esc(c.name)}</h1>
      <p class="lede">${esc(c.detail)}</p>
      <div class="stat-grid">
        <div class="stat"><b>${rows.length}</b><span>leads in this category</span></div>
        <div class="stat"><b>${okRows.length}</b><span>checked against an official page</span></div>
        <div class="stat"><b>${freeRows.length}</b><span>free entry confirmed</span></div>
        <div class="stat"><b>${rows.filter((r) => (r.flags || []).length).length}</b><span>rows carrying a flag</span></div>
      </div>
      <div class="callout info" style="margin-top:16px"><strong>What pays here:</strong> ${esc(c.pays)}</div>
    </section>
    <section>
      <div class="section-head"><div><h2>Listings</h2><p>Checked rows are listed first. Blank cells are unconfirmed values, not zeroes.</p></div></div>
      <div class="panel">
        ${filters({})}
        ${table([...rows].sort((a, b) => (a.sourceStatus === b.sourceStatus ? a.name.localeCompare(b.name) : a.sourceStatus === 'checked' ? -1 : 1)))}
      </div>
    </section>
    <section>
      <div class="section-head"><div><h2>Other categories</h2></div></div>
      <div class="cards">
        ${CATEGORIES.filter((o) => o.id !== c.id).map((o) => `<a class="card" href="${o.id}.html"><h3>${esc(o.name)} <span>${entries.filter((r) => r.category === o.id).length}</span></h3><p>${esc(o.blurb)}</p></a>`).join('\n        ')}
      </div>
    </section>
  </div>
</main>`;
  fs.writeFileSync(path.join(ROOT, 'category', `${c.id}.html`), chrome('../', 'cats',
    `${c.name} \u00b7 free-to-enter cash competitions \u00b7 Prize Atlas`,
    `${rows.length} ${c.name.toLowerCase()} leads, ${okRows.length} checked against the operator\u2019s own page.`,
    body));
}

/* ---- analysis page ---- */
const catStats = CATEGORIES.map((c) => {
  const all = entries.filter((r) => r.category === c.id);
  return `<tr><td data-label="Category"><a href="category/${c.id}.html">${esc(c.name)}</a></td><td data-label="Leads">${all.length}</td><td data-label="Checked">${all.filter((r) => r.sourceStatus === 'checked').length}</td><td data-label="Free confirmed">${all.filter((r) => r.entryFree === 'yes').length}</td><td data-label="Paid">${all.filter((r) => r.entryFree === 'no').length}</td></tr>`;
}).join('\n');

const analysisBody = `<main id="main">
  <div class="wrap prose">
    <p class="crumbs"><a href="index.html">Overview</a> / Analysis</p>
    <p class="eyebrow">Findings</p>
    <h1>What the evidence supports</h1>
    <p class="lede">Every statement below is derived from the ${entries.length} rows in <code>data/entries.json</code> or from an official page read on ${READ_DATE}. Where a number is a judgement rather than a fact, it is labelled.</p>

    <h2>1. Coverage: most of the ledger cannot be trusted yet</h2>
    <p>${checked.length} of ${entries.length} rows have been read on an operator page. ${unverified.length} remain unverified leads with blank prize, entry-cost and deadline cells. The reference ledger was last stamped August 2026 and mixes live contests, ended contests, paid-entry games, directories and pool software in one list.</p>
    <div class="panel"><div class="table-scroll"><table>
      <thead><tr><th scope="col">Category</th><th scope="col">Leads</th><th scope="col">Checked</th><th scope="col">Free confirmed</th><th scope="col">Paid</th></tr></thead>
      <tbody>${catStats}</tbody>
    </table></div></div>

    <h2>2. Where the money actually is</h2>
    <p>Documented prizes span five orders of magnitude. The largest verified pools are technical (ARC Prize 2026: $2,000,000 across three tracks; GEMS Prize Challenge: $300,000; Kaggle\u2019s featured competitions, where the ARC paper track alone showed $450,000). None of those can be won in an afternoon \u2014 they are research projects with open-source obligations.</p>
    <p>The best ratio of prize to effort, for someone competing now, is in judgement games: ESPN NFL Pick\u2019em pays $102,000 across 58 prizes and costs nothing to enter; Metaculus pays forecasting accuracy from pools that reach $50,000. The best creative options are the Wergle Flomp humor poetry contest ($5,100, explicitly no fee) and the Sony World Photography Awards (free entry, $25,000 overall Series prize).</p>

    <h2>3. Free entry has to be checked, not assumed</h2>
    <p>Six checked rows explicitly state free entry, one states a fee, and eleven do not state either. The reference ledger listed the Tom Howard/Margaret Reid poetry contest as a free cash lead; its own page charges $27 per submission. Assumption is what produces that kind of error, so blanks stay blank.</p>
    <p>Two other traps are visible in the data. First, "free" rooms in skill-game apps pay in gems or bonus cash \u2014 the twelve skill-tournament leads are all paid-entry cash rooms or non-cash free rooms. Second, a prize pool is not a prize: Metaculus lists tournaments with "NO PRIZE POOL" alongside $50,000 ones.</p>

    <h2>4. The link problem on the reference site</h2>
    <p>${newsLike.length} leads point at a news article or blog post rather than a rules page, and ${sharedSources.length} URLs are reused across several different contests. The most reused is <code>fantasy.premierleague.com</code>, linked for eight separate rows. A single site URL cannot document eight distinct cash prizes, and none of those eight rows has a prize read from an official rules page. Challenge.gov, linked from the HeroX row, was retired on 2026-03-30 and now serves a sunset notice; USA.gov hosts the official replacement directory and is used here instead.</p>

    <h2>5. How to use an AI coding agent on these competitions</h2>
    <ul>
      <li><strong>Pick a contest with a published, machine-checkable rule set.</strong> Kaggle and DrivenData publish metric, data and submission format, so an agent can iterate without guessing.</li>
      <li><strong>Respect the automation boundary.</strong> ARC Prize states that internet access is not available during Kaggle evaluation, so any agent must run offline inside the submission environment. Metaculus scoring is about calibration, not code speed.</li>
      <li><strong>Budget the compliance work, not just the modelling.</strong> Open-source licences, write-ups and reproducibility requirements are eligibility conditions at ARC Prize, not optional extras.</li>
      <li><strong>Never let an agent enter, deposit or accept terms on your behalf.</strong> Eligibility rules, tax forms and identity checks are personal and usually binding.</li>
      <li><strong>Time-box by deadline.</strong> ${nextDeadlines.length} verified rows have a future deadline; the nearest is ${upcoming ? esc(upcoming.name) + ' on ' + esc(upcoming.deadline) : 'n/a'}.</li>
    </ul>

    <h2>6. Editorial triage (labelled as judgement)</h2>
    <p>The scores on the overview page are arithmetic on verified facts plus two editorial inputs stored in <code>data/triage.json</code> with a written rationale per row: the size of the documented prize (0\u20133) and the effort needed for a credible entry (low/medium/high). No probability, expected value, win rate or time-to-win figure is invented anywhere on this site, because none of the official pages read publishes one.</p>

    <h2>7. Cross-check with the second independent pass</h2>
    <p>A parallel session verified 12 rows separately and stored verbatim quotes in <code>data/verification.json</code>, printed in full on the <a href="methodology.html">method page</a>. The two passes agree on the facts they share: Wergle Flomp is free with $5,100 in prizes, Tom Howard charges $27 and is closed, ESPN is free with $102,000, ARC pays $2,000,000 and closes on 2026-11-02, and Metaculus is free with pools that include zero. Where the two passes differ, the difference is published rather than averaged: that pass marked the Weather Photographer of the Year prize ladder as not reproducible from the operator page, which is why this site leaves that prize cell blank.</p>

    <h2>8. What would change the picture</h2>
    <ul>
      <li>Reading the remaining ${unverified.length} operator pages \u2014 roughly 11 per category would cover the sports backlog.</li>
      <li>Confirming whether the ${newsLike.length} news-linked leads still have live rules pages.</li>
      <li>Re-checking the February 2026 Papaya and Skillz terms for cash-room geography, since both change state lists frequently.</li>
    </ul>
    <p><a href="review.html">See every open item with its source link \u2192</a></p>
  </div>
</main>`;

fs.writeFileSync(path.join(ROOT, 'analysis.html'), chrome('./', 'analysis',
  'Analysis and findings \u00b7 Prize Atlas',
  'Findings from the verification pass: which categories pay, which entries are free, and where the reference ledger is wrong.',
  analysisBody));

/* ---- methodology page ---- */
const methodRows = checked.map((r) => `<tr>
  <td data-label="Listing"><a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a></td>
  <td data-label="Official page read">${esc(r.evidence?.url || r.source)}</td>
  <td data-label="Values copied">${(r.evidence?.confirmed || []).map((x) => `<span class="cell-sub">\u2022 ${esc(x)}</span>`).join('')}</td>
  <td data-label="Not stated / limits">${(r.evidence?.notStated || []).map((x) => `<span class="cell-sub">\u2022 ${esc(x)}</span>`).join('') || '<span class="blank">\u2014</span>'}</td>
</tr>`).join('\n');

const methodBody = `<main id="main">
  <div class="wrap prose">
    <p class="crumbs"><a href="index.html">Overview</a> / Method &amp; sources</p>
    <p class="eyebrow">Verification record</p>
    <h1>Method and sources</h1>

    <h2>Rules applied to every row</h2>
    <ol>
      <li><strong>Every row links out.</strong> A row must carry a link to the operator\u2019s own page. If none could be found, the row says so instead of substituting a news article or an HTTP-only page.</li>
      <li><strong>Facts come from that page.</strong> Prize, entry cost, deadline and eligibility are copied from the linked page on the date recorded in the row\u2019s evidence block. If the page does not state a value, the cell stays blank.</li>
      <li><strong>Blank \u2260 zero and blank \u2260 free.</strong> Only an explicit statement such as "The Competition is free to enter" produces a "Free entry" badge.</li>
      <li><strong>Nothing is inferred.</strong> No prize is rounded, converted, combined or extrapolated; no deadline is guessed from a season pattern; no probability is estimated.</li>
      <li><strong>Disagreements are published.</strong> When an operator\u2019s own page contradicts itself, both readings are recorded and the row is flagged rather than silently resolved.</li>
    </ol>

    <h2>Where the list came from</h2>
    <p>The ${entries.length} rows start from the reference ledger at <a href="https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js" target="_blank" rel="noopener noreferrer">karagemop466-tech/FreeMoneyApps (assets/data.js)</a>, which was last stamped 2026-08-19 and lists 206 entries. Its names and category assignments were imported as <em>leads only</em>; none of its August claims about prizes, free paths or status were carried across as facts. Two rows were added in this pass after reading their operator pages directly (Reedsy\u2019s weekly contest and the USA.gov federal challenge directory).</p>

    <h2>Checked rows and exactly what was read</h2>
    <p>${checked.filter((r) => !r.evidence?.by).length} rows were read directly in this integration pass. ${checked.filter((r) => r.evidence?.by).length} rows carry a read recorded by a parallel session in this repository (${[...new Set(checked.filter((r) => r.evidence?.by).map((r) => r.evidence.by))].join(', ')}); their evidence files are <code>data/verification/batchA.jsonl</code>. Attribution is shown on each row, and their values were not altered — only copied.</p>
    <div class="panel"><div class="table-scroll"><table>
      <thead><tr><th scope="col">Listing</th><th scope="col">Official page read</th><th scope="col">Values copied</th><th scope="col">Not stated / limits</th></tr></thead>
      <tbody>${methodRows}</tbody>
    </table></div></div>

    <h2>Independent second pass (verbatim quotes)</h2>
    <p>A parallel session in this repository verified ${parallelVerify.entries.length} rows against operator pages and stored the exact quoted wording. Those records are kept verbatim in <code>data/verification.json</code> and printed below, so both evidence stores are visible rather than one replacing the other. Where that pass contradicts a catalogue claim, the contradiction stands even when this pass left the cell blank.</p>
    <div class="panel"><div class="table-scroll"><table>
      <thead><tr><th scope="col">Row</th><th scope="col">Status</th><th scope="col">Quoted evidence</th><th scope="col">Page read</th></tr></thead>
      <tbody>${parallelVerify.entries.map((e) => `<tr>
        <td data-label="Row"><span class="cell-name">${esc(e.name)}</span><span class="cell-sub">${esc(e.id)}</span></td>
        <td data-label="Status"><span class="tag ${e.status === 'verified' ? 'tag-ok' : e.status === 'contradicted' ? 'tag-paid' : 'tag-warn'}">${esc(e.status)}</span><span class="cell-sub">${esc(e.evidence_kind || '')}</span></td>
        <td data-label="Quoted evidence">${Object.entries(e.fields || {}).map(([k, v]) => `<span class="cell-sub"><strong>${esc(k)}</strong>: ${esc(v.value)} — &ldquo;${esc(v.quote)}&rdquo;</span>`).join('')}</td>
        <td data-label="Page read"><a class="src" href="${esc(e.official_url)}" target="_blank" rel="noopener noreferrer">${esc(host(e.official_url))} \u2197</a></td>
      </tr>`).join('\n')}</tbody>
    </table></div></div>
    <p class="small">That session's own audit files, link check and alternate page build are preserved in <code>data/</code>, <code>tools/</code> and <code><a href="archive/all.html">archive/</a></code>; nothing was deleted during integration.</p>

    <h2>Automated checks</h2>
    <p><code>node tests/validate.mjs</code> runs on every push and verifies: unique ids; every category and evidence status valid; every unverified row has blank prize, entry, deadline, kind and eligibility; every checked row has an evidence block with a source URL and at least one confirmed value; every row\u2019s source is HTTPS; every internal link and asset on all ${CATEGORIES.length + 4} pages resolves; and no table is forced wider than a 390px viewport.</p>

    <h2>Parallel evidence kept in this repository</h2>
    <ul>
      <li><a href="review.html">Review page</a>: the ${batchA.length} row-by-row reads recorded in <code>data/verification/batchA.jsonl</code>, each with its outcome, prize text and official URL.</li>
      <li><a href="archive/method.html">Archived method page</a> from the parallel build, which explains its 90-point priority score.</li>
      <li><a href="ledger/index.html">Verified ledger build</a>: all 206 imported rows with an automated audit and its own flagged page.</li>
      <li><code>data/ledger.json</code>, <code>data/audit.json</code>, <code>data/verification.json</code>, <code>data/finder-ledger.json</code>: the machine-readable evidence stores, unchanged.</li>
    </ul>

    <h2>Known limits of this pass</h2>
    <ul>
      <li>${unverified.length} rows were not read on an operator page and are published blank and flagged.</li>
      <li>Prize and deadline values age quickly. The reading date is shown on every checked row.</li>
      <li>Eligibility summaries are shortened from longer rules; the linked page wins in any dispute.</li>
      <li>Pages that render only with JavaScript (Topcoder, Zindi, the Reedsy contest entries) could not be read reliably, so they stay unverified.</li>
      <li>This is not legal, financial or tax advice. US federal tax reporting generally begins at $600 of prizes in a year, but eligibility and filing duties are personal.</li>
    </ul>
    <p><a href="review.html">Open items and irregularities \u2192</a></p>
  </div>
</main>`;

fs.writeFileSync(path.join(ROOT, 'methodology.html'), chrome('./', 'method',
  'Method and sources \u00b7 Prize Atlas',
  'The verification rules, the exact official pages read, and the automated checks behind every row.',
  methodBody));

/* ---- review page ---- */
const flagRows = irregularRows.map((r) => `<tr>
  <td data-label="Listing"><span class="cell-name">${esc(r.name)}</span><span class="cell-sub">${esc(CATEGORIES.find((c) => c.id === r.category)?.short)}</span></td>
  <td data-label="Flag">${(r.flags || []).map((f) => `<span class="cell-sub">\u2691 ${esc(f)}</span>`).join('')}</td>
  <td data-label="Source">${r.source ? `<a class="src" href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">${esc(host(r.source))} \u2197</a>` : '<span class="blank">No operator link located</span>'}</td>
</tr>`).join('\n');

const sharedRows = sharedSources.map(([url, rs]) => `<tr>
  <td data-label="URL"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(host(url))}</a></td>
  <td data-label="Rows sharing it"><span class="cell-value">${rs.length}</span><span class="cell-sub">${esc(rs.map((r) => r.name).join('; '))}</span></td>
</tr>`).join('\n');

const reviewBody = `<main id="main">
  <div class="wrap prose">
    <p class="crumbs"><a href="index.html">Overview</a> / Flagged for review</p>
    <p class="eyebrow">Open items</p>
    <h1>Flagged for review</h1>
    <p class="lede">Everything below is either unverified, contradictory or wrong on the source that was checked. Nothing here is hidden from the tables \u2014 each item also appears in its row with a \u2691 marker and its link, so you can inspect the original page yourself.</p>

    <p class="lede">A second, independently audited set of leads and flags lives on the <a href="supplemental/index.html">supplemental research page</a>. Two of those competitions (Codex x TwitchCon and the PayPal AI Hackathon) were re-read in this pass and are now rows in the main table; their flags appear below.</p>

    <h2>Confirmed irregularities</h2>
    <div class="panel"><div class="table-scroll"><table>
      <thead><tr><th scope="col">Listing</th><th scope="col">What is wrong</th><th scope="col">Source to check</th></tr></thead>
      <tbody>${flagRows}</tbody>
    </table></div></div>

    <h2>Links reused across different contests</h2>
    <p>${sharedSources.length} URLs are attached to more than one lead. A single page cannot document several separate prize offers, so these rows are treated as leads only.</p>
    <div class="panel"><div class="table-scroll"><table>
      <thead><tr><th scope="col">URL</th><th scope="col">Rows sharing it</th></tr></thead>
      <tbody>${sharedRows}</tbody>
    </table></div></div>

    <h2>Links that are not rules pages</h2>
    <p>${newsLike.length} rows link to a news article, blog post or announcement instead of the operator\u2019s rules or signup page. Prize details in a news story are not a prize guarantee and often describe an older season.</p>

    <h2>Rows with no operator link at all</h2>
    <div class="panel"><div class="table-scroll"><table>
      <thead><tr><th scope="col">Listing</th><th scope="col">Why the cell is empty</th></tr></thead>
      <tbody>${entries.filter((r) => !r.source).map((r) => `<tr><td data-label="Listing">${esc(r.name)}</td><td data-label="Reason">No usable HTTPS operator page was found in the reference ledger; a non-operator article and an HTTP-only page were deliberately not substituted.</td></tr>`).join('\n')}</tbody>
    </table></div></div>

    <h2>Unverified rows (${unverified.length})</h2>
    <p>These rows have not been read against a current operator page in this pass. Their prize, entry-cost and deadline cells are blank by design, and the legacy August status (live / ended / mixed / caution) is <em>not</em> repeated as a fact. Use the filter below to narrow the ${unverified.length} rows shown.</p>
    <div class="panel">
      ${filters({ category: true })}
      ${table([...unverified].sort((a, b) => a.name.localeCompare(b.name)), { withScore: false })}
    </div>

    ${batchA.length ? `<h2>Row-by-row reads recorded by a parallel session</h2>
    <p>One session checked ${batchA.length} rows against official pages and recorded the outcome, the prize text, the facts and every issue it found in <code>data/verification/batchA.jsonl</code>. Rows marked <em>verified</em> or <em>discrepancy</em> that carried a prize were promoted into the main table with attribution; <em>partial</em>, <em>unverified</em> and <em>broken-link</em> outcomes stayed blank and their issues were added to this page as flags. The full write-up is on the <a href="ledger/flagged.html">ledger build's flagged page</a>.</p>
    <div class="panel"><div class="table-scroll"><table>
      <thead><tr><th scope="col">Row</th><th scope="col">Outcome</th><th scope="col">Prize read</th><th scope="col">Official page</th></tr></thead>
      <tbody>${batchA.map((b) => `<tr>
        <td data-label="Row"><span class="cell-name">${esc(b.id)}</span>${(b.issues || [])[0] ? `<span class="flagline">\u2691 ${esc((b.issues || [])[0])}</span>` : ''}</td>
        <td data-label="Outcome"><span class="tag ${b.outcome === 'verified' ? 'tag-ok' : b.outcome === 'discrepancy' ? 'tag-paid' : b.outcome === 'broken-link' ? 'tag-paid' : 'tag-warn'}">${esc(b.outcome)}</span></td>
        <td data-label="Prize read">${b.prize ? esc(b.prize) : '<span class="blank">Not confirmed</span>'}</td>
        <td data-label="Official page"><a class="src" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${esc(host(b.url))} \u2197</a></td>
      </tr>`).join('\n')}</tbody>
    </table></div></div>` : ''}

    ${parallelAudit ? `<h2>Rule-based audit of the reference ledger (second pass)</h2>
    <p>A parallel session audited the imported ledger mechanically against its own stated rules and recorded ${parallelAudit.checks_run} checks in <code>data/audit.json</code>. Its findings are summarised here and published in full on the <a href="archive/flagged.html">archived audit page</a>. They cover the imported catalogue, not this site's verified rows.</p>
    <div class="panel"><div class="table-scroll"><table>
      <thead><tr><th scope="col">ID</th><th scope="col">Severity</th><th scope="col">Finding</th><th scope="col">Affected rows</th></tr></thead>
      <tbody>${parallelAudit.findings.map((f) => `<tr>
        <td data-label="ID">${esc(f.id)}</td>
        <td data-label="Severity"><span class="tag ${f.severity === 'high' ? 'tag-paid' : f.severity === 'medium' ? 'tag-warn' : 'tag-quiet'}">${esc(f.severity)}</span></td>
        <td data-label="Finding">${esc(f.title)}</td>
        <td data-label="Affected rows">${f.rows && f.rows.length ? f.rows.length : '<span class="blank">\u2014</span>'}</td>
      </tr>`).join('\n')}</tbody>
    </table></div>
    <div class="panel-note">${(parallelAudit.environment_limits || []).map((l) => esc(l)).join(' \u00b7 ')}</div></div>` : ''}

    <h2>How to close an item</h2>
    <ol>
      <li>Open the operator page linked in the row.</li>
      <li>Read prize, entry cost, deadline and eligibility; copy the wording, not your summary.</li>
      <li>Record the reading date, the exact facts copied and anything the page left unstated in an <code>evidence</code> block on the row.</li>
      <li>Only then set <code>sourceStatus</code> to <code>checked</code> and fill the cells you actually read.</li>
    </ol>
    <p><a href="methodology.html">Method and sources \u2192</a></p>
  </div>
</main>`;

fs.writeFileSync(path.join(ROOT, 'review.html'), chrome('./', 'review',
  'Flagged for review \u00b7 Prize Atlas',
  'Unverified rows, broken or reused links, contradictory rules and paid-entry traps, each with the source to check.',
  reviewBody));

/* ---- report ---- */
console.log(`Built index.html, analysis.html, methodology.html, review.html and ${CATEGORIES.length} category pages.`);
console.log(`Rows: ${entries.length} total, ${checked.length} checked (${freeVerified.length} free confirmed), ${unverified.length} unverified.`);
console.log(`Ranked: ${ranked.length}. Flagged rows: ${irregularRows.length}. News-linked rows: ${newsLike.length}. Shared URLs: ${sharedSources.length}.`);
