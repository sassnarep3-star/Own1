# Coordination — Own1

Shared task board for the parallel agent sessions working on this repository. Arena fixes each
session's branch name, so the owning branch is recorded instead of a `session-<id>/<task>` branch.

## Repository state: two merged evidence layers

| Layer | Front door | Generator | Data | Owner |
| --- | --- | --- | --- | --- |
| **Atlas** | `index.html` | `scripts/build.mjs` | `data/verified.json`, `data/legacy.json`, `data/atlas-findings.json` | `75155aeb-own1` (arena/75155aeb-own1) |
| **Ledger pass** | `ledger-pass.html` → `all.html`, `verification.html`, `flagged.html`, `methodology.html`, `executive-summary.html`, `sources.html`, `cross-session.html` | `tools/build_site.py` | `data/ledger.json`, `data/verification.json`, `data/audit.json` | earlier sessions, merged via `main` |

Both layers are published. Neither dataset was deleted or overwritten during the merge.

## Task board

| Task | Status | Owner (branch) | File scope | Notes |
| --- | --- | --- | --- | --- |
| First-pass site, 208 imported rows, 7 checked | done | `27a86924-own1` | — | PRs #1 and #2. Replaced by later passes. |
| Ledger pass: mirror catalogue, verify 12 rows with quotes, audit tooling | done | prior sessions (see git log / `cross-session.html`) | `data/ledger.json`, `data/verification.json`, `data/audit.json`, `tools/**`, `all.html`, `best-picks.html`, `verification.html`, `flagged.html`, `methodology.html`, `executive-summary.html`, `sources.html`, `cross-session.html`, `assets/css/**`, `EXECUTIVE_SUMMARY.md`, `IRREGULARITIES.md`, `VERIFICATION.md`, `supplemental/**` | Merged from `main` into this branch and preserved untouched. |
| Re-import catalogue as quarantined leads | done | `75155aeb-own1` | `scripts/import_legacy.mjs`, `data/legacy.json` | 206 listings; prize/fee/deadline/eligibility blanked by policy; dead-domain and http-only flags. |
| Verify operator pages, build verified dataset | done | `75155aeb-own1` | `data/verified.json`, `research/SOURCES.md` | 44 rows verified 2026-11-01; 17 findings with sources. |
| Atlas site: dashboard, shortlist, categories, review, summary, method | done | `75155aeb-own1` | `index.html`, `shortlist.html`, `categories.html`, `category/**`, `review.html`, `summary.html`, `method.html`, `ledger-pass.html`, `404.html`, `assets/style.css`, `assets/app.js`, `sitemap.xml` | Mobile-first; tables become cards under 900px. |
| Validation and CI | done | `75155aeb-own1` | `tests/validate.mjs`, `.github/workflows/validate.yml` | 3,289 checks covering **both** layers, including every internal link and page reachability. |
| Merge with `main` and publish | in progress | `75155aeb-own1` | `README.md`, `COORDINATION.md` | Merge result and deploy check recorded below. |
| Reconcile the two datasets into one schema | **unclaimed — open task** | — | would touch `data/verified.json`, `data/ledger.json`, both generators | Do not start without claiming here; it breaks both build pipelines if done piecemeal. |

## Requests / handoffs

- **Two generators write overlapping files.** `tools/build_site.py` (ledger pass) and
  `scripts/build.mjs` (Atlas) both write `index.html` and `category/*.html`. The current `index.html`
  and category pages are the Atlas versions. Re-running the Python generator will overwrite them —
  coordinate before doing so.
- `data/audit.json` belongs to the ledger pass. The Atlas findings live in `data/atlas-findings.json`
  to avoid a schema clash.
- `tests/validate.mjs` now validates the whole repository, both layers included. Any new page must be
  linked from a reachable page or the build will fail.
- No other session had an open claim while this integration ran. Log a request here rather than
  editing another layer's files.

## Verification performed (2026-11-01 UTC)

- **Imported:** 206 listings from the reference `assets/data.js` (pass "S", stamped 2026-08-19).
  Only id, name, category, one source URL, legacy claim, status, free-path and description kept.
- **DNS-checked:** all 223 distinct hostnames. Six failed: `supercoach.news.com.au`,
  `fantasyfootball.skysports.com`, `fantasy.football.scot`, `fantazilig.tff.org`,
  `fantasy.premiershiprugby.com`, `fantasyracing.telegraph.co.uk`.
- **Verified:** 44 rows against operator pages (ESPN, CBS Sports ×2, Kaggle ×4, ARC Prize, DrivenData,
  Devpost ×9, Metaculus ×14, Sony World Photography ×4, Vocal, Givling, XPRIZE ×4). Every row links the
  page read and the date. Log: [research/SOURCES.md](research/SOURCES.md).
- **Automated:** `node tests/validate.mjs` → **3,289/3,289 checks pass**, including "no verified field
  copied from a legacy claim", "lead rows never populate prize/fee/deadline", "every internal link in
  the repository resolves", "every published page is reachable from the dashboard" and "rendered rows
  match the dataset".
- **Served:** all pages and assets returned HTTP 200 from a local static server before publishing.

## Irregularities

17 Atlas findings are published on [review.html](review.html) with source links and summarised in
[research/SOURCES.md](research/SOURCES.md) §4; the ledger pass publishes its own set on
[flagged.html](flagged.html). None blocks publication. The most consequential: every catalogue prize
claim is unverified, six source domains are dead, one source is http-only, 26 "ended" listings still
read as open, and four categories have no verified entry.

## Merge record

- Branch `arena/75155aeb-own1`, branched from `main` at `90a7908`.
- `main` advanced to `4e70115` (PRs #8, #10, #12) while this branch was being built. The merge was done
  locally with `git merge origin/main`: **the ledger pass was kept intact**, the Atlas layer kept
  ownership of `index.html`, `category/*`, `review.html`, `assets/style.css`, `assets/app.js` and
  `tests/validate.mjs`; `data/audit.json` stayed with the ledger pass and the Atlas findings moved to
  `data/atlas-findings.json`.
- No conflicted file had its other-side content discarded: every replaced file is either regenerated
  from its own data (Atlas pages) or preserved under its own path (ledger pass pages and tools).
- Pull request, merge and GitHub Pages deploy: recorded below once complete.
