# PrizeDesk

A mobile-first dashboard of **free-to-enter competitions that can pay real money**, rebuilt from the
[Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/) dataset into something
you can actually use on a phone: one row per competition, nine category pages, search/filter/sort, a
transparent shortlist, and a published list of everything that could not be verified.

**Live site:** https://sassnarep3-star.github.io/Own1/

---

## Why this exists

The source site is a single scroll of 206 full-length cards with no search, no filters and no sorting.
Its own pages disagree about which revision is published, at least one cited App Store link is dead, and
12 rows cite no official source while still showing prize figures. This repository keeps the research and
fixes the delivery:

- **Every table row links to the operator's own page** (plus a separate rules link where one exists).
- **A value only appears if an official source states it.** 81 of 206 rows show “—” for the prize instead
  of a number we could not support.
- **Every row carries its verification state**: `live-checked` (12 rows fetched on 1 Nov 2026),
  `source cited — not re-checked` (182), or `no official source` (12).
- **Ended contests are stamped and excluded** from every shortlist (27 rows).
- **17 irregularities are published** with evidence and source links on the Flagged for Review page,
  including the ones we could not settle.

Nothing in the HTML is hand-typed data. Tables, counts, shortlists and flags are generated from JSON at
build time, so the site cannot drift from the dataset.

## Pages

| Page | What it is |
| --- | --- |
| `index.html` | Dashboard: headline numbers, top-ranked live picks, category cards |
| `all.html` | All 206 rows in one sortable, filterable table |
| `categories/*.html` | Nine category pages with the same table controls |
| `c/<id>.html` | One page per competition: facts, steps, terms notes, sources, flags |
| `best.html` | Four shortlists with the scoring model printed on every row |
| `analysis.html` | Counted findings: coverage, entry paths, ID burden, currencies, concentration |
| `verification.html` | Method, provenance, what each badge means, what was actually fetched |
| `flagged.html` | The irregularity register and the full live-check log |
| `executive-summary.html` | The executive summary (also in [`docs/EXECUTIVE_SUMMARY.md`](docs/EXECUTIVE_SUMMARY.md)) |

## Data and provenance

- Source: `github.com/karagemop466-tech/FreeMoneyApps`, file `assets/data.js`,
  commit `466f7c1e7a14b52b4a0d36beb84a00d68fd409b7`, SHA-256
  `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`.
- The file is vendored unchanged at `data/source/ledger.source.js` and recorded in
  `data/source/PROVENANCE.json`. It is parsed as strict JSON — never executed.
- Source authors' own last-check date: **2026-08-19**. This rebuild: **2026-11-01**.

| File | Contents |
| --- | --- |
| `data/ledger.json` | Canonical dataset (206 rows, verbatim fields) |
| `data/verification.json` | Per-row verification state, flags and totals |
| `data/live-checks.json` | The 12 URLs actually fetched this pass, with what each confirmed |
| `data/irregularities.json` | The 17-item register published on the site |

## Build

No dependencies — Node 18+ only.

```bash
npm run build     # ingest -> verify -> build site -> render docs -> check links
```

Or step by step:

```bash
node scripts/ingest.js        # checksum-check the source, write data/ledger.json
node scripts/verify.js        # audit rows, write verification.json + irregularities.json
node scripts/build.js         # generate every HTML page
node scripts/render-docs.js   # regenerate docs/EXECUTIVE_SUMMARY.md
node scripts/checklinks.js    # fail on broken internal links or missing rows
```

Preview locally:

```bash
python3 -m http.server 8080    # then open http://localhost:8080/
```

### Adding verification

Append an entry to `data/live-checks.json` (url, listingIds, outcome, what the page confirmed and did not),
then re-run `npm run build`. Rows whose URLs appear there upgrade themselves from
“source cited — not re-checked” to “live-checked”. The flag register regenerates from the same script.

## Honesty rules the build enforces

1. Copy the source verbatim; never silently correct it.
2. Print a prize or cash-out figure only when the row has an official-tier source and states an amount.
3. No inference, conversion or summation — £ stays £, “$1K/week + $5K season” is not “$6K”.
4. Badge what was not checked, and publish the list of unchecked rows.
5. Turn every inconsistency into a numbered flag with evidence and links.

## Scope and legal

This is an independent compilation. It is not affiliated with, endorsed by, or sponsored by any operator
listed. Contest rules, prizes and eligibility change without notice — always open the operator's own rules
before entering. Some listings are restricted by US state or country, and some involve skill-gaming or
brokerage accounts. Play only where legal. 18+/21+. Nothing here is financial, legal or tax advice.
