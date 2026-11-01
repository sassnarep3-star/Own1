# Coordination — Own1

Shared task board. **Read this before starting work.** One row per task; claim by writing your session ID and file scope, then commit and push the claim immediately. Never start a task another session has claimed.

| Task | Status | Owner | File scope | Notes |
| --- | --- | --- | --- | --- |
| Initial scaffold, 208-lead import, first site | Done | 27a86924-own1 | historical | PRs #1–#2 merged. Superseded by the rebuild below. |
| Mobile listing readability + evidence filter | Done | 85ca8130-own1 | `assets/app.js`, `assets/style.css`, `tests/validate.mjs` | PRs #4, #7 merged. Card layout under 700px and a confirmed-free filter; no data changes. |
| Executive summary + source-first audit write-up | Done | 90c9f78c-own1 | `EXECUTIVE_SUMMARY.md` | PR #5 merged. |
| Supplemental Devpost/hackathon evidence | needs review | 37aed701-own1 | `supplemental/**` | PR #6 open. Facts published; asks the integrator to link `supplemental/index.html` and fold its checked rows in. |
| GEMS official rules + AI participation caveats | needs review | 4db3cf09-own1 | `research/**` (GEMS only) | PR #3 open. |
| **Rebuild: verified-research data model + site v2** | **In progress** | **4a243e58-own1** | `data/**`, `scripts/**`, `assets/**`, `research/**`, `index.html`, `category/**`, `entry/**`, `review.html`, `sources.html`, `playbook.html`, `tests/**`, `README.md`, `COORDINATION.md`, `.github/**` | Integration session. Rebuilds the dataset around per-fact evidence, generates all pages from data, and performs the final merge + Pages deploy. |

## Requests / handoffs

- **37aed701-own1 → integrator (open request):** link `supplemental/index.html` from shared navigation and integrate its checked contest rows + flagged findings. **Accepted by 4a243e58-own1:** the supplement stays published, is linked from the new `sources.html` and footer, and its verified facts are folded into `research/facts.mjs` with attribution.
- **4db3cf09-own1 → integrator:** GEMS caveats to be merged into the GEMS record. **Accepted:** GEMS entry links both the DOE challenge page and the note about AI participation.
- Do not edit files claimed by another active session. Claims older than 60 minutes without commits may be handed off with a note here.
- Branch names are fixed by the workspace; the `session-<id>/<task>` convention cannot be applied here. Each session works on its own `arena/<id>-own1` branch.

## Log

### 2026-11-01 — 27a86924-own1

- Audited starting repository: only README existed. Inspected the external ledger at https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js and imported 206 names/category leads without trusting its stale claims. Added 2 specific leads.
- Individually read 7 official pages and recorded exact URLs and limitations in [research/SOURCES.md](research/SOURCES.md). 201/208 leads remain unverified; two have no usable HTTPS operator source.
- `node tests/validate.mjs` checked 208 unique IDs, blank unknown fields, official link presence for checked rows, 11 pages and internal references.
- Irregularities: legacy August status and prize claims may be stale; the reference project's older 100-item document is explicitly superseded; paid-entry / noncash / group-funded leads included for context, not recommended; ESPN FAQ inconsistent about maximum entries.
- Publication: [PR #1](https://github.com/sassnarep3-star/Own1/pull/1) merged (merge commit `90a79080ff42fbeeb0c58d4ddec2b622f07c3af7`). [Pages deployment](https://github.com/sassnarep3-star/Own1/actions/runs/41312308316) succeeded.

### 2026-11-01 — 85ca8130-own1

- Scope: mobile UI and evidence filtering only. At ≤700px table rows display as labeled cards rather than a sideways-scrolling table. The free-entry filter reads only existing checked fields and does not infer any unknown entry fee.
- Re-read the official [ESPN NFL Pick’em rules](https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules), [Metaculus tournaments](https://www.metaculus.com/tournaments/) and [US Midterms tournament](https://www.metaculus.com/tournament/midterms-2026/). The ESPN FAQ contradicts itself on maximum entries; the Metaculus directory also lists no-prize tournaments.
- Publication: [PR #4](https://github.com/sassnarep3-star/Own1/pull/4) merged (merge commit `e8d22533b909a1ec821a8c848aa579bfce0f7b75`); Pages run [41312552974](https://github.com/sassnarep3-star/Own1/actions/runs/41312552974) succeeded.

### 2026-11-01 — 90c9f78c-own1

- Added `EXECUTIVE_SUMMARY.md` summarising the evidence position and limitations. [PR #5](https://github.com/sassnarep3-star/Own1/pull/5) merged.

### 2026-11-01 — 37aed701-own1

- Supplemental official-source leads in `supplemental/**`, isolated from the claimed shared outputs.
- Read organiser rules for [Codex x TwitchCon](https://twitchcon-codex.devpost.com/rules), [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/rules) and [Global Virtual Hackathon](https://gvhackathon.com/) (plus its [AI fairness policy](https://gvhackathon.com/fairness)), confirming entry, cash-prize, deadline, eligibility and AI details only.
- Flagged the [Challenge.gov sunset](https://www.challenge.gov/); [IceHacks' contradictory cash header](https://icehacks.devpost.com/); [PayPal prize totals](https://paypalaihackathon.devpost.com/) vs its [rules](https://paypalaihackathon.devpost.com/rules); ended [QHack](https://qhack.ai/terms-and-conditions/) and [WiseTech](https://groklearning.com/wtg-programming-competition/) events; [Papaya's free-Gem vs cash distinction](https://www.papaya.com/faq); and the original site's overbroad tax claim against [IRS guidance](https://www.irs.gov/publications/p525).
- PR [#6](https://github.com/sassnarep3-star/Own1/pull/6) open, awaiting integration.

### 2026-11-01 — 4a243e58-own1 (integration session)

Claimed the rebuild after the work above had landed. Read the board before starting; the claim was committed and pushed immediately.

**Verification performed (each page read directly on 2026-11-01; quotes stored in `research/facts.mjs`):**

| Entry | Official page read | What changed vs the record inherited from the ledger |
| --- | --- | --- |
| Metaculus | https://www.metaculus.com/tournaments/ | Confirmed free entry and captured the live pool sizes (13 funded tournaments; 4 with no prize pool). |
| US Midterms 2026 | https://www.metaculus.com/tournaments/ | $10,000 pool, "ends 3 days from now" → 2026-11-04, recorded as derived. |
| ESPN NFL Pick'em | https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay | Free entry confirmed verbatim; full $102,000 prize breakdown; documented the page's own 10-vs-5 entry-limit contradiction. |
| ARC Prize 2026 | https://arcprize.org/competitions/2026 | $2M, Nov 2 submission deadline, open-source requirement, no internet during evaluation. No fee is stated anywhere → fee left blank. |
| Kaggle | https://www.kaggle.com/competitions | Live prize events captured ($450,000 paper track, $100,000 NFL Big Data Bowl, $35,000 Gemma). |
| NFL Big Data Bowl 2027 | https://www.kaggle.com/competitions | $100,000, "2 months to go". |
| DrivenData | https://www.drivendata.org/competitions/ | One active prize competition; benchmarks/practice are unpaid. |
| GEMS Prize | https://www.drivendata.org/competitions/ | $300,000, "4 weeks left". |
| Wergle Flomp | https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free | **Free** with $5,100 in prizes, open Aug 15 2026 – Apr 1 2027. AI-written entries prohibited. |
| Tom Howard/Margaret Reid Poetry | https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest | **$27 per submission** — the ledger implied a free contest. Recorded as paid entry. AI text prohibited. |
| Sony World Photography Awards | https://www.worldphoto.org/sony-world-photography-awards | Free to enter confirmed; $25,000 Series / $5,000 Single Image; 2027 deadlines captured. |
| Environmental Photographer of the Year | https://www.epoty.org/ | Free to enter confirmed; **no cash amount stated** → prize blank. |
| Weather Photographer of the Year | https://www.rmets.org/weather-photographer-of-the-year | Free to enter confirmed; **no cash amount stated** → prize blank. |
| TradingView The Leap | https://www.tradingview.com/the-leap/tradestation-july-2026/rules/ | No purchase necessary, paper trading only — but the linked edition **closed 2026-08-14** → stale-edition flag. |
| Givling | https://givling.com/ | **Reclassified:** crowdfunding queue with random selection, not a judged cash competition. Prior "ended" status was stale. |
| Zindi / Topcoder / XPRIZE / AIcrowd | respective sites | Client-side boards returned no listings, so nothing about prizes or fees could be confirmed → `partial`, fields blank. |

**Irregularities raised in this session:** paid-entry contest mislabelled as free (Tom Howard); ended edition still linked (TradingView); non-competition model listed as a contest (Givling); stale August statuses (Givling "ended" but live); ESPN self-contradiction; prize amounts never stated on two photo contests; two leads with no operator link; four platforms whose boards cannot be verified without sign-in or JavaScript.

**Link health:** `scripts/linkcheck.mjs` runs on a GitHub runner (`.github/workflows/link-health.yml`) and records the real HTTP result for every outbound URL. The sandbox that edits this repo can only reach GitHub, so links are never certified from here by assumption — only from that report, which is shown on the site as "checked <date>".

**Coordination decisions:**
- Kept `EXECUTIVE_SUMMARY.md` and extended it rather than replacing it.
- Kept `supplemental/**` published and linked from the new navigation; its verified facts are folded into `research/facts.mjs`.
- The rebuilt UI preserves the earlier session's mobile card layout and confirmed-free filter, and broadens both.
- Rebase conflicts on `COORDINATION.md` were resolved by keeping every session's log; `data/entries.json` is regenerated from `research/facts.mjs` rather than merged by hand, so no session's verified values are lost.

_(Publication result recorded at the end of this log once the PR is merged and Pages deploys.)_
