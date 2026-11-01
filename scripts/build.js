#!/usr/bin/env node
// Static site generator. Reads data/upstream/ledger.json + data/audit.json + data/verification/*.jsonl|picks.json
// and writes: data/ledger.json, data/ledger.csv, index.html, picks.html, all.html, flagged.html, method.html,
// summary.html, categories/*.html, EXECUTIVE_SUMMARY.md.   Run: node scripts/build.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const wr = (f, s) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), s); };

const UP = JSON.parse(rd('data/upstream/ledger.json'));
const AUD = JSON.parse(rd('data/audit.json'));
const PICKS = JSON.parse(rd('data/verification/picks.json'));
const VER = {};
fs.readdirSync(path.join(root, 'data/verification')).filter(f => f.endsWith('.jsonl')).forEach(f =>
  rd('data/verification/' + f).split('\n').filter(Boolean).forEach(l => { const r = JSON.parse(l); VER[r.id] = r; }));
const CHECK_DATE = '2026-11-01';
const REPO = 'https://github.com/sassnarep3-star/Own1';
const SITE = 'https://sassnarep3-star.github.io/Own1/';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const host = u => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return u; } };

// ---------- merge ----------
const OUT = {
  verified: ['Verified', 'ok'], partial: ['Partly verified', 'part'], discrepancy: ['Differs from official', 'bad'],
  'broken-link': ['Broken link', 'bad'], unverified: ['Not confirmed', 'warn'], 'not-checked': ['Not checked', 'none']
};
const OUT_ORDER = ['verified', 'partial', 'discrepancy', 'broken-link', 'unverified', 'not-checked'];
const STATUS = { live: 'Live', ended: 'Ended', caution: 'Caution', mixed: 'Mixed' };
const FREE = { full: 'Free entry', partial: 'Partly free', 'paid-cash': 'Cash needs entry fee' };
const TYPE = Object.fromEntries(UP.types.map(t => [t.id, t]));

const rows = UP.listings.map((e, i) => {
  const a = AUD.rows[i]; if (a.id !== e.id) throw new Error('audit misaligned ' + e.id);
  const v = VER[e.id] || null;
  const outcome = v ? v.outcome : 'not-checked';
  const flags = a.flags.filter(f => f.code !== 'STALE_CHECK');
  return {
    id: e.id, name: e.name, type: e.type, upstreamStatus: e.status, freePath: e.freePath, platforms: e.platforms,
    officialUrl: (v && v.replacementUrl) || e.signupUrl, upstreamUrl: e.signupUrl, iosUrl: e.iosUrl || null, tosUrl: e.tosUrl || null, rulesUrl: e.rulesUrl || null,
    sources: e.sources, region: a.region, prizeKind: a.prizeKind, flags,
    upstream: { short: e.short, prize: e.prizeUsd, prizeNote: e.prizeNote, eligibility: e.eligibility, restricted: e.restricted, minCashout: e.minCashout, payout: e.payoutMethods, verificationLevel: e.verification.level, lastChecked: e.lastChecked },
    check: { outcome, date: v ? CHECK_DATE : null, urlChecked: v ? v.url : null, finalUrl: v ? v.finalUrl || null : null, verifiedPrize: v ? v.prize || '' : '', facts: v ? v.facts || [] : [], issues: v ? v.issues || [] : [] }
  };
});
rows.sort((x, y) => OUT_ORDER.indexOf(x.check.outcome) - OUT_ORDER.indexOf(y.check.outcome) ||
  ['live', 'mixed', 'caution', 'ended'].indexOf(x.upstreamStatus) - ['live', 'mixed', 'caution', 'ended'].indexOf(y.upstreamStatus) || x.name.localeCompare(y.name));

const count = f => rows.filter(f).length;
const N = {
  total: rows.length,
  byOutcome: Object.fromEntries(OUT_ORDER.map(o => [o, count(r => r.check.outcome === o)])),
  checked: count(r => r.check.outcome !== 'not-checked'),
  flagged: count(r => r.flags.length > 0),
  ended: count(r => r.upstreamStatus === 'ended'),
  endedFree: count(r => r.upstreamStatus === 'ended' && r.freePath === 'full'),
  caution: count(r => r.upstreamStatus === 'caution'),
  nonOfficialOnly: count(r => r.flags.some(f => f.code === 'NO_OFFICIAL_SOURCE')),
  gambling: count(r => r.flags.some(f => f.code === 'GAMBLING_OPERATOR_HOST')),
  broker: count(r => r.flags.some(f => f.code === 'BROKER_PROMO')),
  shared: count(r => r.flags.some(f => f.code === 'SHARED_SIGNUP_URL')),
  nonCash: count(r => r.prizeKind === 'non-cash'),
  mixed: count(r => r.prizeKind === 'mixed'),
  unconfirmedPrize: count(r => r.prizeKind === 'unconfirmed'),
  discrepancies: rows.filter(r => ['discrepancy', 'broken-link'].includes(r.check.outcome)).length,
};
wr('data/ledger.json', JSON.stringify({ generated: CHECK_DATE, upstreamReviewed: UP.reviewed, note: 'Upstream fields are UNVERIFIED claims. Only the "check" object reflects verification against official pages on ' + CHECK_DATE + '.', rows }, null, 1));
const csv = [['id', 'name', 'category', 'upstream_status', 'free_path_upstream', 'region_auto', 'check_outcome', 'verified_prize', 'official_url', 'flags'].join(',')]
  .concat(rows.map(r => [r.id, r.name, r.type, r.upstreamStatus, r.freePath, r.region, r.check.outcome, r.check.verifiedPrize, r.officialUrl, r.flags.map(f => f.code).join('|')].map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')));
wr('data/ledger.csv', csv.join('\n') + '\n');

// ---------- layout ----------
const NAV = [['index.html', 'Dashboard'], ['picks.html', 'Top picks'], ['all.html', 'All entries'], ['flagged.html', 'Flagged for review'], ['summary.html', 'Executive summary'], ['method.html', 'Method']];
function page({ file, title, desc, body, active }) {
  const depth = file.split('/').length - 1, rel = '../'.repeat(depth), root_ = '../'.repeat(depth + 1); // pages live under ledger/
  const nav = NAV.map(([h, t]) => `<a href="${rel}${h}"${h === active ? ' aria-current="page"' : ''}>${t}</a>`).join('') + `<a href="${root_}index.html">Prize Atlas leads</a><a href="${root_}supplemental/index.html">Supplemental findings</a>`;
  const cats = UP.types.map(t => `<a href="${rel}categories/${t.id}.html"${file === 'categories/' + t.id + '.html' ? ' aria-current="page"' : ''}>${esc(t.name)}</a>`).join('');
  wr('ledger/' + file, `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Free Cash Contest Finder</title><meta name="description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230b6b4f'/%3E%3Ctext x='32' y='45' font-size='38' text-anchor='middle' fill='white' font-family='sans-serif'%3E$%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${root_}assets/finder.css"></head>
<body><a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap bar"><a class="brand" href="${rel}index.html"><span class="logo">$</span><span>Free Cash Contest Finder</span></a>
<nav class="nav" aria-label="Main">${nav}</nav></div>
<div class="wrap"><nav class="cats" aria-label="Categories"><span class="catlabel">Categories</span>${cats}</nav></div></header>
<main id="main" class="wrap">${body}</main>
<footer class="wrap foot"><p>Data date: upstream ledger reviewed <b>${esc(UP.reviewed)}</b>; verification run <b>${CHECK_DATE}</b>. Not financial or legal advice. Official rules always govern; taxes are the winner's responsibility.
Source ledger: <a href="https://github.com/karagemop466-tech/FreeMoneyApps">karagemop466-tech/FreeMoneyApps</a> · <a href="${REPO}">this repo</a> · <a href="${root_}data/ledger.csv">CSV</a> · <a href="${root_}data/ledger.json">JSON</a></p></footer>
<script src="${root_}assets/finder.js" defer></script></body></html>`);
}
const badge = o => `<span class="badge ${OUT[o][1]}">${OUT[o][0]}</span>`;
const ext = (u, t, cls = '') => `<a class="${cls}" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}</a>`;

function tableFor(list, { filters = true } = {}) {
  const sel = (id, label, opts) => `<label>${label}<select data-f="${id}"><option value="">All</option>${opts.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('')}</select></label>`;
  const bar = filters ? `<div class="filters" role="search"><label class="grow">Search<input type="search" data-q placeholder="Name, prize, platform…" autocomplete="off"></label>
${sel('check', 'Verification', OUT_ORDER.map(o => [o, OUT[o][0]]))}${sel('status', 'Status (upstream)', Object.entries(STATUS))}${sel('free', 'Entry (upstream)', Object.entries(FREE))}
${sel('region', 'Region (auto)', [...new Set(rows.map(r => r.region))].sort().map(x => [x, x]))}${sel('prize', 'Prize type (auto)', [['cash', 'Cash'], ['mixed', 'Cash + non-cash'], ['non-cash', 'Non-cash'], ['unclear', 'Unclear'], ['unconfirmed', 'Unconfirmed']])}
<button type="button" data-reset>Reset</button><span class="count" data-count aria-live="polite"></span></div>` : '';
  const body = list.map(r => {
    const flagN = r.flags.length;
    const vp = r.check.verifiedPrize;
    const det = `<details><summary>Details${flagN ? ` · ${flagN} flag${flagN > 1 ? 's' : ''}` : ''}</summary><div class="det">
${r.check.facts.length || r.check.issues.length ? `<h4>Checked on ${CHECK_DATE} against <a href="${esc(r.check.urlChecked)}" target="_blank" rel="noopener noreferrer">${esc(host(r.check.urlChecked))}</a></h4>
${r.check.facts.length ? '<ul>' + r.check.facts.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : ''}${r.check.issues.length ? '<p class="lbl bad">Issues</p><ul>' + r.check.issues.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : ''}` : '<p class="muted">Not checked against the official page in this session — treat every value below as an unverified upstream claim.</p>'}
<h4>Upstream claims <span class="muted">(unverified${r.check.outcome === 'not-checked' ? '' : ' unless listed above'}; ledger dated ${esc(r.upstream.lastChecked)})</span></h4>
<dl><dt>Prize</dt><dd>${esc(r.upstream.prize) || '—'}</dd><dt>Eligibility</dt><dd>${esc(r.upstream.eligibility) || '—'}</dd><dt>Limits</dt><dd>${esc(r.upstream.restricted) || '—'}</dd><dt>Payout</dt><dd>${esc((r.upstream.payout || []).join(', ')) || '—'}</dd><dt>Note</dt><dd>${esc(r.upstream.prizeNote) || '—'}</dd><dt>About</dt><dd>${esc(r.upstream.short) || '—'}</dd></dl>
${flagN ? '<h4>Automated flags</h4><ul>' + r.flags.map(f => `<li><code>${f.code}</code> ${esc(f.msg)}</li>`).join('') + '</ul>' : ''}
<h4>Source links</h4><ul class="src">${[...(r.upstreamUrl !== r.officialUrl ? [{ title: 'Original upstream link (broken)', url: r.upstreamUrl, tier: 'broken' }] : []), ...r.sources].map(s => `<li>${ext(s.url, s.title || host(s.url))} <span class="tier ${esc(s.tier)}">${s.tier === 'official' ? 'official' : esc(s.tier) + ' (not official)'}</span></li>`).join('')}${r.rulesUrl && !r.sources.some(s => s.url === r.rulesUrl) ? `<li>${ext(r.rulesUrl, 'Rules page (upstream link)')}</li>` : ''}${r.tosUrl ? `<li>${ext(r.tosUrl, 'Terms (upstream link)')}</li>` : ''}${r.iosUrl ? `<li>${ext(r.iosUrl, 'iOS App Store listing')}</li>` : ''}</ul></div></details>`;
    return `<tr id="row-${esc(r.id)}" data-check="${r.check.outcome}" data-status="${r.upstreamStatus}" data-free="${r.freePath}" data-region="${esc(r.region)}" data-prize="${r.prizeKind}">
<td data-l="Contest" class="c-name"><a class="nm" href="${esc(r.officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a><span class="sub">${esc(TYPE[r.type].name)} · ${esc(host(r.officialUrl))}</span>${det}</td>
<td data-l="Verification">${badge(r.check.outcome)}${r.check.date ? `<span class="sub">${r.check.date}</span>` : ''}</td>
<td data-l="Verified prize" class="c-prize">${vp ? esc(vp) : '<span class="blank">— unverified</span>'}</td>
<td data-l="Status (upstream)"><span class="st ${r.upstreamStatus}">${STATUS[r.upstreamStatus]}</span></td>
<td data-l="Entry (upstream)">${FREE[r.freePath]}</td>
<td data-l="Region (auto)">${esc(r.region)}</td>
<td data-l="Official link">${ext(r.officialUrl, 'Official site ↗', 'btn')}</td></tr>`;
  }).join('\n');
  return `${bar}<div class="tw"><table class="tbl" data-table><thead><tr><th>Contest</th><th>Verification</th><th>Verified prize</th><th>Status <small>(upstream)</small></th><th>Entry <small>(upstream)</small></th><th>Region <small>(auto)</small></th><th>Official link</th></tr></thead><tbody>${body}</tbody></table></div>
<p class="fine">“Verified prize” is filled only when an official page fetched on ${CHECK_DATE} states it; blank means <b>unverified</b>, not zero. “Status”, “Entry” and “Region” come from the upstream ledger (dated ${esc(UP.reviewed)}) and are not verified unless the row's Details say so. Region and prize-type filters are automatic text matches on upstream wording.</p>`;
}

// ---------- pages ----------
// Category pages
UP.types.forEach(t => {
  const list = rows.filter(r => r.type === t.id);
  const c = o => list.filter(r => r.check.outcome === o).length;
  page({
    file: `categories/${t.id}.html`, title: t.name, active: '', desc: t.blurb,
    body: `<div class="crumb"><a href="../index.html">Dashboard</a> › ${esc(t.name)}</div><h1>${esc(t.name)} <span class="pill">${list.length}</span></h1>
<p class="lede">${esc(t.blurb)} <span class="muted">(Category description from the upstream ledger.)</span></p>
<div class="mini"><span>${c('verified') + c('partial')} verified or partly verified</span><span>${c('discrepancy') + c('broken-link')} differ from official</span><span>${c('not-checked') + c('unverified')} unverified</span><span>${list.filter(r => r.upstreamStatus === 'ended').length} marked ended upstream</span></div>
${tableFor(list)}`
  });
});

// All entries
page({ file: 'all.html', title: 'All entries', active: 'all.html', desc: 'Every entry in one filterable table.', body: `<h1>All entries <span class="pill">${rows.length}</span></h1><p class="lede">All ${rows.length} upstream listings in one table, verified rows first. Use the filters, or open a category from the bar above.</p>${tableFor(rows)}` });

// Picks
const picksBody = PICKS.map(p => `<tr><td data-l="Contest" class="c-name"><a class="nm" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a><span class="sub">${esc(p.kind)}</span></td><td data-l="Verified prize" class="c-prize">${esc(p.prize)}</td><td data-l="Window">${esc(p.window)}</td><td data-l="Notes">${esc(p.note)}</td><td data-l="Official source">${ext(p.url, host(p.url) + ' ↗', 'btn')}</td></tr>`).join('');
page({
  file: 'picks.html', title: 'Top picks', active: 'picks.html', desc: 'Competitions whose prize and dates were read from the official page on ' + CHECK_DATE,
  body: `<h1>Top picks — verified on ${CHECK_DATE}</h1>
<p class="lede">Only entries whose prize figure and dates were read from an official page on ${CHECK_DATE} appear here. Each row shows the stated prize and the entry window. <b>Time-sensitive items are listed first.</b></p>
<div class="callout"><b>How to read this:</b> A big prize pool is not the same as a good chance of winning. In our analysis (not an official claim), the AI/data and forecasting contests reward measurable skill and are the best fit for an AI coding agent. Eligibility, tax and open-source terms were <u>not</u> read in full for every row — open the official link before investing time.</div>
<h2>Closing soon (by Nov 18, 2026)</h2>
<div class="tw"><table class="tbl simple"><thead><tr><th>Contest</th><th>Verified prize</th><th>Window</th><th>Notes</th><th>Official source</th></tr></thead><tbody>${PICKS.filter(p => /2026-11-0[2-9]|Nov (0[2-9]|1[0-8])|Ends in 3 days/.test(p.window)).map(p => `<tr><td data-l="Contest" class="c-name"><a class="nm" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a><span class="sub">${esc(p.kind)}</span></td><td data-l="Verified prize" class="c-prize">${esc(p.prize)}</td><td data-l="Window">${esc(p.window)}</td><td data-l="Notes">${esc(p.note)}</td><td data-l="Official source">${ext(p.url, host(p.url) + ' ↗', 'btn')}</td></tr>`).join('')}</tbody></table></div>
<h2>All verified picks</h2>
<div class="tw"><table class="tbl simple"><thead><tr><th>Contest</th><th>Verified prize</th><th>Window</th><th>Notes</th><th>Official source</th></tr></thead><tbody>${picksBody}</tbody></table></div>
<p class="fine">Figures marked “as displayed” are Kaggle/Devpost/Metaculus/DrivenData listing text on ${CHECK_DATE}. Every row links to the official page it was read from. Rows with discrepancies (e.g. entries that have closed) are on the <a href="flagged.html">Flagged for Review</a> page, not here.</p>`
});

// Flagged
const byCode = {};
rows.forEach(r => r.flags.forEach(f => (byCode[f.code] = byCode[f.code] || []).push(r)));
const CODE_INFO = {
  GAMBLING_OPERATOR_HOST: ['Betting/gambling brand as operator', 'Upstream README says gambling-operator contests were removed, yet these remain. Policy decision needed.'],
  BROKER_PROMO: ['Trading-platform / forex-broker promotions', 'Demo-account contests run by brokers. Customer-acquisition funnels; some require KYC. Policy decision needed on whether they belong.'],
  NO_OFFICIAL_SOURCE: ['No official source in upstream data', 'Only affiliate/forum sources were cited, so no value can be confirmed.'],
  ENDED_BUT_FREE_FULL: ['Ended but counted as a "true free path"', 'Inflates the headline "189 true free paths" figure.'],
  SHARED_SIGNUP_URL: ['Generic shared sign-up link', 'Several rows point to the same generic page (e.g. the FPL home page) instead of the specific operator page.'],
  NON_CASH_PRIZE: ['Prize text appears non-cash', 'Gift cards, merchandise, trips, in-game items. Not "cash prize" competitions.'],
  MIXED_PRIZE: ['Cash mixed with non-cash prizes', 'Automatic text match; read the rules to see what actually pays cash.'],
  PRIZE_UNCONFIRMED: ['Upstream itself says prize is unconfirmed/ended', 'Listed with a prize note such as "Not confirmed for 2026/27".'],
  POSSIBLY_STALE_DATES: ['Live status but 2024/2025 dates cited', 'Possible out-of-season entry.'],
  SIGNUP_HOST_NOT_IN_SOURCES: ['Sign-up host differs from cited sources', 'The link people are sent to is on a different domain from the source cited.'],
  FREE_PATH_FEE_MENTION: ['Marked free but text mentions fees', 'Read the rules before assuming it is fully free.'],
  UNVERIFIED_LEAGUE_CODE: ['League join code without verification flag', 'FPL league codes usually change every season.'],
  INSECURE_URL: ['Non-HTTPS link', 'http:// link in the data.']
};
const verRows = rows.filter(r => ['discrepancy', 'broken-link'].includes(r.check.outcome));
const flaggedBody = `<h1>Flagged for review</h1>
<p class="lede">Everything here is published, not blocking. Each item links to the source it was checked against. Items are grouped by how they were found: <b>A</b> checked against an official page on ${CHECK_DATE}; <b>B</b> found by automated checks of the upstream data (no official page read); <b>C</b> structural problems on the original site.</p>
<h2 id="a">A · Differs from the official page (${verRows.length})</h2>
<div class="tw"><table class="tbl simple"><thead><tr><th>Contest</th><th>What we found</th><th>Official page checked</th></tr></thead><tbody>${verRows.map(r => `<tr><td data-l="Contest" class="c-name"><a class="nm" href="all.html#q=${encodeURIComponent(r.name)}">${esc(r.name)}</a>${badge(r.check.outcome)}</td><td data-l="Finding"><ul>${r.check.issues.map(x => `<li>${esc(x)}</li>`).join('')}</ul></td><td data-l="Source">${ext(r.check.urlChecked, host(r.check.urlChecked) + ' ↗', 'btn')}<span class="sub">${CHECK_DATE}</span></td></tr>`).join('')}</tbody></table></div>
<h2 id="a2">A · Partly verified or not confirmed — open questions</h2>
<div class="tw"><table class="tbl simple"><thead><tr><th>Contest</th><th>Open question</th><th>Official page checked</th></tr></thead><tbody>${rows.filter(r => ['partial', 'unverified', 'verified'].includes(r.check.outcome) && r.check.issues.length).map(r => `<tr><td data-l="Contest" class="c-name"><a class="nm" href="all.html#q=${encodeURIComponent(r.name)}">${esc(r.name)}</a>${badge(r.check.outcome)}</td><td data-l="Finding"><ul>${r.check.issues.map(x => `<li>${esc(x)}</li>`).join('')}</ul></td><td data-l="Source">${ext(r.check.urlChecked, host(r.check.urlChecked) + ' ↗', 'btn')}</td></tr>`).join('')}</tbody></table></div>
<h2 id="b">B · Automated findings in the upstream data</h2>
<p class="muted">Counts are rows affected. “STALE_CHECK” (all ${rows.length} rows carry an upstream check date of ${esc(UP.reviewed)}, 74 days before ${CHECK_DATE}) is omitted from per-row lists but applies to every row not re-checked here.</p>
${Object.entries(CODE_INFO).filter(([c]) => byCode[c]).map(([c, [t, d]]) => `<details class="flag"><summary><b>${esc(t)}</b> <span class="pill">${byCode[c].length}</span> <code>${c}</code></summary><p>${esc(d)}</p><ul class="cols">${byCode[c].map(r => `<li>${ext(r.officialUrl, r.name)} <span class="muted">(${esc(STATUS[r.upstreamStatus])}${r.check.outcome !== 'not-checked' ? ', ' + OUT[r.check.outcome][0].toLowerCase() : ''})</span></li>`).join('')}</ul></details>`).join('')}
<h2 id="c">C · Problems on the original site</h2>
<ul>
<li><b>Broken link:</b> <code>https://www.herox.com/challenges</code> returns HeroX's own “404 Page not found” (checked ${CHECK_DATE}). Replacement used here: ${ext('https://www.herox.com/crowdsourcing-projects', 'herox.com/crowdsourcing-projects')}.</li>
<li><b>Headline stats mislead:</b> “189 true free paths” includes ${N.endedFree} entries the ledger itself marks <i>ended</i> and ${rows.filter(r => r.freePath === 'full' && r.upstreamStatus === 'caution').length} marked <i>caution</i>; “60 added this pass” is the length of an old pass-C list (the latest pass S added 10); the page header still says “Pass C · 17 Aug 2026” while the data says pass ${esc(UP.pass)}, reviewed ${esc(UP.reviewed)}.</li>
<li><b>Mobile usability:</b> the original renders ${rows.length} full cards in one long scroll with no search or filters (by design, per its own intro), and loads three Google Fonts files; it is hard to scan on a phone.</li>
<li><b>Dead weight in repo:</b> <code>100_VERIFIED_CONTESTS.md</code> in the upstream repo is marked <i>superseded</i> because its own “verified” claims were false; 15 audit files (AUDIT_2026-08-19*.md) are narrative claims, not evidence. We did not rely on any of them.</li>
<li><b>Own1 repo:</b> contained only a one-line README when this session started (other sessions have since merged the separate Prize Atlas site); “review the repo” therefore meant reviewing the upstream ledger repo, which we imported unchanged to <code>data/upstream/</code> (commit <code>466f7c1</code>).</li>
</ul>
<h2 id="d">D · Unverified rows</h2>
<p><b>${N.byOutcome['not-checked']}</b> of ${N.total} rows were not opened against their official page in this session, and ${N.byOutcome.unverified} more were opened but could not be confirmed. Their prize cells are blank by design. <a href="all.html#check=not-checked">Show the not-checked rows →</a></p>
<h2 id="e">E · Findings reported by other sessions (not re-read here)</h2>
<p>These come from the <a href="${REPO}/blob/main/COORDINATION.md">coordination board</a> and <a href="../supplemental/index.html">supplemental page</a> written by other sessions. This session has <b>not</b> re-opened the links below except where listed in section A; read the official pages before relying on them. The full Prize Atlas queue is at <a href="../review.html">review.html</a>.</p>
<ul>
<li><b>Challenge.gov sunset:</b> reported on the supplemental page; official site ${ext('https://www.challenge.gov/', 'challenge.gov')}. Relevant because HeroX/Challenge.gov rows above point to it.</li>
<li><b>IceHacks (Devpost):</b> reported to show a contradictory cash header — ${ext('https://icehacks.devpost.com/', 'icehacks.devpost.com')}.</li>
<li><b>PayPal AI Hackathon:</b> prize totals on the listing page reported to differ from the rules — ${ext('https://paypalaihackathon.devpost.com/rules', 'rules')}.</li>
<li><b>Ended events:</b> ${ext('https://qhack.ai/terms-and-conditions/', 'QHack')} and ${ext('https://groklearning.com/wtg-programming-competition/', 'WiseTech programming competition')} are reported as ended.</li>
<li><b>Papaya:</b> reported distinction between free Gem and cash competitions — ${ext('https://www.papaya.com/faq', 'papaya.com/faq')}.</li>
<li><b>Tax statement:</b> the original site's blanket tax statement is reported to overreach compared with ${ext('https://www.irs.gov/publications/p525', 'IRS Publication 525')}.</li>
<li><b>Two rows with no usable HTTPS operator link:</b> <code>thelines-survivor</code> and <code>squarespool</code> in the Prize Atlas data.</li>
</ul>`;
page({ file: 'flagged.html', title: 'Flagged for review', active: 'flagged.html', desc: 'Discrepancies, unverified items and irregularities, with source links.', body: flaggedBody });

// Method
const logRows = Object.values(VER).map(v => `<tr><td data-l="Entry">${esc((rows.find(r => r.id === v.id) || {}).name || v.id)}</td><td data-l="Result">${badge(v.outcome)}</td><td data-l="Official URL fetched">${ext(v.url, v.url)}${v.finalUrl && v.finalUrl !== v.url ? `<span class="sub">redirected to ${esc(v.finalUrl)}</span>` : ''}</td></tr>`).join('');
page({
  file: 'method.html', title: 'Method', active: 'method.html', desc: 'How data was collected, verified and what was not verified.',
  body: `<h1>Method &amp; verification log</h1>
<h2>Rules applied</h2><ul>
<li><b>Source of rows:</b> the 206 listings in the upstream ledger (<a href="https://karagemop466-tech.github.io/FreeMoneyApps/">live site</a>, <a href="https://github.com/karagemop466-tech/FreeMoneyApps/tree/466f7c1e7a14b52b4a0d36beb84a00d68fd409b7">commit 466f7c1</a>). They are treated as <b>claims</b>, not facts.</li>
<li><b>Verified</b> means: a human-readable official page (operator, league, sponsor or platform domain) was fetched on ${CHECK_DATE} and states the value shown. Nothing is inferred or filled in.</li>
<li><b>Blank = unverified.</b> If a value could not be read from an official page, the “Verified prize” cell is left empty.</li>
<li>Upstream columns (status, entry, region) are labelled “upstream/auto” and kept visible so you can see the claim, but they are not verification.</li>
<li>“Region” and “prize type” are automatic keyword matches on upstream wording — handy filters, not facts.</li></ul>
<h2>Verification levels</h2><table class="tbl simple"><tbody>
<tr><td>${badge('verified')}</td><td>Prize and key terms read from an official page on ${CHECK_DATE}. (${N.byOutcome.verified})</td></tr>
<tr><td>${badge('partial')}</td><td>Official page loads and confirms some values; others could not be confirmed. (${N.byOutcome.partial})</td></tr>
<tr><td>${badge('discrepancy')}</td><td>Official page contradicts or changes the upstream claim (closed, stale year, different amount). (${N.byOutcome.discrepancy})</td></tr>
<tr><td>${badge('broken-link')}</td><td>Upstream link returns an error page. (${N.byOutcome['broken-link']})</td></tr>
<tr><td>${badge('unverified')}</td><td>Page opened but no usable prize/terms text. (${N.byOutcome.unverified})</td></tr>
<tr><td>${badge('not-checked')}</td><td>Not opened in this session. (${N.byOutcome['not-checked']})</td></tr></tbody></table>
<h2>Limitations (read this)</h2><ul>
<li>Pages were read through a text fetcher, not a full browser: JavaScript-rendered listings (e.g. Zindi) and login-walled pages can't be read, and are reported as unverified.</li>
<li>Only ${N.checked} of ${N.total} rows were opened against an official page. The rest are published with blank prize cells and the upstream claim tucked under “Details”. Re-run verification in a follow-up session; the board in <a href="${REPO}/blob/main/COORDINATION.md">COORDINATION.md</a> lists it as unclaimed.</li>
<li>Outbound network access in the build environment is limited, so external links on the site cannot be machine-checked at build time; <code>scripts/linkcheck.js</code> validates every <i>internal</i> link and anchor, and external links were checked only where listed below.</li>
<li>Eligibility, tax forms and full rules were read only where stated in a row's Details.</li></ul>
<h2>Official pages fetched on ${CHECK_DATE}</h2><div class="tw"><table class="tbl simple"><thead><tr><th>Entry</th><th>Result</th><th>Official URL fetched</th></tr></thead><tbody>${logRows}</tbody></table></div>
<h2>Reproduce</h2><pre>node scripts/audit.js   # automated checks → data/audit.json
node scripts/build.js   # merge + generate site
node scripts/linkcheck.js</pre>`
});

// Dashboard
const catCards = UP.types.map(t => { const l = rows.filter(r => r.type === t.id); const v = l.filter(r => ['verified', 'partial'].includes(r.check.outcome)).length; return `<a class="card cat" href="categories/${t.id}.html"><b>${esc(t.name)}</b><span class="big">${l.length}</span><span class="muted">${v} verified · ${l.filter(r => r.upstreamStatus === 'ended').length} ended</span></a>`; }).join('');
const soon = PICKS.filter(p => /2026-11-0[2-9]|Nov (0[2-9]|1[0-8])|Ends in 3 days/.test(p.window));
page({
  file: 'index.html', title: 'Dashboard', active: 'index.html', desc: 'Find the best free-to-enter cash prize competitions. Every figure checked against official pages or left blank.',
  body: `<section class="hero"><h1>Find free-to-enter competitions that pay real money</h1>
<p class="lede">${N.total} listings imported from the Free Contest Ledger, organized by category. Prize figures appear <b>only</b> when read from an official page on ${CHECK_DATE}; otherwise the cell is blank and the row is flagged.</p>
<p class="cta"><a class="btn primary" href="picks.html">See verified top picks</a><a class="btn" href="all.html">Browse all ${N.total}</a><a class="btn" href="flagged.html">Flagged for review</a></p></section>
<section class="stats" aria-label="Key numbers">
<div class="card stat"><span class="big">${N.total}</span><span>upstream listings</span></div>
<div class="card stat"><span class="big">${N.byOutcome.verified + N.byOutcome.partial}</span><span>verified or partly verified today</span></div>
<div class="card stat bad"><span class="big">${N.discrepancies}</span><span>differ from official / broken link</span></div>
<div class="card stat warn"><span class="big">${N.byOutcome['not-checked'] + N.byOutcome.unverified}</span><span>still unverified (blank prize)</span></div>
<div class="card stat"><span class="big">${N.ended}</span><span>marked ended upstream</span></div></section>
<section><h2>Time-sensitive (verified ${CHECK_DATE})</h2><div class="cards">${soon.map(p => `<a class="card pick" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"><b>${esc(p.name)}</b><span class="prize">${esc(p.prize)}</span><span class="muted">${esc(p.window)}</span></a>`).join('')}</div><p><a href="picks.html">All verified picks →</a></p></section>
<section><h2>Browse by category</h2><div class="cards cats-grid">${catCards}</div></section>
<section><h2>Key findings</h2><ul class="find">
<li><b>${N.discrepancies} of ${N.checked} checked entries</b> differ from the upstream ledger or have a broken link — e.g. ESPN NFL Survivor and Playoff Predictor have closed entry, the RotoBaller Challenge's draft window ended Sep 8, the Action Network “Favorites” page is the 2024 edition, MLB Beat the Streak's window ends with the 2026 regular season, and a HeroX link returns 404. <a href="flagged.html#a">Details →</a></li>
<li><b>Most “free” prizes are not cash:</b> automatic text matching finds ${N.nonCash} rows with purely non-cash prizes and ${N.mixed} mixing cash with gift cards, trips or credits. GamerSaloon's $10 is Bonus Cash that cannot be withdrawn (official page).</li>
<li><b>Best fit for an AI coding agent:</b> data-science, ML and forecasting contests (Kaggle, DrivenData, Metaculus bot tournaments, ARC Prize) — measurable scoring and large published pools. See <a href="categories/tech.html">Tech &amp; data</a> and <a href="categories/forecasting.html">Forecasting</a>.</li>
<li><b>Scope question for you:</b> ${N.gambling} rows are run by betting brands and ${N.broker} are broker/trading-platform promotions, despite the upstream policy of excluding gambling-operator funnels. <a href="flagged.html#b">Review →</a></li></ul>
<p><a href="summary.html">Read the executive summary →</a></p></section>`
});

// Executive summary (md source + html)
const md = `# Executive summary — Free Cash Contest Finder

**Date of verification:** ${CHECK_DATE} · **Upstream ledger reviewed:** ${UP.reviewed} (pass ${UP.pass}) · **Live site:** ${SITE}ledger/

## Purpose
Collect, organize and analyze free-to-enter competitions that can pay real cash, and surface the best ones to compete in with an AI coding agent. The starting point was the [Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/) (${N.total} listings), which was hard to use on mobile and contained at least one verified broken link (HeroX).

## What was built
- A GitHub Pages site (this repo): dashboard, verified **Top picks**, ${UP.types.length} category pages, an all-entries table with search/filters, a **Flagged for Review** page, a method/verification log, and CSV/JSON data exports.
- Mobile-first layout: tables collapse to cards on phones, no web fonts, search and filters on every table.
- Offline audit and build scripts (\`scripts/audit.js\`, \`scripts/build.js\`, \`scripts/linkcheck.js\`) so results are reproducible.

## Verification result (read this first)
| Outcome | Rows |
|---|---|
| Verified against an official page on ${CHECK_DATE} | ${N.byOutcome.verified} |
| Partly verified | ${N.byOutcome.partial} |
| Differs from official page / broken link | ${N.discrepancies} |
| Opened, not confirmable | ${N.byOutcome.unverified} |
| **Not checked in this session (prize cell left blank)** | **${N.byOutcome['not-checked']}** |

Only ${N.checked} of ${N.total} rows were opened against an official page. The remaining rows keep the upstream claim visible under *Details* but their verified-prize cell is blank and flagged. Nothing was inferred or filled in.

## Key findings
1. **${N.discrepancies} of ${N.checked} checked entries disagree with the ledger.** ESPN NFL Survivor and NFL Playoff Predictor no longer accept new entries; the RotoBaller Challenge's draft window closed Sep 8; the Action Network "Favorites" $100K page is the 2024 edition; MLB Beat the Streak's official window ends with the 2026 regular season; TradingView's latest "The Leap" contest advertised TradingView plans, not cash; Majors Challenge's $250,000 prize was not on its official page; the HeroX sign-up link returns 404.
2. **Verified, large, free, US-friendly pools:** ESPN NFL Pick'em ($102,000, free, through 2027-01-10), ESPN College Pick'em ($86,000), CBS Pro Football Pick'em ($1,000 weekly, $5,000 season, $100,000 contingency), CBS College Pick'em ($1,000 weekly). Eligibility: CBS rules say 50 US states + DC, 18+.
3. **Best fit for an AI coding agent (our analysis, not an official claim):** ARC Prize 2026 ($2,000,000; **submissions due 2026-11-02**, papers 2026-11-08; open-source required; no API LLMs at evaluation), Metaculus Fall 2026 FutureEval Bot Tournament ($50,000), DrivenData GEMS Prize ($300,000), Kaggle NFL Big Data Bowl 2027 ($100,000), and Devpost hackathons up to $1,000,000 (Meta VR Start, to 2026-11-18).
4. **"Free" often means non-cash:** ${N.nonCash} rows have non-cash-only prize text and ${N.mixed} mix cash with gift cards, trips or credits (automatic text match, unverified). GamerSaloon's $10 is Bonus Cash that cannot be withdrawn.
5. **Original headline stats overstate:** "189 true free paths" includes ${N.endedFree} entries the ledger itself marks ended; "60 added this pass" is a stale list length.
6. **Policy conflicts:** ${N.gambling} rows are run by betting brands (e.g. Fanatics sportsbook) and ${N.broker} are broker/trading-platform promotions, although upstream says gambling-operator funnels were removed.
7. **Every row is stale by default:** the upstream "last checked" date is ${UP.reviewed}, 74 days before verification; seasonal contests (NFL, FPL) change quickly.

## Recommended next steps
1. Spend time now on the time-boxed AI/data contests above (ARC Prize closes first), then the free US pick'em pools for steady weekly prizes.
2. Run a follow-up verification session over the ${N.byOutcome['not-checked']} unchecked rows (task 3 on the board) — start with US-eligible, cash-prize, live rows.
3. Decide scope: keep or drop betting-brand and broker promotions; decide whether non-cash prizes belong in a "cash prize" site.
4. Read each contest's official rules before investing effort (tax-form thresholds, eligibility, open-source terms). The upstream ledger says US tax forms apply at $600+; that figure was not verified here.

## Review links
- Flagged for Review: ${SITE}ledger/flagged.html
- Verification log: ${SITE}ledger/method.html
- Task board and PR record: [COORDINATION.md](${REPO}/blob/main/COORDINATION.md)
`;
wr('ledger/EXECUTIVE_SUMMARY.md', md);
// Root EXECUTIVE_SUMMARY.md = integrated overview + earlier sessions' Prize Atlas summary (verbatim) + this ledger's summary.
wr('EXECUTIVE_SUMMARY.md', `# Executive Summary — Own1 (integrated)

Several sessions published work to this repo in parallel. Both are kept, cross-linked and described below; neither overwrote the other.

| Part | What it is | Live |
| --- | --- | --- |
| 1 · Prize Atlas | 208 research leads, 7 rows read against official pages, review queue, supplemental findings (sessions 27a86924, 90c9f78c, 85ca8130, 37aed701) | ${SITE} |
| 2 · Verified Contest Ledger | all 206 upstream rows with automated audit, ${N.checked} rows checked against official pages, flagged page, verified picks (session a479d584) | ${SITE}ledger/ |

Where both parts checked the same page (ESPN NFL Pick'em, ARC Prize, Metaculus, Kaggle, DrivenData GEMS) their values agree. Anything neither part read from an official page is blank and flagged. The consolidated flagged-items view is ${SITE}ledger/flagged.html and the Prize Atlas queue is ${SITE}review.html.

---

# Part 1 — Prize Atlas (as published by earlier sessions, unchanged)

` + fs.readFileSync(path.join(root, 'research/PRIZE_ATLAS_SUMMARY.md'), 'utf8').replace(/^# .*\n/, '') + `

---

# Part 2 — Verified Contest Ledger

` + md.replace(/^# .*\n/, ''));
function mdToHtml(src) {
  const inl = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const out = []; let list = null, tbl = null;
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } if (tbl) { out.push('</tbody></table></div>'); tbl = null; } };
  src.split('\n').forEach(l => {
    let m;
    if ((m = l.match(/^(#{1,3}) (.*)/))) { close(); out.push(`<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`); }
    else if (/^\|.*\|$/.test(l)) { if (/^\|[-| ]+\|$/.test(l)) return; const cells = l.slice(1, -1).split('|').map(x => x.trim()); if (!tbl) { close(); tbl = 1; out.push('<div class="tw"><table class="tbl simple"><thead><tr>' + cells.map(c => `<th>${inl(c)}</th>`).join('') + '</tr></thead><tbody>'); } else out.push('<tr>' + cells.map(c => `<td>${inl(c)}</td>`).join('') + '</tr>'); }
    else if ((m = l.match(/^(\d+)\. (.*)/))) { if (list !== 'ol') { close(); list = 'ol'; out.push('<ol>'); } out.push(`<li>${inl(m[2])}</li>`); }
    else if ((m = l.match(/^- (.*)/))) { if (list !== 'ul') { close(); list = 'ul'; out.push('<ul>'); } out.push(`<li>${inl(m[1])}</li>`); }
    else if (l.trim()) { close(); out.push(`<p>${inl(l)}</p>`); } else close();
  }); close(); return out.join('\n');
}
page({ file: 'summary.html', title: 'Executive summary (ledger part)', active: 'summary.html', desc: 'Executive summary of findings.', body: `<article class="prose">${mdToHtml(md)}</article>` });

console.log('built', rows.length, 'rows;', JSON.stringify(N.byOutcome));
