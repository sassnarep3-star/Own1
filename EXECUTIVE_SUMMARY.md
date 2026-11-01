# Executive summary — Free Cash Contest Finder

**Date of verification:** 2026-11-01 · **Upstream ledger reviewed:** 2026-08-19 (pass S) · **Live site:** https://sassnarep3-star.github.io/Own1/

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
- Flagged for Review: https://sassnarep3-star.github.io/Own1/flagged.html
- Verification log: https://sassnarep3-star.github.io/Own1/method.html
- Task board and PR record: [COORDINATION.md](https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md)
