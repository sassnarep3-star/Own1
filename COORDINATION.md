# Coordination — Own1

Shared task board for the agent sessions working this repository. Arena fixes each session's branch
name, so the owning branch is recorded instead of a `session-<id>/<task>` branch.

## Repository state

| Layer | Entry point | Generator | Data | Owner |
| --- | --- | --- | --- | --- |
| **Prize Atlas** (root) | `index.html` | `npm run build` → `scripts/build-data.mjs`, `scripts/build-site.mjs` | `data/verification.json`, `data/entries.json`, `data/stats.json` | later sessions, merged via `main` |
| **Verified Atlas** (subsite) | `atlas/index.html` | `scripts/build.mjs` | `data/verified.json`, `data/legacy.json`, `data/atlas-findings.json`, `data/atlas-entries.json` | `75155aeb-own1` (arena/75155aeb-own1) |
| **Contest Finder** (subsite, earlier) | `ledger/index.html` | `scripts/build.js` | `data/finder-ledger.json` | earlier session, merged via `main` |
| Archived | — | `tools/build_site_legacy.py` | `data/ledger.json`, `data/audit.json` | superseded; kept for provenance, not run |

Each layer is published and linked from the root navigation ("Verified atlas (44)").

## Task board

| Task | Status | Owner (branch) | File scope | Notes |
| --- | --- | --- | --- | --- |
| First-pass site, 208 imported rows, 7 checked | done | `27a86924-own1` | — | PRs #1, #2. Superseded. |
| Root Prize Atlas: evidence file, 211 rows, 24 entry pages, root build + DOM test | done | later sessions | root `*.html`, `category/**`, `entry/**`, `assets/style.css`, `assets/app.js`, `scripts/build-data.mjs`, `scripts/build-site.mjs`, `data/*`, `tests/validate.mjs`, `tests/dom.test.mjs` | Merged into this branch from `main`, preserved; one nav link to `/atlas` added to the generator and the pages regenerated. |
| Contest Finder subsite | done | earlier session | `ledger/**`, `scripts/build.js`, `assets/finder.*`, `data/finder-*` | Preserved unchanged. |
| Re-import catalogue as quarantined leads | done | `75155aeb-own1` | `scripts/import_legacy.mjs`, `data/legacy.json` | 206 listings; prize/fee/deadline/eligibility blanked; dead-domain and http-only flags. |
| Verify operator pages, build verified dataset | done | `75155aeb-own1` | `data/verified.json`, `research/SOURCES.md` | 44 rows verified 2026-11-01; 17 findings with sources. |
| Verified Atlas subsite | done | `75155aeb-own1` | `atlas/**`, `assets/atlas.css`, `assets/atlas.js`, `scripts/build.mjs`, `data/atlas-*.json` | Mobile-first; tables become cards under 900px; search/filter/sort. |
| Validation and CI | done | `75155aeb-own1` | `tests/validate-atlas.mjs`, `.github/workflows/validate.yml` | CI now runs the root build + diff gate, the root suites, the headless DOM test and the atlas suite (3,700+ checks incl. every internal link in the repo). |
| Merge with `main`, publish, verify deploy | in progress | `75155aeb-own1` | `README.md`, `COORDINATION.md` | Result recorded below. |
| **Consolidate the layers into one dataset and one generator** | **unclaimed — open task** | — | would touch `data/*.json`, `scripts/build-*.mjs`, `scripts/build.mjs`, `atlas/**`, root pages | Claim here first: three generators write overlapping page sets. |

## Requests / handoffs

- **Generator ownership.** `scripts/build-site.mjs` writes root pages and `category/*`; `scripts/build.mjs`
  writes only `atlas/**`; `scripts/build.js` writes `ledger/**`. Do not point one at another's paths.
- **Nav link.** The root navigation entry "Verified atlas (44)" is produced by `scripts/build-site.mjs`.
  If that generator is replaced, re-add the link or the subsite becomes unreachable (CI checks
  reachability from the dashboard and will fail).
- **Data naming.** The Verified Atlas uses `data/atlas-findings.json` and `data/atlas-entries.json` so it
  never collides with the root layer's `data/audit.json` and `data/entries.json`.
- No other session had an open claim while this integration ran. Log a request here rather than
  editing another layer's files.

## Verification performed (2026-11-01 UTC)

- **Imported:** 206 listings from the reference `assets/data.js` (pass "S", stamped 2026-08-19).
  Only id, name, category, one source URL, legacy claim, status, free-path and description kept.
- **DNS-checked:** all 223 distinct hostnames. Six failed: `supercoach.news.com.au`,
  `fantasyfootball.skysports.com`, `fantasy.football.scot`, `fantazilig.tff.org`,
  `fantasy.premiershiprugby.com`, `fantasyracing.telegraph.co.uk`.
- **Verified:** 44 rows against operator pages (ESPN, CBS Sports ×2, Kaggle ×4, ARC Prize, DrivenData,
  Devpost ×9, Metaculus ×14, Sony World Photography ×4, Vocal, Givling, XPRIZE ×4). Every row links
  the page read and the date. Log: [research/SOURCES.md](research/SOURCES.md).
- **Automated:** `node tests/validate-atlas.mjs` → **3,832/3,832 checks pass**, including "no verified
  field copied from a legacy claim", "lead rows never populate prize/fee/deadline", "every internal
  link in the repository resolves" and "every published page is reachable from the site entry point".
  `node tests/validate.mjs` (other layers) still passes.
- **Served:** every page and asset returned HTTP 200 from a local static server before publishing.

## Irregularities

17 Atlas findings are published on [atlas/review.html](atlas/review.html) with source links and
summarised in [research/SOURCES.md](research/SOURCES.md) §4; the ledger layer publishes its own set on
[flagged.html](flagged.html). None blocks publication. The most consequential: every catalogue prize
claim is unverified, six source domains are dead, one source is http-only, 26 "ended" listings still
read as open, and four Atlas categories have no verified entry.

## Merge record (continuing)

- Branch `arena/75155aeb-own1`, branched from `main` at `90a7908`.
- `main` advanced repeatedly during this session (PRs #8, #10, #11, #12, #16 and two direct integrations).
  Each advance was merged in, never rebased over, and no other session's files were deleted:
  - **First merge** brought in the ledger layer. Conflict resolution kept the ledger pages and tools,
    moved this session's findings to `data/atlas-findings.json` and its merged dataset to
    `data/atlas-entries.json`, and extended `tests/validate-atlas.mjs` to check every HTML file.
  - **Second merge** brought in the Contest Finder subsite under `ledger/` and a restructured root.
    The Atlas layer was moved to `atlas/**` (its own assets `assets/atlas.css`, `assets/atlas.js`) so the
    root pages could stay with the ledger layer. One nav link was added to `tools/build_site.py` and the
    root pages were regenerated from it.
- Pull request, merge commit and GitHub Pages deploy check: recorded below once complete.
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

## Follow-up: 20a81ffd-own1 (2026-11-01 UTC)

- Scope: independent line-by-line re-verification of all 7 officially-checked leads against live operator pages (no values inferred; unverified fields left blank).
- Verified by re-fetching each official page on 2026-11-01 UTC; every displayed value matches `data/entries.json`:
  1. ESPN NFL Pick'em — https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules — free to enter ("Every game we offer is completely free"); $102,000 total incl. $5,000 random drawing; NO PURCHASE NECESSARY; prize $102,000 / entry Free / deadline 2027-01-10 ✓
  2. ARC Prize 2026 — https://arcprize.org/competitions/2026 — $2,000,000 across 3 tracks; submissions due Nov 2 2026; papers Nov 8; open-source required; no internet in Kaggle evaluation; $2,000,000 / deadline 2026-11-02 ✓
  3. Metaculus Tournaments — https://www.metaculus.com/tournaments/ — free participation, cash prizes; some tournaments list NO PRIZE POOL; varies / entry Free ✓
  4. US Midterms 2026 (Metaculus) — https://www.metaculus.com/tournament/midterms-2026/ — $10,000 pool; closes Nov 4 2026; $10,000 / deadline 2026-11-04 ✓
  5. GEMS Prize Challenge — https://www.drivendata.org/competitions/306/competition-doe-gems/ — $300,000 total; ends Dec 3 2026 23:59 UTC; U.S. DOE Office of Geothermal sponsored; $300,000 / deadline 2026-12-03 ✓
  6. Kaggle Competitions — https://www.kaggle.com/competitions — featured competitions have prizes; practice/community may not; varies ✓
  7. DrivenData Competitions — https://www.drivendata.org/competitions/ — separates prize competitions from benchmarks/practice; varies ✓
- Validation: `node tests/validate.mjs` → OK (208 unique IDs, 7 page-checked, 2 with no operator link, 11 pages and all local references pass); `node --check assets/app.js` → OK.
- Irregularities carried forward (see research/SOURCES.md and review.html): ESPN FAQ entry-limit conflict (5 vs 10); ARC Prize 2026 deadline imminent Nov 2 2026; automation via network APIs barred inside Kaggle evaluation; 201 of 208 leads unverified with blank financial/timing fields; 2 leads (`thelines-survivor`, `squarespool`) have no usable HTTPS operator source; legacy August statuses (27 ended / 5 mixed / 11 caution) are stale.
- No edits to files claimed by other sessions (`index.html`, `review.html`, `data/**`, `supplemental/**`). Open integration request from `37aed701-own1` (link `supplemental/index.html` from shared navigation) remains logged here, unclaimed.
- Integration PR from this session (#10): https://github.com/sassnarep3-star/Own1/pull/10; merge and Pages deployment to be confirmed after rebase.

</details>

---

## 8. Integration request from earlier sessions — completed

Both open requests are now closed by this integration:

1. `37aed701-own1` asked for `supplemental/index.html` to be linked from the shared navigation. Done: it is linked
   from the footer of every generated page, from `cross-session.html`, and from the **Cross-session** item in the main
   nav.
2. `37aed701-own1` asked for the newly checked contest rows and flagged findings to be integrated into the shared
   pages. Done without re-typing their numbers: `cross-session.html` renders their seven checked leads straight from
   `data/entries.json` with attribution, and their time-critical dates (ARC 2026-11-02 / 2026-11-08, Metaculus US
   Midterms 2026-11-04, GEMS 2026-12-03, ESPN $102,000) are quoted on the dashboard and on that page. Their
   `review.html` remains their review queue and is linked, not replaced.

Their follow-up verification (`20a81ffd-own1`) independently re-read all seven checked pages and added the
verbatim ESPN quote “Every game we offer is completely free”. That quote is recorded in §7 above; this session did
not re-read it, and it is attributed rather than absorbed.

## 9. Second merge — `main` moved again during integration

While the PR was open, `main` advanced twice more (PR #8 from `90c9f78c-own1`, PR #10 from `20a81ffd-own1`). Both
changes were confined to `COORDINATION.md`; `git merge origin/main` produced **one** conflict, in `COORDINATION.md`.
Resolution: this session's board kept as the current state, and the other sessions' new entries moved **inside** the
preserved-log block (§7) so no sentence of their record was dropped. No file of theirs was edited to resolve it.
`tests/validate.mjs` from their build still passes after the merge.


### Publication record (T7 — done)

| Item | Value |
| --- | --- |
| Pull request | [#12](https://github.com/sassnarep3-star/Own1/pull/12) — “Free Cash Ledger: mobile-first dashboard, official-source verification, and flagged review page” |
| Merge method | merge commit, `--merge`, no approval waited for |
| Merge commit | `4e70115` (`Merge pull request #12 from sassnarep3-star/arena/d21e8702-own1`) |
| CI on the PR | `Validate static site` → **pass** (run [41312958554](https://github.com/sassnarep3-star/Own1/actions/runs/41312958554/job/124866988654)) |
| Pages build | commit `4e7011508`, status **built**, created 2026-11-01T13:47:45Z, updated 13:48:03Z, no error |
| Pages deployment | `github-pages` deployment for `4e7011508`, created 2026-11-01T13:47:54Z |
| Live checks after deploy | `index.html`, `all.html`, `flagged.html` fetched from <https://sassnarep3-star.github.io/Own1/> on 2026-11-01 and confirmed to render the new build (206-row catalogue, verification badges, flagged findings) |

Post-merge follow-up carried by the PR whose body summarises this record: it fixes one methodology sentence
(“prize documented on an official page” now states explicitly that 4 of the 12 verified rows rest on a page quoting
the operator’s terms, labelled `secondary-official-terms`). No data, score or flagged item changed.

**Task board state:** T1–T7 done. Nothing on this board is `unclaimed`. The two items that remain open are not tasks:
the 194 unverified rows (published on `verification.html` as “not checked this pass”) and the 13 flagged items
(published on `flagged.html`). Both are **needs review** in the sense the brief uses — published, non-blocking, and
waiting on a human decision.

---

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
PR #11 could not merge twice: first `main` had the Prize Atlas site (add/add in `COORDINATION.md`, `EXECUTIVE_SUMMARY.md`, `README.md`, `assets/style.css`, `assets/app.js`, `index.html`); then `main` advanced again with the Free Cash Competition Ledger build (conflicts in the same docs, `category/**`, `index.html`, `data/ledger.json`, `data/audit.json`). Resolution each time, nothing from other sessions discarded:
- All root pages, `category/**`, `assets/**`, `data/ledger.json`, `data/audit.json`, `data/entries.json`, `tests/**`, `tools/**`, `research/**`, `supplemental/**` are the other sessions' versions, unchanged. The only edit to their generated pages is one added nav item, **Verified ledger**, via `NAV` in `tools/build_site.py` (regenerated with `python3 tools/build_site.py`; diff is one line per page).
- This session's site lives under `ledger/` with its own assets (`assets/finder.css`, `assets/finder.js`). Its data files were renamed to avoid collisions: `data/finder-ledger.json`, `data/finder-ledger.csv`, `data/finder-audit.json` (`scripts/audit.js` and `scripts/build.js` updated).
- Docs: this section is appended to the board; `README.md` and `EXECUTIVE_SUMMARY.md` each gain a short pointer section for the ledger. The ledger's own executive summary is `ledger/EXECUTIVE_SUMMARY.md` (also `ledger/summary.html`).
- Cross-check against other sessions' checked rows: ARC Prize, Metaculus, Kaggle, DrivenData and Checkmate were read by both; values agree ($2M with Nov 2 / Nov 8; GEMS $300,000; ESPN $102,000). Status labels differ for Checkmate (verified there, partial here: see `ledger/flagged.html` section E). This session also read ESPN's how-to-play page and recorded the full prize breakdown ($102,000 = 3×$20,000 + $10,000 + 54×$500 + $5,000 random drawing) and two ESPN page inconsistencies (58 vs 59 prizes; 10 vs five entries).
- Other sessions' findings not re-read here are listed, as such, in section E of `ledger/flagged.html`.

### Verification record (tasks 1–2)
Sources: 28 official pages fetched 2026-11-01, each listed with URL, facts and issues in `data/verification/batchA.jsonl` and on `ledger/method.html`. Verification performed: the page was read for the displayed prize, free-entry statement and window; anything not seen stays blank. Irregularities (all on `ledger/flagged.html`):
- ESPN NFL Survivor and NFL Playoff Predictor: entry closed on 2026-11-01 though upstream says live. RotoBaller Challenge: drafts ended Sep 8, 2026.
- Action Network "Favorites": only the 2024 FAQ found. MLB Beat the Streak: window ends with the 2026 regular season. TradingView The Leap: latest contest paid TradingView plans, `$50,000` not found. Majors Challenge: `$250,000` not found; commissioner pays $1/team for majors.
- HeroX `/challenges` returns 404 (replacement `/crowdsourcing-projects`). Fanatics Survivor: official page is a sportsbook/casino homepage; contest and prize not found.
- Upstream headline stats overstate (189 "true free paths" includes ended rows); betting-brand and broker rows conflict with upstream's own policy; every upstream row is dated 2026-08-19.
- Scope limit: 28 of 206 rows checked; 178 rows have blank prize cells and an "unverified" label. Link checking: `node scripts/linkcheck.js` verifies internal links and anchors only; external URLs cannot be fetched from the build sandbox.

---

## 10. Integration session `4a243e58-own1` — rebuild and final merge

**Claim:** dataset (`data/**`, `scripts/**`, `research/**`), generated pages (`index.html`, `category/**`, `entry/**`, `review.html`, `sources.html`, `playbook.html`), client assets (`assets/app.js`, `assets/style.css`), `tests/**`, `.github/workflows/validate.yml`, `README.md`, `EXECUTIVE_SUMMARY.md`.

**What changed and why.** The repository by this point held two parallel dashboard builds plus a 208-row catalogue in which 7 rows were checked. This session rebuilt the data layer so a value can only enter the site through a quoted official page, regenerated every page from that data, and measured link health instead of asserting it.

| Change | Detail |
| --- | --- |
| Evidence-first data model | `research/facts.mjs` is the only place a prize, fee, deadline or eligibility value may be written, and each carries URL + exact quote + date read. `scripts/build-data.mjs` merges that with the inherited catalogue. |
| Verification | **18 entries page-checked (48 quoted facts), 6 partly checked, 187 unverified.** Newly verified in this session: Codex x TwitchCon, PayPal AI Hackathon, Checkmate Gaming, Wergle Flomp, Sony World Photo, ESPN, Metaculus (+ Midterms), ARC Prize, Kaggle, NFL Big Data Bowl, DrivenData, GEMS, Tom Howard, TradingView, Givling, EPOTY, Weather POTW. |
| Link health | Every outbound URL requested by a GitHub runner (203 URLs): 166 OK, **10 dead outright**, 27 bot-blocked. Published on the flagged page and per row. |
| Corrections to the inheritance | Tom Howard is **paid** ($27), not free. TradingView links a **closed** edition. Givling is a **crowdfunding queue**, not a contest. Two leads have **no operator link**. |
| Tests | `tests/validate.mjs` fails on any unsourced/blank-violating value, cross-host evidence, broken local link or duplicate id. `tests/dom.test.mjs` renders the tables in jsdom and proves the filters actually filter. CI rebuilds and fails on drift. |

### Verified Atlas merge record (session 75155aeb-own1)

`main` advanced four times while this branch was being built (PRs #8, #10, #11, #12, #16, #19 and two
direct integrations). Each advance was **merged, never rebased over**, and no layer's files were deleted:

1. **Ledger merge.** Root pages and tools kept from `main`; this session's findings moved to
   `data/atlas-findings.json` and its merged dataset to `data/atlas-entries.json`.
2. **Contest Finder merge.** The `ledger/` subsite was kept; the Atlas layer moved to `atlas/**` with its
   own assets (`assets/atlas.css`, `assets/atlas.js`) so no path is shared with the root layer.
3. **npm-build merge.** The root layer moved to `npm run build` (`scripts/build-data.mjs` +
   `scripts/build-site.mjs`) and archived `tools/build_site.py` as `tools/build_site_legacy.py`. The
   one thing this session had to re-apply was the root nav link to `/atlas`, added to
   `scripts/build-site.mjs` and regenerated; the previous patch to the Python generator was dropped
   with that generator and is recorded here.
4. **CI merged**: root build + staleness gate + `tests/validate.mjs` + `tests/dom.test.mjs`, then
   Atlas build + staleness gate + `tests/validate-atlas.mjs` (which also audits every internal link in
   the repository and page reachability from the dashboard).

**Publication:** pull request and merge result recorded below.
