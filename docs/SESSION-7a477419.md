# Session `arena/7a477419-own1` — task T15 record (labelled T14 when claimed; renumbered on merge) (2026-11-02)

Scope claimed in `COORDINATION.md` before any edit. Branch name is fixed by the workspace (`arena/7a477419-own1`), so `session-<id>/<task>` was not used.

## What was done

1. **Re-read time-critical rows** on their official pages: ARC Prize 2026, Metaculus US Midterms 2026, Codex x TwitchCon Hackathon, Kaggle competition list. Re-reads are appended to the existing cross-check record (original confirmed items kept, new ones prefixed `[re-read 2026-11-02]`).
2. **Added two cross-checks** for rows that had none: XPRIZE (competitions page and Quantum Applications page) and Devpost (hackathon list).
3. **Added nine new rows** from their own overview/rules pages (`data/additions.json`, each with `addedBy` and a matching entry in `data/cross-checks.json`): six Kaggle competitions and three Devpost hackathons.
4. **Added the Verified shortlist page** (`shortlist.html`, from `data/shortlist-notes.json`), sorted by closing date, with what each official page says about AI/agent use.
5. **Added irregularities I-22 to I-28** to `scripts/verify.js`; they publish on `flagged.html`.
6. **Generator edits** (`scripts/build.js`, `scripts/ingest.js`, `scripts/content.js`): countdowns run from the newest reading date, cross-check wording no longer says "not by this session", per-row `addedBy`, new nav item.

## Official sources read on 2026-11-02

| Page | Used for |
| --- | --- |
| <https://arcprize.org/competitions/2026> | Dates (submissions due Nov 2, papers Nov 8), rules on open source and no API access at evaluation |
| <https://www.kaggle.com/competitions> | Prize and time remaining for ARC tracks ($850,000 / $700,000 / $450,000), Gemma 4, Quantum, Enveda, Name That LLM, Squares in Squares, NFL BDB |
| <https://www.kaggle.com/competitions/gemma-4-developer-agent/overview> | Prizes ($110,000 total), timeline, submission format |
| <https://www.kaggle.com/competitions/name-that-llm/overview> and `/rules` | $50,000 prizes, timeline, code requirements, Kaggle foundational eligibility |
| <https://www.kaggle.com/competitions/squares-in-squares/overview> | Prizes, milestones, timeline |
| <https://www.kaggle.com/competitions/google-verifiable-quantum-circuit-compilation/overview> | Prizes ($150,000), AI-agent statement, timeline |
| <https://www.kaggle.com/competitions/enveda-CASMI26-molecule-id-mass-spectra/overview> | Prizes ($50,000), timeline, code requirements |
| <https://www.kaggle.com/competitions/nfl-big-data-bowl-2027/overview> | Track prizes ($100,000), timeline, eligibility of tracks |
| <https://www.kaggle.com/docs/competitions> | Competition types; no statement of entry fee |
| <https://www.metaculus.com/tournament/midterms-2026/> (and the dead `us-midterms-2026` slug) | $10,000 pool, closes Nov 04; slug 404 |
| <https://devpost.com/hackathons> | Prize totals and dates of listed hackathons; DSH Hacks V2 discrepancy |
| <https://kiroween.devpost.com/> and `/rules` | $100,000, "NO PURCHASE OR PAYMENT NECESSARY", dates, exclusions, Kiro requirement |
| <https://codegeist2026.devpost.com/> and `/rules` | $120,000+, prize list, dates, exclusions, Forge requirement |
| <https://start-developer-competition-26.devpost.com/rules> | Membership gate, dates, exclusions |
| <https://twitchcon-codex.devpost.com/> | $25,000 prize list, deadline, Codex requirement |
| <https://www.xprize.org/competitions> and `/competitions/qc-apps` | Purses; finalist teams selected |

## Verification rules followed

- Values were copied from the page text; arithmetic checks that passed: ARC $850,000 + $700,000 + $450,000 = $2,000,000; Gemma $65,000 + $35,000 + $10,000 = $110,000; Quantum $100,000 + $50,000 = $150,000; NFL BDB $45,000 + $45,000 + $10,000 = $100,000; Codegeist 3×$15,000 + 3×$8,000 + 3×$5,000 + 24×$1,500 = $120,000; Codex x TwitchCon $10,000 + $6,000 + $4,000 + 2×$2,500 = $25,000.
- Free entry is asserted only where the rules say so (Devpost rows). Kaggle rows are "Entry cost not stated".
- Meta VR Start's `$1,000,000` is the page-title claim; the prize table was not read.
- Rules pages were read in part (first chunks). Where a rules section was not read, the row says so.
- Prior sessions' readings were not re-read except those listed in item 1; they remain attributed to their authors.

## Not done / handed on

- Eligibility for Singapore-based entrants was not determined; only the exclusion lists printed on each page are recorded.
- 190+ rows still carry "source cited — not re-checked". Sports, creative and market categories were not touched in this session; claim them on the board before starting.
- `data/atlas-entries.json` and `data/verified.json` still contain the dead Metaculus slug (I-22); left unchanged as another session's archive.


## Addendum — FutureEval, GEMS and the T14 integration request

Read directly on 2026-11-02 and recorded in `data/cross-checks.json`, `data/additions.json` (row `fall-futureeval-2026`, 221 rows total) and `data/shortlist-notes.json`:

- **Fall 2026 FutureEval Bot Tournament** (https://www.metaculus.com/tournament/fall-futureeval-2026/): $50,000 pool, bot-only, closes 2027-01-06. Resources page: https://www.metaculus.com/notebooks/38928/ai-benchmark-resources/ (only sections 1-2 of 19 read; the prize split is unread). Rules: https://www.metaculus.com/tournament-rules/ ("No purchase, fee, or payment is required to participate"). Flag I-30: bot LLM/search costs are the entrant's.
- **Midterms**: the Metaculus rules confirm no fee, so the earlier caveat "free entry not re-confirmed" was removed. Bots are ineligible for Midterms prizes unless its own rules permit them; humans may use AI tools.
- **GEMS** (https://www.herox.com/GEMSPrize): HeroX limits entry to U.S.-based entrants; closing time differs (5 PM ET on HeroX vs 23:59 UTC in the earlier DrivenData reading). The rules PDF at nlr.gov could not be fetched. Flag I-29.
- **Global Virtual Hackathon** (https://gvhackathon.com/): re-read; free, students 14-18 only, matches the existing record.
- The other items in `ac192142-own1`'s integration request (Codex, Midterms, Kaggle index) are covered by the readings listed above. Their notes remain at `data/verification/current-state-2026-11-02.md`.
- Not verified: Singapore eligibility for any competition. No page read names Singapore as excluded or eligible; Devpost exclusion lists say "including but not limited to".
