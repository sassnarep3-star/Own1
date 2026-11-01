# Executive summary

**Site:** <https://sassnarep3-star.github.io/Own1/> · **Built:** 2026-11-01 · **Dataset:** 211 listings · **Source of record:** `data/entries.json`, rendered into every page by `scripts/build.js`

This repository replaces a hard-to-use, partly broken reference page of "free money apps" with a mobile-first dashboard that lists **211 competitions which can pay cash**, puts every listing in one plain table, and refuses to publish a number it has not read on an official page.

---

## 1. What the site says, in one line each

- **211 listings** across eight categories: AI/data/code, forecasting, writing-art-photography, sports picks, markets & trading, skill cash games, trivia, and pool software.
- **18 listings are verified** this build: the operator's own page was fetched on 2026-11-01 and the prize, entry cost, deadline and eligibility were copied from it. **6 are partial**, **187 are unverified**.
- **11 have free entry confirmed**, **1 is confirmed paid**, **14 have a confirmed cash figure**, and **2 have no usable operator link** at all.
- **22 irregularities** are documented (codes I-01…I-22) and published on the **Flagged for review** page; **13 rows were re-fetched live** in this pass and **13 rows carry an independent cross-check**.

## 2. The important findings

1. **The reference list mixes three very different things:** genuinely free contests, "free to play" fantasy games whose prizes are merchandise or tickets, and pay-to-enter skill apps that advertise cash. Presenting them as one list of "free money apps" is the single biggest defect in the original page.
2. **Its headline counts do not match its own data.** The source homepage shows counts computed in JavaScript (e.g. "119 listings" in one page, 206 in the data); see I-01.
3. **Some of its links are simply gone or wrong.** The Challenge.gov submission portal the list still points at has been **retired** — `usa.gov/challenges` is the current federal entry point. The RoboForex contest page returns **404**. Two rows have no operator link at all.
4. **Closed contests are still presented as open.** ESPN's NFL Survivor and Playoff Predictor had stopped accepting entries at the time of the read; the RotoBaller draft window closed 2026-09-08; MLB Beat the Streak's window ends with the 2026 regular season.
5. **A prize headline is not a prize.** The clearest example is Deriv's demo tournaments: free to enter and genuinely cash-paying ($1,000 / $600 / $400 a month), but the money needs a fully verified account and the operator is an offshore entity. ESPN Pick'em's "$102,000" includes a $5,000 random drawing, not a skill prize. CBS's "$100,000" is a contingency prize for a perfect week.
6. **Paying to win is the norm in the "skill games" category.** Solitaire Cash, Bingo Cash, Skillz, Pocket7Games and GamerSaloon are entry-fee products; GamerSaloon's $10 is **Bonus Cash that cannot be withdrawn**. They are listed, labelled and never counted as free.
7. **The honest answer to "is this even possible?"** Yes — but the realistic free paths are narrow: forecasting tournaments (Metaculus), data-science competitions (Kaggle, DrivenData, ARC Prize), creative prizes (Sony World Photography, poetry, photography salons), demo-trading tournaments (Deriv), and free sports pick'em games (ESPN, CBS). Everything else either costs money, demands a serious body of work, or is already closed.

## 3. What was done to the repo

- **Read the reference ledger line by line** and rebuilt it as a pinned dataset (`data/entries.json`) with a per-row verification status, an evidence block, and flags.
- **Checked every displayed value against an official page.** 33 official reads are logged in `data/verification/batchA.jsonl` and `batchB.jsonl`; the 29 verified rows are exported row-by-row to `research/EVIDENCE.csv` (source, prize, entry cost, deadline, eligibility, reading date, evidence URL, reading session, flags).
- **Never filled a blank by inference.** Unverified rows publish empty prize, entry, deadline and eligibility cells and say so.
- **Rebuilt the site** as static, pre-rendered HTML with plain tables that work without JavaScript, 44 px touch targets, and per-category pages.
- **Published the irregularities** rather than hiding them: `flagged.html` lists all 22 with severity and evidence links.
- **Coordinated with five parallel sessions** through `COORDINATION.md`, claiming file scopes and integrating their work in five rounds (PRs #17, #24, #27, #29, #31). When `main` later converged on another session's "PrizeDesk" build, this session stopped overwriting it and delivered its last round through that build's own extension point, `data/cross-checks.json`.

## 4. Where to look

| Page | What it holds |
| --- | --- |
| [`index.html`](https://sassnarep3-star.github.io/Own1/) | Dashboard: counts, best bets, and the full 211-row table with filters |
| [`all.html`](https://sassnarep3-star.github.io/Own1/all.html) | Every listing as one plain, printable table |
| [`categories/directory.html`](https://sassnarep3-star.github.io/Own1/categories/directory.html) | The same rows grouped by category |
| [`best.html`](https://sassnarep3-star.github.io/Own1/best.html) | Shortlist ranked only on verified facts |
| [`analysis.html`](https://sassnarep3-star.github.io/Own1/analysis.html) | What the data shows: prize sizes, free vs paid, effort by category |
| [`verification.html`](https://sassnarep3-star.github.io/Own1/verification.html) | Method, row statuses and the evidence rules |
| [`flagged.html`](https://sassnarep3-star.github.io/Own1/flagged.html) | All 22 irregularities with source links |
| [`research.html`](https://sassnarep3-star.github.io/Own1/research.html) | Supplemental research page kept from a parallel session |

## 5. Caveats

- **A listing is not an offer.** Links are research pointers; prizes, rules and eligibility change without notice. Always read the operator's current rules before entering.
- **Verification is dated.** Every checked row records the date it was read (2026-11-01). Anything older than a season should be re-read before you rely on it.
- **This build could not use a headless browser.** External pages were read through a text fetcher, so JavaScript-only boards (Zindi, Kaggle counts, TopCoder) could not be verified and are published blank.
- **Prize figures are the operator's own claims.** No prize has been independently audited or paid out by this project.
- **Tax and eligibility are real.** US reporting generally starts at $600 of winnings; several contests are 18+/21+, region-limited, or require identity verification before payment.
- **Nothing here is financial or legal advice**, and no listing is an endorsement of the operator.
