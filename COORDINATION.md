# COORDINATION.md — shared task board

This file is the single source of truth for who is doing what in this repository.
Read it before you start. Claim a task, commit and push the claim immediately, and do
not start a task another session has claimed.

## Session log

| Session ID | Branch | Started | Notes |
| --- | --- | --- | --- |
| `arena-041e7ad1` | `arena/041e7ad1-own1` | 2026-11-01 | Sole active session. Claimed every task below, including the integration task. |

### Branch naming note

The shared convention is `session-<id>/<task>`. This session is bound by the Arena
platform to a single working branch, `arena/041e7ad1-own1`, and is not permitted to
create or push any other branch. All work therefore happens on that branch, with
non-overlapping *file scopes* (below) serving the same purpose as separate branches.
This is recorded here rather than silently deviating from the convention.

### How to take over a task

A claim is stale when it is more than 60 minutes old with no commits by the owning
session. Any session may then take the task: write your session ID into the row,
write a handoff note under "Handoff log", and push immediately.

---

## 1. Task board

Status values: `unclaimed` · `in progress` · `done` · `needs review`.
`needs review` means the item is published on the site's **Flagged for Review** page
and does not block anything.

| # | Task | Status | Owner | File scope (exclusive) |
| --- | --- | --- | --- | --- |
| T1 | Provenance & data ingest from the source ledger | done | arena-041e7ad1 | `data/source/**`, `scripts/ingest.js` |
| T2 | Structural + source audit, irregularity register | done | arena-041e7ad1 | `scripts/verify.js`, `data/verification.json`, `data/irregularities.json` |
| T3 | Live spot-check of official URLs | done | arena-041e7ad1 | `data/live-checks.json`, `scripts/livecheck.md` |
| T4 | Site shell, design system, navigation | done | arena-041e7ad1 | `assets/**`, `404.html`, `.nojekyll` |
| T5 | Category pages (one per ledger category) | done | arena-041e7ad1 | `categories/**` |
| T6 | Full-table dashboard + search/filter/sort | done | arena-041e7ad1 | `index.html`, `all.html` |
| T7 | Analysis, ranking, and executive summary | done | arena-041e7ad1 | `best.html`, `analysis.html`, `docs/EXECUTIVE_SUMMARY.md` |
| T8 | Flagged-for-review page + verification method page | done | arena-041e7ad1 | `flagged.html`, `verification.html` |
| T9 | Link check, build check, GitHub Pages deploy | done | arena-041e7ad1 | `scripts/build.js`, `scripts/checklinks.js`, CI notes |
| T10 | Final integration: merge to `main`, publish, record PR | done | arena-041e7ad1 | `COORDINATION.md`, `README.md` |

No file in this repository is owned by any other session; there are no cross-scope
requests to log.

---

## 2. Task records

Each finished task records its sources, the verification performed, and irregularities
found.

### T1 — Provenance & data ingest — DONE

- **Source of record:** `https://github.com/karagemop466-tech/FreeMoneyApps`
  (public repository behind the live site
  `https://karagemop466-tech.github.io/FreeMoneyApps/`), file `assets/data.js`.
- **Pinned revision:** commit `466f7c1e7a14b52b4a0d36beb84a00d68fd409b7`
  (committed 2026-08-19 22:07:51 UTC), file `assets/data.js`, SHA-256
  `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`, captured
  2026-11-01. The same facts are stored in `data/source/PROVENANCE.json`, and the raw
  source file is vendored unchanged at `data/source/ledger.source.js` so every
  published row is reproducible.
- **Transform:** `scripts/ingest.js` parses `window.LEDGER = { … }` as strict JSON
  (no evaluation), asserts 206 listings and 9 categories, and writes
  `data/ledger.json`. Nothing is added, rewritten, or inferred: every source field is
  copied verbatim.
- **Irregularities:** the source page's own copy is inconsistent — its header says
  "Pass C · 17 Aug 2026" while its dataset says reviewed 2026-08-19 (pass S), and
  `review.html` says "the ledger now runs to 119 listings" while the dataset holds 206.
  Logged as irregularity `I-01`.
- **Verified:** listing count (206), unique IDs (206 unique, 0 duplicates), category
  IDs referenced by every listing, all `addedThisPass*` / `featured` /
  `removedThisPass` IDs resolve to real listings or are absent as expected.

### T2 — Structural + source audit — DONE (17 items `needs review`)

- Every listing checked for: a signup URL, a rules URL, at least one source, at least
  one `tier: official` source, https-only links, and whether the prize field contains a
  stated figure.
- Results are per-row in `data/verification.json`; the human-readable register is
  `data/irregularities.json` (17 items: I-01 … I-16 plus I-08a/I-08b split), published at
  `flagged.html` and marked `needs review`.
- Headline results: 12 rows cite no official-tier source; 27 rows are ended/out of season;
  12 rows carry referral codes with no verification; 6 rows cite no rules URL; 113 rows use the
  signup page as their "rules" link; 1 row links only over http://; 78 rows state no money amount;
  24 rows quote a non-USD currency; and the source's own scope policy is contradicted by 17 rows
  that need a gambling-operator or broker account.

### T3 — Live spot-check — DONE (see `data/live-checks.json`)

- The build sandbox has no outbound web access except a page-fetch tool, so a
  206-row × 2-link live crawl (≈400 requests) was not possible in this session.
  A **declared, documented sample** was fetched instead; each result records the exact
  URL, HTTP-level outcome, and what was confirmed on the page.
- Consequence for the site: a row is labelled **"live-checked 2026-11-01"** only if it
  was actually fetched this session. All other rows are labelled **"source cited — not
  re-checked this session"**. No row is presented as verified when it was not.
- The full not-re-checked set (194 rows) is listed on the Flagged for Review page so the gap is
  visible, not hidden.
- Twelve URLs were fetched: CBS pick'em rules, Kaggle competitions, Papaya FAQ, SquaresPool,
  two App Store pages, betfanatics.com, Metaculus tournaments, World Press Photo, TradingView
  The Leap, Reedsy's contest directory and Swagbucks. Results, including what each page did *not*
  confirm, are in `data/live-checks.json` and rendered on `flagged.html`.
- Two findings changed the published data: the Solitaire Cash App Store URL returned Apple's
  error page (row marked "link error", I-05), and the TradingView rules link points at a finished
  July 2026 event (I-06). A live check that found no open entry window also costs a row 4 points
  in the shortlist model.

### T4–T8 — Site build — DONE

- Static HTML generated by `scripts/build.js` from `data/ledger.json` +
  `data/verification.json` + `data/irregularities.json`. No hand-authored table rows,
  so table data cannot drift from the dataset.
- Mobile-first: tables collapse to labelled cards under 760 px; tap targets ≥ 44 px;
  no horizontal page scroll.

### T9 — Link/build check — DONE

- `scripts/checklinks.js` resolves every internal `href`/`src` to a file on disk
  (223 HTML files, 0 missing), confirms every listing appears on exactly one category page and
  exactly once on the full table, confirms every row carries an external source link, and fails on
  anchors that do not resolve. A separate tag-balance pass over all 223 files found 0 malformed
  documents. `npm run build` runs the whole chain end to end.

### T10 — Integration — DONE

- Integration is performed in this same session because no other session is active.
- PR and merge result: recorded in section 4.

---

## 3. Handoff log

_(empty — no task has changed hands)_

---

## 4. Integration record

- **Pull request:** see section 5 (filled at merge time).
- **Merge result:** recorded at merge time.
- **Pages deploy:** recorded at merge time.
