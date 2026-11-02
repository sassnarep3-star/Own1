# PrizeDesk — free-to-enter cash competition research

A static, mobile-first dashboard for researching competitions that may pay cash. It is based on the public [Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/), but keeps source claims separate from fresh verification: unknown or unsupported values stay blank, and irregularities are listed for review.

**Live dashboard:** <https://sassnarep3-star.github.io/Own1/>  
**Executive summary:** [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)  
**Latest targeted official-source refresh:** [2026-11-02 verification note](data/verification/current-state-2026-11-02.md)

## Site map

| Page | Purpose |
| --- | --- |
| [`index.html`](index.html) | Dashboard and search/filter controls |
| [`all.html`](all.html) | All 211 current listings in a table |
| [`best.html`](best.html) | Shortlist based on the pinned dataset and recorded rules |
| [`analysis.html`](analysis.html) | Dataset coverage and findings |
| [`research.html`](research.html) | Source-ledger audit |
| [`verification.html`](verification.html) | Verification method, status counts, and known limits |
| [`flagged.html`](flagged.html) | 22 recorded irregularities and review items |
| [`categories/`](categories/) | Nine category-specific tables and subpages |
| [`c/`](c/) | Per-listing detail pages |
| [`data/ledger.json`](data/ledger.json) | Canonical combined data used by the root-site generator |
| [`data/verification.json`](data/verification.json) | Derived row-level source and verification status |
| [`data/live-checks.json`](data/live-checks.json) | Official-page reads recorded on 2026-11-01 |
| [`data/cross-checks.json`](data/cross-checks.json) | Independent official-source cross-checks |
| [`data/verification/current-state-2026-11-02.md`](data/verification/current-state-2026-11-02.md) | Targeted official-source refresh and findings; not yet merged into the generated row data |
| [`archive/prize-atlas/`](archive/prize-atlas/) | Separate, preserved prior build; not the current root-site generator |

The upstream source file contains 206 listings. The combined local dataset has 211 because five separately attributed additions were merged. These counts must not be conflated.

## Data and verification policy

- The upstream data is pinned to a source repository commit and SHA-256 in [`data/source/PROVENANCE.json`](data/source/PROVENANCE.json). It is third-party research, not an official competition source.
- A source URL is not the same as a fresh verification. The verification snapshot records whether a page was fetched, independently cross-checked, merely cited, or absent.
- Do not infer an entry fee, prize value, deadline, eligibility, or open status. Unknown stays blank/unconfirmed.
- The upstream dataset marks many entries as free, but only an official terms page can establish a current free-entry claim. Re-check every contest before entering.
- The 2026-11-02 note records a targeted sample of current official pages. It does **not** refresh all 211 rows or update the generated tables.
- No odds or expected return are estimated. A cash-prize headline does not establish a likely return.

## Build and checks

Node.js 22 is used in CI. Dependencies are not required for the build.

```sh
npm run build
```

This ingests the checksum-pinned source, merges explicitly attributed additions and cross-checks, derives verification and flags, generates the static site, renders the documentation summary, and runs checks. The individual commands are:

```sh
node scripts/ingest.js
node scripts/verify.js
node scripts/build.js
node scripts/render-docs.js
npm run check
```

`npm run check` validates internal links, row coverage, static pages, and the archived Prize Atlas build. It does not fetch external operator sites; passing it does not mean each contest is current or eligible for a particular entrant.

To preview locally:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

## Current caveat

The current verification output is dated 2026-11-01: 12 official URLs loaded, one returned an error, 10 rows have independent official-page checks, 177 rows cite an official-tier source that was not re-opened in that pass, and 11 rows have no official-tier source. The 2026-11-02 targeted refresh is evidence-only for now; integrate it into the source data and regenerate pages before calling those rows freshly verified on the site.
