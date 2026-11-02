# Executive summary

_211 competitions, 30 rows checked against 40 official operator pages on 2026-11-02, 181 rows left blank and flagged. No inferred values._

Verified on 2026-11-02. Live site: https://sassnarep3-star.github.io/Own1/


## What this is

Free-to-enter cash-prize competitions, reorganised into a mobile-friendly dashboard. The source is the third-party "Free Money & Contest Ledger" at https://karagemop466-tech.github.io/FreeMoneyApps/, whose maintained dataset is pinned by commit and SHA-256 in data/source/PROVENANCE.json. That ledger is a research catalogue, not an official operator document, so no figure from it is published as a fact.

The live site is https://sassnarep3-star.github.io/Own1/. It contains 211 competition rows, one row per entry in the pinned ledger, plus 7 new official leads found on 2026-11-02. Every row links to the operator's page where one exists; rows without an official source are labelled "none official" and flagged.


## The rule we applied

1. A value appears only when the exact wording is on an official operator page fetched on 2026-11-02. Each such value carries the verbatim quote and its URL on the Verified 2 Nov page.
2. If an official page does not state a value, the cell is blank and the row is flagged unverified. Nothing is inferred, converted, summed, rounded or filled from the ledger.
3. The reference ledger is used only for the competition name, its category grouping and where to look. Its prize, entry, status and eligibility labels are never republished as values.
4. Every irregularity is published on the clearly labelled Flagged for Review page with its source links; a flag never blocks publication and never becomes a guessed value.


## The 2026-11-02 verification pass

| Measure | Value | Where it comes from |
| --- | --- | --- |
| Competition rows | 211 | data/ledger.json (pinned source ledger + 5 merged additions) |
| Official pages fetched on 2026-11-02 | 40 | data/verification-2026-11-02.json (pages) |
| Rows with at least one confirmed official value | 30 | data/verification-2026-11-02.json (rows) |
| Rows left blank and flagged unverified | 181 | 211 minus 30 |
| Confirmed free-entry statements | 17 | exact wording on operator pages |
| Confirmed paid-entry statements | 1 | exact wording on operator pages |
| Rows with a confirmed prize figure | 24 | exact wording on operator pages |
| Rows with no official source | 11 | data/verification.json |
| Published irregularities | 40 | 22 historical + 18 new |

The 2026-11-01 automated link check is recorded separately in data/link-health.json: 203 URLs, 166 ok, 10 hard failures and 27 soft failures. Several "failures" are HTTP 403 anti-bot responses, not broken pages; the same pages loaded on 2026-11-02. The dated observation is published on the Flagged page, not treated as a verdict.


## Best documented opportunities (verified 2026-11-02)

These are the rows where an official page states a cash figure, free/no-purchase entry and an open status. Ordered by the literal figure stated on the official page; this is not an odds estimate, an endorsement or an expected-value ranking. No figure has been summed or extrapolated. Excluded: rows the operator says are closed, ended or seasonal; rows whose verified deadline has passed; and prizes the operator describes as Bonus Cash, Gems, points, credits or crowdfunding.

| Competition | Prize (official wording) | Entry (official wording) | Deadline | Status (official wording) | Official source |
| --- | --- | --- | --- | --- | --- |
| CBS Sports Pro Football Pick'em | 18 weekly $1,000; $5,000 season; $100,000 contingency; maximum ARV $223,000 | Free to play | 2027-01-10 |  | https://www.cbssports.com/fantasy/football/games/pickem/rules |
| ESPN NFL Pick'em | $102,000 total (3 x $20,000; $10,000 Confidence; 18 weekly $500 x 3 modes; $5,000 random drawing) | Free to play | 2027-01-10 |  | https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay |
| Sony World Photography Awards | $25,000 (Series); $5,000 (Single Image) | Free to enter | 2027-01-12 | 2027 awards open for entries | https://www.worldphoto.org/sony-world-photography-awards |
| PayPal AI Hackathon | 1st Place $12,000 USD; 2nd $8,000; 3rd $5,000 | Free entry — no purchase or payment necessary | 2026-11-12 |  | https://paypalaihackathon.devpost.com/rules |
| US Midterms 2026 (Metaculus tournament) | $10,000 Prize Pool | Free to participate | 2026-11-04 | Open until 4 Nov 2026 | https://www.metaculus.com/tournament/midterms-2026/ |
| Codex x TwitchCon Hackathon | 1st Place $10,000 USD; Devpost lists $25,000 in prizes | Free entry — no purchase or payment necessary | 2026-11-02 |  | https://twitchcon-codex.devpost.com/rules |
| Wergle Flomp Humor Poetry Contest | $5,100 in prizes (1st $2,000; 2nd $750; 3rd $350; 10 x $200 honourable mentions) | No fee to enter | 2027-04-01 |  | https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free |
| Deriv Trading Tournaments | 1st $1,000; 2nd $600; 3rd $400 per monthly tournament | Free entry, no deposit |  | Monthly, open tournament schedule on contest.deriv.com | https://deriv.com/newsroom/updates/free-trading-tournaments-virtual-funds-cash-prizes |
| Global Virtual Hackathon 2026 | $1,000 first place per division; two $250 runners-up per division | Free entry, no fee | 2026-11-25 |  | https://gvhackathon.com/ |

Deadlines that fall on 2026-11-02 (ARC Prize submissions and Codex x TwitchCon) close on the day of this pass. Confirm on the operator page before starting work.


## Where an AI coding agent can actually help

The rules differ sharply and the differences are quoted with links on the Analysis page:

- Allowed/required: Codex x TwitchCon ("Participants may use standard development tools ... and AI coding assistants" and a Codex session ID is required); PayPal AI Hackathon ("along with an AI tool, model, or platform of their choice"); Global Virtual Hackathon ("Building with AI tools is allowed and expected"); GEMS Prize official rules §3.2 permit generative AI but require a narrative disclosure of its use; Metaculus runs a bot-only FutureEval tournament with a $50,000 pool.
- Restricted: Metaculus platform rules say "automated systems, bots, artificial intelligence, or user accounts which are officially registered as bot accounts, are ineligible for tournament prizes" unless competition-specific rules permit — human participants may use AI tools only when "the final submissions reflect their own decisions and understanding". ARC Prize requires open-source code and says "Internet access is not available during Kaggle evaluation (no API-based systems like GPT/Claude/etc.)"; Kaggle Code Competitions run inside Notebook compute limits; TradingView warns that high-frequency scripts can trigger a ban.
- Prohibited: Winning Writers contests ("may not contain any AI-generated text"); ESPN ("Entries must be manually key-stroked by the entrant; use of automated entry devices or programs ... are prohibited"); CBS may disqualify "automated computer scripts".

For an agent-assisted entrant, the highest-value work is therefore in tech and forecasting competitions with objective scoring and explicit AI permission, not in pick'em or judged-writing contests. Two independent rules findings from the handoff in PR #3 (GEMS deadline-time conflict and Metaculus bot-prize eligibility) were re-verified against the official pages on 2026-11-02 and published as R-17 and R-18.


## Important irregularities (published, not resolved by guessing)

- The reference site's own 100_VERIFIED_CONTESTS.md is marked "SUPERSEDED — DO NOT USE AS A SOURCE" and documents claims its authors found false.
- The reference site is one JavaScript-rendered scroll of 206 cards with no search or filters; its counts show zero when scripts are blocked.
- Official links have rotted: herox.com/challenges and roboforex.com/contests/ return 404, and Challenge.gov was sunset on 2026-03-30 (replacement: usa.gov/challenges).
- Statuses drifted since the ledger's 2026-08-19 review: ESPN Survivor entry is closed, Tom Howard is closed, FOX Super 6 has no active games, and TradingView The Leap ended 14 August 2026.
- Tom Howard charges $27 per submission; GamerSaloon's $10 is Bonus Cash "not eligible for withdrawal"; Givling is a crowdfunding queue, not a trivia contest.
- 11 rows have no official operator source at all — mostly FPL mini-league codes from forum threads and old blog posts. All of their values are blank.
- Deadline fields mix registration close and submission close: the Global Virtual Hackathon's 13 November date is registration; submissions close 25 November 2026.

The full register, with evidence and links for manual review, is on the Flagged for Review page and in REPO_REVIEW.md. All 40 items are status "needs review" and do not block the site or the merge.


## How to reproduce and check

1. node scripts/ingest.js — verify the pinned source checksum and rebuild data/ledger.json.
2. node scripts/verify.js — rebuild the per-row verification state and the historical irregularity register.
3. node scripts/build.js — render every page, category page and detail page (deterministic: no network, no clock).
4. node scripts/checklinks.js, node tests/validate.mjs, node tests/validate-prize-atlas.mjs — link, data and archive checks.
5. node scripts/render-docs.js — regenerate docs/EXECUTIVE_SUMMARY.md from this same content module.

GitHub Pages serves the main branch from the repository root. The CI workflow rebuilds the site and fails if any generated file changes, if a link is broken, or if a page lacks the mobile viewport/breakpoints.

---

Generated by `scripts/render-docs.js` from `scripts/summary-content.js`, which also renders `executive-summary.html`.
Every figure is computed at build time from `data/ledger.json`, `data/verification.json`,
`data/irregularities.json`, `data/verification-2026-11-02.json` and `data/review-2026-11-02.json`.
