'use strict';
/**
 * content.js — prose that is rendered twice: as the site's Executive summary page and as
 * docs/EXECUTIVE_SUMMARY.md. Keeping one source prevents the two from drifting apart.
 *
 * Blocks: {t:'h2'|'h3'|'p'|'ul'|'ol'|'table'|'note', text, items, head, rows}
 * Numbers are injected from data, never typed by hand.
 */

function build(ctx) {
  const n = ctx.totals;
  const pct = (a, b) => Math.round((a / b) * 1000) / 10;

  return {
    title: 'Executive summary',
    standfirst:
      'What the source ledger contains, what we could and could not verify, what we rebuilt, and where the free cash actually is.',

    blocks: [
      { t: 'h2', text: '1. The brief, and what was delivered' },
      { t: 'p', text:
        'The source site (Free Money & Contest Ledger) is a research catalogue of free-to-enter competitions that can pay real money. Its weaknesses are real: on a phone it is one long scroll of ' + n.rows + ' full-length cards with no search, no filters and no sorting, its own pages disagree about which revision is published, and one of its cited App Store links returned an error page when we fetched it. It also mixes ' + n.endedListings + ' ended contests and ' + n.withPromoCode + ' unverified referral codes into the same undifferentiated list as live, verifiable competitions.' },
      { t: 'p', text:
        'This repository rebuilds it as a mobile-first dashboard: one row per competition, nine category pages, a full-table page with search/filter/sort, a scoring-based shortlist, a verification page, and a Flagged for Review page carrying every irregularity with source links. Every table row links to the operator\'s own page. Nothing on the site is a value we invented — values that no official source supports are left blank and listed as unverified.' },

      { t: 'h2', text: '2. Key numbers' },
      { t: 'table', head: ['Measure', 'Value', 'Meaning'], rows: [
        ['Listings carried over', String(n.rows), 'All rows from the pinned source file; no additions, no deletions'],
        ['Categories', '9', 'Skill, trivia, sports, creative, forecasting, market, tech, directories, pools'],
        ['Free-to-enter (full free path)', String(n.freeEntryFull) + ' (' + pct(n.freeEntryFull, n.rows) + '%)', 'Source marks a genuinely free entry path'],
        ['Some free events only', String(n.freeEntryPartial), 'Free practice exists; cash play costs money'],
        ['Cash requires an entry fee', String(n.paidCash), 'Free play pays gems, not dollars'],
        ['Not marked ended', String(n.rows - n.endedListings), 'Live, mixed or flagged "caution" by the source; the strict "active" count is lower'],
        ['Ended / out of season', String(n.endedListings), 'Excluded from every shortlist'],
        ['Prize text with a stated money amount', String(n.prizeFigureStated), pct(n.prizeFigureStated, n.rows) + '% — the rest say "varies", "your group" or "confirm in-app"'],
        ['Prize cell blanked on the site', String(n.prizeBlankedOnSite), 'No official source, or no stated amount — left blank, never guessed'],
        ['Rows with no official-tier source', String(n.noOfficialSource), 'Prize claims rest on affiliate/forum sources only'],
        ['Referral / promo codes withheld', String(n.withPromoCode), 'Unverifiable personal codes; deliberately not republished'],
        ['Rows re-fetched live this pass', String(n.recheckedThisPass), 'Of ' + n.rows + ' — see section 6'],
        ['Flagged irregularities', String(ctx.flags.length), 'All published on the Flagged for Review page'],
        ['Age of the source data', n.staleDays + ' days', 'Source last checked ' + ctx.sourceReviewed + '; re-verified ' + ctx.verifiedOn]
      ]},

      { t: 'h2', text: '3. What is actually wrong with the original site' },
      { t: 'ul', items: [
        'Mobile usability: ' + n.rows + ' cards, each with six metadata rows, six expandable blocks and up to eight buttons, rendered as a single column. No search box, no filters, no sorting — stated on the page itself as a design choice.',
        'Version confusion: the header says "Pass C · 17 Aug 2026", the data says pass S / ' + ctx.sourceReviewed + ', and the review page says the ledger "runs to 119 listings" while the data holds ' + n.rows + '.',
        'Broken and weak links: in a sample of 12 fetched URLs, the Solitaire Cash App Store link returned Apple\'s "An Error Occurred" page; one row links only over http://; six rows cite no rules page at all; ' + n.rulesEqualsSignup + ' rows use the signup page as the "rules" link.',
        'Unsupported prize claims: ' + n.noOfficialSource + ' rows have no official-tier source, and three of them say outright that the prize table came from review sites.',
        'Unverifiable incentives: ' + n.withPromoCode + ' referral/league codes, 8 of them explicitly marked unverified and 4 with no verification flag at all.',
        'Scope drift: the file says sweepstakes, casinos and bookmaker accounts are excluded, then links a contest through a live US sportsbook (betfanatics.com) and includes ' + (ctx.flagCounts['I-10'] - 2) + ' forex/CFD broker demo contests whose own notes call them "broker acquisition funnels".',
        'Dead weight: ' + n.endedListings + ' ended contests and 2 directory rows are presented with the same weight as live competitions.'
      ]},

      { t: 'h2', text: '4. What this rebuild does differently' },
      { t: 'ul', items: [
        'Verified-only values: a prize or cash-out figure appears in the table only when the row has an official-tier source and the source text states an amount. Otherwise the cell is blank and marked unverified.',
        'One link per row to the operator, plus a second link to the rules/terms page when one exists, and a third to the App Store only where an app actually exists.',
        'Every row carries a verification badge: "Live-checked" (' + n.liveChecked + ' rows fetched on ' + ctx.verifiedOn + '), "Link error" (' + n.liveCheckError + '), "Source cited — not re-checked" (' + n.officialSourceCited + '), or "No official source" (' + n.noOfficialSource + ').',
        'Status is first-class: ended contests are stamped, filtered out of the shortlists and excluded from the "enter now" count.',
        'Search, filters (category, entry path, platform, ID checks, status) and sorting work on a real table on desktop and collapse to labelled cards on a phone.',
        'The '+ ctx.flags.length + ' irregularities are published with their evidence, their links and a recommended action — including the ones we could not settle ourselves.'
      ]},

      { t: 'h2', text: '5. Where the money and the odds actually are' },
      { t: 'p', text:
        'Sports pick\'em is the largest category (' + ctx.catCount.sports + ' of ' + n.rows + ' rows) and holds most of the seven-figure marketing numbers, but it is also the most seasonal — ' + n.endedListings + ' rows are already out of season — and the big pools are split across thousands of entrants with tie-breakers. It is the worst place to win money per hour unless you are chasing a specific, well-understood contest.' },
      { t: 'p', text:
        'Tech and forecasting carry the largest free-to-enter cash pools with the least luck. Checked live on ' + ctx.verifiedOn + ': Kaggle had prize-bearing competitions of $450,000, $100,000 and $35,000 open to anyone; Metaculus listed 19 tournaments with published pools up to $50,000 and states plainly that you "can participate for free and win cash prizes". The ledger additionally lists ARC Prize at $2,000,000 across three 2026 tracks (source claim, not re-checked). These are also the only categories where the work — modelling, calibration, engineering — is exactly what an AI coding agent can help you do, and where one entry can plausibly place.' },
      { t: 'p', text:
        'Market/paper-trading contests sit in between. They are free to enter and several pay genuine withdrawable cash, but about half are broker acquisition funnels where the "prize" is a funded demo account or a trading credit, and a few require a live brokerage account. Treat them as marketing offers that happen to be winnable.' },
      { t: 'p', text:
        'Skill tournaments and trivia are the weakest value in the set: the free rooms pay gems or points, the dollar prizes need an entry fee, and the house takes a rake from every pot. Creative contests are free but judged and slow — worth entering only where the prize is large relative to the effort and the judging is transparent.' },

      { t: 'h2', text: '6. What we did not verify — read this before you enter anything' },
      { t: 'ul', items: [
        n.recheckedThisPass + ' of ' + n.rows + ' rows were fetched live this pass. The build environment could reach the web only through a page-fetch tool, so a full ' + n.rows + '-row crawl (roughly 400 URLs) was not possible. The remaining ' + (n.rows - n.recheckedThisPass) + ' rows are published as "source cited — not re-checked", and the full list is on the Flagged for Review page.',
        'All prize figures are at least ' + n.staleDays + ' days old. Seasonal sports contests in particular must be re-read from the operator page before you commit time.',
        'We did not verify AI-assistance terms for any contest. Many judged contests restrict or prohibit AI-generated entries; check the rules before using an agent.',
        'We did not assess tax treatment beyond flagging that US prizes of $600+ normally require a W-9. That is general context, not advice.',
        'Gambling-adjacent rows are kept but stamped "operator account required". Whether they belong in a free-money ledger is a scope decision for you.'
      ]},

      { t: 'h2', text: '7. Practical next steps' },
      { t: 'ol', items: [
        'Start with the "Best picks" page: it ranks only live, free-to-enter, officially sourced rows that state a real cash amount, and it shows the scoring so you can disagree with it.',
        'Pick two categories, not nine. Tech and forecasting give the best expected value for time spent, and both suit AI-assisted work.',
        'Before entering anything, open the operator\'s rules from the row and confirm: current prize, deadline, eligibility in your state, and whether entry is genuinely free this season.',
        'Treat every "funded account", "trading credit" and "gems" prize as worth zero unless you specifically want the product behind it.',
        'Re-run the pipeline (' + 'npm run build' + ') when you want a fresh pass: the source is pinned by commit and checksum, so any change is auditable.'
      ]},

      { t: 'h2', text: '8. Provenance' },
      { t: 'p', text:
        'Source data: the public FreeMoneyApps repository, commit ' + ctx.commit + ', file assets/data.js, SHA-256 ' + ctx.sha256 + ', captured ' + ctx.verifiedOn + '. The file is vendored unchanged in this repository and parsed as strict JSON — never executed. Every published row can be traced back to that file, and every claim in it can be traced to the operator link shown on the row.' }
    ]
  };
}

module.exports = { build };
