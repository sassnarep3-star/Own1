# PrizeDesk — free-to-enter cash-prize competition research

A static, mobile-first dashboard for finding and checking competitions that may pay cash. It builds on the public [Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/), but distinguishes imported claims from official-page checks. Unsupported or unstated values are left blank, and irregularities are published for review.

**Live dashboard:** <https://sassnarep3-star.github.io/Own1/>
**Executive summary:** [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) · [web version](https://sassnarep3-star.github.io/Own1/executive-summary.html)
**Line-by-line evidence:** <https://sassnarep3-star.github.io/Own1/verified.html>
**Verified shortlist:** <https://sassnarep3-star.github.io/Own1/shortlist.html>
**Flagged for Review:** <https://sassnarep3-star.github.io/Own1/flagged.html>
**Latest source audits:** [2026-11-02 targeted refresh](data/verification/current-state-2026-11-02.md) · [2026-11-02 integration record](research/VERIFICATION-2026-11-02.md) · [repo review](REPO_REVIEW.md)

## Site map

| Page | Purpose |
| --- | --- |
| [`index.html`](index.html) | Dashboard, key figures, best verified opportunities, closing deadlines |
| [`all.html`](all.html) | Full table of the 221 combined listings; searchable/filterable |
| [`shortlist.html`](shortlist.html) | Deadline-sorted official-page checks with entry/AI caveats |
| [`best.html`](best.html) | Open-now shortlist built only from confirmed official wording |
| [`verified.html`](verified.html) | 40 official pages fetched and 30 rows with verbatim quotes and URLs |
| [`categories/`](categories/) | Nine category-specific tables |
| [`c/`](c/) | Per-listing detail pages (221) |
| [`analysis.html`](analysis.html) | Coverage, AI-agent compatibility, deadlines, findings and limits |
| [`verification.html`](verification.html) | Evidence method, provenance and reproduce steps |
| [`repo-review.html`](repo-review.html) | Repo review with GitHub links for manual review |
| [`research.html`](research.html) | Source-ledger audit |
| [`flagged.html`](flagged.html) | 49 irregularities (R-01…R-18 + I-01…I-30/I-16) and every unverified row |
| [`executive-summary.html`](executive-summary.html) | Generated executive summary with official-source links |
| [`data/ledger.json`](data/ledger.json) | Canonical combined source data (221 rows) |
| [`data/verification.json`](data/verification.json) | Derived row-level verification states and totals |
| [`data/verification-2026-11-02.json`](data/verification-2026-11-02.json) | This integration session's dated official-page reads |
| [`data/review-2026-11-02.json`](data/review-2026-11-02.json) | Repo review and 18 new irregularities with source links |
| [`data/cross-checks.json`](data/cross-checks.json) | 25 official-page checks with dates, readers, confirmed facts and caveats |
| [`data/shortlist-notes.json`](data/shortlist-notes.json) | Per-row sourced notes for the Verified shortlist |
| [`data/live-checks.json`](data/live-checks.json) | Live fetch outcomes from the 2026-11-01 base pass (plus a dated correction note) |
| [`docs/SESSION-7a477419.md`](docs/SESSION-7a477419.md) | Earlier session's 10 sourced additions, rereads and flags |
| [`archive/prize-atlas/`](archive/prize-atlas/) | Separate preserved earlier build; not the current root-site generator |

The upstream source file has **206 listings**. The current local dataset has **221** because **15 later additions** were separately attributed. Do not describe 221 as the source website's count. The combined dataset reconciles as 206 pinned upstream rows + 15 attributed additions.

## Data and verification policy

- The upstream data is pinned by repository commit and SHA-256 in [`data/source/PROVENANCE.json`](data/source/PROVENANCE.json). It is third-party research, not an official operator rules document.
- A cited source link is not proof of a fresh fetch. The current verification distinguishes live fetches, independent official-page reads, source-only citations, and rows without an official source.
- The 1 Nov base pass contains 13 live-fetch outcomes (12 loaded, one error). Earlier sessions recorded 25 official-page check records; this integration session added 40 dated official-page reads on 2 Nov 2026. The upstream source marks many rows free, but those source labels are **not** fresh official confirmation for every current competition.
- **A value is published only when an official page read on 2026-11-02 states it.** Every other prize, entry cost, deadline, status and eligibility cell is blank and flagged unverified. Nothing is inferred, converted, summed or rounded.
- Rows with no official operator source are labelled `none official` and keep blank values.
- Do not infer entry cost, cash value, deadline, eligibility or open status. Unknown stays unknown.
- No odds or expected return are estimated. A cash-prize headline does not establish likely winnings.
- Review [`data/verification/current-state-2026-11-02.md`](data/verification/current-state-2026-11-02.md) and [`research/VERIFICATION-2026-11-02.md`](research/VERIFICATION-2026-11-02.md) for the targeted reads, limits and integration result. **No Singapore-specific eligibility conclusion is established** for any user or contest.

## Build and checks

CI uses Node.js 22. Dependencies are not required for the build.

```sh
npm run build
```

This ingests the pinned source, merges explicitly attributed additions/cross-checks, derives verification and flags, generates the static site and summary, and runs validation. Individual commands:

```sh
node scripts/ingest.js
node scripts/verify.js
node scripts/build.js                      # deterministic: no network, no clock
node scripts/render-docs.js                # docs/EXECUTIVE_SUMMARY.md
node scripts/render-verification-record.js # research/VERIFICATION-2026-11-02.md
npm run check
```

`npm run check` runs `scripts/checklinks.js`, `tests/validate.mjs` and `tests/validate-prize-atlas.mjs`: dataset contracts, generated pages and every internal reference. It does not fetch external operator websites; a passing check does not establish current availability or personal eligibility.

To preview locally:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

## Current limits

The pinned source declared a review date of 2026-08-19. In the current verification output, 175 rows cite an official-tier page not reopened in the base pass and 11 rows have no official-tier source. This integration session re-read 40 official pages covering 30 rows; the remaining 191 rows are published with blank values rather than guessed ones. Current status, entry cost and eligibility must be confirmed on the operator's rules page before entering. The site is a research index, not an operator, sponsor, guarantee, or legal/financial adviser.
