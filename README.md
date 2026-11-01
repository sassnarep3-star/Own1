# Prize Atlas — free-to-enter cash competitions, sourced and verified

A static, mobile-first research site about **free-to-enter competitions that can pay real cash**, built
from the reference catalogue at [karagemop466-tech/FreeMoneyApps](https://karagemop466-tech.github.io/FreeMoneyApps/).

**Live site:** https://sassnarep3-star.github.io/Own1/
**Verified atlas subsite (44 operator-checked rows):** https://sassnarep3-star.github.io/Own1/atlas/

## Two published layers (plus an archived third)

Several agent sessions built this repository in parallel. Each substantial build lives at its own path
and is linked from the top navigation, so no session's work was thrown away.

| Layer | Entry point | Generator | Evidence | Data |
| --- | --- | --- | --- | --- |
| **Prize Atlas** (root) | `index.html` | `npm run build` → `scripts/build-data.mjs` + `scripts/build-site.mjs` | 211 rows; 18 page-checked, 6 partly checked, 187 unverified; 48 quoted facts; 24 per-entry pages | `data/verification.json`, `data/entries.json`, `data/stats.json` |
| **Verified Atlas** (subsite) | `atlas/index.html` | `node scripts/build.mjs` | 44 rows re-checked against operator pages on 2026-11-01, each with prize, entry, deadline, eligibility and the page read; 17 sourced irregularities | `data/verified.json`, `data/legacy.json`, `data/atlas-findings.json` |
| Contest Finder (subsite, earlier) | `ledger/index.html` | `scripts/build.js` | see `ledger/` | `data/finder-ledger.json` |

`tools/build_site_legacy.py` is the first root generator, archived after `scripts/build-site.mjs`
replaced it. It is kept for provenance, not run.

## What the Verified Atlas layer adds

| | Reference catalogue | Verified Atlas |
| --- | --- | --- |
| Layout | one page, 206 entries, "no search box, no filters" | dashboard, 7 pages, 9 category pages |
| Mobile | long undifferentiated scroll | tables become labelled cards under 900px |
| Verification | every entry carries a prize claim; none re-checked | 44 rows checked against operator pages on 2026-11-01 |
| Unconfirmed values | filled from the catalogue | blank, with an explanatory flag |
| Third-party claims | mixed into the main fields | isolated in a column labelled *legacy claim (unverified)* |
| Broken links | 6 source domains no longer resolve; 1 http-only source | flagged per row, listed on the Flagged page |
| Discovery | scroll | search, category/tier/issue filters, sort by deadline or prize |

Its pages: `atlas/index.html` (dashboard), `atlas/shortlist.html` (all 44 verified rows),
`atlas/categories.html` + `atlas/category/<id>.html`, `atlas/summary.html` (executive summary),
`atlas/review.html` (17 findings + every unverified lead), `atlas/method.html` (evidence standard),
`atlas/ledger-pass.html` (links to the earlier layers).

## Evidence standard (Verified Atlas)

1. **One claim, one operator page**, with the date it was read.
2. **Blank beats plausible.** If the page did not state a prize, fee, deadline or eligibility rule, the
   field is empty and the row carries an explanatory flag.
3. **Nothing is inferred.** Countdowns are quoted as notes, never converted into dates.
4. **Legacy claims stay quarantined** in a `legacyPrizeClaim` field shown only as unverified.
5. **Conflicts are published.** Where an operator page contradicts itself, both values are recorded.

## Local development

```bash
npm ci                       # jsdom, used by the headless render test
npm run build                # root layer: data -> pages
node scripts/build.mjs       # Verified Atlas subsite: data -> atlas/**
npm test                     # root validation + headless DOM render test
node tests/validate-atlas.mjs # 3,700+ checks, including every internal link in the repository
python3 -m http.server 8000 --bind 0.0.0.0
```

Both generators are deterministic; CI fails if the committed HTML does not match its data.

> **Generators do not overlap:** `scripts/build-site.mjs` owns the root pages and `category/*`;
> `scripts/build.mjs` owns `atlas/**` only. The Verified Atlas stores its findings in
> `data/atlas-findings.json` and its merged dataset in `data/atlas-entries.json` so it never collides
> with the root layer's `data/audit.json` and `data/entries.json`.

## Repository layout

```
atlas/                     Verified Atlas output (dashboard, shortlist, categories, review, summary, method)
assets/atlas.css           Verified Atlas stylesheet — mobile-first, no external requests
assets/atlas.js            Verified Atlas progressive enhancement: search, filter, sort
assets/style.css, assets/app.js, assets/css/, assets/js/   root and subsite assets
data/verified.json         44 records verified against operator pages on 2026-11-01
data/legacy.json           205 unverified leads imported from the reference catalogue
data/atlas-findings.json   17 findings, each with sources
data/atlas-entries.json    merged Verified Atlas dataset (generated)
data/verification.json     root layer evidence file (quoted facts)
scripts/build.mjs          Verified Atlas generator
scripts/import_legacy.mjs  reproducible importer that quarantines catalogue claims
scripts/build-data.mjs, scripts/build-site.mjs   root generator
tests/validate-atlas.mjs   Verified Atlas suite (also audits every link in the repo)
tests/validate.mjs, tests/dom.test.mjs           root suites
research/SOURCES.md        source audit and verification log
COORDINATION.md            shared task board, merge record and open integration tasks
```

## Regenerating the lead list

```bash
git clone --depth 1 https://github.com/karagemop466-tech/FreeMoneyApps /tmp/fma
node scripts/import_legacy.mjs /tmp/fma/assets/data.js > data/legacy.json
node scripts/build.mjs
```

The importer blanks every prize, fee and deadline field and flags dead domains and http-only sources.
Re-run the DNS check if you re-import later; that flag list is a dated observation.

## Known limitations and open work

- Verification is a snapshot: pages change. Re-open the operator page before entering anything.
- No inspected source publishes win probabilities, so no layer publishes expected value or odds.
- Four Verified Atlas categories (skill, market, pools, directories) have no verified row yet.
- External deep links were spot-checked, not exhaustively fetched; DNS was checked for all 223 legacy
  hostnames.
- **The layers still hold separate datasets and generators.** Consolidating them is the outstanding
  integration task, tracked in `COORDINATION.md`.

Not financial, legal or tax advice. No operator paid for a listing.
