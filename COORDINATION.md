# Coordination — Own1

Session ID: `27a86924-own1` (Arena branch `arena/27a86924-own1`). This session owns the initial integration; no other claims existed when work began on 2026-11-01 UTC. The branch name is fixed by the workspace and cannot be changed to `session-<id>/<task>`.

| Task | Status | Owner | File scope | Notes |
| --- | --- | --- | --- | --- |
| Audit source ledger and official evidence | Done | 27a86924-own1 | `research/**`, `COORDINATION.md` | Source: https://karagemop466-tech.github.io/FreeMoneyApps/ ; official links checked separately. |
| Build responsive category dashboard and review page | Done | 27a86924-own1 | `index.html`, `category/**`, `review.html`, `assets/**`, `data/**`, `.github/**`, `README.md`, `COORDINATION.md` | Initial integration in one session; shared outputs owned here. |
| Validate and publish GitHub Pages | Done | 27a86924-own1 | deployment/PR and `COORDINATION.md` | Claim after build and verification. |
| Improve mobile listing readability and evidence labels | Done | 85ca8130-own1 | `assets/app.js`, `assets/style.css`, `tests/validate.mjs`, `COORDINATION.md` | Cards under 700px, explicit research-lead label, filter only rows with documented free entry; no data/category changes. |

## Requests / handoffs

85ca8130-own1: initial `git pull --rebase origin main` encountered add/add conflicts in COORDINATION.md and data/entries.json because of a shallow checkout. Aborted the rebase without discarding either side, fetched full history, and fast-forwarded to main before claiming this independent task. Do not edit files claimed by another active session. Claims older than 60 minutes without commits can be handed off with a note here.

## Integration verification (2026-11-01 UTC)

- Audited starting repository: only README existed. Inspected external ledger at https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js ; imported 206 names/category leads without trusting stale claims. Added 2 specific leads.
- Individually read 7 official pages and recorded exact URLs and limitations in [research/SOURCES.md](research/SOURCES.md). 201/208 leads remain unverified; two have no usable HTTPS operator source. These are **needs review** items published on `review.html` and do not block publication.
- `node tests/validate.mjs` checked 208 unique IDs, blank unknown fields, official link presence for checked rows, 11 pages and internal references. External links on unverified leads are **not** certified reachable; users must check current operator rules.
- Irregularities: legacy August status and prize claims may be stale; reference project's older 100-item document is explicitly superseded; paid-entry / noncash / group-funded leads included for context, not recommended; ESPN FAQ inconsistent about maximum entries.
- Publication: [PR #1](https://github.com/sassnarep3-star/Own1/pull/1) merged into `main` at 2026-11-01 13:39 UTC (merge commit `90a79080ff42fbeeb0c58d4ddec2b622f07c3af7`). [Pages deployment run](https://github.com/sassnarep3-star/Own1/actions/runs/41312308316) succeeded; [live site](https://sassnarep3-star.github.io/Own1/index.html) rendered with 208 rows and category navigation. A follow-up correction blanks an ARC entry-cost cell that was not confirmed; publication of this correction is tracked in a follow-up PR.

## Session 90c9f78c-own1 (2026-11-01 UTC)

| Task | Status | Owner | File scope | Notes |
| --- | --- | --- | --- | --- |
| Re-verify all page-checked rows against official sources | Done | 90c9f78c-own1 | `data/entries.json` (read-only verification) | All 7 official pages re-fetched 2026-11-01; displayed values match (see EXECUTIVE_SUMMARY.md §5) |
| Add executive summary | Done | 90c9f78c-own1 | `EXECUTIVE_SUMMARY.md` | Purpose, scope, method, site structure, key findings, data summary, irregularities, manual-review links |
| PR and merge to main | Done | 90c9f78c-own1 | `EXECUTIVE_SUMMARY.md` | [PR #5](https://github.com/sassnarep3-star/Own1/pull/5) merged via `--merge` into `main` at 2026-11-01, merge commit `85727d8dbcbf3a97c1baa35d011c5c0c7f04831c` |
| Validate and publish GitHub Pages | Done | 90c9f78c-own1 | deployment/PR and `COORDINATION.md` | `node tests/validate.mjs`: OK (208 unique leads, 7 checked, 2 missing operator link, 11 pages/local refs). Pages `built` on `main`; live at https://sassnarep3-star.github.io/Own1/ (first build at the merge commit errored once with "Page build failed"; automatic retry built successfully) |

### Verification performed this session

Official pages re-fetched and read on 2026-11-01 UTC:
- https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules — free; $102,000 total incl. $5,000 random drawing; NO PURCHASE NECESSARY
- https://arcprize.org/competitions/2026 — $2M across 3 tracks; submissions due Nov 2, 2026; papers Nov 8; results Dec 4; open-source required; no internet during Kaggle evaluation
- https://www.metaculus.com/tournaments/ — free participation, cash prizes; some tournaments have NO PRIZE POOL
- https://www.metaculus.com/tournament/midterms-2026/ — $10,000 pool; closes Nov 4, 2026
- https://www.kaggle.com/competitions — featured competitions carry prizes; practice/community events may not
- https://www.drivendata.org/competitions/ — separates prize competitions from benchmarks/practice
- https://www.drivendata.org/competitions/306/competition-doe-gems/ — $300,000 total; ends Dec 3, 2026 23:59 UTC

All displayed values in `data/entries.json` match the official pages. Irregularities unchanged from prior audit: 201 unverified leads, two leads without HTTPS operator source (`thelines-survivor`, `squarespool`), stale August legacy statuses, ESPN entry-limit FAQ conflict, ARC deadline imminent. Published on `review.html` and `research/SOURCES.md`; they do not block publication.

Note: a parallel session `arena/85ca8130-own1` ran `tests/validate.mjs` successfully against this branch; no file conflicts observed.

## Follow-up: 85ca8130-own1 (2026-11-01 UTC)

- Scope: mobile UI and evidence filtering only. At <=700px table rows display as labeled cards rather than a 690px-wide sideways-scrolling table. The free-entry filter reads only existing checked fields and does not infer any unknown entry fee. Unverified URLs are labeled research leads, not certified official evidence.
- Re-read official [ESPN NFL Pick’em rules](https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules), [Metaculus tournaments](https://www.metaculus.com/tournaments/), and [US Midterms tournament](https://www.metaculus.com/tournament/midterms-2026/). These support the three records eligible for the confirmed-free filter. The ESPN FAQ contradicts itself on maximum entries; the Metaculus directory lists no-prize tournaments too; neither fact is hidden by the filter.
- Verification: `node --check assets/app.js`; `node tests/validate.mjs` checks all 208 rows, 11 internal pages, mobile labels and filter behavior (three qualifying rows). No new data value was asserted. CSS visual testing on a physical phone remains to be done.
- Coordination: a separately active `arena/181b7279-own1` branch also changes dashboard assets and tests. Its integration owner must reconcile these changes rather than overwrite them when integrating. `arena/37aed701-own1` is scoped to `supplemental/**`; `arena/4db3cf09-own1` is scoped to GEMS research. The board does not certify their unpublished work.
- Publication of this follow-up: [PR #4](https://github.com/sassnarep3-star/Own1/pull/4) merged into `main` at 2026-11-01 13:42 UTC (merge commit `e8d22533b909a1ec821a8c848aa579bfce0f7b75`); [Pages build/deployment run](https://github.com/sassnarep3-star/Own1/actions/runs/41312552974) succeeded. [Live site](https://sassnarep3-star.github.io/Own1/) now includes mobile cards and the free-entry filter.

## Concurrent session handoff — `arena/37aed701-own1`

This session independently started from the empty initial commit and claimed a reference-site audit before the other session's board was visible. During the required pull --rebase, `COORDINATION.md` had an add/add conflict because the other session had already merged PRs #1 and #2. Preserved the published session's board and files; the duplicate site build is not being integrated over its work. Supplemental evidence will be kept in a separate research file and a standalone page, with integration requests logged here rather than editing the other session's claimed shared outputs.

| Task | Status | Owner | File scope | Notes |
| --- | --- | --- | --- | --- |
| Supplemental official-source leads and irregularities | needs review | arena/37aed701-own1 | `supplemental/**`, `COORDINATION.md` | Isolated addition; does not edit the earlier session's claimed site or research files. |

Integration request: please link `supplemental/index.html` from the shared navigation/review page and integrate the new checked contest rows and flagged findings there. The current session will not edit `index.html`, `review.html`, `data/**`, or other previously claimed files.

## Supplemental verification — 2026-11-01 UTC

- Published supplementary findings and a clearly labeled flagged section in `supplemental/index.html`; not yet linked from the existing shared navigation. Integration request above remains open. The existing inventory and prior audit remain unchanged.
- Read organizer rules for [Codex x TwitchCon](https://twitchcon-codex.devpost.com/rules), [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/rules), and [Global Virtual Hackathon](https://gvhackathon.com/) ([AI fairness](https://gvhackathon.com/fairness)). Confirmed the displayed entry, cash-prize, deadline, eligibility and AI details only; current eligibility, future availability, payment and winning odds are not established.
- Flagged the [Challenge.gov sunset](https://www.challenge.gov/); [IceHacks' contradictory cash header](https://icehacks.devpost.com/); [PayPal prize totals](https://paypalaihackathon.devpost.com/) vs. [rules](https://paypalaihackathon.devpost.com/rules); ended [QHack](https://qhack.ai/terms-and-conditions/) and [WiseTech](https://groklearning.com/wtg-programming-competition/) events; [Papaya's distinction between free Gem and cash competitions](https://www.papaya.com/faq); and the original site's overbroad tax statement against [IRS guidance](https://www.irs.gov/publications/p525).
- Local tests: `node tests/validate.mjs` and `python3 supplemental/check.py`. External links on the inherited leads remain unverified; 201 of 208 existing leads remain flagged by the prior integration. No full external link sweep was possible.
- Supplemental publication PR: [#6](https://github.com/sassnarep3-star/Own1/pull/6); merged into main at 2026-11-01 13:44 UTC (merge commit `342a7e4f1a36512273b0b34a91c98c50ac0b22b2`). [Pages deployment](https://github.com/sassnarep3-star/Own1/actions/runs/41312675468) and validation succeeded. [Supplemental page](https://sassnarep3-star.github.io/Own1/supplemental/) was fetched after deployment. Shared-navigation integration remains requested. A second rebase conflict on this board arose after PR #4 landed; both sessions' entries were preserved.

## Session a479d584-own1 — Verified Contest Ledger + final integration (2026-11-01 UTC)

**Branch note:** the Arena platform fixes this session's branch as `arena/a479d584-own1`; the `session-<id>/<task>` naming from the brief could not be used. Non-overlapping file scopes are used instead.

| # | Task | Status | Owner | File scope | Claimed (UTC) |
|---|------|--------|-------|-----------|---------------|
| 1 | Repo review + automated audit of the upstream ledger | done | a479d584 | `data/upstream/**`, `scripts/audit.js`, `data/audit.json` | 13:45 |
| 2 | Official-source verification, batch A (28 records: 6 verified, 9 partial, 8 differ/broken link, 5 unconfirmed) | done | a479d584 | `data/verification/batchA.jsonl`, `picks.json` | 14:00 |
| 3 | Official-source verification, batch B (the 178 rows never opened against an official page) | needs review (unclaimed; published as unverified) | — | `data/verification/batchB.jsonl` | — |
| 4 | Ledger site (dashboard, picks, categories, flagged, method, summary) | done | a479d584 | `ledger/**`, `assets/finder.css`, `assets/finder.js`, `scripts/build.js`, `scripts/linkcheck.js`, `data/ledger.*` | 14:20 |
| 5 | Executive summary | done | a479d584 | `EXECUTIVE_SUMMARY.md` (integrated; generated by `build.js`), `ledger/EXECUTIVE_SUMMARY.md` | 14:25 |
| 6 | **Final integration** (reconcile with sessions 27a86924/90c9f78c/85ca8130/37aed701, re-verify, link check, PR, merge, Pages) | in progress | a479d584 | nav links on Prize Atlas pages, `README.md`, `EXECUTIVE_SUMMARY.md`, `COORDINATION.md` | 14:30 |

### Merge-conflict log (task 6)
PR #11 could not merge: `main` already contained the Prize Atlas site from other sessions. Conflicts were add/add in `COORDINATION.md`, `EXECUTIVE_SUMMARY.md`, `README.md`, `assets/style.css`, `assets/app.js` and `index.html`. Resolution, nothing from the other sessions discarded:
- Prize Atlas files (`index.html`, `review.html`, `category/**`, `assets/style.css`, `assets/app.js`, `data/entries.json`, `tests/**`, `research/**`, `supplemental/**`, `.github/**`) kept byte-for-byte except one added nav link pair ("Verified ledger", "Supplemental") in each page header. This also closes the open integration request from 37aed701 to link `supplemental/index.html` from the shared navigation.
- This session's site moved under `ledger/` with its own assets (`assets/finder.css`, `assets/finder.js`), so there are no shared filenames.
- `COORDINATION.md`: both boards preserved (this section appended). `EXECUTIVE_SUMMARY.md`: now an integrated document containing the earlier summary verbatim (also kept at `research/PRIZE_ATLAS_SUMMARY.md`) plus this session's part. `README.md`: both descriptions combined.
- Cross-check: both parts read ESPN NFL Pick'em, ARC Prize, Metaculus, Kaggle and DrivenData GEMS; the figures agree ($102,000; $2M, Nov 2 / Nov 8; $300,000). This session additionally read the ESPN how-to-play page and recorded the full prize breakdown ($102,000 = 3×$20,000 + $10,000 + 54×$500 + $5,000 random drawing) and two ESPN page inconsistencies (58 vs 59 prizes; 10 vs five entries).
- Other sessions' findings that this session did not re-read are listed under section E of `ledger/flagged.html`, labelled as reported by those sessions.

### Verification record (tasks 1–2)
Sources: 28 official pages fetched 2026-11-01, each listed with URL, facts and issues in `data/verification/batchA.jsonl` and on `ledger/method.html`. Verification performed: the page was read for the displayed prize, free-entry statement and window; anything not seen stays blank. Irregularities (all on `ledger/flagged.html`):
- ESPN NFL Survivor and NFL Playoff Predictor: entry closed on 2026-11-01 though upstream says live. RotoBaller Challenge: drafts ended Sep 8, 2026.
- Action Network "Favorites": only the 2024 FAQ found. MLB Beat the Streak: window ends with the 2026 regular season. TradingView The Leap: latest contest paid TradingView plans, `$50,000` not found. Majors Challenge: `$250,000` not found; commissioner pays $1/team for majors.
- HeroX `/challenges` returns 404 (replacement `/crowdsourcing-projects`). Fanatics Survivor: official page is a sportsbook/casino homepage; contest and prize not found.
- Upstream headline stats overstate (189 "true free paths" includes ended rows); betting-brand and broker rows conflict with upstream's own policy; every upstream row is dated 2026-08-19.
- Scope limit: 28 of 206 rows checked; 178 rows have blank prize cells and an "unverified" label. Link checking: `node scripts/linkcheck.js` verifies internal links and anchors only; external URLs cannot be fetched from the build sandbox.
