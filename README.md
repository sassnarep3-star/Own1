# PrizeDesk — free-to-enter cash-prize competitions

A static, mobile-first dashboard built from the reference ledger at
<https://karagemop466-tech.github.io/FreeMoneyApps/>. Every published value was read on an official
operator page on **2026-11-02**; anything that could not be confirmed is left **blank and flagged
unverified**. No value is inferred, converted, summed or carried over from the third-party ledger as a fact.

**Live site:** <https://sassnarep3-star.github.io/Own1/>
**Verification pass:** [`data/verification-2026-11-02.json`](data/verification-2026-11-02.json) (40 official pages, 30 rows with confirmed values, 181 rows blank and flagged)
**Written review:** [`REPO_REVIEW.md`](REPO_REVIEW.md), [`research/VERIFICATION-2026-11-02.md`](research/VERIFICATION-2026-11-02.md), [`EXECUTIVE_SUMMARY.md`](EXECUTIVE_SUMMARY.md)

## What is in here

| Path | What it is |
| --- | --- |
| `index.html` | Dashboard: counts, best verified opportunities, closing deadlines, category cards, findings |
| `all.html` | All 211 rows in one searchable/filterable table; every row links to a source |
| `categories/*.html` | Nine category subpages with the same verified-only table |
| `c/*.html` | One detail page per row: confirmed values, verbatim quotes, sources and flags |
| `best.html` | Open-now shortlist, excluded rows with reasons, AI-agent rules, new official leads |
| `analysis.html` | Coverage, AI compatibility, deadlines, per-row irregularities, findings and limits |
| `verified.html` | Line-by-line evidence: 40 pages fetched and 30 rows with verbatim quotes and URLs |
| `verification.html` | Provenance, the five verification rules, badge meanings, reproduce steps |
| `repo-review.html` | Repo review with GitHub links for manual review |
| `research.html` | Source audit of the reference site |
| `flagged.html` | **Flagged for Review** — 40 irregularities (R-01…R-18 and I-01…I-22), all unverified rows, no-official-source rows and link-health observations |
| `executive-summary.html` | Executive summary rendered from `scripts/summary-content.js` |
| `data/source/PROVENANCE.json`, `data/source/ledger.source.js` | Pinned reference commit + SHA-256 and the byte-for-byte vendored source ledger |
| `data/ledger.json` | Canonical 211-row dataset (206 pinned + 5 merged additions, 13 cross-checks) |
| `data/verification-2026-11-02.json` | Dated official-page reads and per-field confirmed values with verbatim quotes |
| `data/review-2026-11-02.json` | Repo review and 18 new irregularities with source links |
| `data/verification.json`, `data/irregularities.json`, `data/link-health.json` | Earlier verification state, the historical 22-item register and a dated link-health observation |
| `scripts/build.js` | Deterministic generator (no network, no clock, no randomness) |
| `scripts/summary-content.js`, `scripts/render-docs.js` | Shared content for the executive-summary page and `docs/EXECUTIVE_SUMMARY.md` |
| `scripts/checklinks.js`, `tests/validate.mjs`, `tests/validate-prize-atlas.mjs` | Link, page and archived-build checks |
| `.github/workflows/validate.yml` | CI: rebuild + determinism diff, data/link checks, mobile viewport and breakpoint assertions |
| `archive/**`, `ledger/**`, `entry/**`, `supplemental/**` | Earlier builds from parallel sessions, preserved unchanged and link-checked |
| `COORDINATION.md` | Shared task board, claims, conflict log, sources and publication records |

## Data policy

- **Confirmed** values are copied verbatim from an official operator page fetched on 2026-11-02. Each carries its quote and URL on `verified.html` and in `data/verification-2026-11-02.json`.
- **Unverified** rows keep their name, category and links but have blank prize, entry, deadline, status and eligibility cells. They are listed individually on `flagged.html#unverified-rows`.
- Blank means *not confirmed* — never zero, never free. Only explicit operator wording such as "The Challenge is FREE to play" produces a confirmed-free badge.
- Rows with no official operator source are labelled `none official` and published with blank values.
- The reference ledger is third-party research: it supplies only the competition name, category grouping and where to look. Its own prize/status/free labels are not republished as values.
- Nothing is converted, combined, rounded, extrapolated or estimated; no win probability or expected value is published.
- Irregularities are published with evidence and source links; status "needs review" does not block publication.

## Build and checks

```bash
npm run build     # ingest -> verify -> build:site -> docs -> check
npm run check     # checklinks + validate.mjs + validate-prize-atlas.mjs
node scripts/build.js          # regenerate all HTML from committed JSON only
node scripts/render-docs.js    # regenerate docs/EXECUTIVE_SUMMARY.md
python3 -m http.server 8000 --bind 0.0.0.0   # local preview
```

No dependencies and no build step at deploy time. GitHub Pages serves the repository root of `main`
(`.nojekyll` present). CI rebuilds the site and fails if any generated file changes, so a stale
commit cannot publish a broken page.

## Adding or verifying a row

1. Fetch the operator's official page; read the exact wording for prize, entry cost, deadline, status and eligibility.
2. Add a row to `data/verification-2026-11-02.json` with a `facts` object whose `value`, `quote` and `url` come from that page. Leave every other field out (blank) and record it in `notStated`.
3. Add the URL to `pages` with the returned title and outcome, and any irregularities to `data/review-2026-11-02.json`.
4. Run `npm run build`. If a check fails, fix it before merging.
5. Commit the generated pages together with the data files.

Never fill a blank from the reference ledger, a news article, a forum or an estimate.
