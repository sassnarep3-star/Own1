# Executive summary — Free-to-enter cash-prize competition finder

**Dashboard:** [PrizeDesk](https://sassnarep3-star.github.io/Own1/) · **Source site:** [Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/) · **Audit date:** 2026-11-02

## Executive view

The upstream ledger is a discovery catalogue of competitions that may pay cash. Its page states it has no search, filters, or sorting. PrizeDesk reorganizes the catalogue into a mobile-first dashboard with category pages, a searchable/filterable table, a Verified shortlist, per-listing detail pages, analysis, verification guidance, and a Flagged for Review page.

The upstream file contains **206 listings**. The current combined repository dataset contains **221 rows**: those 206 pinned records plus 15 separately attributed additions. These totals describe different datasets.

**Do not rank by headline prize alone.** First confirm on the official rules page that entry is free, the award is cash, the deadline is still open, the entrant is eligible, and the rules permit the intended AI use. A prize pool is not a win estimate. No odds or expected returns are calculated here.

## Current verification snapshot

| Measure | Value | What it means |
| --- | ---: | --- |
| Combined listings | 221 | 206 upstream records + 15 attributed additions |
| Categories | 9 | Skill, trivia, sports, creative, forecasting, market, tech, directories, and pools |
| Upstream says full free path | 196 | Source classification, not current official confirmation for every row |
| Upstream says some free events / paid cash / unknown | 14 / 4 / 7 | Source classifications; verify each specific contest |
| Official URL fetches in the 1 Nov base pass | 12 loaded; 1 error | 13 fetch outcomes; not the same as later independent checks |
| Independent official-page checks | 22 rows | 25 check records are retained with dates and reader attribution |
| Official-tier URL cited but not reopened in the base pass | 175 rows | Source cited, not freshly fetched in that pass |
| No official-tier source in the current verification output | 11 rows | Prize/entry claims remain unsupported by an operator-tier source |
| Prize amount blanked | 80 rows | No qualifying official support or no amount stated |
| Flagged irregularities | 31 | Published on [Flagged for Review](https://sassnarep3-star.github.io/Own1/flagged.html) |
| Pinned upstream review date | 2026-08-19 | 74 days before the 1 Nov base verification snapshot |

The free-path counts above are imported source labels, not independently confirmed offers. Unknown entry cost remains unknown. The 2026-11-02 official reads were integrated as cross-check evidence and on the Verified shortlist; they do not mean every row was freshly fetched or every entry is currently open.

## Best current leads for an AI-assisted entrant

These are examples from official pages read by this project on 1–2 Nov 2026. They are not guarantees or a ranking by probability of winning. The [Verified shortlist](https://sassnarep3-star.github.io/Own1/shortlist.html) shows sourced closing dates and restrictions; read the operator's latest terms before starting.

1. **AI-bot contest — [Metaculus Fall 2026 FutureEval Bot Tournament](https://www.metaculus.com/tournament/fall-futureeval-2026/).** Official page: $50,000 pool, bot-only format, closes 6 Jan 2027. [Metaculus's general rules](https://www.metaculus.com/tournament-rules/) say there is no participation fee but generally exclude bots from prize eligibility unless contest-specific terms permit them. The bot-tournament [resource page](https://www.metaculus.com/notebooks/38928/ai-benchmark-resources/) is essential reading. Model and search calls may cost money; the repository flags these running costs as I-30.
2. **Human forecasting — [US Midterms 2026 on Metaculus](https://www.metaculus.com/tournament/midterms-2026/).** Official page: $10,000 pool, closes 4 Nov. General Metaculus rules say no entry fee is required and permit AI assistance for human forecasters when final forecasts reflect the participant's own decisions and understanding. Check the tournament-specific terms; this is not a bot-prize contest.
3. **Time-critical software build — [Codex x TwitchCon Hackathon](https://twitchcon-codex.devpost.com/rules).** Rules state no purchase/payment is necessary. The event page says $25,000 total cash; the rules list $10,000 first place, $6,000 second, $4,000 third, and two $2,500 runner-up prizes. It requires a Twitch-connected project built with OpenAI Codex, code repository, public YouTube demo, project description, and Codex session ID. The official deadline was 2 Nov at 2 p.m. Pacific; check immediately whether entry has closed. I-26 flags the time-critical close.
4. **High pool, entry cost unknown — [GEMS Prize Challenge](https://www.drivendata.org/competitions/306/competition-doe-gems/).** DrivenData states a $300,000 pool and 3 Dec close. Free entry was not stated on the inspected competition page. The latest source review flags U.S.-based eligibility and a closing-time discrepancy (I-29); read the official rules before investing effort.
5. **Student teams only — [Global Virtual Hackathon 2026](https://gvhackathon.com/).** The organizer states free entry and, in each division, a $1,000 first prize plus two $250 runner-up prizes. Participants must be students aged 14–18 in teams of 2–4 with a supervising teacher. Its policy explicitly permits and expects AI tools; registration closes 13 Nov AoE.

The latest review also found tool-locked competitions (Codex, Kiro, Atlassian Forge), offline-only evaluation restrictions, and contests whose headlines do not match prize type. See I-25–I-30 on the review page and the official sources attached to each Verified shortlist row.

**Singapore eligibility caveat:** this audit does not establish that a specific person in Singapore is eligible for any event. Confirm geographic restrictions, prize payment, age, sanctions/export terms, and local law directly with the operator.

## What was wrong with the upstream experience

- **Mobile discovery:** the source page explicitly says there is no search, filters, or sorting; users must scroll or jump to sections.
- **Different totals:** the source dataset has 206 listings; the repository has 221 after 15 attributed additions. The combined number is not an upstream count.
- **Stale statuses:** upstream data declares a review date of 2026-08-19. The snapshot labels 27 entries ended or out of season, but the rest are not thereby confirmed open today.
- **Link and evidence gaps:** the base verification identified 11 rows without an official-tier source, 6 without rules URLs, 117 using the signup link as the rules link, and one HTTP URL. One App Store URL returned an error in a dated fetch; this does not prove it is still broken.
- **Mixed economics:** the list mixes genuinely free entries, free practice that pays no cash, paid-entry cash tournaments, non-cash credits, directories, and pool software.
- **Unsupported amounts:** 80 prize cells are blanked where a supported amount is absent. A headline amount, a past award, or promotional credits are not treated as confirmed cash winnings.

## Site map

| Page | Purpose |
| --- | --- |
| [Dashboard](https://sassnarep3-star.github.io/Own1/) | Searchable/filterable overview and ranked picks |
| [All competitions](https://sassnarep3-star.github.io/Own1/all.html) | Full table |
| [Verified shortlist](https://sassnarep3-star.github.io/Own1/shortlist.html) | Newly reread, deadline-sorted rows with official sources |
| [Category pages](https://sassnarep3-star.github.io/Own1/categories/sports.html) | Nine category subpages |
| [Analysis](https://sassnarep3-star.github.io/Own1/analysis.html) | Dataset coverage and findings |
| [Verification method](https://sassnarep3-star.github.io/Own1/verification.html) | Evidence statuses and method |
| [Flagged for Review](https://sassnarep3-star.github.io/Own1/flagged.html) | 31 documented irregularities |
| [Executive summary](https://sassnarep3-star.github.io/Own1/executive-summary.html) | This summary as a generated web page |
| [`data/verification/current-state-2026-11-02.md`](data/verification/current-state-2026-11-02.md) | Targeted source reads and integration update |
| [`docs/SESSION-7a477419.md`](docs/SESSION-7a477419.md) | Detailed record of the latest 10 sourced additions and checks |

## Verification and limitations

- The source file is pinned by repository commit and SHA-256 in [`data/source/PROVENANCE.json`](data/source/PROVENANCE.json). It is third-party research, not an official contest document.
- The 1 Nov base pass has 13 live-fetch outcomes (12 loaded, one error). The 2 Nov integration adds 25 official-page check records across 22 rows, with dates and reading session recorded. A link cited by the dataset is not the same as a freshly fetched page.
- 175 entries cite an official-tier source that was not reopened in the 1 Nov base pass; 11 entries have no official-tier source in the current output. Each should be reviewed before relying on its details.
- `npm run build` and `npm run check` validate the generated data, pages, and internal links. They do not crawl external links or prove a contest remains open.
- The source-to-site pipeline keeps unsupported prize and entry fields blank and displays flags. Tax, legal eligibility, contest outcome, and probability of winning are not assessed.

## Official sources for manual review

- [Original Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/)
- [Metaculus tournament rules](https://www.metaculus.com/tournament-rules/)
- [FutureEval Bot Tournament](https://www.metaculus.com/tournament/fall-futureeval-2026/)
- [US Midterms 2026](https://www.metaculus.com/tournament/midterms-2026/)
- [Codex x TwitchCon official rules](https://twitchcon-codex.devpost.com/rules)
- [GEMS Prize Challenge](https://www.drivendata.org/competitions/306/competition-doe-gems/)
- [Global Virtual Hackathon 2026](https://gvhackathon.com/)
- [Full 2 Nov source audit](data/verification/current-state-2026-11-02.md)
- [Current data and cross-checks](data/verification.json) · [latest session record](docs/SESSION-7a477419.md)
