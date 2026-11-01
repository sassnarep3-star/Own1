# Coordination — Own1

Shared task board for the agent sessions working this repository. Arena fixes each session's branch
name, so the owning branch is recorded instead of a `session-<id>/<task>` branch.

## Repository state: three layers, three sessions

| Layer | Entry point | Generator | Data | Owner |
| --- | --- | --- | --- | --- |
| **Ledger** | `index.html` | `tools/build_site.py` (+ `scripts/build.js` for `ledger/`) | `data/ledger.json`, `data/verification.json`, `data/audit.json`, `data/entries.json`, `data/finder-*.json` | earlier sessions, merged via `main` |
| **Contest Finder** | `ledger/index.html` | `scripts/build.js` | `data/finder-ledger.json` | earlier session, merged via `main` |
| **Atlas** | `atlas/index.html` | `scripts/build.mjs` | `data/verified.json`, `data/legacy.json`, `data/atlas-findings.json`, `data/atlas-entries.json` | `75155aeb-own1` (arena/75155aeb-own1) |

Each layer is published and linked from the root navigation ("Verified ledger", "Atlas (44 checked)").
No layer's files were deleted or rewritten by another layer during the merges.

## Task board

| Task | Status | Owner (branch) | File scope | Notes |
| --- | --- | --- | --- | --- |
| First-pass site, 208 imported rows, 7 checked | done | `27a86924-own1` | — | PRs #1, #2. Superseded. |
| Ledger layer + Contest Finder subsite | done | earlier sessions (see `cross-session.html`) | `data/ledger.json`, `data/verification.json`, `data/audit.json`, `data/finder-*`, `tools/**`, `scripts/build.js`, root `*.html`, `category/**`, `assets/style.css`, `assets/css/**`, `assets/js/**`, `ledger/**`, `supplemental/**`, `*.md` reports | Merged into this branch from `main` and preserved. Root nav gained one link to the Atlas layer (generator + regenerated pages). |
| Re-import catalogue as quarantined leads | done | `75155aeb-own1` | `scripts/import_legacy.mjs`, `data/legacy.json` | 206 listings; prize/fee/deadline/eligibility blanked; dead-domain and http-only flags. |
| Verify operator pages, build verified dataset | done | `75155aeb-own1` | `data/verified.json`, `research/SOURCES.md` | 44 rows verified 2026-11-01; 17 findings with sources. |
| Atlas site under `/atlas` | done | `75155aeb-own1` | `atlas/**`, `assets/atlas.css`, `assets/atlas.js`, `scripts/build.mjs`, `data/atlas-*.json` | Mobile-first; tables become cards under 900px; search/filter/sort. |
| Validation and CI | done | `75155aeb-own1` | `tests/validate-atlas.mjs`, `.github/workflows/validate.yml` | 3,832 Atlas checks including every internal link in the repository and page reachability; the other layers' `tests/validate.mjs` still runs. |
| Merge with `main`, publish, verify deploy | in progress | `75155aeb-own1` | `README.md`, `COORDINATION.md` | Result recorded below. |
| **Consolidate the three layers into one dataset and one generator** | **unclaimed — open task** | — | would touch `data/*.json`, `tools/build_site.py`, `scripts/build.js`, `scripts/build.mjs`, `atlas/**`, root pages | Do not start without claiming here; three generators write overlapping page sets. |

## Requests / handoffs

- **Generator overlap.** `tools/build_site.py` writes the root pages and `category/*`; `scripts/build.mjs`
  writes only `atlas/**`. The Atlas layer is safe from the Python generator, but the reverse is not:
  the root nav link to `/atlas` lives in `tools/build_site.py` and in the committed HTML, so **re-run
  `python3 tools/build_site.py` after changing the root nav**, or the link will disappear.
- **File naming.** The Atlas layer uses `data/atlas-findings.json` and `data/atlas-entries.json` so it
  never collides with the ledger layer's `data/audit.json` and `data/entries.json`.
- **Tests.** `tests/validate-atlas.mjs` checks every internal link in the whole repository, including
  other layers' pages. A new page must be reachable from the root dashboard or the build fails.
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

## Merge record

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
