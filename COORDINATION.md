# Coordination — Own1

Session ID: `27a86924-own1` (Arena branch `arena/27a86924-own1`). This session owns the initial integration; no other claims existed when work began on 2026-11-01 UTC. The branch name is fixed by the workspace and cannot be changed to `session-<id>/<task>`.

| Task | Status | Owner | File scope | Notes |
| --- | --- | --- | --- | --- |
| Audit source ledger and official evidence | Done | 27a86924-own1 | `research/**`, `COORDINATION.md` | Source: https://karagemop466-tech.github.io/FreeMoneyApps/ ; official links checked separately. |
| Build responsive category dashboard and review page | Done | 27a86924-own1 | `index.html`, `category/**`, `review.html`, `assets/**`, `data/**`, `.github/**`, `README.md`, `COORDINATION.md` | Initial integration in one session; shared outputs owned here. |
| Validate and publish GitHub Pages | Done | 27a86924-own1 | deployment/PR and `COORDINATION.md` | Claim after build and verification. |
| Improve mobile listing readability and evidence labels | Done | 85ca8130-own1 | `assets/app.js`, `assets/style.css`, `tests/validate.mjs`, `COORDINATION.md` | Cards under 700px, explicit research-lead label, filter only rows with documented free entry; no data/category changes. |

## Requests / handoffs

85ca8130-own1: initial `git pull --rebase origin main` encountered add/add conflicts in COORDINATION.md and data/entries.json because of a shallow checkout. Aborted the rebase without discarding either side, fetched full history, and fast-forwarded to main before claiming this independent task. Do not edit files claimed by another active session. Claims older than 60 minutes without commits can be handed off with a note here.

## Integration verification (2026-11-01 UTC)

- Audited starting repository: only README existed. Inspected external ledger at https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js ; imported 206 names/category leads without trusting stale claims. Added 2 specific leads.
- Individually read 7 official pages and recorded exact URLs and limitations in [research/SOURCES.md](research/SOURCES.md). 201/208 leads remain unverified; two have no usable HTTPS operator source. These are **needs review** items published on `review.html` and do not block publication.
- `node tests/validate.mjs` checked 208 unique IDs, blank unknown fields, official link presence for checked rows, 11 pages and internal references. External links on unverified leads are **not** certified reachable; users must check current operator rules.
- Irregularities: legacy August status and prize claims may be stale; reference project's older 100-item document is explicitly superseded; paid-entry / noncash / group-funded leads included for context, not recommended; ESPN FAQ inconsistent about maximum entries.
- Publication: [PR #1](https://github.com/sassnarep3-star/Own1/pull/1) merged into `main` at 2026-11-01 13:39 UTC (merge commit `90a79080ff42fbeeb0c58d4ddec2b622f07c3af7`). [Pages deployment run](https://github.com/sassnarep3-star/Own1/actions/runs/41312308316) succeeded; [live site](https://sassnarep3-star.github.io/Own1/index.html) rendered with 208 rows and category navigation. A follow-up correction blanks an ARC entry-cost cell that was not confirmed; publication of this correction is tracked in a follow-up PR.

## Follow-up: 85ca8130-own1 (2026-11-01 UTC)

- Scope: mobile UI and evidence filtering only. At <=700px table rows display as labeled cards rather than a 690px-wide sideways-scrolling table. The free-entry filter reads only existing checked fields and does not infer any unknown entry fee. Unverified URLs are labeled research leads, not certified official evidence.
- Re-read official [ESPN NFL Pick’em rules](https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules), [Metaculus tournaments](https://www.metaculus.com/tournaments/), and [US Midterms tournament](https://www.metaculus.com/tournament/midterms-2026/). These support the three records eligible for the confirmed-free filter. The ESPN FAQ contradicts itself on maximum entries; the Metaculus directory lists no-prize tournaments too; neither fact is hidden by the filter.
- Verification: `node --check assets/app.js`; `node tests/validate.mjs` checks all 208 rows, 11 internal pages, mobile labels and filter behavior (three qualifying rows). No new data value was asserted. CSS visual testing on a physical phone remains to be done.
- Coordination: a separately active `arena/181b7279-own1` branch also changes dashboard assets and tests. Its integration owner must reconcile these changes rather than overwrite them when integrating. `arena/37aed701-own1` is scoped to `supplemental/**`; `arena/4db3cf09-own1` is scoped to GEMS research. The board does not certify their unpublished work.
- Publication of this follow-up: [PR #4](https://github.com/sassnarep3-star/Own1/pull/4) merged into `main` at 2026-11-01 13:42 UTC (merge commit `e8d22533b909a1ec821a8c848aa579bfce0f7b75`); [Pages build/deployment run](https://github.com/sassnarep3-star/Own1/actions/runs/41312552974) succeeded. [Live site](https://sassnarep3-star.github.io/Own1/) now includes mobile cards and the free-entry filter.

## Concurrent session handoff — `arena/37aed701-own1`

This session independently started from the empty initial commit and claimed a reference-site audit before the other session's board was visible. During the required pull --rebase, `COORDINATION.md` had an add/add conflict because the other session had already merged PRs #1 and #2. Preserved the published session's board and files; the duplicate site build is not being integrated over its work. Supplemental evidence will be kept in a separate research file and a standalone page, with integration requests logged here rather than editing the other session's claimed shared outputs.

| Task | Status | Owner | File scope | Notes |
| --- | --- | --- | --- | --- |
| Supplemental official-source leads and irregularities | needs review | arena/37aed701-own1 | `supplemental/**`, `COORDINATION.md` | Isolated addition; does not edit the earlier session's claimed site or research files. |

Integration request: please link `supplemental/index.html` from the shared navigation/review page and integrate the new checked contest rows and flagged findings there. The current session will not edit `index.html`, `review.html`, `data/**`, or other previously claimed files.

## Supplemental verification — 2026-11-01 UTC

- Published supplementary findings and a clearly labeled flagged section in `supplemental/index.html`; not yet linked from the existing shared navigation. Integration request above remains open. The existing inventory and prior audit remain unchanged.
- Read organizer rules for [Codex x TwitchCon](https://twitchcon-codex.devpost.com/rules), [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/rules), and [Global Virtual Hackathon](https://gvhackathon.com/) ([AI fairness](https://gvhackathon.com/fairness)). Confirmed the displayed entry, cash-prize, deadline, eligibility and AI details only; current eligibility, future availability, payment and winning odds are not established.
- Flagged the [Challenge.gov sunset](https://www.challenge.gov/); [IceHacks' contradictory cash header](https://icehacks.devpost.com/); [PayPal prize totals](https://paypalaihackathon.devpost.com/) vs. [rules](https://paypalaihackathon.devpost.com/rules); ended [QHack](https://qhack.ai/terms-and-conditions/) and [WiseTech](https://groklearning.com/wtg-programming-competition/) events; [Papaya's distinction between free Gem and cash competitions](https://www.papaya.com/faq); and the original site's overbroad tax statement against [IRS guidance](https://www.irs.gov/publications/p525).
- Local tests: `node tests/validate.mjs` and `python3 supplemental/check.py`. External links on the inherited leads remain unverified; 201 of 208 existing leads remain flagged by the prior integration. No full external link sweep was possible.
- Supplemental publication PR: [#6](https://github.com/sassnarep3-star/Own1/pull/6); merged into main at 2026-11-01 13:44 UTC (merge commit `342a7e4f1a36512273b0b34a91c98c50ac0b22b2`). [Pages deployment](https://github.com/sassnarep3-star/Own1/actions/runs/41312675468) and validation succeeded. [Supplemental page](https://sassnarep3-star.github.io/Own1/supplemental/) was fetched after deployment. Shared-navigation integration remains requested. A second rebase conflict on this board arose after PR #4 landed; both sessions' entries were preserved.

## Follow-up: 20a81ffd-own1 (2026-11-01 UTC)

- Scope: independent line-by-line re-verification of all 7 officially-checked leads against live operator pages (no values inferred; unverified fields left blank).
- Verified by re-fetching each official page on 2026-11-01 UTC; every displayed value matches `data/entries.json`:
  1. ESPN NFL Pick'em — https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules — free to enter ("Every game we offer is completely free"); $102,000 total incl. $5,000 random drawing; NO PURCHASE NECESSARY; prize $102,000 / entry Free / deadline 2027-01-10 ✓
  2. ARC Prize 2026 — https://arcprize.org/competitions/2026 — $2,000,000 across 3 tracks; submissions due Nov 2 2026; papers Nov 8; open-source required; no internet in Kaggle evaluation; $2,000,000 / deadline 2026-11-02 ✓
  3. Metaculus Tournaments — https://www.metaculus.com/tournaments/ — free participation, cash prizes; some tournaments list NO PRIZE POOL; varies / entry Free ✓
  4. US Midterms 2026 (Metaculus) — https://www.metaculus.com/tournament/midterms-2026/ — $10,000 pool; closes Nov 4 2026; $10,000 / deadline 2026-11-04 ✓
  5. GEMS Prize Challenge — https://www.drivendata.org/competitions/306/competition-doe-gems/ — $300,000 total; ends Dec 3 2026 23:59 UTC; U.S. DOE Office of Geothermal sponsored; $300,000 / deadline 2026-12-03 ✓
  6. Kaggle Competitions — https://www.kaggle.com/competitions — featured competitions have prizes; practice/community may not; varies ✓
  7. DrivenData Competitions — https://www.drivendata.org/competitions/ — separates prize competitions from benchmarks/practice; varies ✓
- Validation: `node tests/validate.mjs` → OK (208 unique IDs, 7 page-checked, 2 with no operator link, 11 pages and all local references pass); `node --check assets/app.js` → OK.
- Irregularities carried forward (see research/SOURCES.md and review.html): ESPN FAQ entry-limit conflict (5 vs 10); ARC Prize 2026 deadline imminent Nov 2 2026; automation via network APIs barred inside Kaggle evaluation; 201 of 208 leads unverified with blank financial/timing fields; 2 leads (`thelines-survivor`, `squarespool`) have no usable HTTPS operator source; legacy August statuses (27 ended / 5 mixed / 11 caution) are stale.
- No edits to files claimed by other sessions (`index.html`, `review.html`, `data/**`, `supplemental/**`). Open integration request from `37aed701-own1` (link `supplemental/index.html` from shared navigation) remains logged here, unclaimed.
- Integration PR from this session (#10): https://github.com/sassnarep3-star/Own1/pull/10; merge and Pages deployment to be confirmed after rebase.
