# Executive summary — free-to-enter cash-prize competition finder

**Dashboard:** <https://sassnarep3-star.github.io/Own1/> · **Reference site analysed:** <https://karagemop466-tech.github.io/FreeMoneyApps/>
**Project:** "FREE TO ENTER CASH PRIZE COMPETITIONS" — collect, organise and analyse the competitions, find the ones worth spending time on, and support an AI coding agent entering the difficult real-cash contests.
**Verification date:** 2026-11-02 · **Integration session:** `f25e2b4b-own1` (branch `arena/f25e2b4b-own1`)
**Sources of record:** [`data/ledger.json`](data/ledger.json) (221 combined rows), [`data/verification-2026-11-02.json`](data/verification-2026-11-02.json) (40 dated official-page reads), [`data/cross-checks.json`](data/cross-checks.json) (25 earlier official-page check records).

---

## 1. The short version

The reference site is a single JavaScript-rendered scroll of 206 cards with no search, no filters and no table, and its own headline counts show zero when scripts are blocked. Some of its operator links have rotted, several "active" rows are closed on the operator's own page, and two of its own documents are marked superseded by their authors.

This repository now publishes a mobile-first, pre-rendered dashboard with **221 competition rows**, a searchable full table, nine category subpages, a detail page per row, a deadline-sorted Verified shortlist, analysis and findings, a line-by-line verification record, a repo review with manual-review links, and a clearly labelled **Flagged for Review** page.

The governing rule: **a value is published only when an official operator page fetched on 2026-11-02 states it.** On that date this session fetched **40 official operator pages** and confirmed values for **30 rows**. The remaining **191 rows** keep their names, categories and links, but their prize, entry, deadline, status and eligibility cells are **blank and flagged unverified**. Nothing was inferred, converted, summed, rounded or carried over from the third-party ledger as a fact.

## 2. Dataset reconciliation — two totals, not a contradiction

The pinned upstream source file has **206 listings**. The combined repository dataset has **221 rows**: 206 pinned upstream rows + 15 separately attributed additions merged by parallel sessions. **221 is not the reference site's own count.** Earlier sessions also added 25 official-page check records with reader attribution, 22 independently checked rows, 10 detail pages, `shortlist.html`, `data/shortlist-notes.json`, the [targeted current-state audit](data/verification/current-state-2026-11-02.md), the [integration log](docs/SESSION-7a477419.md), and flags I-22…I-30. Their work was carried forward in this integration (PRs #34–#39 on `main`); nothing was reverted to the older 211-row state.

The base verification snapshot is dated 2026-11-01; the latest independent cross-checks and this session's reads are dated 2026-11-02. A passing local check does not certify that an external operator site is currently reachable or that a particular person is eligible.

## 3. Key figures (computed at build time)

| Measure | Value | Origin |
| --- | --- | --- |
| Combined competition rows | 221 | `data/ledger.json` (206 pinned + 15 additions) |
| Categories | 9 | skill, trivia, sports, creative, forecasting, market, tech, directory, pools |
| Official pages fetched 2026-11-02 | 40 | `data/verification-2026-11-02.json` → `pages` |
| Rows with confirmed official values | 30 | `data/verification-2026-11-02.json` → `rows` |
| Rows blank + flagged unverified | 191 | 221 − 30 |
| Confirmed free-entry statements | 17 | verbatim operator wording |
| Confirmed paid-entry statements | 1 | verbatim operator wording |
| Rows with a confirmed prize figure | 24 | verbatim operator wording |
| Rows with no official source | 11 | `data/verification.json` → `officialSourceCount === 0` |
| New irregularities published | 18 (R-01…R-18) | `data/review-2026-11-02.json` |
| Earlier register retained | 31 (I-01…I-30 + I-16) | `data/irregularities.json` |
| Total published irregularities | 49 | 31 historical + 18 new |
| New official leads found | 7 | official index pages, not merged into the ledger |
| Earlier dated official-page check records | 25 | `data/cross-checks.json` |
| Generated files | 243 | 221 detail + 9 category + 13 root pages |

Automated link health from 2026-11-01 (kept as a dated observation): 203 URLs, 166 ok, 10 hard failures, 27 soft failures. Several "failures" are HTTP 403 anti-bot responses rather than broken pages — those same pages loaded on 2026-11-02.

## 4. Where the best verified opportunities are

The shortlist on the site is restricted to rows where an official page states a cash figure, free/no-purchase entry and an open status, the verified deadline has not passed, and the prize wording does not say Bonus Cash, Gems, points, credits or crowdfunding. It is a reading of the rules, not an odds estimate, endorsement or expected-value ranking. **Do not rank by headline prize alone.**

Confirmed by official pages on 2026-11-02:

- **Tech / data:** [GEMS Prize Challenge](https://www.drivendata.org/competitions/306/competition-doe-gems/) — "Total Prize Pool: $300,000", closes "Dec. 3, 2026, 11:59 p.m. UTC" (the [official rules](https://www.nlr.gov/docs/fy26osti/96647.pdf) A.1 say "5:00 p.m. ET on the prize submission deadline date" — the times conflict; see R-17). [ARC Prize 2026](https://arcprize.org/competitions/2026) — "$2M in prizes. 3 tracks.", submissions due 2 November 2026. [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/rules) — "NO PURCHASE OR PAYMENT NECESSARY", 1st Place $12,000, deadline 12 November 2026. [Codex x TwitchCon](https://twitchcon-codex.devpost.com/rules) — no purchase necessary, 1st Place $10,000, deadline 2 November 2026. The [Devpost index](https://devpost.com/hackathons) lists 14,228 hackathons and a $1,000,000 contest (Meta VR Start Developer Competition 2026).
- **Forecasting:** [Metaculus Tournaments](https://www.metaculus.com/tournaments/) — "You can participate for free and win cash prizes for being accurate", 19 tournaments shown with per-tournament pools. [US Midterms 2026](https://www.metaculus.com/tournament/midterms-2026/) — "$10,000 Prize Pool", "Closes Nov 04". The [Fall 2026 FutureEval Bot Tournament](https://www.metaculus.com/tournament/fall-futureeval-2026/) is "a bot-only competition" with a $50,000 pool, closing 6 January 2027 — an unusually direct fit for an AI agent, subject to the platform's bot-prize rule below.
- **Sports pick'em:** [ESPN NFL Pick'em](https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay) — "$102,000 in total prize money", "Every game we offer is completely free", registration ends 10 January 2027. [CBS Sports Pro Football Pick'em](https://www.cbssports.com/fantasy/football/games/pickem/rules) — "The Challenge is FREE to play", 18 × $1,000 weekly, $5,000 season, $100,000 contingency, maximum ARV $223,000.
- **Creative:** [Sony World Photography Awards](https://www.worldphoto.org/sony-world-photography-awards) — "free to enter", $25,000 Series / $5,000 Single Image, closes January 2027. [Wergle Flomp](https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free) — "No fee to enter", $5,100 in prizes, open until 1 April 2027.
- **Markets:** [Deriv monthly tournaments](https://deriv.com/newsroom/updates/free-trading-tournaments-virtual-funds-cash-prizes) — "Free entry; no purchase or deposit necessary", 1st $1,000 / 2nd $600 / 3rd $400, but a fully verified account is required.

Two deadlines (ARC Prize submissions and Codex x TwitchCon) fall on 2026-11-02, the day of this pass. Confirm on the operator page before starting work.

## 5. What an AI coding agent may actually do

This is the most consequential finding for the project's stated goal. The rules differ sharply and the [Analysis page](https://sassnarep3-star.github.io/Own1/analysis.html) quotes each one with its official link:

| Reading | Official wording (abridged, exact quotes on the site) |
| --- | --- |
| AI assistants allowed / required | Codex x TwitchCon: "Participants may use standard development tools, including frameworks, libraries, starter templates, and AI coding assistants" and a Codex session ID must be submitted. PayPal AI Hackathon: "along with an AI tool, model, or platform of their choice". Global Virtual Hackathon: "Building with AI tools is allowed and expected". GEMS official rules §3.2 permit generative AI but require a narrative disclosure of its use. Metaculus runs a bot-only FutureEval tournament. |
| Split rule | [Metaculus Tournament Rules](https://www.metaculus.com/tournament-rules/): "automated systems, bots, artificial intelligence, or user accounts which are officially registered as bot accounts, are ineligible for tournament prizes" unless competition-specific rules permit; human participants may use AI tools only "as long as the final submissions reflect their own decisions and understanding". The bot-only FutureEval tournament is an explicit exception, not a general permission. |
| AI restricted by the environment | ARC Prize: "Internet access is not available during Kaggle evaluation (no API-based systems like GPT/Claude/etc.)" and code must be open source. Kaggle Code Competitions run inside Notebook compute limits. TradingView warns that scripts with excessively high activity "will lead to a ban". |
| AI prohibited | Winning Writers: "may not contain any AI-generated text". ESPN: "Entries must be manually key-stroked by the entrant; use of automated entry devices or programs, or entries by third parties are prohibited". CBS may disqualify "automated computer scripts". |

**Conclusion:** an AI agent is a genuine fit for objective-scoring tech and forecasting events whose rules invite it, and a liability in pick'em or judged-writing contests. Model/API calls may cost money; running costs are not estimated here. No contest is described as agent-friendly on this site without a quoted rule.

## 6. Important irregularities (published, not resolved by guessing)

All 49 items (18 new + 31 earlier) are on the [Flagged for Review page](https://sassnarep3-star.github.io/Own1/flagged.html) with evidence and source links, and in [`REPO_REVIEW.md`](REPO_REVIEW.md). Status "needs review" does not block publication or the merge. Highlights:

- The reference site's own [`100_VERIFIED_CONTESTS.md`](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/100_VERIFIED_CONTESTS.md) is marked "SUPERSEDED — DO NOT USE AS A SOURCE" and documents claims its authors found false; `index.md` carries a similar notice.
- Broken / retired links: [herox.com/challenges](https://www.herox.com/challenges) and [roboforex.com/contests](https://roboforex.com/contests/) return 404; [Challenge.gov](https://www.challenge.gov/) says "The Challenge.gov platform was sunset on March 30, 2026" and points to [usa.gov/challenges](https://www.usa.gov/challenges).
- Stale statuses: the ledger says 2026-08-19 for every upstream row, but official pages now say ESPN Survivor "Entry creation has closed", Tom Howard "This contest is currently closed", FOX Super 6 "No active games", and TradingView The Leap ended 14 August 2026. Sony renamed "Professional" to "Series" and "Open" to "Single Image".
- Paid entry in a free ledger: Tom Howard charges "$27 per submission"; Papaya's FAQ separates free Gems rooms from cash competitions and describes a platform fee from entry-fee pools.
- Non-cash "prizes": GamerSaloon's $10 is "Bonus Cash ... not eligible for withdrawal"; Swagbucks pays SB points; Givling is a crowdfunding queue with random Spinners, not a trivia contest.
- Contradictions: ESPN's own page says both "create up to 10 entries" and "up to five total"; PayPal's $67,500 Devpost headline includes "$1000 Render credits"; the Devpost index now shows a $1,000,000 contest against the ledger's $685,000 ceiling.
- **Handoff from PR #3 (session `4db3cf09-own1`), re-verified on 2026-11-02:** the GEMS official rules and competition page disagree on the submission cut-off time and §3.2 requires a generative-AI narrative disclosure (R-17); Metaculus platform rules bar bots/AI accounts from prizes by default (R-18). Both are published with their exact quotes and official links.
- 11 rows have **no official operator source** (mostly FPL mini-league codes from forum threads and old blog posts). All of their values are blank.
- Deadline confusion: the Global Virtual Hackathon's 13 November date is the registration close; submissions close 25 November 2026.
- The blanket "US tax forms apply at $600+" is a generalisation; specific official rules require a W-9 or Form 1099 at $600 or more. Nothing here is tax advice.

## 7. Repo work and manual-review links

- The reference site and its own GitHub files were read line by line: [index.html](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/index.html), [app.js](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/js/app.js), [style.css](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/css/style.css), [README.md](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/README.md), [100_VERIFIED_CONTESTS.md](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/100_VERIFIED_CONTESTS.md).
- The maintained dataset `assets/data.js` is vendored byte-for-byte as [`data/source/ledger.source.js`](data/source/ledger.source.js); [`PROVENANCE.json`](data/source/PROVENANCE.json) records commit `466f7c1e7a14b52b4a0d36beb84a00d68fd409b7` and SHA-256 `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`. `scripts/ingest.js` verifies the checksum and parses the file as JSON without executing JavaScript.
- Every file reviewed in this repo is linked on the [Repo review page](https://sassnarep3-star.github.io/Own1/repo-review.html) and in [`REPO_REVIEW.md`](REPO_REVIEW.md). The written verification record is [`research/VERIFICATION-2026-11-02.md`](research/VERIFICATION-2026-11-02.md).
- The site is generated deterministically by [`scripts/build.js`](scripts/build.js) (no network, no clock), so CI can rebuild and fail if any generated file changes.

## 8. Site structure

| Page | Contents |
| --- | --- |
| `index.html` | Dashboard: counts, best verified opportunities, closing deadlines, category cards, findings |
| `all.html` | All 221 rows, searchable/filterable, every row with an official source link |
| `categories/*.html` | Nine category subpages with the same verified-only table |
| `c/*.html` | One detail page per row with quotes, sources and flags |
| `best.html` | Open-now shortlist, excluded rows with reasons, AI-agent rules, new official leads |
| `shortlist.html` | Deadline-sorted official-page checks with the earlier sessions' sourced notes and caveats |
| `analysis.html` | Category coverage, AI compatibility, deadlines, per-row irregularities, findings and limits |
| `verified.html` | Line-by-line evidence: 40 pages fetched, 30 rows with verbatim quotes and URLs |
| `verification.html` | Provenance, the five rules, badge meanings, reproduce steps, limitations |
| `repo-review.html` | Repo review with GitHub links for manual review |
| `research.html` | Source audit of the reference site |
| `flagged.html` | **Flagged for Review** — all 49 irregularities plus every unverified row |
| `executive-summary.html` | This summary, rendered from the same content module as `docs/EXECUTIVE_SUMMARY.md` |

## 9. Verification performed

1. `npm run build` — ingest (checksum), verify, build, docs, check — all passed on the combined 221-row dataset.
2. `node scripts/checklinks.js` — 568 HTML files, 221 table rows, no broken internal links/anchors, one detail link per row, a source link on every row.
3. `node tests/validate.mjs` — link-checked 568 pages / 17,478 local references with no failures; the executive-summary count/date regression checks pass.
4. `node tests/validate-prize-atlas.mjs` — archived 208-row build and its evidence filter pass.
5. `node scripts/build.js` re-run to confirm byte-for-byte determinism.
6. GitHub Pages deployment confirmed after the merge (recorded in `COORDINATION.md`).

## 10. Caveats

- A listing is not an offer. Prizes, rules, eligibility and deadlines change without notice; open the operator's current rules before entering.
- Verification is dated 2026-11-02 and deliberately incomplete: 191 rows were not re-read by this session and are published blank rather than guessed.
- No odds, field sizes, effort estimates or expected-value figures exist in the evidence, so none are published.
- No value from the third-party ledger is published as a fact; upstream labels are not republished at all.
- **No Singapore-specific eligibility conclusion is established.** Confirm geographic restrictions, age limits, sanctions/export terms, prize payment and local law directly with the operator.
- Nothing here is legal, tax or financial advice, and no operator is endorsed.
