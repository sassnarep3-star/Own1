# Executive summary — Free Cash Competition Ledger

**Prepared:** 2026-11-01 · **Owner:** session `d21e8702-own1` · **Live site:** <https://sassnarep3-star.github.io/Own1/>
**Source under review:** “Free Money & Contest Ledger” — <https://karagemop466-tech.github.io/FreeMoneyApps/>
(data pass “S”, reviewed 2026-08-19; mirrored verbatim from `karagemop466-tech/FreeMoneyApps`, `assets/data.js`)

---

## 1. What this is

The reference site is a single long scroll of **206 free-to-enter competition listings** across nine categories,
built by its author as “a field catalog, not a tip jar”. The catalogue itself is genuinely useful raw material:
each listing already carries a prize description, an eligibility note, payout rails, sign-up steps and at least one
outbound link.

It is not usable as a decision tool, and not safe as a money guide:

- **Mobile.** One page, no search, no filters, no sort, ~206 long cards. It ships a 367 KB data file that is
  rendered entirely client-side, so on a phone you scroll through everything to compare anything.
- **No prioritisation.** Nothing tells you which of the 206 is worth a weekend. The largest category (sports
  pick’em, 129 rows) is presented with the same weight as the 14 tech/data competitions where the money is largest.
- **Claims are unranked and unevenly sourced.** 194 of 206 rows cite an official page; **12 cite none**, including
  eight Fantasy Premier League mini-leagues cited to affiliate blogs and Reddit, and four demo-trading contests whose
  dollar prize ladders are cited only to affiliate sites.
- **Some labels are simply wrong.** Two rows checked this pass are contradicted outright by the operator’s own page.

This project delivers the organised, mobile-first version of that catalogue plus a separate verification layer, so
“the catalogue says” and “we confirmed it” can never be confused.

## 2. What was built

A static, mobile-first dashboard published on GitHub Pages, generated from the mirrored data by
`tools/build_site.py`:

| Page | What it answers |
| --- | --- |
| `index.html` — Dashboard | Headline numbers, category map, top five picks, the findings that matter. |
| `best-picks.html` | 25-row ranked shortlist with the score components shown, plus an honest read on where an AI agent helps. |
| `all.html` | All 206 rows, searchable/filterable/sortable, one official link per row. |
| `category/*.html` (9 pages) | The same table scoped to one category, with category stats. |
| `verification.html` | Every row re-checked this pass: URL, verbatim quote, checked date, status. |
| `flagged.html` | 11 mechanical integrity findings + 2 contradicted rows, each with its source. |
| `methodology.html` | Weights, provenance, SHA-256 of the mirror, and the limits. |
| `sources.html` | Evidence pages used, plus every operator link by category. |
| `executive-summary.html` | This document. |

Engineering: no framework, no build service, no JavaScript required to read any data. Progressive enhancement adds
search, filter, sort and expandable detail panels. `tools/audit.py`, `tools/verify_check.py`,
`tools/build_site.py` and `tools/check_links.py` are all reproducible from the repo.

## 3. What the numbers actually say

All figures below are computed from `data/ledger.json` and `data/audit.json`, not estimated.

| Measure | Value |
| --- | --- |
| Listings | 206 |
| Tagged “free USD path” | 189 |
| Free **and** enterable today (live or caution) | **163** (79.1%) |
| Listed but out of season (“ended”) | 27 |
| Rows that are pool tools or directories, not competitions | 9 |
| Rows with no official-tier source | 12 |
| Rows whose prize is published only as prose (no figure) | 102 |
| iOS option anywhere | 78 (site headline says 62 because it excludes ended rows) |
| Largest category | Sports pick’em — 129 rows (63%) |
| Smallest categories with real cash | Forecasting 3, Tech 14, Creative 18 |

**The structural finding:** the catalogue’s size is in pick’em and survivor pools, but its *value per hour* is in
the small categories. Tech/data pays the largest documented prizes (DrivenData currently runs a **$300,000** challenge;
Kaggle hackathons show **$35,000–$450,000** labels; ARC Prize 2026 is **$2,000,000** across three tracks).
Forecasting is the most agent-friendly free money in the whole list: Metaculus states you can *“participate for free
and win cash prizes”* and two of its **$50,000** pools (Summer and Fall 2026 FutureEval) are explicitly bot tournaments.

## 4. Verification results (12 rows, checked 2026-11-01)

| Status | Rows | Meaning |
| --- | --- | --- |
| Verified | 7 | Every recorded field read on the operator’s page and matches the catalogue |
| Partly verified | 3 | Prize confirmed; free entry not stated on the page read |
| **Contradicted** | **2** | The operator’s own page contradicts the catalogue |
| Not checked this pass | 194 | Keeps its operator link; **no claim is made** |

The two contradictions are the reason this project exists:

1. **Tom Howard/Margaret Reid Poetry Contest** — tagged `Free USD path` and `live`. Its official page states
   **“Fee: $27 per submission”** and **“This contest is currently closed. It will open again on April 15, 2027.”**
   A pay-to-enter, currently-closed contest was being advertised as free money.
   Source: <https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest>
2. **Weather Photographer of the Year (RMetS)** — free entry confirmed on the operator’s own page, but the
   catalogue’s £5,000 / £2,500 / £750 ladder conflicts with two independent 2026 listings (£1,500 / £500 / £500).
   The verified prize is **left blank** rather than guessed.
   Source: <https://www.rmets.org/weather-photographer-of-the-year>

Also confirmed against official pages: Wergle Flomp (no fee, $5,100 in prizes, closes 1 Apr 2027), ARC Prize 2026
($2,000,000, three tracks, hosted on Kaggle), Metaculus (free entry, 19 live tournaments, $3,400–$50,000 pools,
5 with no pool), Checkmate Gaming (“totally free to enter with real cash prizes”), and — as secondary evidence —
World Press Photo (€10,000 + €1,000), Sony World Photography Awards ($25,000 / $5,000) and Istanbul Photo Awards
($58,000 pool, free entry).

## 5. Irregularities flagged for review

Eleven mechanical findings, all published on `flagged.html` with source links. The four that change behaviour:

- **F01 (high)** — 12 rows have no official-tier source; the source file’s own rule requires one for any prize figure.
- **F02 (high)** — 3 demo-trading prize ladders (RoboForex $700, FBS $450, NPBFX $1,000 top prizes) are cited only to
  affiliate pages. Figures are reproduced as *source data, unverified* and never as a verified amount.
- **F03 (high)** — 11 Fantasy Premier League rows share one sign-up URL (`fantasy.premierleague.com`), which
  publishes **no cash prize**; the cash claims come from third-party mini-leagues with private rules.
- **F05 (medium)** — 27 ended rows are inside the reference site’s headline “free path” count of 189.

Lower-severity presentation issues: the “Added this pass” figure is one sub-list (60) while the union of all
`addedThisPass*` lists is 192, so most later additions never get the “New” badge (F10); the masthead says
“Pass C · 17 Aug 2026” while the data says pass “S”, 2026-08-19 (F11).

## 6. Recommendation

1. **Work one tech/data contest** (Kaggle or DrivenData) as the primary effort. Largest documented prizes, genuinely
   open entry, and the one format where a coding agent compounds: reproducible pipeline, fast iteration, public
   leaderboard feedback.
2. **Add one Metaculus tournament** as the low-cost second stream — free entry, thinner fields, and bot tournaments
   that explicitly invite an automated approach.
3. **Treat the sports section as entertainment, not income.** 129 rows, low prize per entry, luck-dominated. Pick at
   most one pool you already follow.
4. **Before entering any judged creative prize, read the AI clause.** Winning Writers states clearly that entries
   “may not contain any AI-generated text”. Several photo salons have similar rules; an agent that ignores this
   forfeits the entry.
5. **Do not treat trading-demo contests as cash.** Many pay bonuses or account credits, and four are sourced only to
   affiliate pages.

## 7. Limits — stated, not hidden

- **194 of 206 rows were not re-verified this pass.** They carry their operator link and no claim. A blank on this
  site is a blank, never an inference.
- **No currency conversion.** €10,000 stays €10,000; rows are not ranked across currencies.
- **No link-liveness claims.** The build shell cannot reach operator domains, so “link checked” is only ever said
  where a page read is recorded in `data/verification.json`.
- **The priority score is editorial.** Five published components; it is not an expected-value calculation and not a
  probability of winning.
- **Parallel sessions.** Two other agent sessions claimed overlapping scopes on this repository before work began;
  neither had committed a site file. The overlap and the integration role are logged in `COORDINATION.md`.

## 8. Next actions that need a human

1. Spot-check the two contradicted rows against the official pages linked above (2 minutes each).
2. Decide whether the 12 unsourced rows should be dropped or annotated permanently in the source catalogue.
3. Choose which category to promote next for verification — Creative (18 rows) has the most free-money-with-a-catch
   and the most AI-clause risk.
