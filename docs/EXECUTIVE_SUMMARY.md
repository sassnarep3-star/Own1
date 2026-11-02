# Executive summary

_What the competition catalogue contains, what current official sources confirm, and what still needs review._


## 1. The project and the decision

The public Free Money & Contest Ledger is a discovery list of contests and platforms that may pay cash. Its own page describes a single list without search, filters, or sorting. PrizeDesk reorganizes the research as a mobile-first dashboard with nine category pages, a searchable/filterable table, detail pages, an analysis, a verification-method page, and a Flagged for Review page. The upstream file contains 206 listings; this repository has 211 after 5 separately attributed additions.

A row is a lead, not an offer. A cited link is not proof that a competition is open today, free to enter, or available to a particular entrant. Use the operator’s current rules before committing effort. No win probability or expected return is estimated.


## 2. Verification snapshot

| Measure | Value | What it means |
| --- | --- | --- |
| Combined listings | 211 | 206 pinned upstream rows + 5 attributed additions |
| Categories | 9 | Skill, trivia, sports, creative, forecasting, market, tech, directories, and pools |
| Source-marked full free path | 193 | Upstream classification; not a fresh official confirmation for every row |
| Some free events / paid cash / unknown path | 13 / 4 / 1 | Source classifications; check the specific event’s terms |
| Rows marked ended / out of season | 27 | Source snapshot; verify current status before relying on it |
| Official-page fetch outcomes (1 Nov 2026) | 12 loaded; 1 error | 13 fetch outcomes total in the saved pass |
| Independent cross-checks | 10 rows | 13 check records are retained in the repository |
| Official-tier source cited, not re-opened in that pass | 177 | Link is recorded, but the source was not freshly fetched in that pass |
| No official-tier source in that pass | 11 | Prize / entry claims are not officially supported there |
| Prize cells blanked | 80 | No qualifying official source or no stated amount |
| Flagged irregularities | 22 | Published on the Flagged for Review page |
| Upstream declared review date | 2026-08-19 | 74 days before the 1 Nov verification snapshot |

The source marks 193 rows as having a full free path, but that is a source-dataset label, not current confirmation for every contest. Entry cost that is not stated by an official source stays unknown. The pinned source data was reviewed on 2026-08-19; its age and the row-level coverage above limit how much should be relied on.


## 3. What the source catalogue gets wrong or leaves unclear

- Mobile discovery is difficult: the source page explicitly says it has no search box, filters, or sorting and presents a long list of detailed contest cards.
- The source website displays 206 listings. This repository displays 211 because five later additions are merged and attributed; the totals describe different datasets.
- 27 rows are marked ended or out of season in the pinned source snapshot, so its status labels are not proof that entry is currently open.
- 11 rows had no official-tier source in the verification snapshot; 6 lacked a rules URL; 117 used the signup URL as their rules link; and 1 source URL used HTTP.
- 80 prize cells are blanked by the verifier. Free practice, cash-entry play, non-cash credits, pool tools, and cash-prize contests must not be presented as equivalent.
- The 2026-11-01 live check for one cited App Store URL returned an error page. That is a dated observation, not proof the link remains broken.


## 4. Opportunities from the targeted 2 Nov official-source refresh

These are targeted reads from 2 Nov 2026, recorded separately in data/verification/current-state-2026-11-02.md. They are not yet merged into the canonical row-level verification file or rendered as live-checked rows. Values below are limited to what the cited official pages state.

- FutureEval Bot Tournament: official page states a $50,000 pool, bot-only format, and 6 Jan 2027 close. Metaculus general rules say no fee is required but generally bar bots from prizes unless contest-specific terms permit them; read the bot resources and specific terms before building. Model/API use may still cost money.
- US Midterms 2026 on Metaculus: official page states a $10,000 pool and 4 Nov close. General rules say no entry fee is required and allow AI assistance to human forecasters when forecasts reflect their own decisions and understanding. Contest-specific restrictions may apply.
- Codex x TwitchCon: official rules say no purchase/payment is required; the event page lists $25,000 total cash, with $10,000 first place. The rules require a Twitch-connected Codex project, a repository, a public YouTube demo, a project description, and a Codex session ID. Official deadline: 2 Nov 2026, 2 p.m. Pacific; check immediately whether it is still open.
- GEMS Prize Challenge: official DrivenData page states $300,000 total and a 3 Dec 2026, 11:59 p.m. UTC end date. The inspected page does not state entry cost, so free entry is unconfirmed.
- Global Virtual Hackathon: official event page states free entry and $1,000 first prize plus two $250 runner-up awards in each division. It is for students aged 14–18 in teams of 2–4 with a supervising teacher; registration closes 13 Nov AoE. Its organizer says AI tools are allowed and expected.

The user’s approximate location is Singapore. This audit does not determine eligibility for a specific person or establish Singapore eligibility for any of these events. Confirm location, age, prize-delivery, sanctions, and local-law terms before investing effort.


## 5. Practical triage for an AI-assisted entrant

1. Read the current operator rules and confirm free entry, cash (not credits), deadline, entrant eligibility, and how a prize is delivered.
2. Choose a task that matches the rules: human forecasting assisted by AI is different from submitting an autonomous bot; a hackathon may require a particular tool, team, demo, or code repository.
3. Compare work required and competition structure, not headline prize alone. A $50,000 pool or first-place award does not imply a likely or positive return.
4. Count API/model charges, time, team obligations, identity/tax paperwork, and legal restrictions as real constraints. This site does not compute expected value or odds.
5. Open the Flagged for Review page for stale, incomplete, conflicting, or unsupported records. Re-check any lead immediately before entering.


## 6. Official sources for manual review

- [Original Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/) — Upstream discovery list; 206 shown on the page.
- [Metaculus US Midterms 2026](https://www.metaculus.com/tournament/midterms-2026/) — $10,000 pool; closes 4 Nov 2026.
- [Metaculus Fall 2026 FutureEval Bot Tournament](https://www.metaculus.com/tournament/fall-futureeval-2026/) — $50,000; bot-only; closes 6 Jan 2027.
- [Metaculus competition rules](https://www.metaculus.com/tournament-rules/) — Fee, eligibility, AI-assistance, and bot restrictions.
- [Codex x TwitchCon official rules](https://twitchcon-codex.devpost.com/rules) — Entry, eligibility, deliverables, deadline, prize schedule.
- [GEMS Prize Challenge](https://www.drivendata.org/competitions/306/competition-doe-gems/) — Prize and closing date; entry fee not stated on inspected page.
- [Global Virtual Hackathon 2026](https://gvhackathon.com/) — Official student eligibility, free entry, prize tiers, timeline.
- [2026-11-02 targeted audit note](data/verification/current-state-2026-11-02.md) — Full facts, limits, and the verification performed.
- [Flagged for Review](flagged.html) — Current generated irregularities register.


## 7. Reproducibility and limits

- The upstream JavaScript data file is pinned by repository commit and SHA-256, copied without alteration, and parsed as strict JSON; it is not executed.
- The 2 Nov official-page reads are evidence-only at present. Do not treat those rows as live-checked in the generated table until the data pipeline is updated and the pages rebuilt.
- The local build checks internal links, row coverage, and output structure. It does not crawl external URLs or prove that a contest remains open.
- This site is an independent research index, not a sponsor or guarantee. Contest terms can change; this is not legal, tax, or financial advice.

Source repository commit 466f7c1e7a14b52b4a0d36beb84a00d68fd409b7; source file SHA-256 13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211. The source was captured on 1 Nov 2026. Verification snapshot date: 2026-11-01.

---

Generated by `scripts/render-docs.js` for the verification date 2026-11-01.
Site: https://sassnarep3-star.github.io/Own1/

Every figure in this document is computed from `data/ledger.json`, `data/verification.json`
and `data/irregularities.json` at build time. Source dataset: commit `466f7c1e7a14b52b4a0d36beb84a00d68fd409b7`,
SHA-256 `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`.