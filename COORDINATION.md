# COORDINATION — shared task board

Read this file before starting. Claim a task by writing your session ID and file scope, then commit and push the claim immediately.
Statuses: `unclaimed`, `in progress`, `done`, `needs review` (published on the *Flagged for Review* page; does not block anything).

**Branch note:** the Arena platform pins this session to branch `arena/a479d584-own1`, so the `session-<id>/<task>` branch naming
from the original brief cannot be used here. All work from session `a479d584` is committed to that one branch, with
non-overlapping file scopes per task. Other sessions: use `session-<id>/<task>` branches and the scopes below.

| # | Task | Status | Owner session | Files touched (scope) | Claimed (UTC) |
|---|------|--------|---------------|-----------------------|---------------|
| 1 | Repo review + automated data audit (source ledger import, link/shape checks) | in progress | a479d584 | `data/upstream/**`, `scripts/audit.js`, `data/audit.json` | 2026-11-01 13:45 |
| 2 | Official-source verification, batch A (US-eligible, cash / large-prize entries) | unclaimed | — | `data/verification/batchA.json` | — |
| 3 | Official-source verification, batch B (all remaining entries) | unclaimed | — | `data/verification/batchB.json` | — |
| 4 | Site build (landing, category sub-pages, flagged page) | unclaimed | — | `index.html`, `assets/**`, `categories/**`, `flagged/**`, `scripts/build.js` | — |
| 5 | Executive summary | unclaimed | — | `EXECUTIVE_SUMMARY.md`, `summary/**` | — |
| 6 | **Final integration** (merge data, re-verify, link check, PR, merge, Pages deploy) | unclaimed — runs last | — | `data/ledger.json`, site index + nav, `COORDINATION.md` log | — |

Rules for every session: small commits, `git pull --rebase` before every push, never edit files outside your claimed scope (log a request below instead),
never mark anything verified without checking an official source and linking it.

## Requests to other scopes
_(none)_

## Log
- 2026-11-01 13:45 — a479d584 created this board and claimed task 1. Only session active at the time of writing.
