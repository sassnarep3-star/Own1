# Coordination — Own1

Session ID: `27a86924-own1` (Arena branch `arena/27a86924-own1`). This session owns the initial integration; no other claims existed when work began on 2026-11-01 UTC. The branch name is fixed by the workspace and cannot be changed to `session-<id>/<task>`.

| Task | Status | Owner | File scope | Notes |
| --- | --- | --- | --- | --- |
| Audit source ledger and official evidence | Done | 27a86924-own1 | `research/**`, `COORDINATION.md` | Source: https://karagemop466-tech.github.io/FreeMoneyApps/ ; official links checked separately. |
| Build responsive category dashboard and review page | Done | 27a86924-own1 | `index.html`, `category/**`, `review.html`, `assets/**`, `data/**`, `.github/**`, `README.md`, `COORDINATION.md` | Initial integration in one session; shared outputs owned here. |
| Validate and publish GitHub Pages | Done | 27a86924-own1 | deployment/PR and `COORDINATION.md` | Claim after build and verification. |

## Requests / handoffs

None. Do not edit files claimed by another active session. Claims older than 60 minutes without commits can be handed off with a note here.

## Integration verification (2026-11-01 UTC)

- Audited starting repository: only README existed. Inspected external ledger at https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js ; imported 206 names/category leads without trusting stale claims. Added 2 specific leads.
- Individually read 7 official pages and recorded exact URLs and limitations in [research/SOURCES.md](research/SOURCES.md). 201/208 leads remain unverified; two have no usable HTTPS operator source. These are **needs review** items published on `review.html` and do not block publication.
- `node tests/validate.mjs` checked 208 unique IDs, blank unknown fields, official link presence for checked rows, 11 pages and internal references. External links on unverified leads are **not** certified reachable; users must check current operator rules.
- Irregularities: legacy August status and prize claims may be stale; reference project's older 100-item document is explicitly superseded; paid-entry / noncash / group-funded leads included for context, not recommended; ESPN FAQ inconsistent about maximum entries.
- Publication: [PR #1](https://github.com/sassnarep3-star/Own1/pull/1) merged into `main` at 2026-11-01 13:39 UTC (merge commit `90a79080ff42fbeeb0c58d4ddec2b622f07c3af7`). [Pages deployment run](https://github.com/sassnarep3-star/Own1/actions/runs/41312308316) succeeded; [live site](https://sassnarep3-star.github.io/Own1/index.html) rendered with 208 rows and category navigation. A follow-up correction blanks an ARC entry-cost cell that was not confirmed; publication of this correction is tracked in a follow-up PR.

## Session 4db3cf09-own1 — independent rules review

| Task | Status | Owner | File scope | Notes |
| --- | --- | --- | --- | --- |
| Check GEMS Prize Challenge official rules for eligibility, fees and AI-assistance conditions | Needs review | 4db3cf09-own1 | `research/gems-rules-4db3cf09.md`, coordination log | Independent, narrow review; no site/data edits. Existing integration and deployment claims remain with their owners. |

- 2026-11-01 UTC: Found multiple parallel branches with overlapping integration claims (`27a86924`, `37aed701`, `d21e8702`, `a479d584`). Please reconcile their contributions and claims before another integration or deployment. This session will not overwrite their claimed site/data files.

- Rebase conflict: 2026-11-01 UTC, `COORDINATION.md` conflicted with the merged PR #2 publication update; retained the main-branch update and this independent claim without discarding either.
- GEMS official rules reviewed: [research/gems-rules-4db3cf09.md](research/gems-rules-4db3cf09.md). [Official rules](https://www.nlr.gov/docs/fy26osti/96647.pdf) and [competition page](https://www.drivendata.org/competitions/306/competition-doe-gems/) conflict on submission time; entry fee unverified, and narrative-disclosure process needs clarification. Request to integration owner: add these findings to Flagged for Review with source links, not as confirmed eligibility or free entry.
- Request to integration owner: [Metaculus competition rules](https://www.metaculus.com/tournament-rules/) explicitly say AI tools may assist human forecasts, but bot/automated/AI accounts are ineligible for tournament prizes unless competition-specific rules permit; final submissions must reflect the human's own decisions and understanding. This materially affects the user's planned AI-assisted participation and should be surfaced with its source and competition-specific caveat.
