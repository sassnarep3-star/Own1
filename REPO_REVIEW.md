# Repo review — 2026-11-02

**Session:** `f25e2b4b-own1` (final integration, branch `arena/f25e2b4b-own1`, task T17 — renumbered from T14 after `main` advanced)
**Purpose:** line-by-line review of the reference site, the pinned dataset, this repository's data contract, generator, tests, CI workflow and published pages. Every item links to a file or an official page for manual review.
**Rule:** no value is stated as a fact unless an official operator page was read on 2026-11-02. Anything else is left blank and flagged.

The same review is published on the live site at <https://sassnarep3-star.github.io/Own1/repo-review.html>. The full machine-readable irregularity register is [`data/review-2026-11-02.json`](data/review-2026-11-02.json) and the dated official-page reads are [`data/verification-2026-11-02.json`](data/verification-2026-11-02.json).

---

## 1. Scope and method

1. Read the reference site live at <https://karagemop466-tech.github.io/FreeMoneyApps/> and its GitHub repository tree at <https://github.com/karagemop466-tech/FreeMoneyApps>.
2. Read the reference site's own `index.html`, `assets/js/app.js`, `assets/css/style.css`, `README.md`, `index.md`, `100_VERIFIED_CONTESTS.md` and audit documents through the GitHub API.
3. Verified the vendored dataset checksum against `data/source/PROVENANCE.json` (three on-disk copies hash identically).
4. Reviewed `package.json`, `.github/workflows/validate.yml`, `scripts/*.js`, `tests/*.mjs`, `data/*.json` and the published HTML pages.
5. Fetched 40 official operator pages on 2026-11-02 with a page-fetch tool; recorded the returned title, outcome and verbatim quotes.
6. Rebased onto the newest `origin/main` (`ce854c6`), resolved the `COORDINATION.md` conflict without discarding any session's work, and regenerated every page from the **combined 221-row dataset**.
7. Rebuilt the site and ran all checks; confirmed byte-for-byte determinism.

## 2. Reference site — what was reviewed

| File | Link for manual review | Finding |
| --- | --- | --- |
| `index.html` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/index.html> | Landing page explicitly says "No search box, no filters: just scroll, or tap a section to jump to it." All cards and the four headline counts are injected by JavaScript (`<div class="stat"><b id="statTotal">0</b>…`), so with scripts blocked the page shows an empty grid and four zeroes. |
| `assets/js/app.js` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/js/app.js> | Client-side card renderer. No table view, no filters, no per-row source status. |
| `assets/css/style.css` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/css/style.css> | A single `@media (max-width: 760px)` breakpoint; the card grid uses `repeat(auto-fit, minmax(240px, 1fr))`. On a phone, 206 cards is a long scroll with no comparison view. |
| `README.md` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/README.md> | Declares "206 listings across 9 categories" and says every entry has an official link. The live page also claims "206 Listings", "189 True free paths", "62 iOS options", "60 Added this pass", and "US tax forms apply at $600+". |
| `100_VERIFIED_CONTESTS.md` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/100_VERIFIED_CONTESTS.md> | Opens with "SUPERSEDED — DO NOT USE AS A SOURCE" and documents that its own closing claims were false (rows with non-existent prizes/links). |
| `index.md` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/index.md> | "Superseded research document (2026-08-19). Kept for provenance." |
| `assets/data.js` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js> | The maintained 206-row ledger; vendored byte-for-byte as `data/source/ledger.source.js`. |

**Reference-site conclusion:** the defects the user reported are confirmed — the site is a long client-rendered card list with no search/filter/table (hard on mobile), and several operator links have rotted or been retired. Its own superseded documents show that some historical prize and link claims were wrong. None of those figures were imported as facts.

## 3. This repository — file-by-file review

| Path | Link for manual review | What was checked / finding |
| --- | --- | --- |
| `COORDINATION.md` | <https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md> | Shared task board. T1–T13 done; T8 unclaimed with no commits; T14 (`ac192142-own1`), T15 (`7a477419-own1`) and T16 (`ac192142-own1`) landed on `main` via PRs #34–#39 while this session worked. This session's claim was renumbered to **T17** on rebase and its conflict logged below. Stale open PR #3 from `4db3cf09-own1` handled as a handoff. |
| `README.md` | <https://github.com/sassnarep3-star/Own1/blob/main/README.md> | Was headed "Prize Atlas" and described a different generator; rewritten for the 221-row combined build, keeping the earlier session's dataset reconciliation and current-state-audit links. |
| `EXECUTIVE_SUMMARY.md` | <https://github.com/sassnarep3-star/Own1/blob/main/EXECUTIVE_SUMMARY.md> | Rewritten for the 2026-11-02 verification pass, keeping the earlier session's 206 + 15 = 221 reconciliation, Verified shortlist and Singapore eligibility caveat. |
| `docs/EXECUTIVE_SUMMARY.md` | <https://github.com/sassnarep3-star/Own1/blob/main/docs/EXECUTIVE_SUMMARY.md> | Generated by `scripts/render-docs.js` from the same content module as `executive-summary.html`, so the document and page cannot disagree. |
| `data/source/PROVENANCE.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/source/PROVENANCE.json> | Pins commit `466f7c1e7a14b52b4a0d36beb84a00d68fd409b7`, source file `assets/data.js`, SHA-256 `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`, declared review date 2026-08-19. |
| `data/source/ledger.source.js` | <https://github.com/sassnarep3-star/Own1/blob/main/data/source/ledger.source.js> | Byte-for-byte copy; `data/upstream/data.js.orig` and `data/source-data.js` hash identically to the provenance SHA-256. |
| `data/ledger.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/ledger.json> | **221 rows**: 206 pinned upstream + 15 attributed additions, with 25 cross-check records merged. |
| `data/verification.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/verification.json> | Per-row official-source count, flags, cross-checks and historical live-check state. 11 rows have `officialSourceCount === 0`. |
| `data/irregularities.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/irregularities.json> | Historical **31-item** register I-01…I-30 plus I-16, retained with its ids so existing links resolve. |
| `data/verification-2026-11-02.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/verification-2026-11-02.json> | **New**: 40 official pages fetched, 30 rows with field-by-field confirmed values and verbatim quotes, 7 new official leads. |
| `data/review-2026-11-02.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/review-2026-11-02.json> | **New**: repo file index, reference file index, 18 new irregularities R-01…R-18 with evidence and source links. |
| `data/cross-checks.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/cross-checks.json> | 25 dated official-page checks with reader attribution, quarantined from the pinned source file. Preserved. |
| `data/shortlist-notes.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/shortlist-notes.json> | Per-row sourced notes for the Verified shortlist, written by `7a477419-own1`. Rendered verbatim on `shortlist.html`. |
| `data/verification/current-state-2026-11-02.md` | <https://github.com/sassnarep3-star/Own1/blob/main/data/verification/current-state-2026-11-02.md> | Earlier session's targeted official-source refresh and PR #35 integration update. Preserved verbatim. |
| `docs/SESSION-7a477419.md` | <https://github.com/sassnarep3-star/Own1/blob/main/docs/SESSION-7a477419.md> | Earlier session's integration log for 10 sourced additions and flags I-22…I-30. Preserved verbatim. |
| `data/live-checks.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/live-checks.json> | 12 historical live checks dated 2026-11-01. Its `method` says "Sandbox has no general outbound internet", which described that session only; a dated `laterNote` was added without changing or re-dating any historical check. |
| `data/link-health.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/link-health.json> | 203 URLs, 166 ok, 10 hard failures, 27 soft failures, dated 2026-11-01. Several failures are HTTP 403 anti-bot responses; the same pages loaded on 2026-11-02. |
| `scripts/ingest.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/ingest.js> | Verifies the SHA-256, strips `window.LEDGER = `, parses strict JSON, merges `cross-checks.json` and `additions.json`. JavaScript is never executed. |
| `scripts/verify.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/verify.js> | Produces per-row verification state and the historical irregularity register; now reports 221 rows and 31 irregularities. `verifiedOn` remains 2026-11-01 because it describes the older live-check file. |
| `scripts/build.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/build.js> | Rewritten as a deterministic evidence-first generator: no network, no clock, no randomness. Supersedes the earlier generator edits from T16; the Verified shortlist page was carried forward and regenerated from the same sourced notes. |
| `scripts/summary-content.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/summary-content.js> | **New** shared content module for the executive-summary page and `docs/EXECUTIVE_SUMMARY.md`. |
| `scripts/render-docs.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/render-docs.js> | Rewritten to use the shared content module. |
| `scripts/render-verification-record.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/render-verification-record.js> | **New** human-readable line-by-line export of the dated official-page reads. |
| `scripts/checklinks.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/checklinks.js> | Checks every internal link/anchor, one detail page per row, one appearance per row on `all.html`, and an external source link on every table row. |
| `tests/validate.mjs` | <https://github.com/sassnarep3-star/Own1/blob/main/tests/validate.mjs> | Schema-aware link checks plus T16's executive-summary count/date regression checks; all pass on this build. |
| `tests/validate-prize-atlas.mjs` | <https://github.com/sassnarep3-star/Own1/blob/main/tests/validate-prize-atlas.mjs> | Validates the archived 208-row build and its evidence filter; kept working. |
| `.github/workflows/validate.yml` | <https://github.com/sassnarep3-star/Own1/blob/main/.github/workflows/validate.yml> | Rebuilds with `node scripts/build.js`, fails if any generated file changes, runs all checks, asserts the mobile viewport and CSS breakpoints at 520px/960px. |
| `assets/css/site.css` | <https://github.com/sassnarep3-star/Own1/blob/main/assets/css/site.css> | Mobile-first; labelled cells at narrow widths; contains `@media (min-width: 520px)` and `@media (min-width: 960px)`. |
| `assets/js/app.js` | <https://github.com/sassnarep3-star/Own1/blob/main/assets/js/app.js> | Progressive-enhancement search/filter/sort; tables are fully rendered in HTML and work without JavaScript. |
| published root pages | <https://github.com/sassnarep3-star/Own1/tree/main> | `index.html`, `all.html`, `best.html`, `shortlist.html`, `analysis.html`, `verified.html`, `verification.html`, `repo-review.html`, `research.html`, `flagged.html`, `executive-summary.html`, `404.html`, `sitemap.xml`, `.nojekyll` — all regenerated. |
| `categories/**`, `c/**` | <https://github.com/sassnarep3-star/Own1/tree/main/categories> | 9 category pages + 221 detail pages, all regenerated with verified-only values. |
| `archive/**`, `ledger/**`, `entry/**`, `supplemental/**` | <https://github.com/sassnarep3-star/Own1/tree/main/archive> | Earlier builds from parallel sessions. Preserved untouched; all of their local links still resolve. |
| `research/gems-rules-4db3cf09.md` | <https://github.com/sassnarep3-star/Own1/blob/main/research/gems-rules-4db3cf09.md> | Independent GEMS rules review handed off by `4db3cf09-own1` in PR #3, preserved verbatim and re-verified. |
| `research/VERIFICATION-2026-11-02.md` | <https://github.com/sassnarep3-star/Own1/blob/main/research/VERIFICATION-2026-11-02.md> | This session's line-by-line verification record. |

## 4. Data-integrity checks performed

- `sha256sum data/source/ledger.source.js` equals the `sourceFileSha256` in `PROVENANCE.json`: `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`. Two other copies match.
- `node scripts/ingest.js` reports 221 listings (206 pinned + 15 additions), 25 cross-check records, 9 categories.
- `node scripts/verify.js` reports 221 rows, 11 with no official source, 31 irregularities.
- `node scripts/build.js` reports **243 generated files** (221 detail pages, 9 category pages, 13 root pages, sitemap).
- `node scripts/checklinks.js`: 568 HTML files, 221 table rows, no broken internal links/anchors, every row has a source link.
- `node tests/validate.mjs`: 17,478 local references checked across 568 pages, no failures; executive-summary regression checks pass.
- `node tests/validate-prize-atlas.mjs`: archived 208-row build passes.
- `npm run build` full chain passed; a second `node scripts/build.js` produced no diff (deterministic).

## 5. Conflict log (2026-11-02, integration by `f25e2b4b-own1`)

`git pull --rebase origin main` found that `main` had advanced from `ee4f824` to `ce854c6` with PRs #34–#39 (T14/T15/T16 by `ac192142-own1` and `7a477419-own1`). One `COORDINATION.md` content conflict and 230 generated-page conflicts appeared while replaying this session's commits. Nothing from another session was discarded:

| Item | Resolution |
| --- | --- |
| `COORDINATION.md` | Kept `main`'s T15 row and renumbered this session's claim to **T17** (its original T14 collided with `ac192142-own1`'s T14, which landed first). Both rows are on the board, with the reason recorded. |
| 230 generated HTML pages | Resolved to this session's replayed versions, then **regenerated from the combined 221-row dataset** with `npm run build`, so no page reflects the older 211-row state. |
| `scripts/build.js`, `scripts/render-docs.js` | Kept this session's deterministic generator. The earlier session's `shortlist.html`, `data/shortlist-notes.json`, `data/cross-checks.json`, current-state audit and integration log were all preserved and are rendered or linked from the new build. |
| `README.md`, `EXECUTIVE_SUMMARY.md`, `docs/EXECUTIVE_SUMMARY.md` | Rewritten as one merged document: this session's verification pass plus the earlier session's 206 + 15 = 221 reconciliation, Verified shortlist, 25 check records, 31 historical flags, PR #35/#38 records and Singapore eligibility caveat. |
| `data/entries.json`, `data/triage.json`, archived builds | Untouched; `tests/validate.mjs` still link-checks them and the archived builds pass. |

**Handoff from PR #3:** session `4db3cf09-own1` (task T8, stale since 2026-11-01, no further commits) asked the integration owner to publish two independent rules findings. Its `research/gems-rules-4db3cf09.md` was preserved verbatim; the [GEMS official rules](https://www.nlr.gov/docs/fy26osti/96647.pdf), [DrivenData rules page](https://www.drivendata.org/competitions/306/competition-doe-gems/rules/) and [Metaculus Tournament Rules](https://www.metaculus.com/tournament-rules/) were re-fetched and read on 2026-11-02; the findings were published as R-17 and R-18 with exact quotes. No work from that session was discarded.

## 6. Irregularities flagged (summary)

The full register with evidence, severity, affected rows and source links is [`data/review-2026-11-02.json`](data/review-2026-11-02.json) and the [Flagged for Review page](https://sassnarep3-star.github.io/Own1/flagged.html). IDs R-01…R-18 are new on 2026-11-02; I-01…I-30/I-16 are retained from earlier reviews. All are **status: needs review** and do not block publication or the merge.

| ID | Severity | Finding (abridged) | Primary source link |
| --- | --- | --- | --- |
| R-01 | high | Reference site's `100_VERIFIED_CONTESTS.md` is superseded and documents false claims | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/100_VERIFIED_CONTESTS.md> |
| R-02 | medium | 206 client-rendered cards, no search/filters/table, counts show zero without JS | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/index.html> |
| R-03 | high | HeroX `/challenges` 404, RoboForex `/contests/` 404, Challenge.gov sunset 2026-03-30 | <https://www.challenge.gov/> |
| R-04 | high | All upstream rows dated 2026-08-19; several statuses have changed | <https://fantasy.espn.com/games/nfl-survivor-2026/make-picks> |
| R-05 | high | Paid entry in a free ledger ($27 Tom Howard; Papaya Gems vs cash rooms) | <https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest> |
| R-06 | high | Non-cash "prizes": Bonus Cash, SB points, Gems, crowdfunding queue | <https://www.gamersaloon.com/promos/1rounder/> |
| R-07 | medium | Official pages contradict the ledger and sometimes themselves | <https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay> |
| R-08 | high | AI-agent rules differ sharply (permitted / restricted / prohibited) | <https://arcprize.org/competitions/2026> |
| R-09 | medium | Deadline fields mix registration close, submission close and event end | <https://gvhackathon.com/> |
| R-10 | medium | 11 rows have no official operator source | <https://github.com/sassnarep3-star/Own1/blob/main/data/verification.json> |
| R-11 | medium | Repo contains several overlapping builds and stale docs; `main` advanced during this task | <https://github.com/sassnarep3-star/Own1/blob/main/README.md> |
| R-12 | low | Link-health check mixes real failures with HTTP 403 bot blocks | <https://github.com/sassnarep3-star/Own1/blob/main/data/link-health.json> |
| R-13 | medium | AIcrowd official index returned no verifiable competition facts | <https://www.aicrowd.com/challenges> |
| R-14 | low | FPL rules URL redirects; official rules state no cash prize | <https://fantasy.premierleague.com/en/help/rules> |
| R-15 | low | Blanket "$600 tax form" claim is a generalisation, not a universal rule | <https://www.mlb.com/apps/beat-the-streak/official-rules> |
| R-16 | low | 2026-11-01 record says "no outbound internet"; a dated correction was added | <https://github.com/sassnarep3-star/Own1/blob/main/data/live-checks.json> |
| R-17 | high | GEMS official rules and competition page disagree on the submission cut-off time; AI use must be disclosed | <https://www.nlr.gov/docs/fy26osti/96647.pdf> |
| R-18 | high | Metaculus tournament rules bar bots/AI accounts from prizes by default | <https://www.metaculus.com/tournament-rules/> |

## 7. Manual-review checklist

1. Open <https://sassnarep3-star.github.io/Own1/verified.html> and compare any quoted value with its official URL.
2. Open <https://sassnarep3-star.github.io/Own1/flagged.html#unverified-rows> and nominate rows for the next verification pass.
3. Open <https://sassnarep3-star.github.io/Own1/flagged.html#no-official-source> and supply an operator link for any of the 11 rows.
4. Compare [`EXECUTIVE_SUMMARY.md`](EXECUTIVE_SUMMARY.md), [`docs/EXECUTIVE_SUMMARY.md`](docs/EXECUTIVE_SUMMARY.md) and the live executive-summary page.
5. Review the build gate: [`.github/workflows/validate.yml`](https://github.com/sassnarep3-star/Own1/blob/main/.github/workflows/validate.yml), [`scripts/checklinks.js`](https://github.com/sassnarep3-star/Own1/blob/main/scripts/checklinks.js).
6. Read [`research/VERIFICATION-2026-11-02.md`](research/VERIFICATION-2026-11-02.md) and the earlier [current-state audit](data/verification/current-state-2026-11-02.md).

## 8. What was deliberately not done

- No value was inferred, converted, summed, rounded or filled from the reference ledger.
- No historical dataset, archived build or parallel session's file was deleted, renamed or overwritten.
- No unverified row was dropped from the site; all 221 rows remain published with blank values where confirmation is missing.
- No approval was awaited; the merge proceeds once the build, checks and deployment succeed.
