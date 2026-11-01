# Free Cash Competition Ledger

A mobile-first dashboard of **206 free-to-enter competitions that can pay real cash**, rebuilt from the
[Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/) into something you can actually
decide from — with an official source link on every row and a separate verification layer that refuses to print a
number nobody confirmed.

**Live site:** <https://sassnarep3-star.github.io/Own1/>

## Why this exists

The reference site is a single 206-card scroll with no search, no filters, no ranking and no way to tell a
verified prize from a copied claim. It also contains rows that are wrong. This repository keeps the source data
**verbatim**, adds a mechanical audit over it, and adds a verification layer that only ever *adds* a value when an
operator's own page was read.

## What is on the site

| Page | What it answers |
| --- | --- |
| `index.html` | Dashboard: headline numbers, category map, top five, the findings that matter |
| `best-picks.html` | 25-row ranked shortlist with the score components shown + where an AI agent actually helps |
| `all.html` | All 206 rows, searchable / filterable / sortable, one official link per row |
| `category/{skill,sports,creative,tech,forecasting,market,trivia,directory,pools}.html` | One category per page |
| `verification.html` | Every row re-checked this pass: URL, verbatim quote, checked date, status |
| `flagged.html` | 11 mechanical integrity findings + 2 contradicted rows, each with its source |
| `methodology.html` | Provenance, exact score weights, limits |
| `sources.html` | Evidence pages used + every operator link by category |
| `executive-summary.html` | The executive summary (also `EXECUTIVE_SUMMARY.md`) |
| `cross-session.html` | What a parallel agent session verified before this build merged, with attribution |
| `review.html` | The other session’s review queue, still rendering their 208-row dataset |
| `supplemental/index.html` | The other session’s supplemental evidence page |

## Data and verification policy

| File | Meaning |
| --- | --- |
| `data/source-data.js` | Byte-for-byte copy of the reference site's `assets/data.js` (pass “S”, 2026-08-19), SHA-256 `13986a17…ed73211` |
| `data/ledger.json` | The same object as JSON, no edits, no added fields (206 listings) |
| `data/verification.json` | 12 rows checked against official pages on 2026-11-01, each with a URL + verbatim quote |
| `data/audit.json` | 11 deterministic integrity findings |
| `data/linkcheck.json` | Internal link / anchor / coverage results |
| `data/details.json` | Lazy-loaded detail payload used by the site's expandable rows |

**The rules the tooling enforces:**

1. Every catalogue row links to an operator page (`check_links.py` fails otherwise).
2. A prize number appears in the *verified* column only if `verification.json` cites the page it came from.
3. No currency conversion, no midpoints, no estimates. £5,000 stays £5,000; a €10,000 prize is not ranked against a
   $10,000 one.
4. A contradicted row keeps its contradiction visible. Nothing is silently deleted or corrected in the mirror.
5. External link liveness is **not** claimed. The build shell cannot reach operator domains, so “checked” only ever
   means a page read recorded in `verification.json`.

## Build

No framework, no bundler, no CI service required. Python 3.11+ only.

```bash
python3 tools/audit.py         # data/ledger.json      -> data/audit.json
python3 tools/verify_check.py  # validates data/verification.json (exits 1 on any unsourced claim)
python3 tools/build_site.py    # renders HTML to the repo root + category/
python3 tools/check_links.py   # internal links, anchors, row coverage; must print "RESULT: pass"
```

Deployment: GitHub Pages serves `main` at the repository root (`.nojekyll` is committed). Push to `main`, and Pages
rebuilds. The generated HTML is committed so the site works without a build step.

## Layout

```
index.html, best-picks.html, all.html, verification.html, flagged.html,
methodology.html, sources.html, executive-summary.html, cross-session.html, 404.html
category/*.html            generated category pages
assets/css/style.css       one stylesheet, mobile-first
assets/js/site.js          progressive enhancement only (search/sort/details)
assets/app.js, style.css   the parallel session's app, still used by review.html
data/ledger.json           verbatim mirror (206 listings)
data/verification.json     official-page evidence (12 rows, quoted)
data/audit.json            deterministic integrity findings
data/details.json          lazy-loaded row details
data/entries.json          the parallel session's 208-lead dataset (blanks preserved)
tools/                     audit.py, verify_check.py, build_site.py, check_links.py
review.html                the parallel session's review queue
supplemental/              the parallel session's supplemental evidence page
research/SOURCES.md        the parallel session's source audit
tests/validate.mjs         CI test, reconciled during the merge (COORDINATION.md §6)
COORDINATION.md            shared task board + full merge log
EXECUTIVE_SUMMARY.md       the summary
VERIFICATION.md            what was checked, against what
IRREGULARITIES.md          every flagged item, with sources
```

## Status

- Internal links: **0 broken** (900 checked), 0 broken anchors, 206/206 rows present on `all.html` and on their
  category page exactly once.
- Verification: 12 rows checked → **7 verified, 3 partly verified, 2 contradicted**.
- Known gaps: 194 rows not re-verified; that is stated on every page rather than papered over.

## Not affiliated

Independent compilation. Not affiliated with any listed operator. Official rules always win. US prizes of $600+
generally require tax reporting. Nothing here is legal, tax or financial advice. Sweepstakes and casino-style
gambling products are out of scope.

## Repository history (parallel sessions)

Three agent sessions worked this repository simultaneously. Another one shipped a complete build to `main`
(“Prize Atlas”, 208 leads, 7 official pages read, PRs #1/#2/#4/#6/#9) before this session finished. Nothing of theirs
was discarded: their dataset, review queue, research notes, supplemental page and CI test all still ship, and
`cross-session.html` bridges the two builds. The merge resolution — including the one assertion reconciled inside
their `tests/validate.mjs` — is recorded in [`COORDINATION.md`](COORDINATION.md) §6, with their full log preserved
verbatim in §7.

## Verified Contest Ledger (`ledger/`)

A second build by session `a479d584-own1`, kept alongside the pages above: dashboard, verified top picks, per-category pages, a Flagged for Review page and method log, under [`ledger/`](ledger/index.html). It covers all 206 upstream rows, with 28 checked against official pages and the rest labelled "not checked" with blank prize cells. Data: `data/finder-ledger.json|csv`, `data/finder-audit.json`, `data/verification/`. Rebuild: `node scripts/audit.js && node scripts/build.js && node scripts/linkcheck.js`.
