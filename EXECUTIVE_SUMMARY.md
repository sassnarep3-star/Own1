# Executive summary — Free-to-enter cash-prize competition finder

**Current dashboard:** [PrizeDesk](https://sassnarep3-star.github.io/Own1/) · **Site repository:** [sassnarep3-star/Own1](https://github.com/sassnarep3-star/Own1) · **Audit snapshot:** 2026-11-02

## Executive view

This repository turns the [Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/) into a mobile-first, searchable dashboard for discovering competitions that may pay cash. The upstream catalogue itself says it is a long list with no search, filters, or sorting. The replacement site groups listings, supports filtering and search, provides a shortlist and analysis, and publishes verification limits and irregularities rather than treating every upstream claim as fact.

**The main decision:** do not rank opportunities by headline prize alone. Prefer competitions whose official terms explicitly establish free entry, a current deadline, cash awards, and eligibility that the entrant can meet. A prize pool is not an estimate of the chance or value of winning. No win probabilities or expected returns are calculated here.

## Snapshot — what is in the repository

| Measure | Current audited value | Interpretation |
| --- | ---: | --- |
| Canonical listings | 211 | 206 from the pinned upstream source file plus 5 separately attributed additions; the upstream site itself displays 206. |
| Categories | 9 | Skill, trivia, sports, creative, forecasting, market, tech, directories, and pools. |
| Official pages fetched in the 2026-11-01 verification snapshot | 12 loaded; 1 returned an error | 13 fetch outcomes in total; see the row-level record in [`data/live-checks.json`](data/live-checks.json). |
| Independent official-page cross-checks recorded | 10 rows | Cross-check details are retained in [`data/cross-checks.json`](data/cross-checks.json). |
| Official-tier sources cited but not re-opened in that pass | 177 rows | A source link is present; the page was not freshly confirmed in that pass. |
| Rows with no official-tier source in that pass | 11 | These claims are not suitable for verified prize/entry values until an operator source is found. |
| Prize amount blanked on the site | 80 | The build suppresses claims without the required official-source basis or a stated amount. |
| Irregularities in the snapshot register | 22 | Published on [Flagged for Review](https://sassnarep3-star.github.io/Own1/flagged.html). |
| Upstream data's declared review date | 2026-08-19 | 75 days before this report date; the catalogue is not a current guarantee. |

These are audit counts, not live availability counts. The pinned source marks 193 listings as having a full free path, 13 as having some free events, 4 as requiring paid cash entry, and 1 as unknown. Those labels originate in the source dataset and must **not** be read as 2026-11-02 official confirmations for every row. Of the 211 records, only the rows with directly checked evidence support current claims; unknown entry cost remains unknown.

## What was checked today and the strongest leads

A targeted official-source refresh was performed on 2026-11-02. It was not a full re-check of all 211 rows. The exact evidence and unresolved terms are recorded in [`data/verification/current-state-2026-11-02.md`](data/verification/current-state-2026-11-02.md).

1. **Best match for an AI coding agent — [Fall 2026 FutureEval Bot Tournament](https://www.metaculus.com/tournament/fall-futureeval-2026/).** The official tournament page states a $50,000 pool and a Jan 6, 2027 close; it is explicitly bot-only. Metaculus's [official competition rules](https://www.metaculus.com/tournament-rules/) state that no fee is required and generally prohibit bots from prizes unless a contest-specific exception applies. The tournament's bot-only format is why its specific rules and the [FutureEval bot resources](https://www.metaculus.com/notebooks/38928/ai-benchmark-resources/) must be read before building. API/model usage can still cost money, and no probability of winning is implied.
2. **Near-term human forecasting — [US Midterms 2026 on Metaculus](https://www.metaculus.com/tournament/midterms-2026/).** Its official page states a $10,000 pool and Nov 4 close. The general competition rules say no entry fee is required and allow AI assistance for human forecasters when their final forecasts reflect their own decisions and understanding. General rules may be overridden by tournament-specific terms; check those before participating.
3. **Near-term build competition — [Codex x TwitchCon Hackathon](https://twitchcon-codex.devpost.com/rules).** The official rules say no purchase/payment is required, require a Twitch-connected project built with OpenAI Codex, and list a Nov 2, 2026, 2 p.m. Pacific deadline. The official prize schedule is $10,000 / $6,000 / $4,000 plus two $2,500 runner-up awards; the event page calls this $25,000 total cash. It requires a repository, public YouTube demo, project description, and Codex session ID. Check the official deadline immediately and establish personal eligibility; the rules impose age, location, and other restrictions.
4. **High prize, free-entry status unknown — [GEMS Prize Challenge](https://www.drivendata.org/competitions/306/competition-doe-gems/).** The official DrivenData page states a $300,000 pool and Dec 3, 2026, 11:59 p.m. UTC end date. The inspected page does not say entry is free, so this is **not** labeled confirmed free here. Its [official-rules resource](https://www.herox.com/GEMSPrize/resource/2274) points to a separate rules document; read it before investing effort.
5. **Free, but restricted to eligible student teams — [Global Virtual Hackathon 2026](https://gvhackathon.com/).** The official page states free entry and a $1,000 first prize plus two $250 runners-up in each division. It is for students aged 14–18 in teams of 2–4 with a supervising teacher; registration closes Nov 13 AoE. The organizer says AI tools are allowed and expected, but team, teacher, consent, and authorship requirements apply.

**Location caveat:** user location is Singapore, but this audit does not determine eligibility for a particular person or contest in Singapore. Read the official rules for geographic restrictions, prize delivery, age, tax forms, and local law before committing time. Do not infer eligibility from a global marketing statement.

## What is wrong with the upstream experience

- **Hard to navigate on mobile:** the source says it is one plain list with no search, filters, or sorting. Entries are long cards with multiple blocks of details.
- **Different counts have different meanings:** its page and pinned file show 206 upstream listings, while this repository's combined catalogue has 211 after five attributed additions. The 211 figure must not be represented as the source site's total.
- **Staleness and status risk:** the pinned upstream data says it was last reviewed 2026-08-19. Its snapshot classifies 27 rows as ended/out of season, so a listing marked active by the source is not proof that entry is currently open.
- **Link and evidence gaps:** in the 2026-11-01 snapshot, 11 rows had no official-tier source, 6 lacked a rules URL, 117 used the signup URL as the rules URL, and one listed URL used HTTP. One App Store URL returned an error in the recorded fetch; this is a historical fetch result, not proof it is still broken today.
- **Mixed economics:** the source combines free-to-enter contests, free practice rounds that do not pay cash, paid-entry cash tournaments, promotional credit, directories, and pool software. These are not equivalent opportunities.
- **Not all prize text is a verified cash award:** the source's prize claims may be missing, stale, conditional, or non-cash. The site blanks unsupported amounts and publishes the reason in its review queue.

## What the rebuilt site provides

- A mobile-first dashboard and full searchable/filterable table at [the live site](https://sassnarep3-star.github.io/Own1/).
- A [complete listing page](https://sassnarep3-star.github.io/Own1/all.html), [best-picks shortlist](https://sassnarep3-star.github.io/Own1/best.html), and category/detail pages.
- [Analysis](https://sassnarep3-star.github.io/Own1/analysis.html), [source audit](https://sassnarep3-star.github.io/Own1/research.html), and [verification method](https://sassnarep3-star.github.io/Own1/verification.html).
- A prominent [Flagged for Review page](https://sassnarep3-star.github.io/Own1/flagged.html) with issues and evidence links.
- A pinned upstream input with checksum and provenance; static generated pages; build checks for internal links, listing coverage, and blank/unverified values.
- The older parallel Prize Atlas build preserved separately at [`archive/prize-atlas/`](archive/prize-atlas/); it is not the current root-site generator.

## How to choose where to spend effort

1. Start with the current official rules, not the shortlist badge. Confirm cash rather than points/credits, entry fee, deadline, and location/age eligibility.
2. Choose opportunities where the work matches your skills and the rules permit the intended AI use. For human Metaculus forecasting, the general terms require the forecasts to remain the participant's own decisions and understanding. FutureEval is specifically bot-oriented; its specific requirements apply.
3. Separate fixed prize schedules from large pools shared among many entrants. A larger headline does not mean a better chance or better value per hour.
4. Treat model/API costs, team requirements, identity/tax paperwork, and deliverable time as effort costs. This repository does not estimate expected value.
5. Re-check a contest immediately before entry. The site is a research index, not an operator, sponsor, guarantee, or legal/financial adviser.

## Verification, limits, and irregularities

- The 2026-11-01 snapshot identifies each check and source in `data/live-checks.json` and `data/verification.json`; the 2026-11-02 targeted refresh is separately recorded at [`data/verification/current-state-2026-11-02.md`](data/verification/current-state-2026-11-02.md).
- This turn did not re-fetch all 211 listings. The 177 source-cited-but-not-reopened rows, 11 no-official-source rows, and every current eligibility claim still need page-level review.
- Local `npm run check` passed: 555 HTML files and 13,563 internal references were checked with no broken local links; the root build completed for 211 listings, 211 detail pages, and 22 flags. The local link checker does not verify external websites or prove that a competition is still open.
- **Fresh evidence is not yet in the generated dataset or tables.** The new official reads are in the audit record only. A follow-up integration must merge any row changes into the current data pipeline, regenerate the site, and rerun checks before those reads are labeled live-checked on the published table.

## Sources for manual review

- [Original Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/)
- [Repository provenance and pinned source](data/source/PROVENANCE.json)
- [Current row-level verification snapshot](data/verification.json)
- [2026-11-02 official-source refresh](data/verification/current-state-2026-11-02.md)
- [All published irregularities](https://sassnarep3-star.github.io/Own1/flagged.html)
- [Metaculus tournament rules](https://www.metaculus.com/tournament-rules/)
- [FutureEval bot tournament](https://www.metaculus.com/tournament/fall-futureeval-2026/)
- [Codex x TwitchCon official rules](https://twitchcon-codex.devpost.com/rules)
- [GEMS Prize Challenge](https://www.drivendata.org/competitions/306/competition-doe-gems/)
- [Global Virtual Hackathon 2026](https://gvhackathon.com/)
