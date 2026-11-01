# Source audit — 2026-11-01 UTC

## Scope and method

The starting repository had only `README.md` (`# Own1`). The requested reference site is a separate repository: [FreeMoneyApps](https://github.com/karagemop466-tech/FreeMoneyApps). Its [ledger data](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js) holds 206 listings, last stamped 2026-08-19. This is **not** an official source for any prize, current entry window, or qualification. Its older [100_VERIFIED_CONTESTS.md](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/100_VERIFIED_CONTESTS.md) calls itself superseded and lists false claims. We imported listing names and category IDs as *unverified leads*, not verified facts. The listed source URL is a research lead unless explicitly checked below. Unverified row fields (prize, fee, deadline) remain empty. No automatic link-check result should be confused with official rule verification.

## Official pages manually read on 2026-11-01 UTC

| Listing | Official page checked | Confirmed / limitations |
| --- | --- | --- |
| ESPN NFL Pick'em | https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules | FAQ says free; total $102,000; includes $5,000 random drawing; game dates through Jan 10, 2027 shown on ESPN picks page. ESPN FAQ also contradicts itself about max entries (5 vs 10): rely on rules/current UI. |
| ARC Prize 2026 | https://arcprize.org/competitions/2026 | $2M across three tracks; Nov 2 submission deadline and Nov 8 paper deadline; open-source requirement; no internet during Kaggle evaluation. Fee not stated on page. |
| Metaculus Tournaments | https://www.metaculus.com/tournaments/ | Platform explicitly says free participation for cash prizes; some listed tournaments have NO PRIZE POOL. |
| Kaggle Competitions | https://www.kaggle.com/competitions | Featured competitions have prizes; practice/other competitions need event-by-event checks. |
| DrivenData Competitions | https://www.drivendata.org/competitions/ | Separates prize competitions from benchmarks/practice; exact entry terms vary. |
| GEMS Prize Challenge | https://www.drivendata.org/competitions/306/competition-doe-gems/ | $300k total; ends Dec 3 2026 at 23:59 UTC; fee not stated on inspected page. |
| Metaculus US Midterms 2026 | https://www.metaculus.com/tournament/midterms-2026/ | $10k pool; closes Nov 4 (year from title), subject to tournament rules. Free entry confirmed at Metaculus tournaments page above. |

## Irregularities / review queue

- 201 of the 208 rows are **not individually checked against their current operator rules**; they appear as unverified leads with financial and timing fields blank. A URL labeled official in the old ledger does not itself verify anything. Some links may be stale or broken.
- 2 legacy rows (`thelines-survivor` and `squarespool`) show no usable HTTPS operator source link; a non-operator article and an HTTP-only page were deliberately not substituted.
- 27 legacy records were labeled `ended`, 5 `mixed`, 11 `caution` in August; none of these statuses proves their situation today. Do not treat an unverified lead as currently open or free.
- Old dataset includes paid-entry skill games, directories, group-funded pool software, and non-cash credits. They are kept for completeness, *not* recommended as free-cash opportunities.
- The legacy `fanatics-survivor` uses a bookmaker URL and a third-party news article for a large prize claim. No current operator contest rules verified; do not quote that prize.
- Historical ESPN entry limits conflict on its own FAQ: FAQ says five while intro and current picks UI say ten. Check official rules before submission.
- ARC Prize 2026 deadline is imminent (Nov 2), and automation via network APIs cannot run inside Kaggle evaluation according to ARC rules.
