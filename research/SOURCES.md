# Source audit and verification log — 2026-11-01 UTC

This file records what was actually read, what it said, and what remains unverified. The published
version of this material is the [Method page](../method.html) and the
[Flagged for review page](../review.html).

## 1. Scope

- **Reference catalogue:** <https://karagemop466-tech.github.io/FreeMoneyApps/> — repository
  <https://github.com/karagemop466-tech/FreeMoneyApps>, data file `assets/data.js`, pass "S",
  stamped **2026-08-19**, 206 listings.
- **Starting repository:** `sassnarep3-star/Own1` at commit `90a7908`, which contained a first-pass
  static site (208 rows, 7 rows checked).
- **This pass:** 206 listings re-imported as unverified leads, 44 rows verified against operator
  pages, 16 irregularities documented, site rebuilt as a mobile-first dashboard.

The reference catalogue is **not** an official source for any prize, entry window or eligibility rule.
A URL that the catalogue labels "official" is a pointer to be checked, not evidence.

## 2. Method

1. Read the reference data file directly (`assets/data.js`) and imported only: id, name, category,
   source URL, legacy prize text, legacy status, legacy free-path label, legacy description.
2. Stripped every prize, fee, deadline and eligibility field to an empty string. A lead row therefore
   shows blanks plus the legacy claim, labelled unverified.
3. Ran a DNS check over all **223** distinct hostnames in the catalogue. Six did not resolve.
4. Opened operator pages for the categories where free entry plus cash is plausible, and recorded only
   what those pages state. Countdowns ("8 days to go") were recorded as notes, never converted to dates.
5. Cross-checked conflicting statements on the same operator page and published both values.

## 3. Operator pages read on 2026-11-01

| Page | What was confirmed |
| --- | --- |
| <https://fantasy.espn.com/games/nfl-pickem-2026/picks> and <https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay> | Free to play; $102,000 across 58 prizes; game dates 09/09/2026–01/10/2027; prize ladder; $5,000 random drawing; the page contradicts itself on the entry limit (10 vs five) |
| <https://fantasy.espn.com/free-prize-games> | ESPN free-to-play games index; related tile for College Pick'em ("LIVE • Sep 5 – Dec 5") |
| <https://www.cbssports.com/fantasy/football/games/pickem/rules> | 2026 Pro Football Pick'em: free, 18+, 50 states + DC, 2026-09-09 to 2027-01-10, 18 × $1,000 weekly, $5,000 season, $100,000 contingency |
| <https://www.cbssports.com/fantasy/college-football/games/pickem/rules> | College Pick'em: free, 18+, 50 states + DC, 2026-09-05 to 2026-11-28; prize amounts not read this pass |
| <https://www.kaggle.com/competitions> | Hub states "Featured: premier challenges with prizes"; cards for ARC Prize 2026 Paper Track ($450,000, "8 days to go"), NFL Big Data Bowl 2027 ($100,000, "2 months to go"), Gemma 4 Developer Agent Paper Track ($35,000, "11 days to go") |
| <https://arcprize.org/competitions/2026> | $2M across three tracks; submissions due 2026-11-02, papers 2026-11-08, results 2026-12-04; open-source requirement; no internet during Kaggle evaluation |
| <https://www.drivendata.org/competitions/> | Index separates prize competitions, benchmarks and practice |
| <https://www.drivendata.org/competitions/306/competition-doe-gems/> | $300,000 total; ends Dec. 3, 2026, 11:59 p.m. UTC; prize ladder; eligibility deferred to rules page |
| <https://devpost.com/hackathons> | Listing data for the nine Devpost events recorded (dates and prize totals as shown) |
| <https://paypalaihackathon.devpost.com/> | Deadline 2026-11-12 15:00 EST; eligibility (age of majority, all countries with standard exceptions); deliverables; page states both $67,500 cash and $69,750 total prizes |
| <https://www.metaculus.com/tournaments/> | 19 tournaments; "$10,000 PRIZE POOL", "NO PRIZE POOL" labels and end-countdowns recorded verbatim; operator states participation is free |
| <https://www.worldphoto.org/sony-world-photography-awards> | Free to enter; Series $25,000, Single Image $5,000; Student and Youth prizes are equipment; closes 2026-11-27 (Student), 2027-01-05 (Single Image, Youth), 2027-01-12 (Series) |
| <https://vocal.media/resources/challenges-frequently-asked-questions> | Free entry; 13+; Stripe countries only; cash paid through Stripe |
| <https://givling.com/> | Queue and Exchange mechanics; up to $50,000 + $50,000; $10,814,664 crowdfunded to date |
| <https://www.xprize.org/competitions> | Active purses: Quantum Applications $5M, Water Scarcity $119M, Healthspan $101M; Wildfire $11M in "Finals" |
| <https://www.cbssports.com/games/> | Returned "this page has been moved or deleted" — recorded as a link-rot finding |

Pages fetched but **not** usable as evidence:

- <https://www.aicrowd.com/challenges> — the challenge taxonomy rendered as spam tags, no reliable prize data.
- <https://zindi.africa/competitions> — redirects to zindi.world and renders client-side; no listing data returned.
- <https://www.worldpressphoto.org/contest> — page returned only a heading and a link; no prize figures, so the World Press Photo lead stays unverified.
- <https://www.cbssports.com/games/> — 404 as noted above.

## 4. Irregularities (published on the Flagged for review page)

1. All 206 legacy listings carry a prize claim; 143 contain an explicit dollar figure; none is re-established against a current rules page.
2. Six source domains do not resolve: `supercoach.news.com.au`, `fantasyfootball.skysports.com`, `fantasy.football.scot`, `fantazilig.tff.org`, `fantasy.premiershiprugby.com`, `fantasyracing.telegraph.co.uk`.
3. One listing (`squarespool`) has only an http:// source and no secure alternative.
4. 26 listings marked "ended" still carry a "full free path" label.
5. 68 listings describe non-cash or mixed rewards (gift cards, merchandise, bonus currency, gems, coins, partial free paths).
6. 15 listings include an affiliate-tier source and 4 a forum-tier source.
7. `thelines-survivor` is sourced to a URL pinned to week 1 of the 2024 season.
8. Several mini-league rows link to `fantasy.premierleague.com`, the host platform, not the league operator.
9. ESPN's NFL Pick'em page states two different entry limits.
10. The PayPal AI Hackathon page states two different prize totals.
11. Devpost's DSH Hacks V2 card says "5 non-cash prizes" while its title advertises "$100k+ in prizes".
12. ARC Prize's stated paper deadline and Kaggle's countdown differ by about a day.
13. `100_VERIFIED_CONTESTS.md` in the reference repository declares itself superseded; it was not used.
14. CBS Sports' `/games/` path is a 404 while its deep rules URLs load.
15. Four categories have no verified entry (skill, market, pools, directories).
16. The reference site itself has no search or filters — the usability problem this rebuild addresses.

## 5. What remains unverified

- 205 lead rows: name, category and a legacy source pointer only. Prize, fee, deadline, eligibility,
  work required and payout are blank by policy.
- Hackathon totals read from Devpost are "in prizes", not confirmed "in cash".
- Eligibility for most verified rows is either the operator's summary wording or deferred to a rules
  page that was not opened; where that happened the row says so.
- External deep-link reachability is spot-checked, not certified.

## 6. Reproduce

```bash
git clone --depth 1 https://github.com/karagemop466-tech/FreeMoneyApps /tmp/fma
node scripts/import_legacy.mjs /tmp/fma/assets/data.js > data/legacy.json
node scripts/build.mjs
node tests/validate.mjs
```
