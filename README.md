# Free-to-enter cash competitions — a sourced, mobile-first research site

A static site about **free-to-enter competitions that can pay real cash**, rebuilt from the reference
catalogue at [karagemop466-tech/FreeMoneyApps](https://karagemop466-tech.github.io/FreeMoneyApps/).

**Live site:** https://sassnarep3-star.github.io/Own1/
**Atlas layer (44 operator-verified rows):** https://sassnarep3-star.github.io/Own1/atlas/

## Three layers, three agent sessions

Several agent sessions worked this repository in parallel. Rather than overwrite each other, each
substantial build now lives at its own path and is linked from the root navigation.

| Layer | Entry point | Generator | Rows verified against an operator page | Data |
| --- | --- | --- | --- | --- |
| **Ledger** (root site) | `index.html` | `tools/build_site.py` | 12, each with a verbatim quote (`verification.html`) | `data/ledger.json`, `data/verification.json`, `data/audit.json` |
| **Contest Finder** | `ledger/index.html` | `scripts/build.js` | see `ledger/` | `data/finder-ledger.json` |
| **Atlas** | `atlas/index.html` | `scripts/build.mjs` | **44**, with prize, entry, deadline, eligibility and the page read | `data/verified.json`, `data/legacy.json`, `data/atlas-findings.json` |

The Atlas layer is the newest and the most heavily evidence-constrained: it blanks any prize, fee or
deadline that was not read from an operator page, and publishes 17 sourced irregularities on its
Flagged page. The other two layers keep the catalogue's own wording and tag it per row.

## What the Atlas layer changes

| | Reference catalogue | Atlas layer |
| --- | --- | --- |
| Layout | one page, 206 entries, "no search box, no filters" | dashboard, 7 pages, 9 category pages |
| Mobile | long undifferentiated scroll | tables become labelled cards under 900px |
| Verification | every entry carries a prize claim; none re-checked | 44 rows checked against operator pages on 2026-11-01 |
| Unconfirmed values | filled from the catalogue | blank, with an explanatory flag |
| Third-party claims | mixed into the main fields | isolated in a column labelled *legacy claim (unverified)* |
| Broken links | 6 source domains no longer resolve; 1 http-only source | flagged per row, listed on the Flagged page |
| Discovery | scroll | search, category/tier/issue filters, sort by deadline or prize |

## Atlas pages

- `atlas/index.html` — dashboard: metrics, start-here shortlist, category grid, how to use the site
- `atlas/shortlist.html` — all 44 verified rows, filterable and sortable
- `atlas/categories.html` + `atlas/category/<id>.html` — nine categories, verified rows separated from leads
- `atlas/summary.html` — executive summary: what was verified, where the money is, what is unknown
- `atlas/review.html` — **Flagged for review**: 17 findings with sources plus every unverified lead
- `atlas/method.html` — evidence standard, operator pages read, checks
- `atlas/ledger-pass.html` — hub linking the root ledger layer from the Atlas navigation

## Evidence standard (Atlas layer)

1. **One claim, one operator page**, with the date it was read.
2. **Blank beats plausible.** If the page did not state a prize, fee, deadline or eligibility rule, the
   field is empty and the row carries an explanatory flag.
3. **Nothing is inferred.** Countdowns are quoted as notes, never converted into dates.
4. **Legacy claims stay quarantined** in a `legacyPrizeClaim` field shown only as unverified.
5. **Conflicts are published.** Where an operator page contradicts itself, both values are recorded.

## Local development

```bash
node scripts/build.mjs       # regenerate atlas/*.html + data/atlas-entries.json + atlas/sitemap.xml
node tests/validate-atlas.mjs # 3,832 checks: schema, blanks, every internal link, page reachability
node tests/validate.mjs       # the other layers' own checks
python3 -m http.server 8000 --bind 0.0.0.0
```

The Atlas build is deterministic and CI fails if the committed HTML does not match its data.

> **Careful with generators.** `tools/build_site.py` writes `index.html`, `category/*` and the other
> root pages; `scripts/build.mjs` writes only `atlas/**`. Running the Python generator is safe for the
> Atlas layer (it does not touch `atlas/`), but it will rewrite the root pages. Read `COORDINATION.md`
> before changing either.

## Repository layout

```
atlas/                    Atlas layer output: dashboard, shortlist, categories, review, summary, method
data/verified.json        44 records verified against operator pages on 2026-11-01
data/legacy.json          205 unverified leads imported from the reference catalogue
data/atlas-findings.json  17 findings, each with sources
data/atlas-entries.json   merged Atlas dataset (generated)
data/categories.json      Atlas category metadata
data/ledger.json          206 catalogue rows mirrored verbatim (ledger layer)
data/verification.json    12 quoted row verifications (ledger layer)
data/audit.json           findings computed by tools/audit.py (ledger layer)
scripts/build.mjs         Atlas generator
scripts/import_legacy.mjs reproducible importer that quarantines catalogue claims
assets/atlas.css          Atlas stylesheet — mobile-first, no external requests
assets/atlas.js           Atlas progressive enhancement: search, filter, sort
assets/style.css, assets/css/, assets/js/   other layers' assets
tools/                    ledger generator, audit and link-check scripts
tests/validate-atlas.mjs  Atlas validation suite (also checks every link in the repository)
tests/validate.mjs        other layers' validation suite
research/SOURCES.md       source audit and verification log
COORDINATION.md           shared task board, merge record and open integration tasks
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
- Four Atlas categories (skill, market, pools, directories) have no verified row yet.
- External deep links were spot-checked, not exhaustively fetched; DNS was checked for all 223 legacy
  hostnames.
- **The three layers hold separate datasets and separate generators.** Consolidating them into one
  dataset and one generator is the outstanding integration task, tracked in `COORDINATION.md`.

Not financial, legal or tax advice. No operator paid for a listing.
