# Requirements list and status

Every requirement taken from the project brief, mapped to what exists, and how it is checked. "Verified" here means checked by `node tests/validate.mjs` and, for source facts, read on the linked official page on 2026-11-01.

## A. Collection, organisation, analysis

| # | Requirement | Status | Where / how it is met |
| --- | --- | --- | --- |
| A1 | Collect a full list of free-to-enter cash-prize competitions | Met, with gaps flagged | 212 leads in `data/entries.json`; 206 imported from the reference ledger's `assets/data.js`, 2 previously added, 2 added in this pass after reading their official pages, and 2 re-read from their Devpost rules. |
| A2 | Organise the list | Met | 9 categories, one page each; every row carries category, kind, evidence status, free/paid flag, flags and its source URL. |
| A3 | Analyse the list | Met | `analysis.html` + this repo's `EXECUTIVE_SUMMARY.md`: coverage statistics computed from the data, prize/effort comparison, link-quality findings. |
| A4 | Use a full requirements list | Met | This file. |

## B. Reference-site review

| # | Requirement | Status | Where / how it is met |
| --- | --- | --- | --- |
| B1 | Analyse the reference site | Met | `research/SOURCES.md` §1; the ledger's data file was read at source (206 entries, stamped 2026-08-19). |
| B2 | Fix mobile usability problems | Met | Static, mobile-first CSS: tables re-flow into labelled cards under 760px, 44px tap targets, no horizontal scrolling, no zoom-blocking. |
| B3 | Fix broken links | Met where found | `challenge.gov` (retired 2026-03-30) replaced with `usa.gov/challenges`; 2 rows with no usable operator URL labelled instead of faked; 25 news-linked rows flagged. |
| B4 | Flag irregularities for review | Met | `review.html` lists 8 confirmed irregularity groups with source links; each affected row also carries a ⚑ marker. |

## C. Site creation

| # | Requirement | Status | Where / how it is met |
| --- | --- | --- | --- |
| C1 | GitHub Pages live site | Met | Repository root of `main`, `https://sassnarep3-star.github.io/Own1/`. |
| C2 | Clean landing page | Met | `index.html`: hero, four KPIs, "where to spend your time first" shortlist, category cards, full table, executive summary. |
| C3 | Subpages organised by category | Met | `category/{sports,tech,forecasting,creative,market,skill,trivia,pools,directory}.html`. |
| C4 | Clean, simple, dashboard-like UI | Met | Single visual system in `assets/style.css`; consistent header, filters, tables, badges. |
| C5 | All entries in an easy-to-read table | Met | One 212-row table on the overview, filtered per category; each row pre-rendered, searchable and filterable without a build step. |
| C6 | Include analysis and findings | Met | `analysis.html` (7 sections), `methodology.html` (verification record), `EXECUTIVE_SUMMARY.md`. |
| C7 | Works without JavaScript | Met | `tools/build.mjs` pre-renders every page; `assets/app.js` only hides non-matching rows. |

## D. Verification

| # | Requirement | Status | Where / how it is met |
| --- | --- | --- | --- |
| D1 | Every table row links to an official source | Met | Rendered "Official page" or "Lead link" in every row; the 2 rows without a usable operator URL say so explicitly. |
| D2 | Unconfirmed values stay blank and are flagged | Met | Enforced by tests: unverified rows may not carry prize, entry, deadline, kind, eligibility or a free/paid flag. |
| D3 | Never infer or fill in values | Met | No prize is converted, combined or rounded; no deadline guessed; no probability published. Enforced by the data contract in `tests/validate.mjs`. |
| D4 | Link every verified claim to its source | Met | Each checked row has an `evidence` block (URL, `checkedAt`, facts copied, what was not stated); `methodology.html` prints all of them. |
| D5 | Verify line by line | Met for 28 of 212 rows | Reading dates and exact wording are stored per row; 8 of the 28 are attributed to a parallel session's recorded read; the remaining 184 rows are openly unverified rather than assumed. |

## E. Parallel sessions / coordination

| # | Requirement | Status | Where / how it is met |
| --- | --- | --- | --- |
| E1 | Read/create `COORDINATION.md` before starting | Met | Read before any edit; the earlier session's tasks were recorded there. |
| E2 | Claim tasks with session ID and file scope before editing | Met | Claim committed and pushed (`76fd2f1`) before any shared output changed. |
| E3 | Do not start work claimed by another session | Met | No open claims existed; the three other remote branches contain no commits beyond `main`. |
| E4 | Non-overlapping scopes; branch per session | Met, with one deviation | Session branch is `arena/181b7279-own1`; the workspace fixes that name, so the suggested `session-<id>/<task>` form could not be used. Recorded in `COORDINATION.md`. |
| E5 | Log requests instead of editing another session's files | Not needed | No file owned by another session needed changing. |
| E6 | Small frequent commits, `git pull --rebase` before push | Met | See the commit history on this branch. |
| E7 | Record sources, verification and irregularities, then mark done | Met | `COORDINATION.md` publish log. |
| E8 | Shared outputs only changed by the integration session | Met | This is the integration session; it owns `index.html`, `category/**`, `data/**`, `assets/**`, `tests/**`. |

## F. Pull request, merge, deploy

| # | Requirement | Status | Where / how it is met |
| --- | --- | --- | --- |
| F1 | Open a PR from the integration branch to `main` with a summary, sources and flags | Met | PR linked from `COORDINATION.md`. |
| F2 | Merge without waiting for approval | Met | Merged by this session; result recorded in `COORDINATION.md`. |
| F3 | Confirm GitHub Pages deploys successfully | Met | Pages build status and HTTP check of the live URL recorded in `COORDINATION.md`. |
| F4 | Publish flagged/unverified items on a labelled page | Met | `review.html`, linked in the main navigation. |
| F5 | Fix and retry if build, check or deploy fails | Met | `tests/validate.mjs` failures were fixed before merge; details in the commit history. |
| F6 | Do not merge a broken site | Met | CI workflow `.github/workflows/validate.yml` runs the same checks on every push and PR. |

## G. Quality gates run in this pass

- `node tests/validate.mjs` → 212 unique rows, 28 checked, 17 free confirmed, 14 pages, all local references resolve; `python3 supplemental/check.py` → supplemental rows each carry an official source link.
- Manual link audit of every external URL used as evidence (18 pages opened and read).
- Mobile layout audit at 390px, 620px, 900px and 1180px breakpoints by CSS inspection (no forced table width, no viewport-scaling tricks).
- Accessibility basics: `lang`, skip link, `aria-live` result count, labelled controls, 44px minimum control height, colour contrast on text/badges.
