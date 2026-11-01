# Source audit — 2026-11-01 UTC

This file is the human-readable audit log. The machine-readable version that generates the site is [`research/facts.mjs`](facts.mjs); every value published in the tables comes from an entry there.

## Scope and method

The starting repository contained only `README.md`. The requested reference site is a separate repository, [FreeMoneyApps](https://github.com/karagemop466-tech/FreeMoneyApps), whose [`assets/data.js`](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js) holds 206 listings stamped 2026-08-19. That file is **not** an official source for any prize, window or qualification. It was used for one thing only: names, categories and candidate links. Its older `100_VERIFIED_CONTESTS.md` calls itself superseded and lists false claims, so it was not used at all.

A row is marked `verified` only when the organiser's own page was opened on 2026-11-01 and the displayed value copied as a quote. A row is `partial` when the page would not render its listings. Everything else is `unverified`, and keeps its prize, fee, deadline and fit score blank.

## Official pages read in this session

| Entry | Page read | What it establishes | What it does **not** establish |
| --- | --- | --- | --- |
| Codex x TwitchCon Hackathon | [rules](https://twitchcon-codex.devpost.com/rules) | No purchase necessary; 18+; submission 2026-10-23 → 2026-11-02 14:00 PT; AI coding assistants permitted; $25,000 in prizes (page title); sanction carve-outs incl. Brazil and Quebec | Does not state the individual prize split on the pages read; no guarantee of payment or of eligibility beyond rule 3 |
| PayPal AI Hackathon | [rules](https://paypalaihackathon.devpost.com/rules) | No purchase necessary; age of majority; submission 2026-10-01 → 2026-11-12 12:00 PT; free sandbox; any AI tool | Prize total — the event page and rules are reported to disagree, so no amount is asserted |
| ARC Prize 2026 | [competition](https://arcprize.org/competitions/2026) | $2M across three tracks; submissions 2026-11-02; papers 2026-11-08; open source required; no internet during Kaggle evaluation | Entry fee — not stated anywhere on the page |
| Kaggle | [competitions](https://www.kaggle.com/competitions) | Live prize events: ARC paper track $450,000 (8 days), NFL Big Data Bowl 2027 $100,000 (2 months), Gemma 4 paper track $35,000 (11 days) | Fee; also mixes unpaid "Getting Started" events with prize events |
| NFL Big Data Bowl 2027 | [index](https://www.kaggle.com/competitions) | $100,000; 2 months remaining | Full eligibility — on the competition page, not read here |
| DrivenData | [competitions](https://www.drivendata.org/competitions/) | One active prize competition; benchmarks and practice are unpaid | Entry fee |
| GEMS Prize Challenge | [competition](https://www.drivendata.org/competitions/306/competition-doe-gems/) | $300,000; "4 weeks left"; hosted by DOE | Entry fee |
| Metaculus | [tournaments](https://www.metaculus.com/tournaments/) | "You can participate for free and win cash prizes"; 13 funded tournaments, 4 with no prize pool; largest live pool $50,000 (FutureEval Bot Tournament) | Individual tournament eligibility and payout mechanics |
| US Midterms 2026 | [tournaments](https://www.metaculus.com/tournaments/) | $10,000 pool; "ends 3 days from now" (→ 2026-11-04, derived arithmetically) | — |
| ESPN NFL Pick'em | [how to play](https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay) | Free to play confirmed verbatim; $102,000 total; full prize table; no-purchase clause; void in PR/territories/Quebec | Whether 10 or 5 entries is current — the page contradicts itself |
| Wergle Flomp | [contest](https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free) | No fee to enter; $5,100 total; window 2026-08-15 → 2027-04-01; AI-written text prohibited | — |
| Tom Howard/Margaret Reid | [contest](https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest) | **$27 per submission**; $12,000 total; closed until 2027-04-15; AI text prohibited | — |
| Sony World Photography Awards | [awards](https://www.worldphoto.org/sony-world-photography-awards) | "free to enter"; $25,000 Series / $5,000 Single Image; 2027 deadlines: Single Image 2027-01-05, Series 2027-01-12 | Whether equipment-only Student/Youth prizes include cash |
| Environmental Photographer of the Year | [site](https://www.epoty.org/) | "free to enter ... around the world of all ages and experience levels" | Any cash amount — none is stated, so the prize cell is blank |
| Weather Photographer of the Year | [site](https://www.rmets.org/weather-photographer-of-the-year) | "free to enter"; all skill levels worldwide; dates shown without a year | Any cash amount |
| TradingView The Leap | [rules](https://www.tradingview.com/the-leap/tradestation-july-2026/rules/) | No purchase necessary; skill competition; paper trading only; competition period 2026-07-20 → 2026-08-14 (ended) | Prize amounts — not read, so blank |
| Givling | [site](https://givling.com/) | Crowdfunding queue: $50,000 queue + $50,000 exchange; points from purchases, ads and spinners | That it is a judged competition — it is not |
| Zindi, Topcoder, AIcrowd, XPRIZE | [Zindi](https://zindi.world/competitions), [Topcoder](https://www.topcoder.com/challenges), [AIcrowd](https://www.aicrowd.com/challenges), [XPRIZE](https://www.xprize.org/competitions) | Boards require JavaScript or sign-in; no listings rendered | Prizes, fees, deadlines — all left blank |

## Cross-cutting irregularities

All of these are published on the site's "Flagged for review" page with their source links. Summary:

1. Tom Howard/Margaret Reid is a **paid-entry** contest ($27) that the reference catalog implied was free.
2. TradingView's link points to an **edition that ended** 2026-08-14.
3. Givling is a **crowdfunding queue**, not a judged cash competition; its inherited "ended" status was stale.
4. **Ten links failed a real check**: DNS failures (`supercoach.news.com.au`, `fantasy.football.scot`, `fantazilig.tff.org`, `fantasyracing.telegraph.co.uk`), an expired certificate (`pensacolabeachsongwritersfestival.com`), a certificate name mismatch (`favorites.actionnetwork.com`), two 404s (`bracketchallenge.nhl.com`, `topcoder.com/challenges`), two timeouts (`fantasygaelicfootball.com`, `gaming.uefa.com`). Note that Topcoder served a sign-in shell in a browser despite the 404, so it is flagged as *unreliable*, not closed.
5. ESPN's own page states **both** "up to 10 entries" and "up to five total".
6. PayPal's hackathon page and rules are **reported to disagree** on the prize total; no figure asserted.
7. Challenge.gov was **sunset 2026-03-30** but still appears in the reference catalog.
8. EPOTY and Weather Photographer of the Year **publish no cash amount**; prize cells blank.
9. The reference site's blanket **"$600+" tax rule** is not a legal rule ([IRS Pub. 525](https://www.irs.gov/publications/p525), [Topic 419](https://www.irs.gov/taxtopics/tc419)).
10. Two leads (**TheLines**, **SquaresPool**) have no usable HTTPS operator URL; no substitute was invented.

## Verification status of the inherited catalog

- 190 of 211 rows remain unverified, with financial and timing fields blank.
- 4 rows are `partial` because their boards would not render.
- 21 inherited rows were labelled `ended`, 5 `mixed`, 11 `caution` in August 2026; none of those labels is displayed as a current fact.
- The reference dataset mixes paid-entry skill games, directories, group-funded pool software and non-cash credits. They are retained for completeness and **not** recommended as free-cash opportunities.

## Reproducing the checks

```bash
node scripts/build-data.mjs     # merge facts + leads + link health
node scripts/build-site.mjs     # regenerate every page
node tests/validate.mjs         # verification gate (fails on any unsourced or broken claim)
```

Link health is measured by `.github/workflows/link-health.yml` on a GitHub runner, because the environment that builds this repository can only reach GitHub. A 403/429 from that runner means the site refused a bot — **not** that the page is gone. That distinction is shown in the UI.
