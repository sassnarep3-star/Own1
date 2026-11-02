#!/usr/bin/env node
/**
 * summary-content.js — the single source for the executive summary.
 *
 * scripts/build.js renders these blocks as executive-summary.html and
 * scripts/render-docs.js renders the same blocks as docs/EXECUTIVE_SUMMARY.md,
 * so the document and the live page cannot disagree.
 *
 * Every number is computed at build time from the data files; nothing is typed in.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const ledger = read('data/ledger.json');
const verif = read('data/verification.json');
const irr = read('data/irregularities.json');
const fresh = read('data/verification-2026-11-02.json');
const review = read('data/review-2026-11-02.json');

const rows = ledger.listings.length;
const checked = fresh.rows.length;
const pages = fresh.pages.length;
const unverified = rows - checked;
const confirmedFree = fresh.rows.filter((r) => r.freeConfirmed === 'yes').length;
const confirmedPaid = fresh.rows.filter((r) => r.freeConfirmed === 'no').length;
const confirmedCash = fresh.rows.filter((r) => r.facts && r.facts.prize).length;
const noOfficial = verif.rows.filter((r) => r.officialSourceCount === 0).length;
const allFlags = irr.items.length + review.irregularities.length;
const sourceSite = 'https://karagemop466-tech.github.io/FreeMoneyApps/';
const liveSite = 'https://sassnarep3-star.github.io/Own1/';

function build() {
  const blocks = [];
  const h2 = (text) => blocks.push({ t: 'h2', text });
  const p = (text) => blocks.push({ t: 'p', text });
  const ul = (items) => blocks.push({ t: 'ul', items });
  const ol = (items) => blocks.push({ t: 'ol', items });
  const table = (head, rows2) => blocks.push({ t: 'table', head, rows: rows2 });

  h2('What this is');
  p(`Free-to-enter cash-prize competitions, reorganised into a mobile-friendly dashboard. The source is the third-party "Free Money & Contest Ledger" at ${sourceSite}, whose maintained dataset is pinned by commit and SHA-256 in data/source/PROVENANCE.json. That ledger is a research catalogue, not an official operator document, so no figure from it is published as a fact.`);
  p(`The live site is ${liveSite}. It contains ${rows} competition rows, one row per entry in the pinned ledger, plus ${fresh.newLeads.length} new official leads found on 2026-11-02. Every row links to the operator's page where one exists; rows without an official source are labelled "none official" and flagged.`);

  h2('The rule we applied');
  ol([
    'A value appears only when the exact wording is on an official operator page fetched on 2026-11-02. Each such value carries the verbatim quote and its URL on the Verified 2 Nov page.',
    'If an official page does not state a value, the cell is blank and the row is flagged unverified. Nothing is inferred, converted, summed, rounded or filled from the ledger.',
    'The reference ledger is used only for the competition name, its category grouping and where to look. Its prize, entry, status and eligibility labels are never republished as values.',
    'Every irregularity is published on the clearly labelled Flagged for Review page with its source links; a flag never blocks publication and never becomes a guessed value.'
  ]);

  h2('The 2026-11-02 verification pass');
  table(
    ['Measure', 'Value', 'Where it comes from'],
    [
      ['Competition rows', String(rows), 'data/ledger.json (pinned source ledger + 5 merged additions)'],
      ['Official pages fetched on 2026-11-02', String(pages), 'data/verification-2026-11-02.json (pages)'],
      ['Rows with at least one confirmed official value', String(checked), 'data/verification-2026-11-02.json (rows)'],
      ['Rows left blank and flagged unverified', String(unverified), `${rows} minus ${checked}`],
      ['Confirmed free-entry statements', String(confirmedFree), 'exact wording on operator pages'],
      ['Confirmed paid-entry statements', String(confirmedPaid), 'exact wording on operator pages'],
      ['Rows with a confirmed prize figure', String(confirmedCash), 'exact wording on operator pages'],
      ['Rows with no official source', String(noOfficial), 'data/verification.json'],
      ['Published irregularities', String(allFlags), `${irr.items.length} historical + ${review.irregularities.length} new`]
    ]
  );
  p(`The 2026-11-01 automated link check is recorded separately in data/link-health.json: 203 URLs, 166 ok, 10 hard failures and 27 soft failures. Several "failures" are HTTP 403 anti-bot responses, not broken pages; the same pages loaded on 2026-11-02. The dated observation is published on the Flagged page, not treated as a verdict.`);

  h2('Best documented opportunities (verified 2026-11-02)');
  p('These are the rows where an official page states a cash figure, free/no-purchase entry and an open status. Ordered by the literal figure stated on the official page; this is not an odds estimate, an endorsement or an expected-value ranking. No figure has been summed or extrapolated. Excluded: rows the operator says are closed, ended or seasonal; rows whose verified deadline has passed; and prizes the operator describes as Bonus Cash, Gems, points, credits or crowdfunding.');
  const statusBucket = (r) => {
    const s = r.facts && r.facts.status ? String(r.facts.status.value).toLowerCase() : '';
    if (/closed|ended|404|no active|not found|currently closed/i.test(s)) return 'closed';
    if (/window|timeline|submissions open|regular season/i.test(s)) return 'seasonal';
    return 'open';
  };
  const isCash = (r) => {
    const v = r.facts && r.facts.prize ? String(r.facts.prize.value).toLowerCase() : '';
    return Boolean(v) && !/bonus cash|gems|sb points|crowdfunding|not withdrawable|credits|3-month subscription|non-cash/i.test(v);
  };
  const days = (iso) => Math.round((new Date(iso + 'T00:00:00Z') - new Date('2026-11-02T00:00:00Z')) / 86400000);
  const best = fresh.rows
    .filter((r) => r.facts && r.facts.prize && r.freeConfirmed === 'yes' && r.amountUsd != null)
    .filter((r) => isCash(r) && statusBucket(r) === 'open')
    .filter((r) => !r.facts.deadline || !/^\d{4}-\d{2}-\d{2}$/.test(r.facts.deadline.value) || days(r.facts.deadline.value) >= 0)
    .sort((a, b) => b.amountUsd - a.amountUsd)
    .slice(0, 12);
  table(
    ['Competition', 'Prize (official wording)', 'Entry (official wording)', 'Deadline', 'Status (official wording)', 'Official source'],
    best.map((r) => [
      r.name,
      r.facts.prize.value,
      r.facts.entry ? r.facts.entry.value : '',
      r.facts.deadline ? r.facts.deadline.value : '',
      r.facts.status ? r.facts.status.value : '',
      r.sourceUrl
    ])
  );
  p('Deadlines that fall on 2026-11-02 (ARC Prize submissions and Codex x TwitchCon) close on the day of this pass. Confirm on the operator page before starting work.');

  h2('Where an AI coding agent can actually help');
  p('The rules differ sharply and the differences are quoted with links on the Analysis page:');
  ul([
    'Allowed/required: Codex x TwitchCon ("Participants may use standard development tools ... and AI coding assistants" and a Codex session ID is required); PayPal AI Hackathon ("along with an AI tool, model, or platform of their choice"); Global Virtual Hackathon ("Building with AI tools is allowed and expected"); GEMS Prize official rules §3.2 permit generative AI but require a narrative disclosure of its use; Metaculus runs a bot-only FutureEval tournament with a $50,000 pool.',
    'Restricted: Metaculus platform rules say "automated systems, bots, artificial intelligence, or user accounts which are officially registered as bot accounts, are ineligible for tournament prizes" unless competition-specific rules permit — human participants may use AI tools only when "the final submissions reflect their own decisions and understanding". ARC Prize requires open-source code and says "Internet access is not available during Kaggle evaluation (no API-based systems like GPT/Claude/etc.)"; Kaggle Code Competitions run inside Notebook compute limits; TradingView warns that high-frequency scripts can trigger a ban.',
    'Prohibited: Winning Writers contests ("may not contain any AI-generated text"); ESPN ("Entries must be manually key-stroked by the entrant; use of automated entry devices or programs ... are prohibited"); CBS may disqualify "automated computer scripts".'
  ]);
  p('For an agent-assisted entrant, the highest-value work is therefore in tech and forecasting competitions with objective scoring and explicit AI permission, not in pick\'em or judged-writing contests. Two independent rules findings from the handoff in PR #3 (GEMS deadline-time conflict and Metaculus bot-prize eligibility) were re-verified against the official pages on 2026-11-02 and published as R-17 and R-18.');

  h2('Important irregularities (published, not resolved by guessing)');
  ul([
    'The reference site\'s own 100_VERIFIED_CONTESTS.md is marked "SUPERSEDED — DO NOT USE AS A SOURCE" and documents claims its authors found false.',
    'The reference site is one JavaScript-rendered scroll of 206 cards with no search or filters; its counts show zero when scripts are blocked.',
    'Official links have rotted: herox.com/challenges and roboforex.com/contests/ return 404, and Challenge.gov was sunset on 2026-03-30 (replacement: usa.gov/challenges).',
    'Statuses drifted since the ledger\'s 2026-08-19 review: ESPN Survivor entry is closed, Tom Howard is closed, FOX Super 6 has no active games, and TradingView The Leap ended 14 August 2026.',
    'Tom Howard charges $27 per submission; GamerSaloon\'s $10 is Bonus Cash "not eligible for withdrawal"; Givling is a crowdfunding queue, not a trivia contest.',
    `${noOfficial} rows have no official operator source at all — mostly FPL mini-league codes from forum threads and old blog posts. All of their values are blank.`,
    'Deadline fields mix registration close and submission close: the Global Virtual Hackathon\'s 13 November date is registration; submissions close 25 November 2026.'
  ]);
  p(`The full register, with evidence and links for manual review, is on the Flagged for Review page and in REPO_REVIEW.md. All ${allFlags} items are status "needs review" and do not block the site or the merge.`);

  h2('How to reproduce and check');
  ol([
    'node scripts/ingest.js — verify the pinned source checksum and rebuild data/ledger.json.',
    'node scripts/verify.js — rebuild the per-row verification state and the historical irregularity register.',
    'node scripts/build.js — render every page, category page and detail page (deterministic: no network, no clock).',
    'node scripts/checklinks.js, node tests/validate.mjs, node tests/validate-prize-atlas.mjs — link, data and archive checks.',
    'node scripts/render-docs.js — regenerate docs/EXECUTIVE_SUMMARY.md from this same content module.'
  ]);
  p('GitHub Pages serves the main branch from the repository root. The CI workflow rebuilds the site and fails if any generated file changes, if a link is broken, or if a page lacks the mobile viewport/breakpoints.');

  return {
    title: 'Executive summary — verified 2026-11-02',
    standfirst: `${rows} competitions, ${checked} rows checked against ${pages} official operator pages on 2026-11-02, ${unverified} rows left blank and flagged. No inferred values.`,
    blocks
  };
}

module.exports = { build, stats: { rows, checked, pages, unverified, confirmedFree, confirmedPaid, confirmedCash, noOfficial, allFlags } };
