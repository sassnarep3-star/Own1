# Executive summary

_What the source ledger contains, what we could and could not verify, what we rebuilt, and where the free cash actually is._


## 1. The brief, and what was delivered

The source site (Free Money & Contest Ledger) is a research catalogue of free-to-enter competitions that can pay real money. Its weaknesses are real: on a phone it is one long scroll of 211 full-length cards with no search, no filters and no sorting, its own pages disagree about which revision is published, and one of its cited App Store links returned an error page when we fetched it. It also mixes 27 ended contests and 12 unverified referral codes into the same undifferentiated list as live, verifiable competitions.

Five other sessions were working on this repository at the same time. Their build ("Prize Atlas") is preserved intact under archive/prize-atlas/, and their verified work is merged into this dataset: 5 rows they added after reading operator pages, and 10 official pages they read and recorded. Those rows carry an "Independently checked" badge attributed to the session that read them — they are never presented as checks made by this one.

This repository rebuilds it as a mobile-first dashboard: one row per competition, nine category pages, a full-table page with search/filter/sort, a scoring-based shortlist, a verification page, and a Flagged for Review page carrying every irregularity with source links. Every table row links to the operator's own page. Nothing on the site is a value we invented — values that no official source supports are left blank and listed as unverified.


## 2. Key numbers

| Measure | Value | Meaning |
| --- | --- | --- |
| Listings carried over | 211 | All rows from the pinned source file; no additions, no deletions |
| Categories | 9 | Skill, trivia, sports, creative, forecasting, market, tech, directories, pools |
| Free-to-enter (full free path) | 193 (91.5%) | Source marks a genuinely free entry path |
| Some free events only | 13 | Free practice exists; cash play costs money |
| Cash requires an entry fee | 4 | Free play pays gems, not dollars |
| Not marked ended | 184 | Live, mixed or flagged "caution" by the source; the strict "active" count is lower |
| Ended / out of season | 27 | Excluded from every shortlist |
| Prize text with a stated money amount | 133 | 63% — the rest say "varies", "your group" or "confirm in-app" |
| Prize cell blanked on the site | 81 | No official source, or no stated amount — left blank, never guessed |
| Rows with no official-tier source | 12 | Prize claims rest on affiliate/forum sources only |
| Referral / promo codes withheld | 12 | Unverifiable personal codes; deliberately not republished |
| Rows re-fetched live this pass | 13 | Of 211 — see section 6 |
| Flagged irregularities | 22 | All published on the Flagged for Review page |
| Age of the source data | 74 days | Source last checked 2026-08-19; re-verified 2026-11-01 |


## 3. What is actually wrong with the original site

- Mobile usability: 211 cards, each with six metadata rows, six expandable blocks and up to eight buttons, rendered as a single column. No search box, no filters, no sorting — stated on the page itself as a design choice.
- Version confusion: the header says "Pass C · 17 Aug 2026", the data says pass S / 2026-08-19, and the review page says the ledger "runs to 119 listings" while the data holds 211.
- Broken and weak links: in a sample of 12 fetched URLs, the Solitaire Cash App Store link returned Apple's "An Error Occurred" page; one row links only over http://; six rows cite no rules page at all; 117 rows use the signup page as the "rules" link.
- Unsupported prize claims: 12 rows have no official-tier source, and three of them say outright that the prize table came from review sites.
- Unverifiable incentives: 12 referral/league codes, 8 of them explicitly marked unverified and 4 with no verification flag at all.
- Scope drift: the file says sweepstakes, casinos and bookmaker accounts are excluded, then links a contest through a live US sportsbook (betfanatics.com) and includes 15 forex/CFD broker demo contests whose own notes call them "broker acquisition funnels".
- Dead weight: 27 ended contests and 2 directory rows are presented with the same weight as live competitions.


## 4. What this rebuild does differently

- Verified-only values: a prize or cash-out figure appears in the table only when the row has an official-tier source and the source text states an amount. Otherwise the cell is blank and marked unverified.
- One link per row to the operator, plus a second link to the rules/terms page when one exists, and a third to the App Store only where an app actually exists.
- Every row carries a verification badge: "Live-checked" (12 rows fetched on 2026-11-01), "Link error" (1), "Source cited — not re-checked" (179), or "No official source" (12).
- Status is first-class: ended contests are stamped, filtered out of the shortlists and excluded from the "enter now" count.
- Search, filters (category, entry path, platform, ID checks, status) and sorting work on a real table on desktop and collapse to labelled cards on a phone.
- The 22 irregularities are published with their evidence, their links and a recommended action — including the ones we could not settle ourselves.


## 5. Where the money and the odds actually are

Sports pick'em is the largest category (129 of 211 rows) and holds most of the seven-figure marketing numbers, but it is also the most seasonal — 27 rows are already out of season — and the big pools are split across thousands of entrants with tie-breakers. It is the worst place to win money per hour unless you are chasing a specific, well-understood contest.

Tech and forecasting carry the largest free-to-enter cash pools with the least luck. Checked live on 2026-11-01: Kaggle had prize-bearing competitions of $450,000, $100,000 and $35,000 open to anyone; Metaculus listed 19 tournaments with published pools up to $50,000 and states plainly that you "can participate for free and win cash prizes". The ledger additionally lists ARC Prize at $2,000,000 across three 2026 tracks (source claim, not re-checked). These are also the only categories where the work — modelling, calibration, engineering — is exactly what an AI coding agent can help you do, and where one entry can plausibly place.

Market/paper-trading contests sit in between. They are free to enter and several pay genuine withdrawable cash, but about half are broker acquisition funnels where the "prize" is a funded demo account or a trading credit, and a few require a live brokerage account. Treat them as marketing offers that happen to be winnable.

Skill tournaments and trivia are the weakest value in the set: the free rooms pay gems or points, the dollar prizes need an entry fee, and the house takes a rake from every pot. Creative contests are free but judged and slow — worth entering only where the prize is large relative to the effort and the judging is transparent.


## 6. What we did not verify — read this before you enter anything

- Of 211 rows: 12 were fetched live by this session on 2026-11-01, 1 returned a link error, 7 have an official page read by another session in this repository, 179 cite an official source nobody re-opened this pass, and 12 cite no official source at all. The build environment could reach the web only through a page-fetch tool, so a full 211-row crawl (roughly 400 URLs) was not possible; the unchecked rows are listed in full on the Flagged for Review page.
- All prize figures are at least 74 days old. Seasonal sports contests in particular must be re-read from the operator page before you commit time.
- We did not verify AI-assistance terms for any contest. Many judged contests restrict or prohibit AI-generated entries; check the rules before using an agent.
- We did not assess tax treatment beyond flagging that US prizes of $600+ normally require a W-9. That is general context, not advice.
- Gambling-adjacent rows are kept but stamped "operator account required". Whether they belong in a free-money ledger is a scope decision for you.


## 7. Practical next steps

1. Start with the "Best picks" page: it ranks only live, free-to-enter, officially sourced rows that state a real cash amount, and it shows the scoring so you can disagree with it.
2. Pick two categories, not nine. Tech and forecasting give the best expected value for time spent, and both suit AI-assisted work.
3. Before entering anything, open the operator's rules from the row and confirm: current prize, deadline, eligibility in your state, and whether entry is genuinely free this season.
4. Treat every "funded account", "trading credit" and "gems" prize as worth zero unless you specifically want the product behind it.
5. Re-run the pipeline (npm run build) when you want a fresh pass: the source is pinned by commit and checksum, so any change is auditable.


## 8. How this build relates to the parallel sessions

- Six sessions worked on this repository on 2026-11-01. Five merged their work into main before this integration pass; their task records, PR numbers and deployment runs are preserved verbatim in docs/COORDINATION-session-records.md.
- Their dashboard is preserved as a working, self-contained site at archive/prize-atlas/ — 208 leads, 7 checked official pages, its own review queue and its supplemental research page. Nothing was deleted.
- Their verified findings were merged into this dataset, attributed: 5 new rows (GEMS Prize Challenge, US Midterms 2026, and three AI hackathons) and 10 official-page cross-checks, each showing the URL, the date read, the session that read it, and their caveats.
- Their four additional irregularity findings (ESPN entry limits, Challenge.gov sunset, IceHacks header, PayPal prize totals, the $600 tax generalisation) are published as I-17 to I-21.
- Where the two builds disagreed, this site keeps the stricter rule: a figure is shown only when an official source states it. That is why rows the other build marked "checked" can still show a blank prize here.


## 9. Provenance

Source data: the public FreeMoneyApps repository, commit 466f7c1e7a14b52b4a0d36beb84a00d68fd409b7, file assets/data.js, SHA-256 13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211, captured 2026-11-01. The file is vendored unchanged in this repository and parsed as strict JSON — never executed. Every published row can be traced back to that file, and every claim in it can be traced to the operator link shown on the row.

---

Generated by `scripts/render-docs.js` on 2026-11-01.
Site: https://sassnarep3-star.github.io/Own1/

Every figure in this document is computed from `data/ledger.json`, `data/verification.json`
and `data/irregularities.json` at build time. Source dataset: commit `466f7c1e7a14b52b4a0d36beb84a00d68fd409b7`,
SHA-256 `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`.