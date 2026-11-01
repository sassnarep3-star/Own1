// Shared HTML shells for every generated page.
// Keeping one template means navigation, meta tags and asset paths cannot drift
// between the landing page and the nine category pages.

export const SITE = {
  name: 'Prize Atlas',
  tagline: 'Free-to-enter cash prize competitions, verified line by line',
  updated: '2026-11-01',
  repo: 'https://github.com/sassnarep3-star/Own1',
};

const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0f766e"/><path d="M16 7l2.4 5.6L24 15l-5.6 2.4L16 23l-2.4-5.6L8 15l5.6-2.4z" fill="#fff"/></svg>'
  );

export const NAV = [
  { href: 'index.html', label: 'Overview', view: 'home' },
  { href: 'shortlist.html', label: 'Shortlist', view: 'shortlist' },
  { href: 'categories.html', label: 'Categories', view: 'categories' },
  { href: 'summary.html', label: 'Summary', view: 'summary' },
  { href: 'methodology.html', label: 'Method', view: 'methodology' },
  { href: 'review.html', label: 'Flagged', view: 'review' },
];

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function shell({ title, description, base = './', view = '', category = '', body }) {
  const nav = NAV.map((item) => {
    const current = item.view === view ? ' aria-current="page"' : '';
    return `<a href="${base}${item.href}"${current}>${esc(item.label)}</a>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#0f766e">
<title>${esc(title)}</title>
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="${base}assets/style.css">
</head>
<body data-base="${base}" data-view="${view}" data-category="${category}">
<a class="skip" href="#main">Skip to content</a>
<header class="bar">
  <div class="wrap bar-in">
    <a class="brand" href="${base}index.html"><span class="mark" aria-hidden="true">✳</span><span>Prize Atlas</span></a>
    <nav class="nav" aria-label="Main">${nav}</nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="wrap foot-in">
    <p><strong>Prize Atlas</strong> — a source-first research dashboard. Not financial, legal or tax advice. Rules change without notice: always read the operator's own page before you spend time or money.</p>
    <p>Data last verified <time datetime="${SITE.updated}">1 November 2026</time> · <a href="${base}methodology.html">Method</a> · <a href="${base}review.html">Flagged for review</a> · <a href="${SITE.repo}">Repository</a></p>
  </div>
</footer>
<script src="${base}assets/app.js" defer></script>
</body>
</html>
`;
}

export function hero({ eyebrow, title, lead, actions = [] }) {
  const buttons = actions
    .map((a) => `<a class="btn ${a.primary ? 'btn-primary' : 'btn-quiet'}" href="${a.href}">${a.label}</a>`)
    .join('');
  return `<section class="hero"><div class="wrap">
  <p class="eyebrow">${eyebrow}</p>
  <h1>${title}</h1>
  <p class="lead">${lead}</p>
  ${buttons ? `<div class="hero-actions">${buttons}</div>` : ''}
</div></section>`;
}

export function pageHead({ eyebrow, title, lead, crumbs = [] }) {
  const trail = crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<span>${esc(c.label)}</span>` : `<a href="${c.href}">${esc(c.label)}</a><span aria-hidden="true">/</span>`))
    .join(' ');
  return `<div class="wrap">
  ${trail ? `<nav class="crumbs" aria-label="Breadcrumb">${trail}</nav>` : ''}
  <div class="pagehead">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    <p class="lead">${lead}</p>
  </div>
</div>`;
}

export function stats() {
  return `<div class="wrap"><div class="stats" id="stats">
  <div class="stat"><span class="stat-n" data-stat="total">—</span><span class="stat-l">entries tracked</span></div>
  <div class="stat"><span class="stat-n" data-stat="verified">—</span><span class="stat-l">verified on an official page</span></div>
  <div class="stat"><span class="stat-n" data-stat="freecash">—</span><span class="stat-l">verified free entry + cash</span></div>
  <div class="stat"><span class="stat-n" data-stat="open">—</span><span class="stat-l">open when checked</span></div>
</div></div>`;
}

export function notice(html, kind = 'warn') {
  return `<div class="wrap"><div class="notice notice-${kind}">${html}</div></div>`;
}

export function tablePanel({ showCategoryFilter = false, showSearch = true } = {}) {
  return `<div class="panel" id="panel">
  <div class="toolbar">
    ${
      showSearch
        ? `<div class="field grow"><label for="q">Search</label><input id="q" type="search" placeholder="Name, prize, eligibility…" autocomplete="off"></div>`
        : ''
    }
    ${
      showCategoryFilter
        ? `<div class="field"><label for="f-cat">Category</label><select id="f-cat"><option value="">All categories</option></select></div>`
        : ''
    }
    <div class="field"><label for="f-status">Evidence</label><select id="f-status">
      <option value="">All</option>
      <option value="verified">Verified on official page</option>
      <option value="platform">Platform index</option>
      <option value="lead">Unverified lead</option>
    </select></div>
    <div class="field"><label for="f-entry">Entry</label><select id="f-entry">
      <option value="">Any</option>
      <option value="free">Free</option>
      <option value="conditional">Conditional</option>
      <option value="paid">Paid</option>
      <option value="unknown">Not stated</option>
    </select></div>
    <div class="field"><label for="f-sort">Sort</label><select id="f-sort">
      <option value="score">Actionability</option>
      <option value="deadline">Deadline</option>
      <option value="prize">Prize size</option>
      <option value="name">Name</option>
    </select></div>
    <label class="check"><input type="checkbox" id="f-cash"> Cash confirmed</label>
    <label class="check"><input type="checkbox" id="f-open"> Open now</label>
  </div>
  <div id="rows" aria-live="polite"><p class="loading">Loading entries…</p></div>
  <div class="tfoot"><span id="count">Loading…</span><button class="linkbtn" type="button" id="reset">Reset filters</button></div>
</div>
<noscript><div class="wrap"><div class="notice notice-warn">This dashboard filters the data in your browser, so JavaScript is required for the interactive table. The <a href="{BASE}all.html">full static table</a> contains every entry and works without JavaScript.</div></div></noscript>`;
}
