# Executive Summary — Prize Atlas (Own1)

**Status:** live on GitHub Pages · https://sassnarep3-star.github.io/Own1/index.html
**Prepared:** 2026-11-01 UTC · Source-first research dashboard — not financial or legal advice, not a guarantee of winnings.

## 1. Purpose

Prize Atlas helps users find free-to-enter cash-prize competitions and decide where to spend time competing. Every listing is a **research lead**, not a recommendation. The site is intentionally evidence-first: blank cells mean a value was not confirmed from an official operator page, and nothing is ever inferred or filled in.

## 2. Scope and data source

- Reference ledger: [FreeMoneyApps — assets/data.js](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js), 206 listings last stamped 2026-08-19. Imported as **unverified leads (names and categories only)**; its prize/fee/deadline claims were never trusted as facts.
- The reference project's older [100_VERIFIED_CONTESTS.md](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/100_VERIFIED_CONTESTS.md) is explicitly superseded (it lists false claims) and was **not** used.
- Two additional leads were checked against official operator pages: GEMS Prize Challenge and US Midterms 2026 (Metaculus).
- **Total catalog: 208 leads across 9 categories.**

## 3. Method

1. One record per lead in `data/entries.json` with id, name, category, kind, prize, entry, deadline, note, source, sourceStatus.
2. `sourceStatus === "checked"` only when the linked official operator page was read and the displayed facts were confirmed. Otherwise `"unverified"`.
3. Unverified rows keep prize, entry, deadline, and kind **blank** — deliberately empty until an official source confirms them.
4. Every `source` must be HTTPS; two legacy leads have no usable HTTPS operator source and are shown blank rather than with a misleading link.
5. Paid-entry skill games, directories, group-funded pool tools, and non-cash items are kept for completeness, **not** recommended as free-cash opportunities.

## 4. Site structure

| Page | Contents |
| --- | --- |
| [index.html](https://sassnarep3-star.github.io/Own1/index.html) | Landing dashboard: category cards, table of page-checked leads, metrics, executive summary |
| [category/sports.html](https://sassnarep3-star.github.io/Own1/category/sports.html) | Fantasy & sports picks (129 leads) |
| [category/tech.html](https://sassnarep3-star.github.io/Own1/category/tech.html) | Tech & data (15 leads) |
| [category/creative.html](https://sassnarep3-star.github.io/Own1/category/creative.html) | Creative contests (18 leads) |
| [category/market.html](https://sassnarep3-star.github.io/Own1/category/market.html) | Market simulations (19 leads) |
| [category/skill.html](https://sassnarep3-star.github.io/Own1/category/skill.html) | Skill tournaments (12 leads) |
| [category/forecasting.html](https://sassnarep3-star.github.io/Own1/category/forecasting.html) | Forecasting (4 leads) |
| [category/pools.html](https://sassnarep3-star.github.io/Own1/category/pools.html) | Pool tools (7 leads) |
| [category/directory.html](https://sassnarep3-star.github.io/Own1/category/directory.html) | Directories (2 leads) |
| [review.html](https://sassnarep3-star.github.io/Own1/review.html) | Flagged for review: all 201 unverified leads plus known exceptions |
| [research/SOURCES.md](https://github.com/sassnarep3-star/Own1/blob/main/research/SOURCES.md) | Full source audit, official pages read, irregularities |
| [COORDINATION.md](https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md) | Shared task board, PR and deployment record |

All pages are mobile-responsive, searchable, and filterable by evidence status and listing type. No build step or dependencies; GitHub Pages serves `main` from `/`.

## 5. Key findings — official pages read and confirmed (re-verified 2026-11-01 UTC)

Only 7 of 208 leads have been checked against official operator pages; the rest are unverified leads with blank financial/timing fields.

| # | Lead | Confirmed from official page | Official page |
| --- | --- | --- | --- |
| 1 | ESPN NFL Pick'em | Free to enter ("Every game we offer is completely free"); $102,000 total prizes incl. $5,000 random drawing; NO PURCHASE NECESSARY; void in Puerto Rico/other U.S. territories/Quebec/where prohibited | https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules |
| 2 | ARC Prize 2026 | $2,000,000 across three tracks (ARC-AGI-3, ARC-AGI-2, Paper Prize); submissions due Nov 2, 2026; papers due Nov 8, 2026; results Dec 4, 2026; open-source submission required; no internet during Kaggle evaluation | https://arcprize.org/competitions/2026 |
| 3 | Metaculus Tournaments | Free participation, cash prizes; some listed tournaments have NO PRIZE POOL — check each tournament | https://www.metaculus.com/tournaments/ |
| 4 | US Midterms 2026 (Metaculus) | $10,000 prize pool; closes Nov 4, 2026; governed by Metaculus competition rules | https://www.metaculus.com/tournament/midterms-2026/ |
| 5 | Kaggle Competitions | Platform hosts featured competitions with prizes plus practice/community competitions that may not pay; confirm each event | https://www.kaggle.com/competitions |
| 6 | DrivenData Competitions | Separates prize competitions from benchmarks/practice; exact terms vary by event | https://www.drivendata.org/competitions/ |
| 7 | GEMS Prize Challenge | $300,000 total prize pool ($50k initial round + $250k final round); ends Dec 3, 2026 23:59 UTC; U.S. DOE Office of Geothermal sponsored | https://www.drivendata.org/competitions/306/competition-doe-gems/ |

All seven displayed values in `data/entries.json` match the official pages read on 2026-11-01. Re-verification log is in section 9.

## 6. Data summary

- 208 total leads · 7 page-checked · 201 unverified · 2 with no usable HTTPS operator source (`thelines-survivor`, `squarespool`)
- Unverified leads: every prize / entry / deadline / kind cell is blank on purpose
- Category counts: sports 129, tech 15, creative 18, market 19, skill 12, forecasting 4, pools 7, trivia 2, directory 2

## 7. Irregularities and review queue (published on review.html)

None of these blocks publication; all are listed for your review with source links:

- **201 of 208 leads are not individually checked** against current operator rules. A URL labeled official in the old ledger does not verify anything; some links may be stale or broken. Users must check current operator rules before entering.
- **Two leads have no operator source:** `thelines-survivor` (TheLines Free NFL Survivor) and `squarespool` (SquaresPool.com). No HTTPS operator page was substituted.
- **Legacy status labels are stale:** 27 `ended`, 5 `mixed`, 11 `caution` from the August 2026 ledger. None proves the situation today.
- **ESPN FAQ conflict:** ESPN's own FAQ gives conflicting maximum-entry guidance (five vs ten entries). Check official rules/current UI before submitting.
- **ARC Prize 2026 deadline is imminent (Nov 2, 2026)**, and automation via network APIs cannot run inside Kaggle evaluation per ARC rules.
- **Paid-entry skill games, directories, pool software, and non-cash items** are included for completeness only — not recommended as free cash paths.

## 8. Verification performed this session (2026-11-01 UTC)

Each official page in section 5 was re-fetched live and read; displayed values match `data/entries.json`. Local validation: `node tests/validate.mjs` passes (208 unique IDs, blank unknown fields, HTTPS-only sources, 11 pages and all local references OK). GitHub Actions workflow `.github/workflows/validate.yml` runs the same check on every push and pull request. GitHub Pages build status: **built** (source: `main`, path `/`).

## 9. Links for manual review

- Live site: https://sassnarep3-star.github.io/Own1/index.html
- Full audit: [research/SOURCES.md](https://github.com/sassnarep3-star/Own1/blob/main/research/SOURCES.md)
- Review queue: [review.html](https://sassnarep3-star.github.io/Own1/review.html)
- Task board: [COORDINATION.md](https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md)
- Reference ledger (research lead only, not an official prize source): https://github.com/karagemop466-tech/FreeMoneyApps
