# Repo review — 2026-11-02

**Session:** `f25e2b4b-own1` (final integration, branch `arena/f25e2b4b-own1`)
**Purpose:** line-by-line review of the reference site, the pinned dataset, this repository's data contract, generator, tests, CI workflow and published pages. Every item links to a file or an official page for manual review.
**Rule:** no value is stated as a fact unless an official operator page was read on 2026-11-02. Anything else is left blank and flagged.

The same review is published on the live site at <https://sassnarep3-star.github.io/Own1/repo-review.html>. The full machine-readable irregularity register is [`data/review-2026-11-02.json`](data/review-2026-11-02.json) and the dated official-page reads are [`data/verification-2026-11-02.json`](data/verification-2026-11-02.json).

---

## 1. Scope and method

1. Read the reference site live at <https://karagemop466-tech.github.io/FreeMoneyApps/> and its GitHub repository tree at <https://github.com/karagemop466-tech/FreeMoneyApps> (default branch `main`, last updated 2026-08-19T22:08:24Z).
2. Read the reference site's own `index.html`, `assets/js/app.js`, `assets/css/style.css`, `README.md`, `index.md`, `100_VERIFIED_CONTESTS.md` and `AUDIT_2026-08-19*.md` through the GitHub API.
3. Verified the vendored dataset checksum against `data/source/PROVENANCE.json` (three copies of the pinned file hash identically).
4. Reviewed `package.json`, `.github/workflows/validate.yml`, `scripts/*.js`, `tests/*.mjs`, `data/*.json` and the published HTML pages.
5. Fetched 40 official operator pages on 2026-11-02 with a page-fetch tool; recorded the returned title, outcome and verbatim quotes in `data/verification-2026-11-02.json`.
6. Rebuilt the site and ran all checks; confirmed byte-for-byte determinism.

## 2. Reference site — what was reviewed

| File | Link for manual review | Finding |
| --- | --- | --- |
| `index.html` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/index.html> | Landing page explicitly says "No search box, no filters: just scroll, or tap a section to jump to it." All cards and the four headline counts are injected by JavaScript (`<div class="stat"><b id="statTotal">0</b>…`), so with scripts blocked the page shows an empty grid and four zeroes. |
| `assets/js/app.js` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/js/app.js> | Client-side card renderer. No table view, no filters, no per-row source status. |
| `assets/css/style.css` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/css/style.css> | A single `@media (max-width: 760px)` breakpoint; the card grid uses `repeat(auto-fit, minmax(240px, 1fr))`. On a phone, 206 cards is a long scroll with no comparison view. |
| `README.md` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/README.md> | Declares "206 listings across 9 categories" and says every entry has an official link. The live site's first chunk also claims "206 Listings", "189 True free paths", "62 iOS options", "60 Added this pass", and "US tax forms apply at $600+". |
| `100_VERIFIED_CONTESTS.md` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/100_VERIFIED_CONTESTS.md> | Opens with "SUPERSEDED — DO NOT USE AS A SOURCE" and documents that its own closing claims were false (rows with non-existent prizes/links). |
| `index.md` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/index.md> | "Superseded research document (2026-08-19). Kept for provenance." Contains the older NFL/EPL contest tables. |
| `assets/data.js` | <https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js> | The maintained 206-row ledger; vendored byte-for-byte as `data/source/ledger.source.js`. |
| `AUDIT_2026-08-19*.md` | <https://github.com/karagemop466-tech/FreeMoneyApps/tree/main> | The reference authors' own audit trail; read for provenance only. |

**Reference-site conclusion:** the defects the user reported are confirmed — the site is a long client-rendered card list with no search/filter/table (hard on mobile), and several operator links have rotted or been retired. Its own superseded documents show that some historical prize and link claims were wrong. None of those figures were imported as facts.

## 3. This repository — file-by-file review

| Path | Link for manual review | What was checked / finding |
| --- | --- | --- |
| `COORDINATION.md` | <https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md> | Shared task board. T1–T13 mostly Done; T8 unclaimed with no commits; stale open PR #3 from `arena/4db3cf09-own1` (last updated 2026-11-01T13:41:48Z). This session claimed T14 with session ID and file scope, committed and pushed the claim before editing shared outputs. |
| `README.md` | <https://github.com/sassnarep3-star/Own1/blob/main/README.md> | Was headed "Prize Atlas" and described a different generator (`tools/build.mjs`), 212 rows and `data/entries.json` — stale relative to the live PrizeDesk build. Rewritten for the 2026-11-02 build. |
| `EXECUTIVE_SUMMARY.md` | <https://github.com/sassnarep3-star/Own1/blob/main/EXECUTIVE_SUMMARY.md> | Was dated 2026-11-01 and claimed 211 listings / 18 verified / 6 partial / 187 unverified / 22 irregularities. Rewritten for the 2026-11-02 verification pass. |
| `docs/EXECUTIVE_SUMMARY.md` | <https://github.com/sassnarep3-star/Own1/blob/main/docs/EXECUTIVE_SUMMARY.md> | Generated by `scripts/render-docs.js` from the same content module as `executive-summary.html`, so the document and page cannot disagree. |
| `data/source/PROVENANCE.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/source/PROVENANCE.json> | Pins commit `466f7c1e7a14b52b4a0d36beb84a00d68fd409b7`, source file `assets/data.js`, SHA-256 `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`, declared review date 2026-08-19. |
| `data/source/ledger.source.js` | <https://github.com/sassnarep3-star/Own1/blob/main/data/source/ledger.source.js> | Byte-for-byte copy; three on-disk copies (`data/upstream/data.js.orig`, `data/source-data.js`) hash identically to the provenance SHA-256. |
| `data/ledger.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/ledger.json> | 211 rows: 206 source + 5 additions, 13 cross-checks merged. Types: sports 129, market 19, creative 18, tech 18, skill 12, pools 7, forecasting 4, trivia 2, directory 2. |
| `data/verification.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/verification.json> | Per-row official-source count, flags and historical live-check state. 11 rows have `officialSourceCount === 0`. |
| `data/irregularities.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/irregularities.json> | Historical 22-item register I-01…I-22, retained with its ids so existing links resolve. |
| `data/verification-2026-11-02.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/verification-2026-11-02.json> | **New**: 40 official pages fetched, 30 rows with field-by-field confirmed values and verbatim quotes, 7 new official leads. |
| `data/review-2026-11-02.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/review-2026-11-02.json> | **New**: repo file index, reference file index, 18 new irregularities R-01…R-18 with evidence and source links. |
| `data/live-checks.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/live-checks.json> | 12 historical live checks dated 2026-11-01. Its `method` says "Sandbox has no general outbound internet", which described that session only; a dated `laterNote` was added without changing or re-dating any historical check. |
| `data/link-health.json` | <https://github.com/sassnarep3-star/Own1/blob/main/data/link-health.json> | 203 URLs, 166 ok, 10 hard failures, 27 soft failures, dated 2026-11-01. Several failures are HTTP 403 anti-bot responses; the same pages loaded on 2026-11-02. |
| `scripts/ingest.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/ingest.js> | Verifies the SHA-256, strips `window.LEDGER = `, parses strict JSON, merges `cross-checks.json` and `additions.json`. JavaScript is never executed. |
| `scripts/verify.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/verify.js> | Produces per-row verification state and the historical irregularity register. Its `verifiedOn` remains 2026-11-01 because it describes the older live-check file. |
| `scripts/build.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/build.js> | Rewritten as a deterministic evidence-first generator: no network, no clock, no randomness; every value comes from `data/verification-2026-11-02.json`; everything else blank. |
| `scripts/summary-content.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/summary-content.js> | **New** shared content module for the executive summary page and `docs/EXECUTIVE_SUMMARY.md`. |
| `scripts/render-docs.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/render-docs.js> | Rewritten to use the shared content module. |
| `scripts/checklinks.js` | <https://github.com/sassnarep3-star/Own1/blob/main/scripts/checklinks.js> | Checks every internal link/anchor, one detail page per row, one appearance per row on `all.html`, and an external source link on every table row. |
| `tests/validate.mjs` | <https://github.com/sassnarep3-star/Own1/blob/main/tests/validate.mjs> | Schema-aware: with the current `data/entries.json` schema it link-checks all HTML pages instead of failing on a contract it does not own. |
| `tests/validate-prize-atlas.mjs` | <https://github.com/sassnarep3-star/Own1/blob/main/tests/validate-prize-atlas.mjs> | Validates the archived 208-row build and its evidence filter; kept working. |
| `.github/workflows/validate.yml` | <https://github.com/sassnarep3-star/Own1/blob/main/.github/workflows/validate.yml> | Rebuilds with `node scripts/build.js`, fails if any generated file changes, runs all checks, asserts the mobile viewport and CSS breakpoints at 520px/960px. |
| `assets/css/site.css` | <https://github.com/sassnarep3-star/Own1/blob/main/assets/css/site.css> | Mobile-first; labelled cells at narrow widths; contains `@media (min-width: 520px)` and `@media (min-width: 960px)`. |
| `assets/js/app.js` | <https://github.com/sassnarep3-star/Own1/blob/main/assets/js/app.js> | Progressive-enhancement search/filter/sort; tables are fully rendered in HTML and work without JavaScript. |
| published root pages | <https://github.com/sassnarep3-star/Own1/tree/main> | `index.html`, `all.html`, `best.html`, `analysis.html`, `verified.html`, `verification.html`, `repo-review.html`, `research.html`, `flagged.html`, `executive-summary.html`, `404.html`, `sitemap.xml`, `.nojekyll` — all regenerated. |
| `categories/**`, `c/**` | <https://github.com/sassnarep3-star/Own1/tree/main/categories> | 9 category pages + 211 detail pages, all regenerated with verified-only values. |
| `archive/**`, `ledger/**`, `entry/**`, `supplemental/**` | <https://github.com/sassnarep3-star/Own1/tree/main/archive> | Earlier builds from parallel sessions. Preserved untouched; all of their local links still resolve. |

## 4. Data-integrity checks performed

- `sha256sum data/source/ledger.source.js` equals the `sourceFileSha256` in `PROVENANCE.json`: `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`. Two other copies match.
- `node scripts/ingest.js` reports 211 listings (206 source + 5 merged), 13 cross-checked rows, 9 categories.
- `node scripts/verify.js` reports 211 rows, 11 with no official source, 22 irregularities.
- `node scripts/build.js` reports 232 generated files (211 detail pages, 9 category pages, 12 root pages, sitemap).
- `node scripts/checklinks.js`: 557 HTML files, 211 table rows, no broken internal links/anchors, every row has a source link.
- `node tests/validate.mjs`: 16,525 local references checked across 557 pages, no failures.
- `node tests/validate-prize-atlas.mjs`: archived 208-row build passes.
- `npm run build` full chain passed; a second `node scripts/build.js` produced no diff (deterministic).

## 5. Irregularities flagged (summary)

The full register with evidence, severity, affected rows and source links is [`data/review-2026-11-02.json`](data/review-2026-11-02.json) and the [Flagged for Review page](https://sassnarep3-star.github.io/Own1/flagged.html). IDs R-01…R-18 are new on 2026-11-02; I-01…I-22 are retained from the earlier review.

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
| R-11 | medium | Repo contains several overlapping builds and stale docs | <https://github.com/sassnarep3-star/Own1/blob/main/README.md> |
| R-12 | low | Link-health check mixes real failures with HTTP 403 bot blocks | <https://github.com/sassnarep3-star/Own1/blob/main/data/link-health.json> |
| R-13 | medium | AIcrowd official index returned no verifiable competition facts | <https://www.aicrowd.com/challenges> |
| R-14 | low | FPL rules URL redirects; official rules state no cash prize | <https://fantasy.premierleague.com/en/help/rules> |
| R-15 | low | Blanket "$600 tax form" claim is a generalisation, not a universal rule | <https://www.mlb.com/apps/beat-the-streak/official-rules> |
| R-17 | high | GEMS official rules and competition page disagree on the submission cut-off time; AI use must be disclosed | <https://www.nlr.gov/docs/fy26osti/96647.pdf> |
| R-18 | high | Metaculus tournament rules bar bots/AI accounts from prizes by default | <https://www.metaculus.com/tournament-rules/> |
| R-16 | low | 2026-11-01 record says "no outbound internet"; a dated correction was added | <https://github.com/sassnarep3-star/Own1/blob/main/data/live-checks.json> |

**Handoff integrated:** PR #3 from session `4db3cf09-own1` (task T8, stale since 2026-11-01, no further commits) asked the integration owner to publish two independent rules findings. Its research file `research/gems-rules-4db3cf09.md` was preserved verbatim, the [GEMS official rules](https://www.nlr.gov/docs/fy26osti/96647.pdf), [DrivenData rules page](https://www.drivendata.org/competitions/306/competition-doe-gems/rules/) and [Metaculus Tournament Rules](https://www.metaculus.com/tournament-rules/) were re-fetched and read on 2026-11-02, and the findings were published as R-17 and R-18 with their exact quotes. No work from that session was discarded.

All are **status: needs review** and do not block publication or the merge.

## 6. Manual-review checklist

1. Open <https://sassnarep3-star.github.io/Own1/verified.html> and compare any quoted value with its official URL.
2. Open <https://sassnarep3-star.github.io/Own1/flagged.html#unverified-rows> and nominate rows for the next verification pass.
3. Open <https://sassnarep3-star.github.io/Own1/flagged.html#no-official-source> and supply an operator link for any of the 11 rows.
4. Compare [`EXECUTIVE_SUMMARY.md`](EXECUTIVE_SUMMARY.md), [`docs/EXECUTIVE_SUMMARY.md`](docs/EXECUTIVE_SUMMARY.md) and the live executive-summary page.
5. Review the build gate: [`.github/workflows/validate.yml`](https://github.com/sassnarep3-star/Own1/blob/main/.github/workflows/validate.yml), [`scripts/checklinks.js`](https://github.com/sassnarep3-star/Own1/blob/main/scripts/checklinks.js).
6. Read [`research/VERIFICATION-2026-11-02.md`](research/VERIFICATION-2026-11-02.md) for the dated, line-by-line verification record.

## 7. What was deliberately not done

- No value was inferred, converted, summed, rounded or filled from the reference ledger.
- No historical dataset, archived build or parallel session's file was deleted, renamed or overwritten.
- No unverified row was dropped from the site; all 211 rows remain published with blank values where confirmation is missing.
- No approval was awaited; the merge proceeds once the build, checks and deployment succeed.
