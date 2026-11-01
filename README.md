# Prize Atlas

A static, mobile-first research dashboard for **free-to-enter competitions that pay real cash** —
built from the reference catalogue at
[karagemop466-tech/FreeMoneyApps](https://karagemop466-tech.github.io/FreeMoneyApps/), rebuilt with
search, filters, per-category pages, mobile card layouts, and an evidence trail on every row.

**Live site:** https://sassnarep3-star.github.io/Own1/

## What is different from the reference catalogue

| | Reference catalogue | Prize Atlas |
| --- | --- | --- |
| Layout | one page, 206 entries, "no search box, no filters" | dashboard, 6 top-level pages, 9 category pages |
| Mobile | long scroll, no table/card adaptation | tables become labelled cards under 900px |
| Verification | every entry carries a prize claim, none re-checked | 44 rows verified against operator pages on 2026-11-01; 159 prize/fee/date fields deliberately left blank |
| Third-party claims | mixed into the main fields | kept only in a column labelled *legacy claim (unverified)* |
| Broken links | 6 source domains no longer resolve; 1 http-only source | flagged per row and listed on the Flagged page |
| Discovery | scroll | search, category filter, tier filter, issue filter, and sort by deadline or prize |

## Pages

- `index.html` — dashboard: metrics, start-here shortlist, category grid
- `shortlist.html` — all 44 verified rows, filterable and sortable
- `categories.html` + `category/<id>.html` — nine categories, verified rows separated from leads
- `summary.html` — executive summary: what was verified, where the money is, what is unknown
- `review.html` — **Flagged for review**: 17 audit findings plus every unverified lead
- `method.html` — evidence standard, operator pages read, checks
- `data/entries.json` — merged dataset used by the pages

## Data policy

1. **A verified row cites the operator page it came from**, with the date it was read.
2. **Blank beats plausible.** If the operator page did not state a prize, fee, deadline or eligibility
   rule, the field is empty and the row carries an explanatory flag.
3. **Nothing is inferred.** Countdowns are quoted as notes, not converted into dates; totals are not
   computed from partial prize ladders.
4. **Legacy claims stay quarantined.** Prize text imported from the reference catalogue is stored in a
   `legacyPrizeClaim` field and displayed only in a column labelled unverified.
5. **Conflicts are published.** Where an operator page contradicts itself, both values are recorded and
   the row is flagged.

## Local development

No dependencies, no framework, no build tooling beyond Node.

```bash
node scripts/build.mjs     # regenerate the HTML from data/*.json
node tests/validate.mjs    # 2,885 checks: schema, blanks, links, row counts
python3 -m http.server 8000 --bind 0.0.0.0   # preview at http://localhost:8000
```

The build is deterministic: running it twice produces no diff, and CI fails if the committed HTML does
not match the data.

## Repository layout

```
data/verified.json    44 records verified against operator pages on 2026-11-01
data/legacy.json      205 unverified leads imported from the reference catalogue
data/categories.json  category metadata
data/audit.json       17 findings, each with sources
data/entries.json     merged dataset (generated)
scripts/build.mjs     static site generator
scripts/import_legacy.mjs  importer for the reference catalogue (quarantines claims)
assets/style.css      mobile-first stylesheet, no external requests
assets/app.js         progressive enhancement only: search, filter, sort
tests/validate.mjs    validation suite used by CI
research/SOURCES.md   source audit and verification log
COORDINATION.md       shared task board for parallel agent sessions
```

## Regenerating the lead list

```bash
git clone --depth 1 https://github.com/karagemop466-tech/FreeMoneyApps /tmp/fma
node scripts/import_legacy.mjs /tmp/fma/assets/data.js > data/legacy.json
node scripts/build.mjs
```

The importer strips every prize, fee and deadline field to an empty string and flags dead domains and
http-only sources. Re-run the DNS check if you re-import later; the flag list is a dated observation.

## Limitations

- Verification is a snapshot: pages change. Re-open the operator page before entering anything.
- No inspected source publishes win probabilities, so this site publishes **no** expected-value,
  hourly-rate or odds ranking.
- Four categories (skill, market, pools, directories) have no verified row yet; that gap is stated on
  the site rather than filled with guesses.
- External deep links were spot-checked, not exhaustively fetched. DNS was checked for all 223 legacy
  hostnames.

Not financial, legal or tax advice. No operator paid for a listing.
