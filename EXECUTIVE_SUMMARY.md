# Executive Summary — Own1 (integrated)

Several sessions published work to this repo in parallel. Both are kept, cross-linked and described below; neither overwrote the other.

| Part | What it is | Live |
| --- | --- | --- |
| 1 · Prize Atlas | 208 research leads, 7 rows read against official pages, review queue, supplemental findings (sessions 27a86924, 90c9f78c, 85ca8130, 37aed701) | https://sassnarep3-star.github.io/Own1/ |
| 2 · Verified Contest Ledger | all 206 upstream rows with automated audit, 28 rows checked against official pages, flagged page, verified picks (session a479d584) | https://sassnarep3-star.github.io/Own1/ledger/ |

Where both parts checked the same page (ESPN NFL Pick'em, ARC Prize, Metaculus, Kaggle, DrivenData GEMS) their values agree. Anything neither part read from an official page is blank and flagged. The consolidated flagged-items view is https://sassnarep3-star.github.io/Own1/ledger/flagged.html and the Prize Atlas queue is https://sassnarep3-star.github.io/Own1/review.html.

---

# Part 1 — Prize Atlas (as published by earlier sessions, unchanged)


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


---

# Part 2 — Verified Contest Ledger


**Date of verification:** 2026-11-01 · **Upstream ledger reviewed:** 2026-08-19 (pass S) · **Live site:** https://sassnarep3-star.github.io/Own1/ledger/

## Purpose
Collect, organize and analyze free-to-enter competitions that can pay real cash, and surface the best ones to compete in with an AI coding agent. The starting point was the [Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/) (206 listings), which was hard to use on mobile and contained at least one verified broken link (HeroX).

## What was built
- A GitHub Pages site (this repo): dashboard, verified **Top picks**, 9 category pages, an all-entries table with search/filters, a **Flagged for Review** page, a method/verification log, and CSV/JSON data exports.
- Mobile-first layout: tables collapse to cards on phones, no web fonts, search and filters on every table.
- Offline audit and build scripts (`scripts/audit.js`, `scripts/build.js`, `scripts/linkcheck.js`) so results are reproducible.

## Verification result (read this first)
| Outcome | Rows |
|---|---|
| Verified against an official page on 2026-11-01 | 6 |
| Partly verified | 9 |
| Differs from official page / broken link | 8 |
| Opened, not confirmable | 5 |
| **Not checked in this session (prize cell left blank)** | **178** |

Only 28 of 206 rows were opened against an official page. The remaining rows keep the upstream claim visible under *Details* but their verified-prize cell is blank and flagged. Nothing was inferred or filled in.

## Key findings
1. **8 of 28 checked entries disagree with the ledger.** ESPN NFL Survivor and NFL Playoff Predictor no longer accept new entries; the RotoBaller Challenge's draft window closed Sep 8; the Action Network "Favorites" $100K page is the 2024 edition; MLB Beat the Streak's official window ends with the 2026 regular season; TradingView's latest "The Leap" contest advertised TradingView plans, not cash; Majors Challenge's $250,000 prize was not on its official page; the HeroX sign-up link returns 404.
2. **Verified, large, free, US-friendly pools:** ESPN NFL Pick'em ($102,000, free, through 2027-01-10), ESPN College Pick'em ($86,000), CBS Pro Football Pick'em ($1,000 weekly, $5,000 season, $100,000 contingency), CBS College Pick'em ($1,000 weekly). Eligibility: CBS rules say 50 US states + DC, 18+.
3. **Best fit for an AI coding agent (our analysis, not an official claim):** ARC Prize 2026 ($2,000,000; **submissions due 2026-11-02**, papers 2026-11-08; open-source required; no API LLMs at evaluation), Metaculus Fall 2026 FutureEval Bot Tournament ($50,000), DrivenData GEMS Prize ($300,000), Kaggle NFL Big Data Bowl 2027 ($100,000), and Devpost hackathons up to $1,000,000 (Meta VR Start, to 2026-11-18).
4. **"Free" often means non-cash:** 9 rows have non-cash-only prize text and 52 mix cash with gift cards, trips or credits (automatic text match, unverified). GamerSaloon's $10 is Bonus Cash that cannot be withdrawn.
5. **Original headline stats overstate:** "189 true free paths" includes 26 entries the ledger itself marks ended; "60 added this pass" is a stale list length.
6. **Policy conflicts:** 3 rows are run by betting brands (e.g. Fanatics sportsbook) and 19 are broker/trading-platform promotions, although upstream says gambling-operator funnels were removed.
7. **Every row is stale by default:** the upstream "last checked" date is 2026-08-19, 74 days before verification; seasonal contests (NFL, FPL) change quickly.

## Recommended next steps
1. Spend time now on the time-boxed AI/data contests above (ARC Prize closes first), then the free US pick'em pools for steady weekly prizes.
2. Run a follow-up verification session over the 178 unchecked rows (task 3 on the board) — start with US-eligible, cash-prize, live rows.
3. Decide scope: keep or drop betting-brand and broker promotions; decide whether non-cash prizes belong in a "cash prize" site.
4. Read each contest's official rules before investing effort (tax-form thresholds, eligibility, open-source terms). The upstream ledger says US tax forms apply at $600+; that figure was not verified here.

## Review links
- Flagged for Review: https://sassnarep3-star.github.io/Own1/ledger/flagged.html
- Verification log: https://sassnarep3-star.github.io/Own1/ledger/method.html
- Task board and PR record: [COORDINATION.md](https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md)
