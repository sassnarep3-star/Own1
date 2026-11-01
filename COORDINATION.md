# COORDINATION — shared task board

Read this file before starting. Claim a task by writing your session ID and file scope, then commit and push the claim immediately.
Statuses: `unclaimed`, `in progress`, `done`, `needs review` (published on the *Flagged for Review* page; does not block anything).

**Branch note:** the Arena platform pins this session to branch `arena/a479d584-own1`, so the `session-<id>/<task>` branch naming
from the original brief cannot be used here. All work from session `a479d584` is committed to that one branch, with
non-overlapping file scopes per task. Other sessions: use `session-<id>/<task>` branches and the scopes below.

| # | Task | Status | Owner session | Files touched (scope) | Claimed (UTC) |
|---|------|--------|---------------|-----------------------|---------------|
| 1 | Repo review + automated data audit (source ledger import, link/shape checks) | done | a479d584 | `data/upstream/**`, `scripts/audit.js`, `data/audit.json` | 2026-11-01 13:45 |
| 2 | Official-source verification, batch A (US-eligible, cash / large-prize entries; 28 records: 6 verified, 9 partial, 8 differ/broken, 5 unconfirmed) | done | a479d584 | `data/verification/batchA.jsonl`, `data/verification/picks.json` | 2026-11-01 14:00 |
| 3 | Official-source verification, batch B — the 178 rows not yet opened against an official page (start with US-eligible, cash, live rows) | needs review (unclaimed; published as unverified on the Flagged page) | — | `data/verification/batchB.jsonl` | — |
| 4 | Site build (landing, category sub-pages, flagged page, method, summary) | done | a479d584 | `index.html`, `picks.html`, `all.html`, `flagged.html`, `method.html`, `summary.html`, `categories/**`, `assets/**`, `scripts/build.js`, `scripts/linkcheck.js` | 2026-11-01 14:20 |
| 5 | Executive summary | done | a479d584 | `EXECUTIVE_SUMMARY.md` (generated; also `summary.html`) | 2026-11-01 14:25 |
| 6 | **Final integration** (merge data, re-verify, link check, PR, merge, Pages deploy) | in progress | a479d584 | `data/ledger.json`, `data/ledger.csv`, site index + nav, `COORDINATION.md` log | 2026-11-01 14:30 |

Rules for every session: small commits, `git pull --rebase` before every push, never edit files outside your claimed scope (log a request below instead),
never mark anything verified without checking an official source and linking it.

## Requests to other scopes
_(none)_

## Log
- 2026-11-01 13:45 — a479d584 created this board and claimed task 1. Only session active at the time of writing.
- 2026-11-01 14:30 — a479d584: tasks 1, 2, 4, 5 done. Task 3 intentionally left as `needs review`: only 28 of 206 rows could be opened against official pages in this session (page-by-page fetching is the bottleneck), so 178 rows are published with blank prize cells and an "unverified" badge. Any other session may claim it.
- 2026-11-01 14:30 — a479d584 started task 6 (integration). Re-verification of the combined data: `node scripts/build.js` regenerates `data/ledger.json` from upstream + audit + verification records; `node scripts/linkcheck.js` reports 0 broken internal links/anchors across 15 pages. External links cannot be fetched from the build sandbox; the 28 official pages fetched by hand are listed on the Method page.

## Verification record (task 2) — sources and irregularities
Every record lives in `data/verification/batchA.jsonl` with the official URL fetched, findings and issues; the Method page (`method.html`) lists all URLs. Irregularities were published on `flagged.html`:
- ESPN NFL Survivor / NFL Playoff Predictor: entry closed on 2026-11-01 (official pages) though upstream says live.
- Action Network "Favorites" $100K: only a 2024 FAQ found. MLB Beat the Streak: rules window ends with 2026 regular season. TradingView Leap: latest contest paid TradingView plans; $50,000 claim not found.
- RotoBaller Challenge: drafts ended Sep 8. Majors Challenge: $250,000 claim not found; commissioner pays $1/team for majors.
- HeroX `/challenges` link returns 404 (replacement `/crowdsourcing-projects`).
- Fanatics Survivor: official page is a sportsbook/casino homepage; contest and prize not found. Policy conflict with upstream README (3 betting-brand rows, 19 broker promos).
