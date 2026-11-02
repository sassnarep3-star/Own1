#!/usr/bin/env node
/**
 * verify.js — audit every listing and produce two machine-readable outputs:
 *   data/verification.json  per-row verification state + totals
 *   data/irregularities.json the register published on flagged.html
 *
 * Design rules:
 *  - This script never invents a value. It only classifies what is already in the dataset.
 *  - A row is only called "live-checked" if data/live-checks.json contains a fetch of one of
 *    its own URLs made in this pass. Everything else is honestly labelled as not re-checked.
 *  - Any value with no official-tier source behind it is marked unverified and is blanked on
 *    the published table (the dataset's own text stays visible in the row detail, labelled).
 *
 * Usage: node scripts/verify.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ledger.json'), 'utf8'));
const livePath = path.join(ROOT, 'data/live-checks.json');
const live = fs.existsSync(livePath) ? JSON.parse(fs.readFileSync(livePath, 'utf8')) : { checks: [], coverage: {} };

const CHECK_DATE = live.checkedAt || '2026-11-01';
const SOURCE_REVIEW_DATE = ledger.reviewed; // 2026-08-19, as declared by the source
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
const STALE_DAYS = daysBetween(SOURCE_REVIEW_DATE, CHECK_DATE);

/* ---------- helpers ---------- */

const CURRENCY = [
  { code: 'USD', test: /\$|USD|\bUS dollars?\b/i },
  { code: 'GBP', test: /£|\bGBP\b/i },
  { code: 'EUR', test: /€|\bEUR\b/i }
];

function currenciesIn(text) {
  if (!text) return [];
  return CURRENCY.filter((c) => c.test.test(text)).map((c) => c.code);
}

/** true when the prize text contains an actual money amount, e.g. "$10,000", "£5,000", "€2,000". */
function hasMoneyAmount(text) {
  if (!text) return false;
  return /(?:[$£€]\s?\d[\d,.…]*)|\b\d[\d,.]*\s?(?:USD|GBP|EUR)\b/.test(text);
}

const liveByUrl = new Map();
for (const c of live.checks || []) {
  liveByUrl.set(c.url, c);
  // also index by the URL as written in the dataset, normalised (http->https, trailing slash)
  const norm = (u) => u.replace(/^http:/, 'https:').replace(/\/+$/, '');
  liveByUrl.set(norm(c.url), c);
}

/** Every fetch this pass that touched one of the row's own URLs (a row can have several). */
function findLiveChecks(item) {
  const urls = new Set([item.signupUrl, item.rulesUrl, item.tosUrl, item.iosUrl]
    .filter(Boolean)
    .concat((item.sources || []).map((s) => s.url)));
  const norm = (u) => u.replace(/^http:/, 'https:').replace(/\/+$/, '');
  const wanted = new Set([...urls].flatMap((u) => [u, norm(u)]));
  const out = [];
  for (const c of live.checks || []) {
    const matched = wanted.has(c.url) || wanted.has(norm(c.url)) ||
      (c.listingIds || []).includes(item.id);
    if (matched) out.push(c);
  }
  return out;
}

const homeLike = (u) => {
  try {
    const p = new URL(u).pathname.replace(/\/+$/, '');
    return p === '';
  } catch (e) {
    return false;
  }
};

/* ---------- per-row audit ---------- */

const rows = [];
for (const item of ledger.listings) {
  const sources = item.sources || [];
  const official = sources.filter((s) => s.tier === 'official');
  const other = sources.filter((s) => s.tier !== 'official');
  const allUrls = [item.signupUrl, item.rulesUrl, item.tosUrl, item.iosUrl]
    .filter(Boolean)
    .concat(sources.map((s) => s.url));
  const nonHttps = [...new Set(allUrls.filter((u) => !/^https:\/\//.test(u)))];

  const lcs = findLiveChecks(item);
  const lcLoaded = lcs.find((c) => c.outcome === 'loaded') || null;
  const lcError = lcs.find((c) => c.outcome === 'error-page') || null;
  const lc = lcLoaded || lcError || null;
  const money = hasMoneyAmount(item.prizeUsd);
  const currencies = currenciesIn(item.prizeUsd);
  const hasOfficialBasis = official.length > 0;

  const crossCheck = item.crossCheck || null;
  let status;
  if (lcError) status = 'live-check-error';
  else if (lcLoaded) status = 'live-checked';
  else if (crossCheck) status = 'cross-checked';
  else if (hasOfficialBasis) status = 'official-source-cited';
  else status = 'no-official-source';

  const flags = [];
  if (!hasOfficialBasis) flags.push('I-04');
  if (lcError) flags.push('I-05');
  if (nonHttps.length) flags.push('I-09');
  if (item.code) flags.push('I-07');
  if (!item.rulesUrl) flags.push('I-08a');
  if (item.rulesUrl && item.rulesUrl === item.signupUrl) flags.push('I-08b');
  if (item.status === 'ended') flags.push('I-03');
  if (!money) flags.push('I-12');
  if (currencies.length && !currencies.includes('USD')) flags.push('I-13');
  if (['fanatics-survivor', 'dirty-dozen'].includes(item.id)) flags.push('I-10');
  if (item.type === 'market' && /broker|prop[- ]firm|live .*account|trading bonus|account credit/i.test(
    [item.restricted, item.prizeNote, (item.redFlags || []).join(' ')].join(' '))) flags.push('I-10');
  if (item.type === 'directory') flags.push('I-14');
  if (item.id === 'tradingview-leap') flags.push('I-06');
  if (item.id === 'swagbucks-trivia' || item.id === 'givling') flags.push('I-11');

  rows.push({
    id: item.id,
    name: item.name,
    type: item.type,
    status: item.status,
    freePath: item.freePath,
    verificationLevel: item.verification.level,
    sourceCount: sources.length,
    officialSourceCount: official.length,
    unofficialSourceCount: other.length,
    primaryOfficialUrl: (official[0] || {}).url || null,
    allSourceUrls: sources.map((s) => ({ title: s.title, url: s.url, tier: s.tier })),
    hasRulesUrl: Boolean(item.rulesUrl),
    rulesUrl: item.rulesUrl || null,
    rulesIsHomepage: item.rulesUrl ? homeLike(item.rulesUrl) : null,
    rulesEqualsSignup: item.rulesUrl === item.signupUrl,
    nonHttpsUrls: nonHttps,
    prizeClaim: item.prizeUsd,
    prizeHasMoneyAmount: money,
    prizeCurrencies: currencies,
    prizeHasOfficialBasis: hasOfficialBasis,
    /** Published table value: blank unless an official source exists AND a real amount is stated. */
    prizeCellValue: hasOfficialBasis && money ? item.prizeUsd : null,
    crossCheck: crossCheck ? {
      url: crossCheck.url, checkedDate: crossCheck.checkedDate, checkedBy: crossCheck.checkedBy,
      confirmed: crossCheck.confirmed, caveats: crossCheck.caveats, deadline: crossCheck.deadline
    } : null,
    deadline: item.deadline || null,
    verificationLevelLabel: item.verification.level,
    mergedFrom: item.mergedFrom || null,
    liveCheck: lcLoaded ? { url: lcLoaded.url, outcome: lcLoaded.outcome, pageTitle: lcLoaded.pageTitle, checkedAt: CHECK_DATE } : null,
    liveCheckError: lcError ? { url: lcError.url, outcome: lcError.outcome, pageTitle: lcError.pageTitle, checkedAt: CHECK_DATE } : null,
    liveChecks: lcs.map((c) => ({ url: c.url, outcome: c.outcome, checkedAt: CHECK_DATE })),
    rowStatus: status,
    flags: [...new Set(flags)],
    sourceReviewed: item.lastChecked
  });
}

const count = (fn) => rows.filter(fn).length;

const totals = {
  rows: rows.length,
  liveChecked: count((r) => r.rowStatus === 'live-checked'),
  liveCheckError: count((r) => r.rowStatus === 'live-check-error'),
  crossChecked: count((r) => r.rowStatus === 'cross-checked'),
  officialSourceCited: count((r) => r.rowStatus === 'official-source-cited'),
  noOfficialSource: count((r) => r.rowStatus === 'no-official-source'),
  recheckedThisPass: count((r) => r.liveCheck !== null),
  prizeFigureStated: count((r) => r.prizeHasMoneyAmount),
  prizeBlankedOnSite: count((r) => r.prizeCellValue === null),
  withPromoCode: count((r) => r.flags.includes('I-07')),
  endedListings: count((r) => r.flags.includes('I-03')),
  missingRulesUrl: count((r) => !r.hasRulesUrl),
  rulesEqualsSignup: count((r) => r.rulesEqualsSignup),
  nonHttps: count((r) => r.nonHttpsUrls.length > 0),
  freeEntryFull: count((r) => r.freePath === 'full'),
  freeEntryPartial: count((r) => r.freePath === 'partial'),
  paidCash: count((r) => r.freePath === 'paid-cash'),
  sourceReviewed: SOURCE_REVIEW_DATE,
  verifiedOn: CHECK_DATE,
  staleDays: STALE_DAYS,
  addedByParallelSessions: (ledger.additionsMerged || 0),
  crossChecks: (ledger.crossChecksMerged || 0),
  sourceRepoCommit: ledger.provenance.sourceRepoCommit,
  sourceFileSha256: ledger.provenance.sourceFileSha256
};

fs.writeFileSync(path.join(ROOT, 'data/verification.json'), JSON.stringify({
  verifiedOn: CHECK_DATE,
  sourceReviewed: SOURCE_REVIEW_DATE,
  staleDays: STALE_DAYS,
  method: [
    'Every row was parsed from the pinned source file and checked mechanically for: an official-tier source, a rules URL, https-only links, a stated money amount, and a live fetch made in this pass.',
    'Only rows whose own URL was actually fetched on ' + CHECK_DATE + ' are labelled "live-checked".',
    'Values behind no official source are blanked in the published table and flagged, never filled in.',
    'The remaining ' + (rows.length - totals.recheckedThisPass - count((r) => r.rowStatus === 'cross-checked')) + ' rows carry the source\'s claim of a check on ' + SOURCE_REVIEW_DATE + ' and are published as "source cited — not re-checked this session".',
    count((r) => r.rowStatus === 'cross-checked') + ' rows were verified on ' + CHECK_DATE + ' by the parallel sessions in this repository (see research/SOURCES.md and data/cross-checks.json). Those are labelled "independently checked" rather than being attributed to this session.'
  ],
  totals,
  rows
}, null, 1) + '\n');

/* ---------- irregularity register ---------- */

const idsWith = (flag) => rows.filter((r) => r.flags.includes(flag)).map((r) => r.id);

const register = [
  {
    id: 'I-01',
    title: 'Source site contradicts itself on scope and size',
    severity: 'medium',
    type: 'provenance',
    summary: 'The source page header says "Pass C · 17 Aug 2026", its dataset says pass S / reviewed 2026-08-19, and its own review.html says the ledger "now runs to 119 listings" while the data holds 206. The numbers on the source homepage (206 / 189 / 62 / 60) are computed by its JavaScript, not written into the data.',
    evidence: [
      'index.html of the source site: subtitle "Pass C · 17 Aug 2026".',
      'assets/data.js header: "pass S, 2026-08-19", reviewed: "2026-08-19".',
      'review.html of the source site: "the ledger now runs to 119 listings".'
    ],
    affected: [],
    links: [
      { title: 'Source site', url: 'https://karagemop466-tech.github.io/FreeMoneyApps/' },
      { title: 'Source repository (pinned commit)', url: 'https://github.com/karagemop466-tech/FreeMoneyApps/commit/466f7c1e7a14b52b4a0d36beb84a00d68fd409b7' }
    ],
    action: 'We publish the dataset\'s own numbers and state the pass and date we used. No figure on our site is taken from the source page\'s marketing header.'
  },
  {
    id: 'I-02',
    title: 'Every prize figure is 74 days stale at publication',
    severity: 'high',
    type: 'freshness',
    summary: 'All 206 rows carry "last checked 2026-08-19". Today is 2026-11-01 — a ' + STALE_DAYS + '-day gap. Contest prize tables, seasons and eligibility change on that timescale, and several sports contests in the set are seasonal.',
    evidence: ['Ledger field lastChecked = "2026-08-19" on all 206 rows.', 'Source repository last commit 2026-08-19T22:07:51Z.'],
    affected: ['all'],
    links: [{ title: 'Source repository commit', url: 'https://github.com/karagemop466-tech/FreeMoneyApps/commit/466f7c1e7a14b52b4a0d36beb84a00d68fd409b7' }],
    action: 'Shown on every page as "source reviewed 2026-08-19". Prize figures are labelled as the source\'s claims, and each row links to the operator so the live figure can be read before entering.'
  },
  {
    id: 'I-03',
    title: 'Ended / out-of-season contests are still listed with prize figures',
    severity: 'medium',
    type: 'data-quality',
    summary: totals.endedListings + ' listings are marked "ended / out of season" by the source itself yet still carry a prize figure. They must not be presented as things to enter today.',
    evidence: ['Rows with status "ended" (e.g. espn-pigskin, fox-super6, nba-pickem, yahoo-bracket-mayhem).'],
    affected: idsWith('I-03'),
    links: [],
    action: 'Separated on the site: excluded from every shortlist and from the "enter now" count; shown with an "Ended" stamp in the full table and on its category page.'
  },
  {
    id: 'I-04',
    title: 'No official-source link on the row — prize figure has no official basis',
    severity: 'high',
    type: 'sourcing',
    summary: totals.noOfficialSource + ' listings cite only affiliate or forum sources. Three of them say so in their own text: the prize table was taken from review sites, not the operator.',
    evidence: [
      'Rows whose sources array contains no entry with tier "official".',
      'roboforex-demo restricted field: "Prize table sourced from review sites, not the official domain — re-confirm before relying on it."',
      'fbs-pro-demo and npbfx-demo carry the same note.'
    ],
    affected: idsWith('I-04'),
    links: [],
    action: 'The prize cell is left BLANK for these rows on the site, marked "unverified", and the row is listed here. The dataset\'s own wording is shown in the row detail, clearly labelled as an unconfirmed claim.'
  },
  {
    id: 'I-05',
    title: 'Official iOS link returns an error page',
    severity: 'high',
    type: 'broken-link',
    summary: 'The App Store link for Solitaire Cash (id1252281551) returned Apple\'s "An Error Occurred" page on ' + CHECK_DATE + ', while a different apps.apple.com link fetched in the same session loaded normally. The app is likely no longer on the US storefront, but one observation is not proof.',
    evidence: [
      'Fetch of https://apps.apple.com/us/app/solitaire-cash-win-real-money/id1252281551 returned title "App Store", body "An Error Occurred".',
      'Control fetch of https://apps.apple.com/us/app/skillz-arena/id6761981587 rendered a full app page.'
    ],
    affected: ['solitaire-cash'],
    links: [
      { title: 'Broken App Store link (check manually)', url: 'https://apps.apple.com/us/app/solitaire-cash-win-real-money/id1252281551' },
      { title: 'Control app that loaded fine', url: 'https://apps.apple.com/us/app/skillz-arena/id6761981587' },
      { title: 'Operator site', url: 'https://www.papaya.com/' }
    ],
    action: 'Row keeps the operator link and shows the App Store link marked "reported error ' + CHECK_DATE + '". Human confirmation needed.'
  },
  {
    id: 'I-06',
    title: 'Rules link points at a past, finished contest',
    severity: 'medium',
    type: 'stale-link',
    summary: 'The TradingView row links its "rules" to the named July 2026 event, and on ' + CHECK_DATE + ' the programme\'s landing page showed every event as completed. The generic entry point is the useful link, not a single expired event\'s rules.',
    evidence: [
      'rulesUrl: https://www.tradingview.com/the-leap/tradestation-july-2026/rules/',
      'Landing page on 2026-11-01 listed events through "October 7 – 20, 2026", marked Completed.'
    ],
    affected: ['tradingview-leap'],
    links: [
      { title: 'Programme landing page', url: 'https://www.tradingview.com/the-leap/' },
      { title: 'Expired rules link cited by the source', url: 'https://www.tradingview.com/the-leap/tradestation-july-2026/rules/' }
    ],
    action: 'Row leads with the programme page; the expired rules link is shown as "past contest rules" rather than presented as current terms.'
  },
  {
    id: 'I-07',
    title: 'Referral / promo codes published with no verification',
    severity: 'high',
    type: 'unverifiable-claim',
    summary: totals.withPromoCode + ' rows carry a referral or league code. Eight are explicitly marked codeVerified: false and four have no verification flag at all. Referral codes are personal or affiliate incentives, they change without notice, and a code can never be confirmed as "the operator\'s official offer".',
    evidence: [
      'Rows with a "code" field, e.g. ffs-fpl (eikrq4), fplhub (00ul99), olka (5nysyw), pitchbooking (5hwilh).',
      'codeVerified is false on 8 of the 12 and unspecified on the other 4.'
    ],
    affected: idsWith('I-07'),
    links: [],
    action: 'Codes are NOT published on this site. The row is shown without a code and this entry explains why. If you want them, take them from the operator page, not from this ledger.'
  },
  {
    id: 'I-08a',
    title: 'No rules URL at all',
    severity: 'medium',
    type: 'sourcing',
    summary: totals.missingRulesUrl + ' rows have no rules/terms URL, so a reader cannot check eligibility or prize terms from the row.',
    evidence: ['Rows where rulesUrl is null/empty.'],
    affected: idsWith('I-08a'),
    links: [],
    action: 'Row shows the operator site only, with a "no rules page cited" note in the detail panel.'
  },
  {
    id: 'I-08b',
    title: '"Rules" link is just the signup page',
    severity: 'low',
    type: 'sourcing',
    summary: totals.rulesEqualsSignup + ' of 206 rows point their rules URL at exactly the same address as the signup URL. The rules are then not a separate, linkable document — the reader lands on a marketing or entry page.',
    evidence: ['Rows where rulesUrl === signupUrl.'],
    affected: idsWith('I-08b'),
    links: [],
    action: 'Shown as a single "Official page" link instead of pretending there is a separate rules document.'
  },
  {
    id: 'I-09',
    title: 'Insecure (http://) link',
    severity: 'low',
    type: 'link-hygiene',
    summary: totals.nonHttps + ' row links only http://. The host serves the same page over https, so the link should be upgraded.',
    evidence: ['squarespool: http://www.squarespool.com/ ; the https version returned the same page on ' + CHECK_DATE + '.'],
    affected: idsWith('I-09'),
    links: [{ title: 'https version that works', url: 'https://www.squarespool.com/' }],
    action: 'Our site links the https address. The dataset keeps the original for auditability.'
  },
  {
    id: 'I-10',
    title: 'Gambling-operator and broker-account contests sit inside a ledger that excludes them',
    severity: 'high',
    type: 'scope-policy',
    summary: 'The source states that sweepstakes, casinos, and "any contest that requires an account with a gambling operator (bookmaker, sportsbook or real-money DFS)" are excluded. ' + (idsWith('I-10').length) + ' rows appear to break that rule: a contest entered through Fanatics\' sportsbook/casino product, a contest hosted on a gambling-affiliate domain, and ' + (idsWith('I-10').length - 2) + ' broker demo contests whose own notes call them broker acquisition funnels. Whether they belong in a free-money ledger is your call, not ours — but it should not be silent.',
    evidence: [
      'fanatics-survivor signupUrl is https://betfanatics.com/ — fetched on ' + CHECK_DATE + ': "Fanatics Sports & Casino — Bet $20 Get $350 in FanCash", with Sportsbook and Casino state lists.',
      'dirty-dozen signupUrl is https://www.gambling.com/games/dirty-dozen — a gambling-affiliate domain, contest name "(Gambling.com)".',
      'tickmill-nfp eligibility: "Live Tickmill account holders".',
      'xm-demo / hfm-demo / litefinance-best restricted notes: "Broker acquisition funnel", prizes are trading bonuses or credits.',
      'The source\'s own category blurb for sports advertises "sweepstakes sportsbooks" while the file header excludes sweepstakes (see I-15).'
    ],
    affected: idsWith('I-10'),
    links: [
      { title: 'betfanatics.com (fetched 2026-11-01)', url: 'https://betfanatics.com/' },
      { title: 'gambling.com contest page', url: 'https://www.gambling.com/games/dirty-dozen' },
      { title: 'Tickmill NFP Machine', url: 'https://www.tickmill.com/promotions/nfp-machine' }
    ],
    action: 'These rows are kept (they are free to enter) but are stamped "operator account required" on the site and excluded from the "best free-to-enter" shortlist. Decide whether to drop them.'
  },
  {
    id: 'I-11',
    title: 'Prizes that are points, gems or credits, not dollars',
    severity: 'medium',
    type: 'prize-quality',
    summary: 'The ledger\'s premise is "free competitions that can pay real money", but a number of rows pay in non-cash currency: Swagbucks SB points, Papaya Gems, Skillz Z coins, broker trading credits. The ' + (idsWith('I-11').length) + ' rows below are the ones where the dataset itself says the free path pays in something other than dollars, or where the payout is a credit rather than cash. Others in the skill category have the same shape without saying so as plainly.',
    evidence: [
      'swagbucks-trivia prize: "SB points redeemable for PayPal cash / gift cards".',
      'givling prize: "Trivia removed — no longer a trivia contest" (the row no longer describes a contest at all).',
      'papaya.com/faq (fetched): free competitions use Gems; cash competitions are separate.'
    ],
    affected: ['swagbucks-trivia', 'givling', 'solitaire-cash', 'bingo-cash', 'skillz', 'pocket7', 'hfm-demo', 'litefinance-best', 'deriv-tournaments'],
    links: [
      { title: 'Swagbucks (points currency)', url: 'https://www.swagbucks.com/' },
      { title: 'Papaya FAQ (Gems vs cash)', url: 'https://www.papaya.com/faq' }
    ],
    action: 'Each row states its payout currency explicitly ("points", "gems", "account credit"); the shortlist requires a cash-equivalent payout.'
  },
  {
    id: 'I-12',
    title: 'No stated prize amount',
    severity: 'medium',
    type: 'data-quality',
    summary: totals.prizeFigureStated + ' rows state a money amount; the other ' + (totals.rows - totals.prizeFigureStated) + ' do not. They use placeholder text such as "Prizes decided by your group", "Varies", "Confirm in-app" or "Unverified". These rows cannot be ranked on prize value.',
    evidence: ['Rows where the prize field contains no currency amount.'],
    affected: idsWith('I-12'),
    links: [],
    action: 'Prize shown as "—" on the site with the reason, and the row is ineligible for the big-prize shortlist.'
  },
  {
    id: 'I-13',
    title: 'Non-USD prize currencies in a USD-framed ledger',
    severity: 'low',
    type: 'data-quality',
    summary: 'Some prize figures are in £ or €. They are not converted here — a conversion would be an invented number.',
    evidence: ['Rows whose prize text contains £ or € and no $.'],
    affected: idsWith('I-13'),
    links: [],
    action: 'Original currency shown as written; no conversion applied anywhere on the site.'
  },
  {
    id: 'I-14',
    title: 'Directory listings are not themselves free contests',
    severity: 'medium',
    type: 'scope',
    summary: 'The directory rows are catalogues. Fetched on ' + CHECK_DATE + ', Reedsy\'s writing-contest list showed 458 contests, many of them charging entry fees ($5–$49 observed), and its "prize" is a directory-wide range rather than a prize.',
    evidence: [
      'reedsy-dir prize text: "Listed per contest (hundreds to tens of thousands)".',
      'Fetched page: entry fees $5, $11, $12, $15, $20, $25 and $49 on listed contests.'
    ],
    affected: idsWith('I-14'),
    links: [{ title: 'Reedsy contest directory', url: 'https://reedsy.com/resources/writing-contests/' }],
    action: 'Directory rows carry an explicit warning on their detail page, are scored −6 in the shortlist model and never appear in a "best picks" list.'
  },
  {
    id: 'I-15',
    title: 'Category copy tells readers to use sweepstakes sportsbooks, which the same file excludes',
    severity: 'medium',
    type: 'scope-policy',
    summary: 'The sports category blurb in the source data reads: "Daily fantasy freerolls and sweepstakes sportsbooks." The file header says sweepstakes are excluded by policy. Both cannot be true.',
    evidence: ['types[sports].blurb: "Daily fantasy freerolls and sweepstakes sportsbooks. Free tickets or free coins can win USD; most large pools are paid-entry."'],
    affected: [],
    links: [{ title: 'Source repository', url: 'https://github.com/karagemop466-tech/FreeMoneyApps' }],
    action: 'We do not repeat that blurb. Our category description is written from what the rows actually contain.'
  },
  {
    id: 'I-17',
    title: 'ESPN\'s own rules contradict each other on how many entries you may submit',
    severity: 'low',
    type: 'source-conflict',
    summary: 'Found by the parallel sessions on 2026-11-01: ESPN\'s FAQ says five entries while the intro and the current picks UI say ten. Both cannot be right, and it changes how a multi-entry strategy works.',
    evidence: ['ESPN NFL Pick\'em FAQ vs the current picks page, read 2026-11-01 by arena/27a86924-own1 and re-read by arena/90c9f78c-own1 (see research/SOURCES.md).'],
    affected: ['espn-pickem'],
    links: [
      { title: 'ESPN Pick\'em complete rules', url: 'https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules' }
    ],
    action: 'The caveat is carried on the row\'s detail page verbatim as a cross-check note. We do not pick a number.'
  },
  {
    id: 'I-18',
    title: 'Challenge.gov is listed as a live lead, but the government says the platform was sunset on 2026-03-30',
    severity: 'medium',
    type: 'stale-source',
    summary: 'Found by a parallel session on 2026-11-01: the reference work groups Challenge.gov with other contest platforms, while the government\'s own site states the platform was sunset in March 2026. A dead directory sends readers to nothing.',
    evidence: ['challenge.gov notice read 2026-11-01 (see the archived supplemental research page).'],
    affected: [],
    links: [{ title: 'Challenge.gov (government notice)', url: 'https://www.challenge.gov/' }],
    action: 'No Challenge.gov row exists in this ledger, so nothing was removed. Recorded here because the source material presents it as a current directory.'
  },
  {
    id: 'I-19',
    title: 'IceHacks advertises cash in its header but its own description says there are no cash prizes',
    severity: 'low',
    type: 'source-conflict',
    summary: 'A parallel session found a page contradicting itself: the header advertises cash, the description says no cash prizes. Header copy is not a prize.',
    evidence: ['icehacks.devpost.com read 2026-11-01.'],
    affected: [],
    links: [{ title: 'IceHacks event page', url: 'https://icehacks.devpost.com/' }],
    action: 'IceHacks is not carried as a row, so no prize is published for it. Recorded so the pattern (headline vs rules) stays visible.'
  },
  {
    id: 'I-20',
    title: 'PayPal AI Hackathon: headline prize total and itemised rules disagree',
    severity: 'medium',
    type: 'prize-discrepancy',
    summary: 'The event page advertises $67,500 cash and $69,750 total prizes; the rules itemise individual awards including non-cash credits. This site quotes only the clearly stated first-place cash award ($12,000) and nothing else.',
    evidence: ['Event page vs rules page, read 2026-11-01 by arena/37aed701-own1.'],
    affected: ['paypal-ai-hackathon-2026'],
    links: [
      { title: 'Event page', url: 'https://paypalaihackathon.devpost.com/' },
      { title: 'Official rules', url: 'https://paypalaihackathon.devpost.com/rules' }
    ],
    action: 'The row states "$12,000 first place" only, with this discrepancy noted on its detail page. No total is published.'
  },
  {
    id: 'I-21',
    title: 'The blanket claim that "US tax forms apply at $600+" is a generalisation, not a rule',
    severity: 'low',
    type: 'tax-claim',
    summary: 'A parallel session flagged that the reference work presents a $600 threshold as universal. Reporting depends on the type of income and the filer\'s circumstances; IRS guidance distinguishes prizes/awards from gambling winnings.',
    evidence: [
      'The source dataset\'s own verification-level text: "US prizes of $600+ typically require a W-9".',
      'IRS Publication 525 and IRS Topic 419 distinguish other income from gambling winnings.'
    ],
    affected: [],
    links: [
      { title: 'IRS Publication 525 (taxable and nontaxable income)', url: 'https://www.irs.gov/publications/p525' },
      { title: 'IRS Topic 419 (gambling income and losses)', url: 'https://www.irs.gov/taxtopics/tc419' }
    ],
    action: 'Every page that mentions tax says "the source\'s generalisation" and links this entry. Nothing here is tax advice.'
  },
  {
    id: 'I-22',
    title: 'Metaculus: the slug "us-midterms-2026" returns "Page not found"; the working tournament URL is "midterms-2026"',
    severity: 'low',
    type: 'broken-link',
    summary: 'Read 2026-11-02: https://www.metaculus.com/tournament/us-midterms-2026/ returns "Page not found", while https://www.metaculus.com/tournament/midterms-2026/ loads "US Midterms 2026" ($10,000 prize pool, closes Nov 04). The dead slug still appears in the archived Prize Atlas data (data/atlas-entries.json, data/verified.json).',
    evidence: ['Both URLs fetched 2026-11-02 by arena/7a477419-own1.'],
    affected: ['midterms-2026'],
    links: [
      { title: 'Working tournament page', url: 'https://www.metaculus.com/tournament/midterms-2026/' },
      { title: 'Dead slug (404)', url: 'https://www.metaculus.com/tournament/us-midterms-2026/' }
    ],
    action: 'This site links only the working URL. The archived files were left unchanged and are noted here.'
  },
  {
    id: 'I-23',
    title: 'Meta VR Start Developer Competition: "$1M in cash prizes" but entry is restricted to Meta VR Start members',
    severity: 'medium',
    type: 'eligibility-gate',
    summary: 'The rules state "NO PURCHASE NECESSARY" and also "THIS CONTEST IS OPEN ONLY TO MEMBERS OF THE META VR START PROGRAM", with a Meta account with Developer Access required. The $1,000,000 figure is the page-title claim; the prize table was not read, so it is shown with that label and the row is marked "some free events", not "free entry".',
    evidence: ['Official rules read 2026-11-02 by arena/7a477419-own1.'],
    affected: ['meta-vr-start-2026'],
    links: [{ title: 'Official rules', url: 'https://start-developer-competition-26.devpost.com/rules' }],
    action: 'Kept as a row with the gate stated. Start membership criteria were not read — check them before planning work.'
  },
  {
    id: 'I-24',
    title: 'Devpost "DSH Hacks V2" title says "$100k+ in prizes!" but the listing shows "5 non-cash prizes"',
    severity: 'low',
    type: 'source-conflict',
    summary: 'On the Devpost hackathon list read 2026-11-02, the event is titled "DSH Hacks V2 ($100k+ in prizes!)" while the card shows "5 non-cash prizes" (Jun 24 - Nov 15, 2026). A headline in a title is not a cash prize.',
    evidence: ['Devpost hackathon listing read 2026-11-02 by arena/7a477419-own1.'],
    affected: [],
    links: [{ title: 'Devpost hackathon list', url: 'https://devpost.com/hackathons' }, { title: 'DSH Hacks V2', url: 'https://dsh-hacks-v2.devpost.com/' }],
    action: 'Not carried as a row; recorded so the headline-vs-rules pattern stays visible (see also I-19, I-20).'
  },
  {
    id: 'I-25',
    title: 'Kaggle competition pages state no entry fee but never say "free"',
    severity: 'info',
    type: 'unconfirmed-value',
    summary: 'For the six Kaggle competitions added on 2026-11-02, neither the overview nor the rules text read contains an entry fee or the word "free", and the Kaggle docs page read does not state it either. Entry is by Kaggle registration and acceptance of the rules. Their entry cell therefore reads "Entry cost not stated" rather than "Free entry".',
    evidence: ['Overview pages and the Name That LLM rules page (including the Kaggle foundational rules) read 2026-11-02 by arena/7a477419-own1.'],
    affected: ['gemma-4-developer-agent', 'name-that-llm', 'squares-in-squares', 'google-quantum-circuit-compilation', 'enveda-casmi-2026', 'nfl-big-data-bowl-2027'],
    links: [
      { title: 'Kaggle competition docs', url: 'https://www.kaggle.com/docs/competitions' },
      { title: 'Name That LLM rules (with foundational rules)', url: 'https://www.kaggle.com/competitions/name-that-llm/rules' }
    ],
    action: 'Left as "not stated". If Kaggle publishes an explicit statement, set freePath to "full" for these rows.'
  },
  {
    id: 'I-26',
    title: 'Two top-ranked entries close today (2026-11-02): ARC Prize competition tracks and Codex x TwitchCon',
    severity: 'info',
    type: 'time-sensitive',
    summary: 'ARC Prize lists "November 2, 2026 - Submissions due" (Kaggle showed "6 hours to go" for ARC-AGI-3 and ARC-AGI-2; the Paper Track is due November 8). Codex x TwitchCon shows "Deadline: Nov 2, 2026 @ 5:00pm EST" and "4 more hours to deadline". Countdowns on this site run from the date of the newest official-page reading.',
    evidence: ['arcprize.org/competitions/2026, the Kaggle competition list and twitchcon-codex.devpost.com read 2026-11-02 by arena/7a477419-own1.'],
    affected: ['arcprize', 'codex-twitchcon-2026'],
    links: [
      { title: 'ARC Prize 2026', url: 'https://arcprize.org/competitions/2026' },
      { title: 'Codex x TwitchCon Hackathon', url: 'https://twitchcon-codex.devpost.com/' }
    ],
    action: 'Kept on the dashboard with "today" so the closing date is visible; they drop off at the next rebuild after the date passes.'
  },
  {
    id: 'I-27',
    title: 'Tool-locked or offline-only entries cannot be won with an arbitrary hosted AI agent as the submitted solution',
    severity: 'info',
    type: 'rule-constraint',
    summary: 'ARC Prize: "Internet access is not available during Kaggle evaluation (no API-based systems like GPT/Claude/etc.)". Name That LLM and Enveda CASMI: notebooks with internet disabled. Gemma 4 Developer Agent: the submission must use one allowed Gemma 4 variant. Codex x TwitchCon requires a project built with OpenAI Codex; Kiroween requires Kiro; Codegeist requires Atlassian Forge. An AI coding agent can still help write and test the solution where the rules allow it.',
    evidence: ['Official pages read 2026-11-02 by arena/7a477419-own1; quotes are on the Verified shortlist page.'],
    affected: ['arcprize', 'name-that-llm', 'enveda-casmi-2026', 'gemma-4-developer-agent', 'codex-twitchcon-2026', 'kiroween-2026', 'codegeist-2026'],
    links: [
      { title: 'ARC Prize 2026 rules', url: 'https://arcprize.org/competitions/2026' },
      { title: 'Gemma 4 Developer Agent', url: 'https://www.kaggle.com/competitions/gemma-4-developer-agent/overview' },
      { title: 'Kiroween rules', url: 'https://kiroween.devpost.com/rules' }
    ],
    action: 'Stated in the "What the official page says" column of the Verified shortlist. Nothing is scored on it.'
  },
  {
    id: 'I-28',
    title: 'XPRIZE: multi-million purses are shown, but the Quantum Applications page lists selected finalist teams and no entry terms',
    severity: 'low',
    type: 'unconfirmed-value',
    summary: 'The XPRIZE competitions page lists purses ($5M Quantum Applications, $119M Water Scarcity, $101M Healthspan, $100M Carbon Removal, $10M Rainforest, $11M Wildfire finals). The Quantum Applications page shows 7 finalists and 20 semifinalists chosen by judges; no entry fee, window or eligibility was read, so open entry is not evidenced.',
    evidence: ['xprize.org/competitions and /competitions/qc-apps read 2026-11-02 by arena/7a477419-own1.'],
    affected: ['xprize'],
    links: [
      { title: 'XPRIZE competitions', url: 'https://www.xprize.org/competitions' },
      { title: 'XPRIZE Quantum Applications', url: 'https://www.xprize.org/competitions/qc-apps' }
    ],
    action: 'The row stays; its entry cell is not asserted as free.'
  },
  {
    id: 'I-16',
    title: 'Most rows were not re-checked in this pass',
    severity: 'info',
    type: 'verification-coverage',
    summary: totals.recheckedThisPass + ' of ' + totals.rows + ' rows were fetched live on ' + CHECK_DATE + '. The build sandbox has no general outbound web access, so a 206-row crawl was not possible here. The other ' + (totals.rows - totals.recheckedThisPass) + ' rows are published as "source cited — not re-checked this session".',
    evidence: ['live-checks.json records 12 fetches; no other URL was retrieved this session.'],
    affected: [],
    links: [],
    action: 'Listed openly. Each row carries its own status badge so a reader can tell a live-checked row from a merely cited one.'
  }
];

fs.writeFileSync(path.join(ROOT, 'data/irregularities.json'), JSON.stringify({
  verifiedOn: CHECK_DATE,
  statusMeaning: 'needs review',
  items: register
}, null, 1) + '\n');

console.log('verify ok');
console.log(JSON.stringify(totals, null, 1));
console.log('irregularities:', register.length);
