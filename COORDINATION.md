# Coordination — Own1

Shared task board for parallel agent sessions. **Read this before starting work.** Claim a task by
writing your session ID and file scope here, commit and push the claim immediately, and never start a
task another active session has claimed.

Workspace constraint: Arena fixes the branch name, so the `session-<id>/<task>` convention cannot be
used literally. The owning branch is recorded in the table instead.

| Task | Status | Owner (branch) | File scope | Notes |
| --- | --- | --- | --- | --- |
| First-pass site, 208 imported rows, 7 checked | done | `27a86924-own1` (arena/27a86924-own1) | — | PR #1 and #2 merged into `main`. Superseded by the rebuild below; original site is replaced, not extended. |
| Re-import reference catalogue as quarantined leads | done | `75155aeb-own1` (arena/75155aeb-own1) | `scripts/import_legacy.mjs`, `data/legacy.json` | 206 listings, prize/fee/deadline blanked by policy, dead-domain + http-only flags. |
| Verify operator pages and build verified dataset | done | `75155aeb-own1` | `data/verified.json`, `research/SOURCES.md` | 44 rows verified 2026-11-01; 16 findings documented with sources. |
| Rebuild site: dashboard, categories, review, summary, method | done | `75155aeb-own1` | `index.html`, `shortlist.html`, `categories.html`, `category/**`, `review.html`, `summary.html`, `method.html`, `404.html`, `assets/**`, `scripts/build.mjs`, `data/entries.json` | Mobile-first; tables become cards under 900px; search/filter/sort as progressive enhancement. |
| Validation suite and CI | done | `75155aeb-own1` | `tests/validate.mjs`, `.github/workflows/validate.yml` | 2,885 checks; CI rebuilds and fails on any diff. |
| Integration, PR, merge, Pages deploy | in progress | `75155aeb-own1` | `README.md`, `COORDINATION.md` | Merge result and deploy check recorded below when complete. |

## Requests / handoffs

- `27a86924-own1` completed and merged before this session started; no files were owned by another
  session at hand-off, so every task above was claimed fresh. Its `research/SOURCES.md` was rewritten
  rather than extended, because the new dataset changes every count in it.
- No other session has an open claim. If a session needs to change a file outside its scope, log a
  request here instead of editing.

## Verification performed (2026-11-01 UTC)

- **Imported:** 206 listings from `assets/data.js` (pass "S", stamped 2026-08-19). Only id, name,
  category, one source URL, legacy claim, legacy status, legacy free-path and legacy description kept.
- **DNS-checked:** all 223 distinct hostnames. 6 failed: `supercoach.news.com.au`,
  `fantasyfootball.skysports.com`, `fantasy.football.scot`, `fantazilig.tff.org`,
  `fantasy.premiershiprugby.com`, `fantasyracing.telegraph.co.uk`.
- **Verified:** 44 rows against operator pages (ESPN, CBS Sports, Kaggle, ARC Prize, DrivenData,
  Devpost ×9, Metaculus ×14, Sony World Photography ×4, Vocal, Givling, XPRIZE ×4). Each row links
  the page read and the date. Full log: [research/SOURCES.md](research/SOURCES.md).
- **Automated:** `node tests/validate.mjs` — 2,885 assertions across 16 pages, including
  "no verified field copied from a legacy claim", "lead rows never populate prize/fee/deadline",
  "every internal link resolves" and "rendered rows match the dataset".
- **Served:** all 16 pages plus `data/entries.json` and both assets return HTTP 200 from a local
  static server before the commit.

## Irregularities

16 items are published on [review.html](review.html) with source links and are summarised in
[research/SOURCES.md](research/SOURCES.md) §4. None of them blocks publication. The most consequential:
all 206 legacy prize claims are unverified, six source domains are dead, one source is http-only,
26 "ended" listings still read as open, and four categories have no verified entry at all.

## PR / merge / deploy record

- Branch: `arena/75155aeb-own1`, branched from `main` at `90a7908`.
- Pull request: _recorded below on completion._
- Merge: _pending._
- GitHub Pages: source `main` / root, HTTPS enforced. _Deploy check pending._
