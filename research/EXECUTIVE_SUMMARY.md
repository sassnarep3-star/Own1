# Executive summary — Prize Atlas

**Prepared:** 1 November 2026 · **Data:** 211 entries, 28 verified against an operator page, 3 platform indexes read, 180 unverified leads, 57 individual flags.
**Site:** https://sassnarep3-star.github.io/Own1/ · **Method:** [research/VERIFICATION.md](VERIFICATION.md) · **Live summary page:** `summary.html`

---

## 1. What was asked, and what was done

The reference site (`karagemop466-tech.github.io/FreeMoneyApps`) is a single scrolling page of 206
competition listings. It mixes free contests with paid-entry tournaments, bonus credit and pool
software, and its labels are six weeks old. This project turns it into a usable research tool:
a mobile-first dashboard with one row per competition, an evidence level per row, filters, a
shortlist ordered by a published rubric, and a review queue that shows exactly what could not be
confirmed.

Nothing was carried over as a fact. Every prize, entry cost, deadline and eligibility line in the
published site was read from the operator's own page on 1 November 2026 and is dated. Where the
page did not print a value, the field is empty. There are no estimates, averages, affiliate links
or "typical payout" guesses anywhere in the dataset.

## 2. The five findings that matter

1. **The reference catalogue is a lead list, not a source.** Taken at face value it would have put
   at least three non-free "free money" offers in front of a user: the Tom Howard/Margaret Reid
   poetry contest charges **$27 per submission**; Papaya's cash rooms are funded by **entry fees**
   (free rooms pay Gems, not dollars); HFM's demo contest pays **trading bonuses**, and its own FAQ
   says "No" to "Are the prizes real cash?".
2. **Genuine free-entry cash contests are seasonal and modest.** ESPN NFL Pick'em pays $102,000
   across a whole season, with 18 weekly prizes of $500 against a very large field. CBS Pro
   Football Pick'em pays $1,000 a week plus a $5,000 season prize and a $100,000 contingency prize
   that requires a perfect week including exact tiebreak scores. These are worth minutes a week,
   not hours.
3. **The only place where an AI coding agent changes your odds is data work.** Three Kaggle
   competitions were verified at competition level, not just as a platform: the Gemma 4 Developer
   Agent Competition ($110,000, entry 25 Nov 2026, final submission 2 Dec 2026), NFL Big Data Bowl
   2027 ($100,000, 6 Jan 2027) and Name That LLM ($50,000, 13 Jan 2027) — alongside ARC Prize
   ($2M, 2 Nov 2026) and the DOE GEMS challenge ($300,000, 3 Dec 2026). All are objective and
   scored, and the trade-off is the same everywhere: effort measured in days to weeks, prizes
   concentrated at the top. ARC Prize and Name That LLM both run with **no internet access at
   evaluation time**, so a hosted LLM cannot be part of the submitted solution, and Name That LLM
   showed 11,744 entrants against 10 paying places on the day it was read.
4. **Several "prizes" are not money.** Fantasy EFL pays footballs, merchandise, match tickets and a
   club season ticket. Official FPL advertises only "great prizes". PGA TOUR's imported prizes page
   returns a 404. Challenge.gov was shut down on 30 March 2026 and now only explains where it went.
   A blank prize cell in this dataset is doing real work.
5. **AI assistance is restricted more often than the marketing suggests.** Winning Writers
   contests ban AI-generated text outright; Prize Fest bans generated images; ARC Prize requires
   open-source solutions and offline evaluation. Read the AI clause before planning an AI-heavy
   entry.

## 3. Where to spend time, in order

| Horizon | Action | Why it ranks here |
| --- | --- | --- |
| This week | Metaculus US Midterms 2026 ($10,000, closes 4 Nov) and any open Metaculus tournament with a printed pool; the NFL pick'em weeks that are still open (ESPN, CBS) | Free entry and a printed pool, minutes of effort per week, no signup cost |
| This month | ARC Prize (2 Nov), Gemma 4 Developer Agent (25 Nov entry / 2 Dec submission), GEMS (3 Dec), Sony World Photography Awards (Student 27 Nov, Single Image 5 Jan) | Large verified prizes with deadlines a focused effort can still reach |
| This quarter | NFL Big Data Bowl 2027 (6 Jan), Name That LLM (13 Jan), and a repeatable pipeline for Kaggle / DrivenData / AIcrowd via the ML Contests index | The only categories where an agent materially improves the result |
| Ignore | Papaya-style cash rooms, broker demo contests paying bonuses, pool software, anything still marked *unverified lead* | Paid entry, non-cash prizes, or no evidence at all |

## 4. Verification status

| Measure | Count |
| --- | --- |
| Entries tracked | 211 |
| Verified against an operator page | 28 |
| Platform indexes read (per-event terms vary) | 3 |
| Still unverified leads | 180 |
| Entries with free entry **and** a printed cash prize | 11 |
| Individual flags raised on rows | 57 |
| Documented irregularities on the review page | 11 |

The 11 free+cash entries are ESPN NFL Pick'em, ESPN College Pick'em, ESPN NFL Survivor (entries
closed), CBS Pro Football Pick'em, MLB Beat the Streak (season closed), Metaculus tournaments,
Metaculus US Midterms 2026, Deriv's monthly tournament, Wergle Flomp, the Sony World Photography
Awards and the Tom Howard poetry prize — the last of which also charges a fee and is therefore
**not** counted as free. The site's shortlist separates these cases by tier rather than hiding them.

## 5. Irregularities found (all published on the review page)

| Problem | Example | Source |
| --- | --- | --- |
| Broken imported link | Challenge.gov sunset 30 Mar 2026 | https://www.challenge.gov/ |
| Broken imported link | PGA TOUR Fantasy prizes page returns 404 | https://fantasygolf.pgatour.com/prizes |
| Wrong destination | Louisiana Film Prize link lands on the Photo Prize rules | https://prizefest.com/photo/rules/ |
| Source unavailable | Yahoo Survival Football outage page | https://football.fantasysports.yahoo.com/public/survival |
| Unreadable source | Kaggle, AIcrowd, Zindi, Topcoder, UCL Fantasy return JavaScript shells | https://www.kaggle.com/competitions |
| Misleading prize | HFM demo contest pays trading bonuses | https://www.hfm.com/int/en/promotions/demo-contest |
| Not free | Tom Howard poetry ($27/submission); Papaya cash rooms (entry-fee funded) | https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest |
| AI restriction | Winning Writers ban AI-generated text; Prize Fest bans generated images | https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free |
| Internal contradiction | ESPN entry limit: "up to 10" vs "up to five total" on the same page | https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay |
| Missing source | Two imported rows have no usable HTTPS operator link | https://karagemop466-tech.github.io/FreeMoneyApps/ |
| Stale data | All 206 imported names carry an August 2026 stamp; none of its status labels were reused | https://karagemop466-tech.github.io/FreeMoneyApps/ |

## 6. Risks and rules that apply almost everywhere

- US tax reporting starts at $600 of prizes in a year; operators require a tax form before paying.
- "Free" is usually restricted to the 50 US states plus DC, 18+ (21+ for MLB Beat the Streak);
  ESPN and MLB void Quebec, Puerto Rico and other territories.
- "Up to" and crowdfunded totals are ceilings, not guaranteed sums (Givling's $100,000).
- Demo-trading contests measure simulated performance and say nothing about real trading.
- No legitimate operator charges a fee to release a prize.
- Contests close, pages move and rules change. The `verifiedOn` date on each row is the only
  currency; anything older than a season should be re-checked before you act on it.

## 7. What would make this materially better

1. Work through the 180 unverified leads one operator page at a time — the single highest-value task
   left, and the reason the queue is published rather than hidden.
2. Diarise the two windows that reopen: MLB Beat the Streak (March) and the Tom Howard poetry
   contest (15 April 2027).
3. Replace JavaScript-only platform indexes with individual competition pages only when a
   competition is actually entered — the index cannot be verified, and pretending otherwise would
   be the one thing this dataset refuses to do.

## 8. How the site is built and checked

Static HTML generated from `data/*.json` by `scripts/build.mjs`; no frameworks, no external fonts,
no tracking. `tests/validate.mjs` enforces the schema, the blank-field policy (an unverified row
cannot carry a prize, fee or deadline), https-only sources, a verification date on every checked
row, every internal link, and that every entry appears in the static table. `tests/links.mjs`
reports external link reachability as an advisory job, because operator sites block automated
requests and a 200 response is not evidence of a prize. The build check fails the workflow if a
committed page drifts from its data.
