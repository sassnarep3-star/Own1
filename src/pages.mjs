import { shell, hero, pageHead, stats, notice, tablePanel, SITE } from './template.mjs';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CAT_STATS = (cats, rows) =>
  cats
    .map(
      (c) => `<a class="cat" href="category/${c.id}.html">
  <span class="cat-icon" aria-hidden="true">${c.icon}</span>
  <span class="cat-body">
    <span class="cat-name">${esc(c.label)}</span>
    <span class="cat-short">${esc(c.short)}</span>
    <span class="cat-count">${rows.filter((r) => r.category === c.id).length} entries</span>
  </span>
</a>`
    )
    .join('\n');

export function indexPage(cats, rows) {
  const body = `
${hero({
  eyebrow: 'Source-first prize research',
  title: 'Find the competitions worth your time — and see the evidence for each one.',
  lead: 'Every entry here links to the operator’s own page. Prize money, entry cost and deadlines appear only where that page prints them; everything else is left blank and flagged. No deposits, no affiliate links, no estimated payouts.',
  actions: [
    { href: 'shortlist.html', label: 'See the shortlist', primary: true },
    { href: '#browse', label: 'Browse all entries' },
    { href: 'methodology.html', label: 'How verification works' },
  ],
})}
${stats()}
${notice(
  `<strong>What “verified” means here.</strong> A person opened the official page on 1 November 2026 and read the figure that is shown. It does not mean the contest is still open, that you are eligible, or that winning is likely. Rows marked <em>unverified lead</em> are names worth checking, nothing more. <a href="methodology.html">Read the method</a> or <a href="review.html">see what is still open</a>.`
)}
<section class="wrap section" id="start">
  <div class="section-head">
    <h2>Best documented free entries right now</h2>
    <p>Ranked by the actionability score — how complete and current the verified facts are, not by expected winnings.</p>
  </div>
  <div id="top-picks" class="picks"><p class="loading">Loading entries…</p></div>
</section>
<section class="wrap section">
  <div class="section-head">
    <h2>Browse by category</h2>
    <p>Nine categories. Two are tools rather than contests, and are labelled as such.</p>
  </div>
  <div class="cats" id="category-grid">${CAT_STATS(cats, rows)}</div>
</section>
<section class="wrap section" id="browse">
  <div class="section-head">
    <h2>All entries</h2>
    <p>Filter by evidence level, entry cost and status. Tap any row for eligibility, notes and flags.</p>
    <a href="all.html">Static version (no JavaScript) →</a>
  </div>
  ${tablePanel({ showCategoryFilter: true })}
</section>
<section class="wrap section">
  <div class="section-head"><h2>How to use this in three steps</h2></div>
  <ol class="steps">
    <li><strong>Pick from the shortlist.</strong> Start with entries whose entry cost and prize are both confirmed. The shortlist page groups them into tiers so you can see why.</li>
    <li><strong>Read the operator page before you commit.</strong> Eligibility, taxes, AI rules and deadlines change. The link in each row is the only authority.</li>
    <li><strong>Check the review queue for the rest.</strong> 180 entries are still leads. They are published with blank financial fields so nothing looks better than the evidence supports.</li>
  </ol>
</section>`;
  return shell({
    title: 'Prize Atlas — free-to-enter cash competitions, verified line by line',
    description:
      'A mobile-first dashboard of free-to-enter cash prize competitions. Every verified figure links to the operator page; unconfirmed values are blank and flagged for review.',
    base: './',
    view: 'home',
    body,
  });
}

export function shortlistPage() {
  const body = `
${pageHead({
  eyebrow: 'Tiered shortlist',
  title: 'Where the evidence is strongest',
  lead: 'Four tiers, assigned by rules rather than intuition. Tier 1 needs three verified facts: free entry, a cash prize, and a contest that was open on the verification date. Anything less falls a tier.',
  crumbs: [{ href: 'index.html', label: 'Overview' }, { label: 'Shortlist' }],
})}
${notice(
  `<strong>This is not a prediction of winnings.</strong> The order comes from a published actionability score that rewards complete, verified facts — free entry (+25), a printed cash prize (+20), open at check time (+15), a printed deadline (+10), printed eligibility (+10) and a stated low-effort format (+10). It says nothing about your odds. <a href="methodology.html#score">See the rubric</a>.`,
  'info'
)}
<section class="wrap section" id="tiers">
  <div id="tier-list"><p class="loading">Loading shortlist…</p></div>
</section>`;
  return shell({
    title: 'Shortlist — best-documented free cash competitions · Prize Atlas',
    description: 'Free-to-enter competitions grouped into tiers by verified entry cost, verified cash prize and open status.',
    base: './',
    view: 'shortlist',
    body,
  });
}

export function categoriesPage(cats, rows) {
  const body = `
${pageHead({
  eyebrow: 'Categories',
  title: 'Browse by what you can actually do',
  lead: 'The categories follow the kind of work a competition asks for, plus two tool categories kept separate from contests.',
  crumbs: [{ href: 'index.html', label: 'Overview' }, { label: 'Categories' }],
})}
<section class="wrap section">
  <div class="cats cats-wide">${cats
    .map(
      (c) => `<a class="cat" href="category/${c.id}.html">
    <span class="cat-icon" aria-hidden="true">${c.icon}</span>
    <span class="cat-body">
      <span class="cat-name">${esc(c.label)}</span>
      <span class="cat-short">${esc(c.short)}</span>
      <span class="cat-tag">${esc(c.tagline)}</span>
      <span class="cat-count">${rows.filter((r) => r.category === c.id).length} entries · ${rows.filter((r) => r.category === c.id && r.status !== 'lead').length} checked</span>
    </span>
  </a>`
    )
    .join('\n')}</div>
</section>`;
  return shell({
    title: 'Categories · Prize Atlas',
    description: 'Nine categories of cash prize competitions, with verified and unverified counts for each.',
    base: './',
    view: 'categories',
    body,
  });
}

export function categoryPage(cat, rows) {
  const inCat = rows.filter((r) => r.category === cat.id);
  const checked = inCat.filter((r) => r.status !== 'lead').length;
  const body = `
${pageHead({
  eyebrow: `Category · ${esc(cat.label)}`,
  title: esc(cat.label),
  lead: esc(cat.intro),
  crumbs: [
    { href: '../index.html', label: 'Overview' },
    { href: '../categories.html', label: 'Categories' },
    { label: cat.label },
  ],
})}
${notice(
  `<strong>${inCat.length} entries in this category, ${checked} checked against an operator page.</strong> The rest are leads carried over from the reference catalogue: the name and the link are kept, the money is blank until someone reads the rules. <a href="../review.html">What is flagged</a> · <a href="../methodology.html">How scoring works</a>`,
  'info'
)}
<section class="wrap section">
  <div class="section-head"><h2>Entries</h2><p>${esc(cat.tagline)}</p></div>
  ${tablePanel({ showCategoryFilter: false })}
</section>`;
  return shell({
    title: `${cat.label} — cash prize competitions · Prize Atlas`,
    description: `${cat.short}. ${inCat.length} entries, ${checked} checked against the operator page.`,
    base: '../',
    view: 'category',
    category: cat.id,
    body,
  });
}

export function summaryPage(statsObj) {
  const body = `
${pageHead({
  eyebrow: 'Executive summary',
  title: 'What this research found, and what it deliberately does not claim',
  lead: 'One page for the decision you actually have to make: where to spend the next hour, the next week, and the next month — and which offers to ignore.',
  crumbs: [{ href: 'index.html', label: 'Overview' }, { label: 'Summary' }],
})}
<div class="wrap prose">
  <section>
    <h2>The one-paragraph version</h2>
    <p>Of ${statsObj.total} competitions carried over from the reference catalogue, ${statsObj.verified + statsObj.platform} could be checked against an operator page and ${statsObj.freeCash} have both free entry and a cash prize printed by the operator. The best documented free-cash paths in November 2026 are US media pick’em games (ESPN NFL and College Pick’em, CBS Pro Football Pick’em), the final weeks of the Metaculus midterms tournament, ARC Prize and the GEMS data challenge, the Sony World Photography Awards, and Deriv’s monthly demo tournament. Everything else is either unverified, seasonal and closed, conditional, or not actually a free cash contest.</p>
  </section>

  <section>
    <h2>Five findings that change how you should play this</h2>
    <ol class="findings">
      <li><strong>The reference catalogue is a lead list, not a source.</strong> It mixes free contests with paid-entry tournaments, bonus credit and pool software. Importing its rows as facts would have put at least three non-free “free money” offers in front of you: the Tom Howard poetry prize charges $27 per submission, Papaya’s cash rooms are funded by entry fees, and HFM’s demo contest pays trading bonuses that cannot be withdrawn.</li>
      <li><strong>The realistic free-cash edges are low-value and repetitive, not glamorous.</strong> Pick’em games pay $500 a week against thousands of entrants; forecasting tournaments pay small pools for a few minutes of work per question. These are worth doing for entertainment and small expected value, not as income.</li>
      <li><strong>The prize you can actually influence is data work.</strong> ARC Prize ($2M, closes 2 Nov 2026), the DOE GEMS challenge ($300k, closes 3 Dec 2026) and the Kaggle/DrivenData/AIcrowd family are the only categories where a capable coding agent materially changes the result. Effort is days to weeks and the prize is concentrated at the top.</li>
      <li><strong>Several “prizes” are not money.</strong> Fantasy EFL pays merchandise and match tickets; FPL advertises only “great prizes”; PGA TOUR’s imported prizes page returns 404; Challenge.gov was shut down in March 2026. A blank prize field is doing real work in this dataset.</li>
      <li><strong>AI assistance is often restricted, sometimes banned.</strong> Winning Writers contests forbid AI-generated text; ARC Prize requires open-source solutions and runs with no internet access during evaluation; Prize Fest bans generated images. Read the AI clause before you plan an AI-heavy approach.</li>
    </ol>
  </section>

  <section>
    <h2>Where to spend time, in order</h2>
    <table class="simple">
      <thead><tr><th>Horizon</th><th>What to do</th><th>Why it ranks here</th></tr></thead>
      <tbody>
        <tr><td>This week</td><td>Metaculus US Midterms 2026 (closes 4 Nov) and any open Metaculus tournament with a pool; ESPN and CBS pick’em weeks that are still open.</td><td>Free entry and a printed pool, minutes of effort per week, and no signup cost.</td></tr>
        <tr><td>This month</td><td>ARC Prize (2 Nov), GEMS (3 Dec), Sony World Photography Awards (student 27 Nov).</td><td>Large verified prizes with fixed deadlines that a focused effort can still reach.</td></tr>
        <tr><td>This quarter</td><td>Build a repeatable pipeline for Kaggle/DrivenData/AIcrowd competitions and track new ones via the ML Contests index.</td><td>The only categories where an AI coding agent changes your odds materially; deadlines are rolling.</td></tr>
        <tr><td>Ignore</td><td>Papaya-style cash rooms, broker demo contests paying bonuses, pool software, and any row still marked <em>unverified lead</em> without an operator page that prints a prize.</td><td>Paid entry, non-cash prizes, or no evidence at all.</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Verification status</h2>
    <div class="stats stats-inline">
      <div class="stat"><span class="stat-n">${statsObj.verified}</span><span class="stat-l">verified against an operator page</span></div>
      <div class="stat"><span class="stat-n">${statsObj.platform}</span><span class="stat-l">platform indexes read</span></div>
      <div class="stat"><span class="stat-n">${statsObj.leads}</span><span class="stat-l">unverified leads</span></div>
      <div class="stat"><span class="stat-n">${statsObj.flags}</span><span class="stat-l">individual flags raised</span></div>
    </div>
    <p class="small">Each verified row records the exact page read and the date. Rows that could not be confirmed keep blank prize, entry and deadline fields and are listed on the <a href="review.html">Flagged for review</a> page with their source links. Nothing here is inferred, averaged or estimated.</p>
  </section>

  <section>
    <h2>Risks and rules that apply to almost every entry</h2>
    <ul class="plain">
      <li>US tax reporting starts at $600 of prizes in a year; most operators require a SSN or tax form before payment.</li>
      <li>“Free to enter” is usually restricted to the 50 US states plus DC, 18+ (21+ for some games). ESPN and MLB outright void Quebec, Puerto Rico and other territories.</li>
      <li>Prize pools described as “up to” or “crowdfunded” are not guaranteed sums; Givling’s $100,000 ceiling depends on how many rounds are funded.</li>
      <li>Demo trading and paper-trading contests measure simulated performance and say nothing about real trading results.</li>
      <li>Any operator asking for a fee to release a prize is a scam. Legitimate contests deduct nothing from winnings.</li>
    </ul>
  </section>

  <section>
    <h2>What would make this list materially better</h2>
    <ol class="plain">
      <li>Re-check the 180 unverified leads one operator page at a time — the highest-value work left, and the reason the review queue is published rather than hidden.</li>
      <li>Track the two seasonal windows that will reopen: MLB Beat the Streak (March) and the Tom Howard poetry contest (15 April).</li>
      <li>Replace JavaScript-only platform indexes (Kaggle, AIcrowd, Zindi, Topcoder) with per-competition pages when a contest is actually entered.</li>
    </ol>
  </section>
</div>`;
  return shell({
    title: 'Executive summary · Prize Atlas',
    description: 'What the verified evidence supports: the best free-cash paths in November 2026, what is not actually free, and the open risks.',
    base: './',
    view: 'summary',
    body,
  });
}

export function methodologyPage() {
  const body = `
${pageHead({
  eyebrow: 'Method',
  title: 'How each row is checked',
  lead: 'The rules are boring on purpose: one official page per fact, a date, and a blank when the page does not say it.',
  crumbs: [{ href: 'index.html', label: 'Overview' }, { label: 'Method' }],
})}
<div class="wrap prose">
  <section>
    <h2>Evidence levels</h2>
    <table class="simple">
      <thead><tr><th>Level</th><th>What it means</th><th>What you can rely on</th></tr></thead>
      <tbody>
        <tr><td><span class="pill pill-ok">Verified</span></td><td>The operator’s own page was opened on the verification date and prints the prize, entry cost, deadline or eligibility shown.</td><td>Those specific facts, on that date, for that edition.</td></tr>
        <tr><td><span class="pill pill-info">Platform index</span></td><td>The official index was read; individual events set their own terms.</td><td>That the platform exists and hosts events — not any individual prize.</td></tr>
        <tr><td><span class="pill pill-warn">Unverified lead</span></td><td>Imported name and link only. No operator page was read, or the page could not be read.</td><td>Nothing about money, eligibility or timing.</td></tr>
      </tbody>
    </table>
  </section>

  <section id="score">
    <h2>The actionability score (0–100)</h2>
    <p>This ranks how complete and current the verified facts are. It is deliberately not an expected-value calculation: no source in this dataset publishes win probabilities, entrant counts or time-to-prize data, so any such number would be invented.</p>
    <table class="simple">
      <thead><tr><th>Component</th><th>Points</th><th>Condition</th></tr></thead>
      <tbody>
        <tr><td>Free entry confirmed</td><td>+25</td><td>The operator page says entry is free.</td></tr>
        <tr><td>Cash prize confirmed</td><td>+20</td><td>A cash amount or pool is printed, and the prize is cash rather than merchandise or bonus credit.</td></tr>
        <tr><td>Open when checked</td><td>+15</td><td>No closure notice on the page at the verification date.</td></tr>
        <tr><td>Deadline or season dates printed</td><td>+10</td><td>A date or window appears on the page.</td></tr>
        <tr><td>Eligibility printed</td><td>+10</td><td>Age, geography or account requirements are stated.</td></tr>
        <tr><td>Effort stated</td><td>+10 / +6</td><td>+10 when the format is low-effort (picks, forecasts), +6 when it is not.</td></tr>
        <tr><td>Official page checked</td><td>+10</td><td>Status is verified or platform.</td></tr>
      </tbody>
    </table>
    <p class="small">Unverified leads score 0 by definition and are excluded from the shortlist. The score ships in the site’s JavaScript, so you can read it: <a href="${SITE.repo}/blob/main/assets/app.js">assets/app.js</a>.</p>
  </section>

  <section>
    <h2>Rules the data has to pass</h2>
    <ul class="plain">
      <li><strong>No inferred values.</strong> If the page does not print a prize, entry cost or deadline, the field is empty. Blanks are rendered as “—” and never as “unknown amount”.</li>
      <li><strong>No third-party facts.</strong> Aggregators, news articles and app-store pages are used only to find an operator page, never as the source of a figure.</li>
      <li><strong>A date on every verified row.</strong> <code>verifiedOn</code> is mandatory for verified and platform rows.</li>
      <li><strong>Flags are published, not hidden.</strong> Every contradiction, dead link and non-cash prize is surfaced on the row and on the <a href="review.html">Flagged for review</a> page.</li>
      <li><strong>The build is checked.</strong> A test suite validates the JSON schema, enforces the blank-field policy, verifies every internal link and confirms the generated pages match their source data before anything is published.</li>
    </ul>
  </section>

  <section>
    <h2>Known limits</h2>
    <ul class="plain">
      <li>Most rows are still leads. 180 of 211 entries have not been read against an operator page.</li>
      <li>Verification is a snapshot. Contests close, prizes change and pages move; the date on each row is the only currency.</li>
      <li>Some official pages are JavaScript applications that return nothing to a reader or crawler. Those rows stay unverified rather than being filled in from memory.</li>
      <li>Eligibility summaries are paraphrases of one section of the rules; the rules themselves control.</li>
      <li>External link reachability is monitored separately because operator sites rate-limit and block automated checks; a passing link check is not evidence of a prize.</li>
    </ul>
  </section>

  <section>
    <h2>Provenance</h2>
    <p>The 206 imported names come from the reference catalogue’s data file (stamped 2026-08-19). Names and category assignments were kept; every financial and timing claim was cleared until an operator page confirmed it. The two added rows (GEMS, US Midterms 2026) were added from their operator pages. Full page-by-page notes: <a href="${SITE.repo}/blob/main/research/VERIFICATION.md">research/VERIFICATION.md</a>. Pages and evidence files produced by other agent sessions working in this repository at the same time are preserved and listed on the <a href="archive.html">archive page</a>.</p>
  </section>
</div>`;
  return shell({
    title: 'Method and verification rules · Prize Atlas',
    description: 'How rows are verified, the actionability score rubric, the blank-field policy and known limitations.',
    base: './',
    view: 'methodology',
    body,
  });
}

export function reviewPage(irregularities, rows) {
  const flagged = rows.filter((r) => r.status === 'lead' || r.flags.length).length;
  const cards = irregularities
    .map(
      (i) => `<article class="flag" id="flag-${i.id}">
  <div class="flag-head"><span class="pill pill-warn">${esc(i.severity)}</span><h3>${esc(i.title)}</h3></div>
  <p>${esc(i.detail)}</p>
  <p class="flag-sources">Sources: ${i.sources
    .map((s) => `<a href="${s.url}" rel="noopener noreferrer" target="_blank">${esc(s.label)}</a>`)
    .join(' · ')}</p>
</article>`
    )
    .join('\n');

  const body = `
${pageHead({
  eyebrow: 'Review queue',
  title: 'Flagged for review',
  lead: 'Everything that could not be confirmed, contradicts itself, or is not what it appears to be. Published on purpose: a blank row is honest, an invented one is not.',
  crumbs: [{ href: 'index.html', label: 'Overview' }, { label: 'Flagged for review' }],
})}
${notice(
  `<strong>${flagged} entries carry a flag or are unverified leads.</strong> Unverified does not mean false — it means nobody has read the operator’s current rules for that row yet. No prize, entry cost or deadline is shown for those rows. Each one keeps its source link so you can check it yourself in a minute.`,
  'warn'
)}
<section class="wrap section">
  <div class="section-head"><h2>Specific irregularities</h2><p>Found while checking sources on 1 November 2026. Each links to the page that shows the problem.</p></div>
  <div class="flags">${cards}</div>
</section>
<section class="wrap section" id="rows-section">
  <div class="section-head"><h2>Unverified and flagged entries</h2><p>Filter, sort, and open a row for its notes. Prize fields are empty by design.</p></div>
  <div class="panel">
    <div class="toolbar">
      <div class="field grow"><label for="q">Search</label><input id="q" type="search" placeholder="Name, note, source…" autocomplete="off"></div>
      <div class="field"><label for="f-cat">Category</label><select id="f-cat"><option value="">All categories</option></select></div>
      <div class="field"><label for="f-status">Evidence</label><select id="f-status"><option value="lead">Unverified leads</option><option value="">All</option><option value="verified">Verified on official page</option><option value="platform">Platform index</option></select></div>
      <div class="field"><label for="f-sort">Sort</label><select id="f-sort"><option value="name">Name</option><option value="score">Actionability</option><option value="deadline">Deadline</option></select></div>
    </div>
    <div id="rows" aria-live="polite"><p class="loading">Loading entries…</p></div>
    <div class="tfoot"><span id="count">Loading…</span><button class="linkbtn" type="button" id="reset">Reset filters</button></div>
  </div>
</section>`;
  return shell({
    title: 'Flagged for review · Prize Atlas',
    description: 'Unverified entries, broken links, non-cash prizes and contradictions found during line-by-line verification.',
    base: './',
    view: 'review',
    body,
  });
}

export function allPage(cats, rows) {
  const label = (id) => cats.find((c) => c.id === id)?.label || id;
  const cell = (v) => (v ? esc(v) : '<span class="dash">—</span>');
  const body = `
${pageHead({
  eyebrow: 'Static table',
  title: 'Every entry, no JavaScript',
  lead: 'The same data as the dashboard, rendered at build time so it works without scripts, printing or a slow connection.',
  crumbs: [{ href: 'index.html', label: 'Overview' }, { label: 'All entries' }],
})}
${notice(
  `Rows are ordered by category, then by name. “Verified” means the operator page printed the value shown; “lead” means nothing has been confirmed. <a href="index.html">Back to the dashboard</a> for filters and sorting.`,
  'info'
)}
<section class="wrap section">
  <div class="tablewrap">
    <table class="simple all">
      <thead><tr><th>Competition</th><th>Category</th><th>Evidence</th><th>Prize (cash)</th><th>Entry</th><th>Deadline</th><th>Source</th></tr></thead>
      <tbody>
      ${rows
        .slice()
        .sort((a, b) => label(a.category).localeCompare(label(b.category)) || a.name.localeCompare(b.name))
        .map(
          (r) => `<tr id="${r.id}">
        <td><strong>${esc(r.name)}</strong>${r.flags.length ? `<span class="subtle">${r.flags.length} flag${r.flags.length > 1 ? 's' : ''}</span>` : ''}</td>
        <td>${esc(label(r.category))}</td>
        <td>${
          r.status === 'verified'
            ? '<span class="pill pill-ok">Verified</span>'
            : r.status === 'platform'
            ? '<span class="pill pill-info">Platform</span>'
            : '<span class="pill pill-warn">Lead</span>'
        }</td>
        <td>${cell(r.prize)}</td>
        <td>${cell(r.entry)}</td>
        <td>${cell(r.deadline ? `${r.deadline}${r.deadlineNote ? ' — ' + r.deadlineNote : ''}` : r.deadlineNote)}</td>
        <td>${r.source ? `<a href="${esc(r.source)}" rel="noopener noreferrer" target="_blank">Operator page</a>` : '<span class="dash">no source</span>'}</td>
      </tr>`
        )
        .join('\n')}
      </tbody>
    </table>
  </div>
</section>`;
  return shell({
    title: 'All entries (static table) · Prize Atlas',
    description: 'Every tracked competition in one static table with evidence level, prize, entry cost, deadline and source link.',
    base: './',
    view: 'all',
    body,
  });
}

export function notFoundPage() {
  const body = `
${pageHead({
  eyebrow: '404',
  title: 'That page is not here',
  lead: 'The link may be old, or the competition may have been renamed. Everything lives behind one of these four doors.',
  crumbs: [{ href: 'index.html', label: 'Overview' }, { label: 'Not found' }],
})}
<section class="wrap section">
  <div class="cats">
    <a class="cat" href="index.html"><span class="cat-icon">⌂</span><span class="cat-body"><span class="cat-name">Overview</span><span class="cat-short">The dashboard and all entries</span></span></a>
    <a class="cat" href="shortlist.html"><span class="cat-icon">★</span><span class="cat-body"><span class="cat-name">Shortlist</span><span class="cat-short">Best-documented free cash entries</span></span></a>
    <a class="cat" href="categories.html"><span class="cat-icon">≡</span><span class="cat-body"><span class="cat-name">Categories</span><span class="cat-short">Nine groups, from tech to pool tools</span></span></a>
    <a class="cat" href="review.html"><span class="cat-icon">⚑</span><span class="cat-body"><span class="cat-name">Flagged for review</span><span class="cat-short">Unverified rows and irregularities</span></span></a>
  </div>
</section>`;
  return shell({
    title: 'Page not found · Prize Atlas',
    description: 'Page not found. Browse the dashboard, shortlist, categories or review queue.',
    base: './',
    view: '404',
    body,
  });
}

export function archivePage() {
  const rows = [
    ['ledger/index.html', 'Separate “ledger” subsite (session a479d584)', 'A second full build kept under /ledger/ with its own category pages, picks, method and flagged pages, preserved intact rather than merged into this dashboard.'],
    ['verification.html', 'Independent verification pass (session d21e8702)', 'A separate audit of 12 entries with verbatim quotes from each operator page, including a documented contradiction on the Tom Howard poetry fee and the Weather Photographer of the Year prize.'],
    ['best-picks.html', 'Best-picks view from that same build', 'The tiered shortlist as that session ordered it, kept for comparison.'],
    ['flagged.html', 'Flagged page from that same build', 'Unverified rows and contradictions as that session grouped them.'],
    ['sources.html', 'Source index from that same build', 'A full operator-link index generated from the mirrored ledger.'],
    ['executive-summary.html', 'Executive summary from that same build', 'The parallel session’s written summary.'],
    ['cross-session.html', 'Cross-session record', 'That session’s own notes on parallel work in this repository.'],
    ['supplemental/index.html', 'Supplemental research page', 'Additional research published by an earlier session (PR #6).'],
    ['data/verification.json', 'Machine-readable evidence', 'URL + verbatim quote + status for every claim that audit made.'],
    ['data/ledger.json', 'Mirrored source catalogue', 'The reference ledger’s 206 listings copied verbatim, with provenance notes.'],
    ['data/audit.json', 'Catalogue audit', 'Rule-based integrity checks on the mirrored catalogue.'],
    ['VERIFICATION.md', 'Verification notes (markdown)', 'The written record behind verification.html.'],
    ['EXECUTIVE_SUMMARY.md', 'Executive summary (markdown)', 'The written record behind executive-summary.html.'],
    ['IRREGULARITIES.md', 'Irregularities log (markdown)', 'Problems found by that session.'],
    ['tools/build_site.py', 'That session’s site generator', 'Preserved so its pages can be rebuilt from data/verification.json.'],
  ];
  const body = `
${pageHead({
  eyebrow: 'Archive',
  title: 'Parallel work kept, not deleted',
  lead: 'Several agent sessions built dashboards against this repository at the same time. This is the final integration session: the main site was rebuilt from verified data, and the other sessions’ research artefacts and pages were kept exactly where they were so nothing was lost.',
  crumbs: [{ href: 'index.html', label: 'Overview' }, { label: 'Archive' }],
})}
${notice(
  `<strong>Why two sets of pages exist.</strong> The dashboard, category pages, shortlist, summary, method and review queue are generated by this repository’s build (<code>scripts/build.mjs</code>) from <code>data/entries.json</code>. The pages below come from a parallel session’s Python build and are preserved for their evidence trail, not as a second navigation path. Where the two disagree, this site’s verified data wins, and the disagreement is listed on the <a href="review.html">Flagged for review</a> page.`,
  'info'
)}
<section class="wrap section">
  <div class="tablewrap">
    <table class="simple">
      <thead><tr><th>Artefact</th><th>What it is</th><th>Why it is kept</th></tr></thead>
      <tbody>
      ${rows
        .map(
          ([file, name, why]) => `<tr><td><a href="${file}">${esc(file)}</a></td><td>${esc(name)}</td><td>${esc(why)}</td></tr>`
        )
        .join('\n')}
      </tbody>
    </table>
  </div>
</section>`;
  return shell({
    title: 'Archive of parallel session work · Prize Atlas',
    description: 'Other agent sessions’ verification artefacts and pages, preserved after the final integration rebuild.',
    base: './',
    view: 'archive',
    body,
  });
}
