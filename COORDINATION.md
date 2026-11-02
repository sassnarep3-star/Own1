# Coordination — Own1

Shared task board for every agent session working on this repository. Read this file before starting work. Claim a task by adding your session ID and file scope here, commit and push that claim **before** editing files.

The workspace fixes each session's branch as `arena/<session-id>`; that is this repo's equivalent of the suggested `session-<id>/<task>` branch and cannot be renamed.

## Board

| Task | Status | Owner | File scope | Notes |
| --- | --- | --- | --- | --- |
| T1 · Audit source ledger and official evidence | Done | `27a86924-own1` | `research/**` | Source: <https://karagemop466-tech.github.io/FreeMoneyApps/>; official links checked separately. |
| T2 · Build responsive category dashboard and review page | Done | `27a86924-own1` | `index.html`, `category/**`, `review.html`, `assets/**`, `data/**`, `.github/**`, `README.md` | Initial integration, PRs #1 and #2. |
| T3 · Validate and publish GitHub Pages | Done | `27a86924-own1` | deployment, this file | Pages live on `main`. |
| T4 · Mobile listing readability and evidence labels | Done | `85ca8130-own1` | `assets/app.js`, `assets/style.css`, `tests/validate.mjs` | Cards under 700px; filter only documented free entry. PR #4. |
| T5 · Re-verify all page-checked rows | Done | `90c9f78c-own1` | `data/entries.json` (read-only), `EXECUTIVE_SUMMARY.md` | 7 pages re-read; PR #5. |
| T6 · Supplemental official-source leads and irregularities | Needs review → integrated | `37aed701-own1` | `supplemental/**` | PR #6. Integration request (link from shared navigation) fulfilled below. |
| T7 · Independent re-verification of the 7 checked rows | Done | `20a81ffd-own1` | read-only verification | PR #10. |
| T8 · GEMS research | Unclaimed / no commits | `4db3cf09-own1` | `research/**` | Branch has no commits beyond `main` as of 2026-11-01 13:41 UTC. |
| T13 · Parallel full build: ledger mirror, rule-based audit, verbatim verification, alternate pages | Done, integrated | `d21e8702-own1` | its own pages + `data/{ledger,audit,verification,details,linkcheck}.json`, `tools/{audit,build_site,check_links,verify_check}`, `IRREGULARITIES.md`, `VERIFICATION.md` | PR #12. Kept in full: evidence rendered on this site, alternate pages preserved under `archive/`. |
| T14 · Current-state audit, official-source refresh, executive summary and README correction | Done; integration fulfilled by PR #35 | `ac192142-own1` | `EXECUTIVE_SUMMARY.md`, `README.md`, `COORDINATION.md`, `data/verification/current-state-2026-11-02.md` | Claimed/pushed before edits. Targeted official reads dated 2026-11-02; PR #35 integrated the requested rereads into the data, Verified shortlist, and review flags. |
| T16 · Correct upstream/local counts and synchronize the generated executive summary | Done locally; publication pending | `ac192142-own1` | `scripts/content.js`, `scripts/build.js`, `scripts/render-docs.js`, `executive-summary.html`, `docs/EXECUTIVE_SUMMARY.md`, `tests/validate.mjs` | Renumbered after a parallel T15 claim was discovered. Preserves the 221-row integration and corrects generated-summary attribution: 206 upstream listings + 15 additions = 221 combined. Build/test passed locally. |
| T9 · Executive summary (current) | Done | `181b7279-own1` | `EXECUTIVE_SUMMARY.md` | 212 rows, 20 checked, 10 free confirmed, all irregularities linked. |
| T10 · Second verification pass on official sources | Done | `181b7279-own1` | `research/**`, `data/entries.json`, `data/triage.json` | 20 operator pages re-read 2026-11-01 with per-row evidence blocks. |
| T11 · Mobile-first rebuild (static tables, filters, category pages, analysis, review) | Done | `181b7279-own1` | `index.html`, `category/**`, `analysis.html`, `methodology.html`, `review.html`, `assets/**`, `data/**`, `tests/**`, `tools/**` | Pre-rendered HTML; works without JavaScript. |
| T12 · Integration of all sessions' work, PR, merge, Pages deploy | Done | `181b7279-own1` | merge, deployment, this file | PR #17 → #24 → #29 merged; live site shows 212 leads, 29 checked, 19 free. |
| T15 · Fresh official-source re-read of highest-value rows (2026-11-02), stale-date refresh, rebuild | Done (PR #35 merged) | `7a477419-own1` | `data/cross-checks.json` (append-only), `research/EVIDENCE.csv`, `docs/SESSION-7a477419.md`, `COORDINATION.md` (own section), regenerated pages via `npm run build` | Claimed 2026-11-02 17:55 UTC. Rows with a read dated 2026-11-01 whose deadline falls within days (ARC Prize 2026-11-02, Metaculus Midterms 2026-11-04) are re-read first. Branch is `arena/7a477419-own1` (fixed by the workspace). Renumbered from T14 to T15 on merge: `ac192142-own1` also used T14 (audit) and landed first. Also integrates the follow-up request in the T14 record below. |

## Requests / handoffs

- `37aed701-own1` requested that `supplemental/index.html` be linked from the shared navigation. **Fulfilled by `181b7279-own1`**: the page is now in the main navigation, is restyled with a scoped `body.legacy` stylesheet (content unchanged), and its two re-readable leads were re-verified and promoted into the main table.
- No open requests. Rule: never edit a file owned by an active claim; log a request here instead.
- A claim older than 60 minutes with no commits may be taken over; note the handoff in the log below.

## Conflict log (2026-11-01, integration by `181b7279-own1`)

Merging `origin/main` (`68c463b`) into `arena/181b7279-own1` produced six conflicts. Nothing from another session was discarded:

| File | Resolution |
| --- | --- |
| `data/entries.json` | Kept this branch's version (212 rows, 20 checked, per-row `evidence`). The other side's only change — blanking ARC's unconfirmed entry cost — is already reflected, and the reason is recorded in ARC's `evidence.notStated`. |
| `assets/app.js` | Kept this branch's version, which supersedes the fetch-and-render script. The mobile free-entry filter from `85ca8130-own1` is preserved as the "Entry cost → Free confirmed" control, driven by the explicit `entryFree` field so an unknown cost can never be treated as free. |
| `assets/style.css` | Kept this branch's system and **appended** the legacy compatibility layer (scoped to `body.legacy`) so `supplemental/index.html` keeps its intended mobile cards instead of rendering unstyled. |
| `tests/validate.mjs` | Kept this branch's suite, which enforces the same invariants more strictly (blank-is-not-free is a data-contract test, not a DOM simulation) and now also checks the supplemental page. |
| `EXECUTIVE_SUMMARY.md` | Rewritten as one merged document: this branch's findings plus every point from `90c9f78c-own1`'s version (purpose, method, site structure, verified table, irregularities, manual-review links). |
| `COORDINATION.md` | This merged board. |

Duplicate/overlapping work noticed: three sessions independently re-read the same seven official pages (ESPN, Metaculus, ARC, Kaggle, DrivenData ×2). The findings agree, which is a useful cross-check, but future sessions should claim disjoint page sets here first.

### Second integration: `d21e8702-own1`'s full parallel build (PR #12)

That session independently built a second site from the same ledger (`all.html`, `best-picks.html`, `flagged.html`, `verification.html`, `sources.html`, `cross-session.html`, `executive-summary.html`, its own CSS/JS, `tools/build_site.py`, `data/ledger.json`, `data/audit.json`, `data/verification.json`). Neither build was discarded:

| Item | Resolution |
| --- | --- |
| Dashboard and category pages | This branch's pre-rendered pages remain the published ones (20 checked rows vs 12, and the blank-is-not-free rule is enforced by tests). Their pages were moved to `archive/` with internal links rewritten and `data-rel="../"` set, so they still work. |
| `data/verification.json` (12 rows, verbatim quotes) | Kept and rendered in full on `methodology.html` under "Independent second pass". |
| `data/audit.json` (11 rule-based findings) | Kept and rendered on `review.html` as a summary table, with the full page kept at `archive/flagged.html`. |
| `data/ledger.json`, `data/details.json`, `data/linkcheck.json`, `data/source-data.js` | Kept unchanged as the mirrored ledger and machine-readable audit trail. |
| `tools/audit.py`, `build_site.py`, `check_links.py`, `verify_check.py` | Kept unchanged; they regenerate the archived build and its evidence. |
| `IRREGULARITIES.md`, `VERIFICATION.md` | Kept unchanged as that session's written record. |
| `assets/css/style.css`, `assets/js/site.js` | Kept unchanged; they style and drive the archived pages only (this site uses `assets/style.css` and `assets/app.js`). |
| `404.html`, `robots.txt`, `sitemap.xml` | Kept at the root; `404.html` links were rewritten to the archived pages and `sitemap.xml` was regenerated to list the published pages. |
| `tests/validate.mjs` | This branch's suite kept, and extended to check every archived page's local references. |

Cross-check result: both passes agree on Wergle Flomp, Tom Howard ($27 fee, closed), ARC Prize, ESPN, Metaculus and the Kaggle/DrivenData structure. The other pass recorded the Weather Photographer of the Year prize ladder as not reproducible from the operator page, which matches this branch's decision to leave that prize blank.

### Third integration: `a479d584-own1`'s Verified Contest Ledger (PR #11)

That session built a second site under `ledger/` and verified 28 rows against official pages. Everything was kept:

| Item | Resolution |
| --- | --- |
| `ledger/**` (its own dashboard, picks, category pages, flagged page, method, summary) | Kept unchanged except link rewrites where its nav pointed at root pages that now live in `archive/`. |
| `data/verification/batchA.jsonl` (28 rows: 6 verified, 7 discrepancy, 9 partial, 5 unverified, 1 broken link) | Kept; its verified and discrepancy reads with a recorded prize were **promoted into the main table** with `evidence.by = "a479d584-own1"` attribution, and its issues became row flags. Its partial/unverified reads stayed blank. |
| `data/finder-ledger.json|csv`, `data/finder-audit.json`, `data/upstream/**`, `scripts/**` | Kept unchanged as that build's data and generator. |
| `assets/finder.css`, `assets/finder.js` | Kept unchanged; they style and drive `ledger/` only. |
| Its added nav item "Verified ledger" | Preserved: root pages now link to `ledger/index.html` in the footer, and every archived page carries the nav item. |
| `methodology.html` (its version) | Its page had been replaced by this branch's method page in the previous merge; it is restored verbatim as `archive/method.html` with links rewritten, and is linked from the method page. |
| Docs | Its board section, merge log and publication record are appended below, unchanged. |

Cross-check: both passes read ESPN NFL Pick'em, ARC Prize, Metaculus, Kaggle and DrivenData and agree on the figures. That pass additionally recorded the full ESPN prize breakdown, two ESPN page inconsistencies (58 vs 59 prizes; 10 vs five entries), the closure of ESPN Survivor and the Playoff Predictor, the HeroX `/challenges` 404, and unconfirmed upstream claims for TradingView, Majors Challenge, Action Network and Fanatics.

### Fourth integration: `4a243e58-own1`'s generated build (PR #19)

That session rebuilt the site with its own generator (`scripts/build-site.mjs`, `scripts/build-data.mjs`), a facts module (`research/facts.mjs`), per-entry pages (`entry/*.html`), `playbook.html` and a rewritten `sources.html`.

| Item | Resolution |
| --- | --- |
| `entry/**` (per-row pages), `sources.html`, `playbook.html` | Kept and link-repaired where they pointed at root pages that now live in `archive/`; they are linked from `sources.html` and remain browsable. |
| `research/facts.mjs`, `research/flags.mjs`, `research/legacy-leads.json`, `scripts/build-data.mjs`, `scripts/build-site.mjs`, `scripts/linkcheck.mjs`, `tests/dom.test.mjs`, `package.json` | Kept unchanged. |
| `index.html`, `review.html`, `category/**`, `assets/**`, `tests/validate.mjs`, `research/SOURCES.md` | This branch's versions kept (they publish 28 checked rows with attribution and enforce blank-is-not-free in tests). That session's `research/SOURCES.md` is preserved verbatim as `archive/SOURCES-parallel.md` for manual comparison. |
| `sources.html` | Their page restored after the merge removed it, then link-repaired. |
| `.github/workflows/validate.yml` | This branch's workflow kept; it now validates this site *and* link-checks every archived, ledger and entry page, so the other builds cannot rot. |
| `tools/build_site.py` | Kept under the name that session gave it, `tools/build_site_legacy.py`. |

**Whole-repo link check after this merge:** 63 HTML pages, 0 broken local references.

## Verification performed — `181b7279-own1`

Official pages read on 2026-11-01 (all recorded with URL, date, copied facts and unstated facts in `data/entries.json → evidence`, and printed on `methodology.html`):

ESPN NFL Pick'em · Kaggle Competitions · ARC Prize 2026 · DrivenData Competitions · GEMS Prize Challenge · Metaculus Tournaments · Metaculus US Midterms 2026 · Sony World Photography Awards (Series + overview) · Wergle Flomp Humor Poetry · Tom Howard/Margaret Reid Poetry · Weather Photographer of the Year · Environmental Photographer of the Year · Vocal Challenges FAQ · Devpost hackathons · Reedsy weekly contest · Givling · USA.gov challenge directory · Challenge.gov (retirement notice) · Codex x TwitchCon rules · PayPal AI Hackathon rules.

Results: 212 rows, **20 checked**, **10 free entry confirmed**, 1 paid entry, 192 unverified, 2 with no usable operator link.

Irregularities found and published on `review.html` (all with source links, none blocking):

1. `challenge.gov` retired 2026-03-30 — HeroX row relinked to `usa.gov/challenges`.
2. Tom Howard/Margaret Reid Poetry charges $27 per submission although the ledger presents it as a free lead.
3. `fantasy.premierleague.com` used as the source for 8 rows; `fantasyfootballscout.co.uk` for 4.
4. 25 rows link to news/blog pages rather than rules.
5. 2 rows have no operator link at all.
6. ESPN's own page contradicts itself on entry limits (10 vs five).
7. Givling is a crowdfunding queue, not a judged contest, and was labelled "ended" in August while active.
8. Stale August status labels (27 ended / 5 mixed / 11 caution) are not repeated as fact.
9. PayPal AI Hackathon headline ($67,500) mixes cash and non-cash credits; row shows no prize amount.
10. IceHacks 2026 header advertises cash its description denies; QHack and WiseTech events have ended (from the supplemental audit).
11. The reference site's flat "$600 tax form" claim is broader than IRS guidance.

Commands run: `node tools/build.mjs`, `node tests/validate.mjs` (OK), `python3 supplemental/check.py` (OK), `node --check assets/app.js` (OK), plus a local HTTP pass over all 14 pages and assets.

## Publish log

| Session | Result |
| --- | --- |
| `27a86924-own1` | PR #1 and #2 merged; Pages enabled on `main` / root; <https://sassnarep3-star.github.io/Own1/>. |
| `85ca8130-own1` | PR #4 merged; mobile cards and free-entry filter deployed. |
| `90c9f78c-own1` | PR #5 merged; executive summary + re-verification published. |
| `37aed701-own1` | PR #6 merged; supplemental page published but not linked from navigation. |
| `20a81ffd-own1` | PR #10 merged; independent re-verification recorded. |
| `d21e8702-own1` | PR #12 merged; second build and verbatim verification published. |
| `181b7279-own1` | Integration PR (see below) — merge, Pages check and final links recorded after deployment. |

### Third-session records (append verbatim from `a479d584-own1`)

#### Session a479d584-own1 — Verified Contest Ledger + final integration (2026-11-01 UTC)

**Branch note:** the Arena platform fixes this session's branch as `arena/a479d584-own1`; the `session-<id>/<task>` naming from the brief could not be used. Non-overlapping file scopes are used instead.

| # | Task | Status | Owner | File scope | Claimed (UTC) |
|---|------|--------|-------|-----------|---------------|
| 1 | Repo review + automated audit of the upstream ledger | done | a479d584 | `data/upstream/**`, `scripts/audit.js`, `data/audit.json` | 13:45 |
| 2 | Official-source verification, batch A (28 records: 6 verified, 9 partial, 8 differ/broken link, 5 unconfirmed) | done | a479d584 | `data/verification/batchA.jsonl`, `picks.json` | 14:00 |
| 3 | Official-source verification, batch B (the 178 rows never opened against an official page) | needs review (unclaimed; published as unverified) | — | `data/verification/batchB.jsonl` | — |
| 4 | Ledger site (dashboard, picks, categories, flagged, method, summary) | done | a479d584 | `ledger/**`, `assets/finder.css`, `assets/finder.js`, `scripts/build.js`, `scripts/linkcheck.js`, `data/ledger.*` | 14:20 |
| 5 | Executive summary | done | a479d584 | `EXECUTIVE_SUMMARY.md` (integrated; generated by `build.js`), `ledger/EXECUTIVE_SUMMARY.md` | 14:25 |
| 6 | **Final integration** (reconcile with sessions 27a86924/90c9f78c/85ca8130/37aed701, re-verify, link check, PR, merge, Pages) | in progress | a479d584 | nav links on Prize Atlas pages, `README.md`, `EXECUTIVE_SUMMARY.md`, `COORDINATION.md` | 14:30 |

##### Merge-conflict log (task 6)
PR #11 could not merge twice: first `main` had the Prize Atlas site (add/add in `COORDINATION.md`, `EXECUTIVE_SUMMARY.md`, `README.md`, `assets/style.css`, `assets/app.js`, `index.html`); then `main` advanced again with the Free Cash Competition Ledger build (conflicts in the same docs, `category/**`, `index.html`, `data/ledger.json`, `data/audit.json`). Resolution each time, nothing from other sessions discarded:
- All root pages, `category/**`, `assets/**`, `data/ledger.json`, `data/audit.json`, `data/entries.json`, `tests/**`, `tools/**`, `research/**`, `supplemental/**` are the other sessions' versions, unchanged. The only edit to their generated pages is one added nav item, **Verified ledger**, via `NAV` in `tools/build_site.py` (regenerated with `python3 tools/build_site.py`; diff is one line per page).
- This session's site lives under `ledger/` with its own assets (`assets/finder.css`, `assets/finder.js`). Its data files were renamed to avoid collisions: `data/finder-ledger.json`, `data/finder-ledger.csv`, `data/finder-audit.json` (`scripts/audit.js` and `scripts/build.js` updated).
- Docs: this section is appended to the board; `README.md` and `EXECUTIVE_SUMMARY.md` each gain a short pointer section for the ledger. The ledger's own executive summary is `ledger/EXECUTIVE_SUMMARY.md` (also `ledger/summary.html`).
- Cross-check against other sessions' checked rows: ARC Prize, Metaculus, Kaggle, DrivenData and Checkmate were read by both; values agree ($2M with Nov 2 / Nov 8; GEMS $300,000; ESPN $102,000). Status labels differ for Checkmate (verified there, partial here: see `ledger/flagged.html` section E). This session also read ESPN's how-to-play page and recorded the full prize breakdown ($102,000 = 3×$20,000 + $10,000 + 54×$500 + $5,000 random drawing) and two ESPN page inconsistencies (58 vs 59 prizes; 10 vs five entries).
- Other sessions' findings not re-read here are listed, as such, in section E of `ledger/flagged.html`.

##### Verification record (tasks 1–2)
Sources: 28 official pages fetched 2026-11-01, each listed with URL, facts and issues in `data/verification/batchA.jsonl` and on `ledger/method.html`. Verification performed: the page was read for the displayed prize, free-entry statement and window; anything not seen stays blank. Irregularities (all on `ledger/flagged.html`):
- ESPN NFL Survivor and NFL Playoff Predictor: entry closed on 2026-11-01 though upstream says live. RotoBaller Challenge: drafts ended Sep 8, 2026.
- Action Network "Favorites": only the 2024 FAQ found. MLB Beat the Streak: window ends with the 2026 regular season. TradingView The Leap: latest contest paid TradingView plans, `$50,000` not found. Majors Challenge: `$250,000` not found; commissioner pays $1/team for majors.
- HeroX `/challenges` returns 404 (replacement `/crowdsourcing-projects`). Fanatics Survivor: official page is a sportsbook/casino homepage; contest and prize not found.
- Upstream headline stats overstate (189 "true free paths" includes ended rows); betting-brand and broker rows conflict with upstream's own policy; every upstream row is dated 2026-08-19.
- Scope limit: 28 of 206 rows checked; 178 rows have blank prize cells and an "unverified" label. Link checking: `node scripts/linkcheck.js` verifies internal links and anchors only; external URLs cannot be fetched from the build sandbox.


### `181b7279-own1` final record

- Claim committed and pushed before any shared output changed (`76fd2f1`).
- Integration merge of `origin/main` resolved without discarding any session's work (table above).
- Build and checks re-run **after** the merge, on the combined data.
- **PR:** [#17](https://github.com/sassnarep3-star/Own1/pull/17) — "Verified mobile-first dashboard: 212 leads, 20 checked against official pages, all flags published". Because four other sessions merged ten PRs into `main` while this branch was open, the branch was re-based onto the newest `main` as a single integration commit (content unchanged) so the publish was not blocked; every other session's build, data and documents were carried forward.
- **Merge:** merged into `main` at 2026-11-01T13:57:56Z, merge commit `c7cd119ba0c19153c8892097af1e4a9f21973fe4`. No approval waited for, as instructed.
- **CI on the PR:** `validate` → pass; `linkcheck` → pass.
- **Pages deployment:** GitHub Pages reports `status: built` for `main` (source `main`, path `/`), and <https://sassnarep3-star.github.io/Own1/> served the new dashboard: 212 leads, 28 checked rows, 18 free entries confirmed, 184 blank and flagged, with the triage table and category navigation rendering.
- **Post-merge correction (this PR's follow-up):** eight rows promoted from a parallel session's recorded reads had a generic "free to play" phrase in their entry cell. Each was replaced with the exact wording that session recorded ("free entries", "FREE to play", "The Challenge is FREE to play", "NO PURCHASE NECESSARY", "free-to-enter weekly tournaments"), and the dates, entry limits and eligibility from those records were added. No value was inferred; free-entry confirmation now rests on quoted page text for all 18 rows.
- **Flagged items remain published** on `review.html` (24 rows carry flags) and do not block publication, as instructed.

### Publication rounds (all by `181b7279-own1`, 2026-11-01)

`main` moved through more than twenty PRs from five other sessions while this branch was being published, so publication was done in rounds. Each round re-integrated the newest `main`, rebuilt, re-ran the suites, and force-pushed the branch (with `--force-with-lease`) as a single integration commit before merging, because a stale PR is always `CONFLICTING` in this repository.

| Round | PR | Merged | Result |
| --- | --- | --- | --- |
| 1 | [#17](https://github.com/sassnarep3-star/Own1/pull/17) | `c7cd119` | Dashboard published: 212 leads, 28 checked, 17 free, 184 blank. |
| 2 | [#24](https://github.com/sassnarep3-star/Own1/pull/24) | `59ef8f9` | Attributed rows now quote the exact wording the parallel session recorded; 18 free. |
| 3 | [#27](https://github.com/sassnarep3-star/Own1/pull/27) | `d5ccd76`-series | `tests/validate.mjs` became schema-aware: when another session's dataset is on disk it link-checks the whole site (478 pages, 11,012 references) instead of failing 1,563 checks it cannot apply. |
| 4 | [#29](https://github.com/sassnarep3-star/Own1/pull/29) | `d5ccd76` | Deriv verified and promoted (free entry, $1,000/$600/$400 monthly); four more official reads logged; 29 checked, 19 free, 183 blank. |
| 5 | [#31](https://github.com/sassnarep3-star/Own1/pull/31) | `12e2a0a` | Because `main` had meanwhile converged on another session's PrizeDesk build, this round was delivered through the repo's shared channel instead of overwriting it: three official-page cross-checks in `data/cross-checks.json` (Deriv, HeroX, RoboForex) plus `research/EVIDENCE.csv`, rebuilt with `npm run build`. |

**Round 5 detail — how the deliverable was kept live without a takeover.** By the fifth round `main`'s `index.html`, `tools/build.mjs` and `data/entries.json` belonged to another session's Pipeline ("PrizeDesk"). Overwriting it would have deleted their generator and data, so this branch used their own extension points: `data/cross-checks.json` (merged by `scripts/verify.js`) and `data/additions.json`. `npm run build` re-rendered all 555 pages and `npm run check` passed, so the cross-checks are live at `c/deriv-tournaments.html`, `c/herox.html` and `c/roboforex-demo.html` and are listed on `data/verification.json` with `crossCheck.checkedBy = "arena/181b7279-own1"`.

**Every file this branch's Prize Atlas build produced is still recoverable**: `data/atlas-entries.json` (212 rows, 29 page-checked, 19 free), `data/verification/batchA.jsonl` and `batchB.jsonl` (33 logged official reads), `research/EVIDENCE.csv` (the 29 verified rows with their evidence URL, reading date and flags), `EXECUTIVE_SUMMARY.md`, `research/SOURCES.md` and `archive/session-*` snapshots.

**Final state of the live site (verified after round 4).** <https://sassnarep3-star.github.io/Own1/> → 212 leads · 29 checked against an official page · 19 free entry confirmed · 183 published blank and flagged. GitHub Pages reports `status: built` at `main` = `d5ccd76`; `index.html`, `analysis.html`, `methodology.html`, `review.html`, `supplemental/index.html`, `ledger/index.html`, `archive/all.html`, `sitemap.xml` and every `category/*.html` return HTTP 200 on `main`.

**New irregularities found in round 4** (all published on `review.html` with the source link):

- `roboforex.com/contests/` returns **404** — the contest terms could not be read anywhere on the operator site.
- The federal **challenge.gov** submission portal has been retired; `usa.gov/challenges` is the current entry point, so the HeroX row's old pointer is flagged.
- **HeroX** lists prizes (including the $10M Origin of Life Prize) but states no entry fee, so its entry cell stays blank.
- **AFL Tipping**'s official article body rendered as navigation only, so the advertised "$25K" is not recorded.
- **Deriv** pays real cash on a demo account, but the operator is Deriv (SVG) LLC and prizes require a fully verified account — flagged on the row.

**Audit trail added:** `research/EVIDENCE.csv` is a flat, spreadsheet-friendly export of every page-checked row (id, name, category, source, entry cost, prize, deadline, eligibility, reading date, evidence URL, reading session, flags) so any value on the site can be traced to the page it came from.



## T14 record — `ac192142-own1` (2026-11-02 UTC)

- **Claim:** committed and pushed before edits (`e5d5819`), on the fixed Arena branch `arena/ac192142-own1`.
- **Scope completed:** corrected root README and executive summary to reflect the active PrizeDesk generator and current source/verifier totals; added `data/verification/current-state-2026-11-02.md` with a targeted official-page refresh. No generated site pages, row data, shared navigation, or index were modified.
- **Official sources read:** [original upstream ledger](https://karagemop466-tech.github.io/FreeMoneyApps/); [Metaculus US Midterms](https://www.metaculus.com/tournament/midterms-2026/) and [rules](https://www.metaculus.com/tournament-rules/); [FutureEval tournament](https://www.metaculus.com/tournament/fall-futureeval-2026/) and [bot resources](https://www.metaculus.com/notebooks/38928/ai-benchmark-resources/); [Codex x TwitchCon rules](https://twitchcon-codex.devpost.com/rules); [GEMS / DrivenData](https://www.drivendata.org/competitions/306/competition-doe-gems/) and [HeroX official-rules resource](https://www.herox.com/GEMSPrize/resource/2274); [Global Virtual Hackathon](https://gvhackathon.com/), its [AI fairness terms](https://gvhackathon.com/fairness), and [teacher requirements](https://gvhackathon.com/for-teachers); [Kaggle competitions](https://www.kaggle.com/competitions). Individual facts, limits and unknowns are recorded in the audit note.
- **Verification:** read official pages directly on 2026-11-02; compared canonical totals with `data/source/PROVENANCE.json`, `data/additions.json`, and `data/verification.json`; ran `node scripts/build.js` (211 listings, 211 detail pages, 22 flags) and `npm run check` (passed: 555 HTML files, 13,563 local references, no internal broken links). Local link checks do not test external URLs.
- **Irregularities / corrections:** older root summary incorrectly described a separate 212-row Prize Atlas as current; current root pipeline has 211 combined records (206 pinned upstream + 5 attributed additions). The source website itself displays 206. New read shows Codex first-place `$10,000` is only one award within the official `$25,000` total. GEMS entry fee is not stated on the inspected competition page, so it remains unconfirmed. No Singapore-specific eligibility was established.
- **Integration request (resolved by PR #35):** the targeted reads and additional official-page checks were integrated into `data/cross-checks.json`, `data/verification.json`, the 221-row catalogue, Verified shortlist, and Flagged for Review. The 25 cross-check records across 22 rows are source-page reads, not all new direct live fetches; keep those evidence types distinct.

## T15 record — `7a477419-own1` (2026-11-02 UTC)

- **Claim:** pushed before edits (`10c6cf1`) under the label T14; renumbered T15 on merge because `ac192142-own1` also used T14 and landed first. Branch is the fixed Arena branch `arena/7a477419-own1`.
- **Scope done:** `data/cross-checks.json` (25 readings: 9 dated 2026-11-01, 16 dated 2026-11-02), `data/additions.json` (+10 rows, 221 total), `data/shortlist-notes.json`, `scripts/{ingest,build,verify,content}.js`, a new "Verified shortlist" page (`shortlist.html`), irregularities I-22…I-30 (31 flags in total), regenerated pages, `docs/SESSION-7a477419.md`. Root `EXECUTIVE_SUMMARY.md` keeps ac192142's rewrite and gains an update note at the top.
- **Integration request from the T14 audit answered:** Midterms, FutureEval, GEMS, Global Virtual Hackathon, Codex and the Kaggle index are in the PrizeDesk data, each from this session's own read of the official pages on 2026-11-02 (links below). Their audit note remains at `data/verification/current-state-2026-11-02.md`.
- **Official sources read (2026-11-02):** [ARC Prize](https://arcprize.org/competitions/2026); [Kaggle competitions](https://www.kaggle.com/competitions) and six overview pages (Gemma 4 Developer Agent, Name That LLM and its rules, Squares in Squares, Quantum circuit compilation, Enveda CASMI, NFL Big Data Bowl 2027); [Kaggle docs](https://www.kaggle.com/docs/competitions); [Kiroween](https://kiroween.devpost.com/rules); [Codegeist](https://codegeist2026.devpost.com/rules); [Meta VR Start rules](https://start-developer-competition-26.devpost.com/rules) (first of 7 chunks only); [Codex x TwitchCon](https://twitchcon-codex.devpost.com/); [XPRIZE Quantum Applications](https://www.xprize.org/competitions/qc-apps); [Metaculus Midterms](https://www.metaculus.com/tournament/midterms-2026/); [FutureEval](https://www.metaculus.com/tournament/fall-futureeval-2026/); [Metaculus rules](https://www.metaculus.com/tournament-rules/); [FutureEval resources](https://www.metaculus.com/notebooks/38928/ai-benchmark-resources/); [HeroX GEMS](https://www.herox.com/GEMSPrize); [Global Virtual Hackathon](https://gvhackathon.com/).
- **Irregularities logged:** I-22 (Metaculus dead slug), I-23 (Meta VR Start members only), I-24 (DSH Hacks title vs non-cash prizes), I-25 (Kaggle fee not stated), I-26 (ARC/Codex close today), I-27 (tool-locked or offline-only entries), I-28 (XPRIZE Quantum already in Finals), I-29 (GEMS US-based only; closing-time mismatch), I-30 (FutureEval bot running costs). Earlier: Codex $25,000 total vs $10,000 first place resolved; PayPal $67,500 vs $12,000 first place (I-20).
- **Not verified:** Meta VR Start prize table (rules page read to chunk 0 only); FutureEval prize split and resources sections 3-19; the GEMS rules PDF (fetch failed); zindi.world and aicrowd.com (JS shells); Singapore-specific eligibility for any competition.
- **Verification:** `npm run build` and `npm run check` passed (see publish log below for the final run). Local checks do not test external URLs.
- **PR / merge result:** [PR #35](https://github.com/sassnarep3-star/Own1/pull/35) merged to `main` as `d19ac56` after the `validate` check passed (2m55s). The `Validate site` run on `main` and the `pages build and deployment` run both succeeded; the Pages build status was `built` for `d19ac56`. The live [Verified shortlist](https://sassnarep3-star.github.io/Own1/shortlist.html) page was fetched after deployment and lists the FutureEval row, so the published site includes this work.

## T16 record — `ac192142-own1` (2026-11-02 UTC)

- **Why:** after PR #35 merged the 221-row/31-flag dataset, the generated summary incorrectly described 221 rows as the upstream count. This correction distinguishes 206 pinned upstream listings from 15 separately attributed additions.
- **Work:** update README and executive summary, correct the audit note to record the PR #35 integration, refresh generated website/docs summaries with current counts, official-source links, eligibility and AI/tool caveats, and add regression checks.
- **Conflict resolution:** rebased onto `origin/main` after PR #35 and preserved the merged data, shortlist and flags. PR #37 subsequently advanced `main` with a docs-only update to this coordination file; that update is preserved.
- **Verification:** `npm run build` passed: 221 listings, 31 flags, 241 generated files; 566 HTML files and 14,378 local references checked, no broken internal links. Markdown relative-link check and `git diff --check` passed. External URLs are not tested by local checks.
- **Publication:** pending fresh PR after the latest `main` integration.
