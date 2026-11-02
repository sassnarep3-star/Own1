# PrizeDesk — free-to-enter cash competition research

A static, mobile-first dashboard for finding and checking competitions that may pay cash. It builds on the public [Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/), but distinguishes imported claims from official-page checks. Unsupported or unstated values are left blank, and irregularities are published for review.

**Live dashboard:** <https://sassnarep3-star.github.io/Own1/><br>
**Executive summary:** [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) · [web version](https://sassnarep3-star.github.io/Own1/executive-summary.html)<br>
**Verified shortlist:** <https://sassnarep3-star.github.io/Own1/shortlist.html><br>
**Latest source audit:** [2026-11-02 targeted refresh](data/verification/current-state-2026-11-02.md)

## Site map

| Page | Purpose |
| --- | --- |
| [`index.html`](index.html) | Dashboard and search/filter controls |
| [`all.html`](all.html) | Full table of the 221 combined listings |
| [`shortlist.html`](shortlist.html) | Deadline-sorted official-page checks with entry/AI caveats |
| [`categories/`](categories/) | Nine category-specific tables |
| [`c/`](c/) | Per-listing detail pages |
| [`analysis.html`](analysis.html) | Dataset coverage and findings |
| [`research.html`](research.html) | Source-ledger audit |
| [`verification.html`](verification.html) | Evidence method and status counts |
| [`flagged.html`](flagged.html) | 31 irregularities and review items |
| [`executive-summary.html`](executive-summary.html) | Generated executive summary with official-source links |
| [`data/ledger.json`](data/ledger.json) | Canonical combined source data |
| [`data/verification.json`](data/verification.json) | Derived row-level verification states and totals |
| [`data/cross-checks.json`](data/cross-checks.json) | Official-page checks with dates, readers, confirmed facts and caveats |
| [`data/live-checks.json`](data/live-checks.json) | Live fetch outcomes from the 2026-11-01 base pass |
| [`docs/SESSION-7a477419.md`](docs/SESSION-7a477419.md) | Latest 10 sourced additions, rereads and flags |
| [`archive/prize-atlas/`](archive/prize-atlas/) | Separate preserved earlier build; not the current root-site generator |

The upstream source file has 206 listings. The current local dataset has 221 because 15 later additions were separately attributed. Do not describe 221 as the source website's count.

## Data and verification policy

- The upstream data is pinned by repository commit and SHA-256 in [`data/source/PROVENANCE.json`](data/source/PROVENANCE.json). It is third-party research, not an official operator rules document.
- A cited source link is not proof of a fresh fetch. The current verification distinguishes live fetches, independent official-page reads, source-only citations, and rows without an official source.
- The 1 Nov base pass contains 13 live-fetch outcomes (12 loaded, one error). The 2 Nov integration records 25 official-page checks across 22 rows. The upstream source marks many rows free, but those source labels are not fresh official confirmation for every current competition.
- Do not infer entry cost, cash value, deadline, eligibility, or open status. Unknown stays unknown; unsupported values remain blank and flagged.
- No odds or expected return are estimated. A cash-prize headline does not establish likely winnings.
- Review [`data/verification/current-state-2026-11-02.md`](data/verification/current-state-2026-11-02.md) for the targeted rereads, limits, and integration result. Singapore eligibility was not established for any specific user or contest.

## Build and checks

CI uses Node.js 22. Dependencies are not required for the build.

```sh
npm run build
```

This ingests the pinned source, merges explicitly attributed additions/cross-checks, derives verification and flags, generates the static site and summary, and runs validation. Individual commands:

```sh
node scripts/ingest.js
node scripts/verify.js
node scripts/build.js
node scripts/render-docs.js
npm run check
```

`npm run check` validates dataset contracts, generated pages, and internal references. It does not fetch external operator websites; a passing check does not establish current availability or personal eligibility.

To preview locally:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

## Current limits

The pinned source declared a review date of 2026-08-19. In the current verification output, 175 rows cite an official-tier page not reopened in the base pass and 11 rows have no official-tier source. Current status and eligibility must be confirmed on the operator's rules page before entering. The site is a research index, not an operator, sponsor, guarantee, or legal/financial adviser.
