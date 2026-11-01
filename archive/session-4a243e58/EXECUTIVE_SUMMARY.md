# Executive summary — Prize Atlas (Own1)

**Live site:** https://sassnarep3-star.github.io/Own1/
**Prepared:** 2026-11-01 (UTC) · **Integrated by:** session `181b7279-own1`
**Status:** 212 leads · 28 checked against an official page (20 read in this pass, 8 attributed to a parallel session) · 17 with free entry confirmed · 184 published blank and flagged

Not financial, legal or tax advice, and not a guarantee of winnings. Every row is a research lead until its operator page is read.

---

## 1. Purpose

Prize Atlas helps you find free-to-enter cash-prize competitions and decide where to spend time competing. It is deliberately evidence-first: a *Page checked* badge means the linked operator page was opened on 2026-11-01 and the values were copied from it; a blank cell means the value was not confirmed — never that it is zero, and never that entry is free.

## 2. Data source and scope

- Reference ledger: [FreeMoneyApps — assets/data.js](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js), 206 listings, last stamped 2026-08-19, served at <https://karagemop466-tech.github.io/FreeMoneyApps/>. Imported as **names and categories only**; its prize, fee, deadline and status claims were not trusted as facts.
- The reference project's older [100_VERIFIED_CONTESTS.md](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/100_VERIFIED_CONTESTS.md) calls itself superseded and lists false claims; it was **not** used.
- 212 rows today: 206 imported + 2 added in an earlier pass (GEMS, Metaculus midterms) + 2 added here after reading operator pages directly (Reedsy weekly contest, USA.gov challenge directory) + 2 added here after re-reading the Devpost rules for the Codex x TwitchCon and PayPal AI Hackathons (previously on the supplemental page).
- Category split: sports 129, tech 17, creative 19, market 19, skill 12, forecasting 4, pools 7, trivia 2, directories 3.

## 3. Method

1. One record per lead in `data/entries.json`, with `id, name, category, kind, prize, entry, deadline, eligibility, entryFree, note, source, sourceStatus, evidence, flags`.
2. `sourceStatus: "checked"` **only** when the linked operator page was read and the displayed values were copied from it. `evidence` records the URL, the reading date, the exact facts copied and what the page did not state.
3. Unverified rows keep prize / entry / deadline / kind / eligibility **blank**. `tests/validate.mjs` fails the build if an unverified row carries any of those values or a free/paid flag.
4. Every `source` must be HTTPS. Two legacy leads have no usable operator page and are shown blank rather than given a misleading link.
5. Nothing is inferred, converted, combined, rounded or extrapolated; no win probability, expected value or time-to-win figure is published, because no official page read provides one.
6. Paid-entry skill games, directories, participant-funded pool tools and non-cash rewards are kept visible and labelled — never recommended as free cash paths.

## 4. Site structure

| Page | Contents |
| --- | --- |
| [index.html](https://sassnarep3-star.github.io/Own1/index.html) | Dashboard: four key figures, "where to spend your time first" shortlist, category cards, all 212 rows in one filterable table, executive summary |
| `category/{sports,tech,forecasting,creative,market,skill,trivia,pools,directory}.html` | One page per category, with what actually pays there and the filtered table |
| [analysis.html](https://sassnarep3-star.github.io/Own1/analysis.html) | Findings: coverage, where the money is, free-entry traps, the link problem, how to use a coding agent, what would change the picture |
| [methodology.html](https://sassnarep3-star.github.io/Own1/methodology.html) | Verification rules and every official page read, with the exact values copied |
| [review.html](https://sassnarep3-star.github.io/Own1/review.html) | Flagged for review: irregularities, reused links, rows with no operator link, all 192 unverified rows |
| [supplemental/index.html](https://sassnarep3-star.github.io/Own1/supplemental/index.html) | Independent second audit: three hackathon leads and seven extra flags with official links |
| [research/SOURCES.md](https://github.com/sassnarep3-star/Own1/blob/main/research/SOURCES.md) | Full source audit and limitations |
| [COORDINATION.md](https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md) | Shared task board, conflict log, PR and deployment record |

Pages are pre-rendered static HTML (no fetch, works with JavaScript off). Tables re-flow into labelled cards under 760px, so nothing scrolls sideways on a phone. `assets/app.js` only filters rows already in the document.

## 5. Verified findings

### 5.1 Largest documented prize pools (technical work)

| Competition | Confirmed from the official page | Official page |
| --- | --- | --- |
| ARC Prize 2026 | $2,000,000 across three tracks; submissions due 2026-11-02, papers 2026-11-08, results 2026-12-04; open-source licence required; no internet during Kaggle evaluation | <https://arcprize.org/competitions/2026> |
| Kaggle featured competitions | Per-competition prizes (2026-11-01: ARC Prize 2026 Paper Track $450,000; NFL Big Data Bowl 2027 $100,000; Gemma 4 Developer Agent Paper Track $35,000); practice and playground sections do not pay | <https://www.kaggle.com/competitions> |
| GEMS Prize Challenge (US DOE, via DrivenData) | $300,000 total: $50,000 initial round (5 × $10,000) + $250,000 final round ($100k/$70k/$40k/$25k/$15k); ends 2026-12-03 23:59 UTC | <https://www.drivendata.org/competitions/306/competition-doe-gems/> |

### 5.2 Best prize-to-effort ratio for competing now

| Competition | Confirmed from the official page | Official page |
| --- | --- | --- |
| ESPN NFL Pick'em | Free ("every game we offer is completely free"); $102,000 across 58 prizes; event dates 2026-09-09 to 2027-01-10; 18+ for prizes, void PR/US territories/Quebec | <https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay> |
| Metaculus Tournaments | "You can participate for free and win cash prizes for being accurate"; pools from "NO PRIZE POOL" up to $50,000 | <https://www.metaculus.com/tournaments/> |
| Metaculus US Midterms 2026 | $10,000 pool; closes 2026-11-04 | <https://www.metaculus.com/tournament/midterms-2026/> |
| Wergle Flomp Humor Poetry | "No fee to enter"; $5,100 total ($2,000 first); window 2026-08-15 to 2027-04-01; all ages | <https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free> |
| Sony World Photography Awards | "The Competition is free to enter" (rule 1.2.1); $25,000 overall Series winner, $5,000 Single Image; Series closes 2027-01-12 16:00 GMT; 18+ | <https://www.worldphoto.org/sony-world-photography-awards/series> |
| Codex x TwitchCon Hackathon | "NO PURCHASE OR PAYMENT NECESSARY TO ENTER OR WIN"; $25,000 in prizes per the event title, with $4,000 for 3rd and $2,500 each for two runners-up in the rules; submissions close 2026-11-02 2:00 pm PT; 18+ | <https://twitchcon-codex.devpost.com/rules> |
| PayPal AI Hackathon | "NO PURCHASE OR PAYMENT NECESSARY TO ENTER OR WIN"; submission period 2026-10-01 to 2026-11-12 12:00 pm PT; age of majority | <https://paypalaihackathon.devpost.com/rules> |
| Vocal Challenges | "You're not required to pay to enter Vocal's Challenges"; 13+; Stripe-supported country needed for payout | <https://vocal.media/resources/challenges-frequently-asked-questions> |
| Devpost hackathons | Per-event prize totals, including non-cash events | <https://devpost.com/hackathons> |
| Reedsy weekly short story contest | $250 every week; contest #379 closes 2026-11-06 23:59 EST | <https://reedsy.com/creative-writing-prompts/contests/> |

### 5.3 Free entry confirmed, prize amount not published

Weather Photographer of the Year ("free to enter", <https://www.rmets.org/weather-photographer-of-the-year>) and Environmental Photographer of the Year ("free to enter … all ages and experience levels", <https://www.epoty.org/>). Their prize cells are blank because those pages do not state an amount.

### 5.4 Platform and directory leads

Kaggle, DrivenData, Metaculus, Devpost and Vocal are platforms, not single prizes: the per-event page decides. USA.gov's <https://www.usa.gov/challenges> is the official directory of active U.S. federal prize competitions.

## 6. Data summary

- 212 leads · 28 page-checked · 17 free entry confirmed · 1 paid entry · 184 unverified · 2 with no usable operator link (`thelines-survivor`, `squarespool`)
- Every unverified row shows *Unverified* and *Not confirmed* instead of a value
- Triage scores exist only for the 28 checked rows, and the arithmetic is printed under each score

## 7. Irregularities and review queue

Everything here is published with its source link and does **not** block publication.

1. **Challenge.gov is retired.** The HeroX row pointed at `challenge.gov`, which now says the platform was "sunset on March 30, 2026" and points to USA.gov. Row now uses <https://www.usa.gov/challenges>; original URL recorded on the row. (Also flagged on the supplemental page.)
2. **A "free" contest that charges.** Tom Howard/Margaret Reid Poetry: the operator page states "Fee: $27 per submission" and that the contest is closed until 2027-04-15. Marked *Paid entry*, excluded from the shortlist. <https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest>
3. **One URL cannot verify eight contests.** `fantasy.premierleague.com` is the source for 8 rows and `fantasyfootballscout.co.uk` for 4.
4. **25 rows link to news articles or blogs**, not rules pages.
5. **Two rows have no operator link** (TheLines survivor, SquaresPool). A non-operator article and an HTTP-only page were deliberately not substituted.
6. **ESPN contradicts itself** on entry limits: "Max Entries 10" in the game header, "up to five total" in one FAQ answer. Both recorded; nothing silently chosen.
7. **Givling is not a judged contest.** Payout depends on a crowdfunding queue and random Spinners, and the ledger's August status said "ended" while the operator site is active.
8. **Stale August labels.** 27 `ended`, 5 `mixed`, 11 `caution` rows from 2026-08-19; none repeated as current fact.
9. **Paid-entry and non-cash categories stay visible.** All 12 skill-tournament leads are paid cash rooms or non-cash free rooms; the 7 pool leads are participant-funded tools; 19 market-simulation leads are largely broker marketing.
10. **Headline prize ≠ cash.** The PayPal AI Hackathon advertises $67,500 cash / $69,750 total while its rules list individual awards including non-cash credits; the row shows no prize amount.
11. **Contradictory event page.** IceHacks 2026 advertises cash in its header while its description says there are no cash prizes (supplemental page).
12. **Ended events presented as current.** QHack 2026 closed 2026-10-23 and WiseTech's main competition ran 2026-08-14/15 (supplemental page).
13. **Tax claim overreach.** The reference site states flatly that US tax forms apply at $600+; IRS Publication 525 guidance is more conditional (supplemental page).
14. **Pages that only render in JavaScript** (Topcoder, Zindi, Reedsy entry lists) could not be read reliably and stay unverified.

## 7a. Cross-checks against the other sessions in this repository

Five sessions worked on this repo in parallel. Their work is preserved rather than replaced:

- **Verbatim second pass** (`d21e8702-own1`, `data/verification.json`): 12 rows verified with exact quoted wording, printed in full on `methodology.html`. It agrees with this pass on Wergle Flomp (free, $5,100), Tom Howard ($27 fee, closed), ESPN ($102,000, free), ARC ($2,000,000, closed 2026-11-02) and Metaculus (free, some pools zero). It could not reproduce a published prize ladder for the Weather Photographer of the Year, which is why that prize cell is blank here.
- **Rule-based ledger audit** (same session, `data/audit.json`): 11 findings over the imported catalogue — 12 listings with no official-tier source, 3 dollar figures with no official citation, 9 listings that are not competitions, 6 marked a free path although the description mentions a fee or deposit, 15 naming non-cash currency in the "free" payout copy. Summarised on `review.html`, full page in `archive/flagged.html`.
- **Supplemental audit** (`37aed701-own1`, `supplemental/index.html`): three hackathon leads plus flags on IceHacks, QHack, WiseTech, Papaya and the reference site's blanket $600 tax claim. Its Codex and PayPal rows were re-read in this pass and promoted into the main table.
- **Mobile pass** (`85ca8130-own1`): labelled mobile cards and a confirmed-free filter, carried into this build as the "Entry cost" control.
- Alternate page builds are kept working under `archive/`; nothing from any session was deleted during integration.

## 8. Verification performed

- **20 official pages read directly in this pass on 2026-11-01**, each with a stored `evidence` block: URL, date, facts copied, facts not stated. **8 further rows** carry a parallel session's official-page read recorded in `data/verification/batchA.jsonl`, attributed on the row and printed on `methodology.html`. Total checked: 28.
- `node tests/validate.mjs` → OK: 212 unique rows, 28 checked, 17 free confirmed, 14 pages, every local reference and asset resolves; unverified rows carry no values; only checked rows may be marked free.
- `python3 supplemental/check.py` → OK: supplemental rows each carry an official source link.
- Archived pages from the parallel build are link-checked by the same test, so integration did not leave dead links behind.
- `node tools/build.mjs` regenerates every page from the data; CI fails if committed pages drift from the data or if any table is forced wider than a phone viewport.
- GitHub Actions workflow `.github/workflows/validate.yml` runs the same checks on every push and pull request.

## 9. Recommendation

1. **This week:** Metaculus US Midterms (closes 2026-11-04) and ESPN NFL Pick'em — free, documented, no build work.
2. **If you write or shoot:** Wergle Flomp (open to 2027-04-01) and the Sony World Photography Awards (closes 2027-01-12).
3. **If you are building:** GEMS (closes 2026-12-03) or the next Kaggle cycle, with an agent-assisted pipeline and open-source compliance planned from day one.
4. **Do not start** the 2026 ARC cycle (submissions closed 2026-11-02) or any paid-entry skill room. Treat all 192 unverified rows as research tasks, not opportunities.

## 10. Links for manual review

- Live site: <https://sassnarep3-star.github.io/Own1/>
- Review queue: <https://sassnarep3-star.github.io/Own1/review.html>
- Method and sources: <https://sassnarep3-star.github.io/Own1/methodology.html> · [research/SOURCES.md](research/SOURCES.md)
- Supplemental audit: <https://sassnarep3-star.github.io/Own1/supplemental/index.html>
- Requirements list: [REQUIREMENTS.md](REQUIREMENTS.md) · Task board: [COORDINATION.md](COORDINATION.md)
- Reference ledger (a research lead, not an official prize source): <https://github.com/karagemop466-tech/FreeMoneyApps>
