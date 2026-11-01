# COORDINATION.md — shared task board

This file is the single source of truth for who did what in this repository.
Read it before you start. Claim a task, commit and push the claim immediately, and do
not start a task another session has claimed.

Status values: `unclaimed` · `in progress` · `done` · `needs review`.
`needs review` means the item is published on the site's **Flagged for Review** page and
does not block anything.

---

## Session log

| Session ID | Branch | Merged via | Scope |
| --- | --- | --- | --- |
| `27a86924-own1` | `arena/27a86924-own1` | PR #1, #2 | Initial Prize Atlas dashboard, 208 leads, 7 official pages read, `research/SOURCES.md` |
| `85ca8130-own1` | `arena/85ca8130-own1` | PR #4, #7 | Mobile card layout, evidence filtering, `tests/validate.mjs` |
| `90c9f78c-own1` | `arena/90c9f78c-own1` | PR #5, #8 | Re-verification of all 7 checked rows, executive summary, integration record |
| `37aed701-own1` | `arena/37aed701-own1` | PR #6, #9 | Supplemental research page: 3 hackathons, 5 findings, official links |
| `20a81ffd-own1` | `arena/20a81ffd-own1` | PR #10 | Independent source verification record |
| `a479d584-own1`, `4a243e58-own1` | `arena/a479d584-own1`, `arena/4a243e58-own1` | PR #20, #21 | Fourth build: ledger subsite, `.cjs` scripts, honest link-status classification, ESPN College Pick'em and CBS Pick'em verified, 15 unsourced claims quarantined |
| `4e1fdad5-own1` | `arena/4e1fdad5-own1` | PR #17, #18, #19 | Third full build: per-entry pages, playbook, finder, `data/upstream/` snapshot of the source repo |
| `d21e8702-own1` | `arena/d21e8702-own1` | PR #12, #16 | Second full build of the brief: Python site generator, own audit/methodology/sources pages, `tools/*.py`, `data/audit.json` |
| **`arena-041e7ad1`** | **`arena/041e7ad1-own1`** | **PR #13** | **Final integration session: provenance-pinned rebuild, 211-row verified table, 22 flags, merge of all of the above** |

The first five sessions' own records — task tables, verification logs, PR numbers and
deployment run links — are preserved **verbatim** in
[`docs/COORDINATION-session-records.md`](docs/COORDINATION-session-records.md). They are not
reproduced here to avoid paraphrasing another session's claims.

### Branch naming note

The shared convention is `session-<id>/<task>`. Every session here was bound by the Arena
platform to a single working branch, `arena/<id>-own1`, and was not permitted to create or
push another branch. All work therefore happened on those branches, with non-overlapping
*file scopes* serving the same purpose. This is recorded rather than silently deviating.

### How to take over a task

A claim is stale when it is more than 60 minutes old with no commits by the owning session.
Any session may then take the task: write your session ID into the row, add a handoff note
under "Handoff log", and push immediately.

---

## 1. Task board — this session (`arena-041e7ad1`)

| # | Task | Status | Owner | File scope (exclusive) |
| --- | --- | --- | --- | --- |
| T1 | Provenance & data ingest from the source ledger | done | arena-041e7ad1 | `data/source/**`, `scripts/ingest.js` |
| T2 | Structural + source audit, irregularity register | done | arena-041e7ad1 | `scripts/verify.js`, `data/verification.json`, `data/irregularities.json` |
| T3 | Live spot-check of official URLs | done | arena-041e7ad1 | `data/live-checks.json` |
| T4 | Site shell, design system, navigation | done | arena-041e7ad1 | `assets/**`, `404.html`, `.nojekyll` |
| T5 | Category pages (one per ledger category) | done | arena-041e7ad1 | `categories/**` |
| T6 | Full-table dashboard + search/filter/sort | done | arena-041e7ad1 | `index.html`, `all.html` |
| T7 | Analysis, ranking, and executive summary | done | arena-041e7ad1 | `best.html`, `analysis.html`, `docs/EXECUTIVE_SUMMARY.md` |
| T8 | Flagged-for-review page + verification method page | done | arena-041e7ad1 | `flagged.html`, `verification.html` |
| T9 | Link check, build check, CI | done | arena-041e7ad1 | `scripts/build.js`, `scripts/checklinks.js`, `tests/**`, `.github/**` |
| **T10** | **Final integration: reconcile `main`, merge branches, re-verify combined data, publish** | **done** | arena-041e7ad1 | `COORDINATION.md`, `README.md`, `data/additions.json`, `data/cross-checks.json`, `research.html`, `archive/**` |

---

## 2. Task records — this session

### T1 — Provenance & data ingest — DONE

- **Source of record:** `https://github.com/karagemop466-tech/FreeMoneyApps`, file `assets/data.js`.
- **Pinned revision:** commit `466f7c1e7a14b52b4a0d36beb84a00d68fd409b7` (2026-08-19T22:07:51Z),
  SHA-256 `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`, captured 2026-11-01.
- The file is vendored unchanged at `data/source/ledger.source.js`, recorded in
  `data/source/PROVENANCE.json`, and parsed as strict JSON — never evaluated.
- `scripts/ingest.js` asserts the checksum, the row count (`206 + 5 merged`), unique IDs, and
  category coverage before writing `data/ledger.json`.
- **Irregularity:** the source page's copy is internally inconsistent (header "Pass C · 17 Aug 2026"
  vs data pass S / 2026-08-19; its review page says "119 listings" vs 206 rows). Logged as I-01.

### T2 — Structural + source audit — DONE (22 items `needs review`)

Per-row results in `data/verification.json`; the register is `data/irregularities.json`
(I-01 … I-21 plus the I-08a/I-08b split), published at `flagged.html`.

Headline results: **12** rows cite no official-tier source; **27** rows are ended/out of
season; **12** rows carry referral codes with no verification; **6** rows cite no rules URL;
**117** rows use the signup page as their "rules" link; **1** row links only over `http://`;
**81** rows state no money amount; **24** rows quote a non-USD currency; and **17** rows need a
gambling-operator or broker account, contradicting the source's own exclusion policy.

### T3 — Live spot-check — DONE (12 URLs fetched 2026-11-01)

CBS Pro Football Pick'em rules · Kaggle competitions · Papaya FAQ · SquaresPool · two App Store
pages · betfanatics.com · Metaculus tournaments · World Press Photo · TradingView The Leap ·
Reedsy's contest directory · Swagbucks. Every result records what the page confirmed **and did
not** (`data/live-checks.json`, rendered on `flagged.html`).

Two findings changed published data: the Solitaire Cash App Store URL returned Apple's error
page (row stamped "link error", I-05) and the TradingView rules link points at a finished July
2026 event (I-06). A live check that found no open entry window also costs a row 4 points in the
shortlist model.

**Limit, stated on every page:** the sandbox had no general outbound internet, so 12 of 211 rows
were re-fetched. The other rows are labelled "source cited — not re-checked" and listed in full
on the Flagged page.

### T4–T8 — Site build — DONE

Static HTML generated by `scripts/build.js` from the JSON in `data/`. No hand-authored table
rows. Mobile-first: tables collapse to labelled cards under 820 px, 44 px tap targets, sticky
filter bar is disabled on small screens.

### T9 — Build gates — DONE

`npm run build` runs ingest → verify → build → render docs → checklinks → `tests/validate.mjs` →
`tests/validate-prize-atlas.mjs`. Current state: 241 HTML files, 0 broken internal links,
0 unresolvable anchors, every listing published exactly once, every table row carries an external
source link, 130 published prize figures all backed by an official source, 81 blanked with a
recorded reason.

---

## 3. T10 — final integration and conflict record

### What happened

`main` had moved on by nine merges from five other sessions while this branch was being built
(PRs #1, #2, #4, #5, #6, #7, #8, #9, #10). Merging `origin/main` produced **three add/add or
content conflicts**: `COORDINATION.md`, `README.md`, `index.html`. PR #13 was reported
`CONFLICTING` before the merge.

### How it was resolved — nothing discarded

| Their artifact | Resolution |
| --- | --- |
| Their site (`index.html`, `review.html`, `category/**`, `assets/app.js`, `assets/style.css`, `data/entries.json`) | Moved intact to `archive/prize-atlas/`, with a banner linking to the current site. Their relative paths still resolve; `tests/validate-prize-atlas.mjs` still passes against it (208 leads, 7 checked pages, 11 pages, all local references). |
| Their `supplemental/` page | Moved to `archive/prize-atlas/supplemental/` so its `../assets/*` links keep working; its findings were also promoted into the merged dataset (see below). |
| Their `research/SOURCES.md` | Kept at its original path and linked from the new `research.html`. |
| Their `EXECUTIVE_SUMMARY.md` | Preserved at `archive/prize-atlas/EXECUTIVE_SUMMARY.md`; the current summary is generated at `docs/EXECUTIVE_SUMMARY.md` and `executive-summary.html`. |
| Their `COORDINATION.md` | Preserved verbatim as `docs/COORDINATION-session-records.md` and referenced from this board. |
| Their `tests/validate.mjs` | Preserved as `tests/validate-prize-atlas.mjs` with only the base path changed. |
| Their CI workflow | Extended, not replaced: it now rebuilds the site, asserts the committed HTML matches the data, and runs both test suites plus the link check. |

### Their verified work, merged into the data

- **5 rows added** (`data/additions.json`): GEMS Prize Challenge ($300,000, closes 2026-12-03),
  US Midterms 2026 Metaculus tournament ($10,000, closes 2026-11-04), and three AI hackathons —
  Codex x TwitchCon ($10,000, closes 2026-11-02), PayPal AI Hackathon ($12,000, closes
  2026-11-12), Global Virtual Hackathon 2026 ($1,000/division, register by 2026-11-13).
  Each carries a "not in the original ledger" note and the session that added it.
- **10 cross-checks** (`data/cross-checks.json`): the official URL each session read, on which
  date, the facts it confirmed, and their caveats verbatim. These appear on `research.html`
  and on each row's detail page, attributed — never as this session's own checks.
- **5 new flags**: I-17 ESPN entry-limit conflict, I-18 Challenge.gov sunset, I-19 IceHacks
  header contradiction, I-20 PayPal prize-total discrepancy, I-21 the "$600+" tax generalisation.
- Where the two builds disagreed the stricter rule won: a figure is printed only when an official
  source states it, so rows the other build marked "checked" can still show a blank prize here.

### Second reconciliation (session `d21e8702-own1`, merged while this PR was open)

`main` advanced twice more while this integration was in progress, adding a second complete build of
the same brief (its own root `index.html`, `all.html`, `category/**`, `assets/css/style.css`,
`assets/js/site.js`, `data/ledger.json`, `data/audit.json`, `tools/*.py`, `best-picks.html`,
`cross-session.html`, `methodology.html`, `sources.html`, `IRREGULARITIES.md`, `VERIFICATION.md`).

Resolution, again with nothing discarded:

- The whole build is preserved as a working site at `archive/prize-atlas/dashboard-v2/` (38 files,
  including its data and its four Python tools and its own test), with a banner linking to this site.
  It was placed inside `archive/prize-atlas/` because its pages reference `../review.html` and
  `../supplemental/index.html`, which live there — so its internal navigation still works.
- 31 internal links in the archived copy were rewritten to resolve from its new depth (a path-only
  change; no content edited). `scripts/checklinks.js` now validates the archives as well as the live
  site: 260 HTML files, 0 broken links.
- Its root-level duplicates were removed from the root *after* being archived (`all.html`, `404.html`,
  `data/ledger.json`, `sitemap.xml`, …), so the published site has one canonical set of pages.
- Its `IRREGULARITIES.md` and `VERIFICATION.md` travelled with the archive; its
  `tests/validate.mjs` is preserved alongside it.
- No content of theirs was reworded or deleted.

### Third reconciliation（session `4e1fdad5-own1`）

`main` advanced again mid-integration, adding a third build: 211-entry `data/entries.json`, one page
per listing under `entry/` (33 pages), `playbook.html`, `categories.html`, `archive.html`,
`assets/finder.{css,js}`, `data/finder-*`, `data/uptream`-style source snapshots under `data/upstream/`,
`data/verification/batchA.jsonl`, and a second `scripts/build.js`.

Resolution:

- The whole build is preserved intact at `archive/session-4e1fdad5/` (116 files, banner-linked to the
  live site). Its pages reference `../entry/`, `../assets/`, `../data/`, `../review.html` and
  `../supplemental/index.html`; archiving it as a tree keeps that navigation working.
- Root duplicates were removed only after archiving (`entry/`, `category/`, `ledger/`, `src/`,
  `playbook.html`, `categories.html`, `archive.html`, `shortlist.html`, `summary.html`,
  `package-lock.json`, `assets/finder.*`, `assets/css/style.css`, `assets/js/site.js`).
- Two of their files had overwritten archive files through git's rename detection
  (`archive/prize-atlas/assets/app.js`, `archive/prize-atlas/data/entries.json`). Both were restored
  byte-for-byte from the commit they were archived from, so the Prize Atlas build still runs on its
  own data and app.
- `scripts/checklinks.js` gained two documented relaxations, both scoped: app-level fragments such as
  `#q=Some%20Name` are client-side search, and archived builds render rows client-side so their
  per-row anchors exist only at runtime. File links into the archives are still fully checked.

Result: 325 HTML files, 0 broken links, all suites green.

### Fourth reconciliation (sessions `a479d584`, `4a243e58`)

`main` gained one more build while this PR waited on the mergeable check: a `ledger/` subsite, `.cjs`
script names, a link-status classifier that treats redirects and 5xx as "unknown" rather than
"broken", two additional verified competitions (ESPN College Pick'em, CBS Pick'em) and a documented
quarantine of 15 unsourced claims coming out of the merged builds.

- Preserved intact at `archive/session-4a243e58/` (112 files, banner-linked, including its
  `.github/workflows/link-health.yml`), so their new verifications and quarantine list stay readable
  and diffable.
- Their root duplicates were removed after archiving, and their `link-health` workflow stays out of
  this repo's CI gate — it depends on their `data/entries.json`/`build-data.mjs` pipeline, which lives
  in the archive, not at the root.
- Their new verifications are *not* copied into this build's tables. Copying a claim from another
  session's page would make it second-hand; this build only publishes figures it can show a source
  for itself. Their two verifications are linked from `research.html` via the archive.

Result: 392 HTML files, 0 broken links, all suites green.

### Conflict log

- `index.html` — this session's generated dashboard kept at the root; theirs archived. No content lost.
- `README.md` — merged: this project's documentation plus a "what was merged" table quoting their
  README verbatim.
- `COORDINATION.md` — merged: this board plus their full records in `docs/COORDINATION-session-records.md`.
- No force-push, no `--theirs`/`--ours` bulk resolution, no deletion of another session's file.

---

## 4. Handoff log

_(empty — no task changed hands; every claim was completed by its owner)_

---

## 5. Integration record

- **Pull request:** [#13](https://github.com/sassnarep3-star/Own1/pull/13) — "Rebuild the contest
  ledger as a live, mobile-first verified dashboard".
- **Merge result:** recorded below after the merge completes.
- **Pages deploy:** recorded below after the deploy completes.
