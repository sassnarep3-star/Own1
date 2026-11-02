# Executive summary

_Updated 2026-11-02; base verification snapshot 2026-11-01._

_What the competition catalogue contains, what official pages support, and what still needs review._


## 1. The project and the decision

The upstream Free Money & Contest Ledger is a discovery catalogue; its page presents a long list without search, filters, or sorting. The pinned source file has 206 listings. The current combined PrizeDesk dataset has 221 rows after 15 separately attributed additions. PrizeDesk organizes the list into nine category pages, a searchable and filterable table, a ranked shortlist, per-listing detail pages, an analysis, a verification page, and a Flagged for Review page.

A row is a lead, not an offer. A source link is not proof that a competition is still open, free, or available to a particular person. Use the operator’s current rules before committing effort. This project does not estimate winning odds or expected return.


## 2. Verification snapshot

| Measure | Value | Interpretation |
| --- | --- | --- |
| Combined listings | 221 | 206 pinned upstream rows + 15 attributed additions |
| Categories | 9 | Skill, trivia, sports, creative, forecasting, market, tech, directories, and pools |
| Source-marked full free path | 196 | Source classification, not a fresh official confirmation for every row |
| Some free events / paid cash / unknown path | 14 / 4 / 7 | Source classifications; verify the specific contest terms |
| Rows marked ended / out of season | 27 | Pinned source status; check current operator status |
| Live fetch outcomes in the 1 Nov snapshot | 12 loaded; 1 error | 13 fetch outcomes total |
| Independent official-page checks | 22 rows | 25 check records; dates and readers are recorded per row |
| Official-tier sources cited but not re-opened in that snapshot | 175 | Source URL recorded, but no fresh fetch in that pass |
| No official-tier source in that snapshot | 11 | Claims need an operator source before verified values can be shown |
| Prize cells blanked by the verifier | 80 | No official support or no stated amount |
| Flagged irregularities | 31 | Published on Flagged for Review |
| Pinned source review date | 2026-08-19 | 74 days before the 1 Nov base verification snapshot |

The source classifies 196 rows as having a full free path, 14 as having some free events, 4 as requiring paid cash entry, and 7 as unknown. These are imported source labels, not verified current entry terms for all rows. A value the official page does not state stays unknown or blank.


## 3. What matters for an AI-assisted entrant

- Metaculus Fall 2026 FutureEval is explicitly a bot-only tournament; its page states a $50,000 pool and a 6 Jan 2027 close. Metaculus general rules say no entry fee is required but normally exclude bots from prizes unless contest-specific terms permit them. The official resource page describes the bot competition. Model/API and search use can still have operating costs (flag I-30).
- Metaculus US Midterms 2026 has a stated $10,000 pool and a 4 Nov close. General Metaculus rules allow AI assistance for a human forecaster only when final forecasts reflect that person’s own decisions and understanding. Check the contest-specific terms.
- Codex x TwitchCon rules state no purchase/payment is necessary and require an OpenAI Codex-built Twitch-connected project, a repository, a public YouTube demo, a project description, and the Codex session ID. The event page states $25,000 total cash; first place is $10,000. The rules deadline is 2 Nov 2026 at 2 p.m. Pacific, so confirm immediately whether entry is still open.
- The GEMS Prize page states a $300,000 total pool and 3 Dec 2026 close. Its entry-cost status is not confirmed as free; the latest verification pass also flags U.S.-based eligibility and a closing-time discrepancy (I-29). Read the official rules before considering it.
- Global Virtual Hackathon is free and explicitly permits/expects AI tools, but eligibility is restricted to student teams aged 14–18 with a supervising teacher; its $1,000 first prize and two $250 runner-up prizes are per division.

No Singapore-specific eligibility conclusion is established for any competition. Confirm geography, age, prize delivery, sanctions, local law, and any contest-specific restrictions before investing time.


## 4. Why the catalogue needs review

- The upstream page shows 206 listings; the combined site shows 221 because it includes later attributed additions. Never describe the combined count as the upstream total.
- The pinned source was last reviewed on 2026-08-19. Its 27 ended/out-of-season labels and other status fields are not proof of current availability.
- 11 rows had no official-tier source in the verification snapshot; 6 lacked a rules URL; 117 used a signup URL as the rules URL; and 1 source URL used HTTP.
- 80 prize cells are blanked because the available evidence does not support an amount. Free practice, non-cash credits, paid-entry cash rooms, directories, and cash competitions are different products.
- A 1 Nov fetch of one App Store URL returned an error. This is a dated observation, not proof that the link remains broken today.


## 5. How to use the site

1. Start with the Verified shortlist and its official-source column, then open the actual rules page before entering.
2. Confirm cash versus points/credits, entry fee, deadline, age and location eligibility, prize delivery, and permitted use of AI.
3. Choose a task that matches the rules: human forecasts assisted by AI are different from an autonomous bot; hackathons may require a particular tool, team, demo, or repository.
4. Compare the work required and competition structure, not headline prize alone. Account for time, team obligations, and model/API costs; no return estimate is published here.
5. Use Flagged for Review for unresolved sources, stale information, status problems, and contradictions. Re-check every time-sensitive claim before acting.


## 6. Official sources for manual review

- [Original Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/) — Upstream discovery catalogue; page shows 206 listings.
- [Verified shortlist](../shortlist.html) — Newly re-read opportunities with source links and contest-specific caveats.
- [Metaculus FutureEval Bot Tournament](https://www.metaculus.com/tournament/fall-futureeval-2026/) — $50,000; bot-only; closes 6 Jan 2027.
- [Metaculus competition rules](https://www.metaculus.com/tournament-rules/) — Fees, AI assistance, bot restrictions, and eligibility.
- [Metaculus US Midterms 2026](https://www.metaculus.com/tournament/midterms-2026/) — $10,000 pool; closes 4 Nov 2026.
- [Codex x TwitchCon official rules](https://twitchcon-codex.devpost.com/rules) — Entry, eligibility, requirements, deadline, and prize schedule.
- [GEMS Prize Challenge](https://www.drivendata.org/competitions/306/competition-doe-gems/) — $300,000 pool; entry cost not stated on the inspected page.
- [Global Virtual Hackathon 2026](https://gvhackathon.com/) — Free entry, student eligibility, prize tiers, and timeline.
- [2026-11-02 official-source audit](../data/verification/current-state-2026-11-02.md) — Original targeted reads, limitations, and verification performed.
- [Flagged for Review](../flagged.html) — Current irregularities register.


## 7. Verification limits and provenance

- The 1 Nov base pass fetched 13 URLs (12 loaded and one error); 25 official-page check records are now retained, including the 2 Nov reads. The verification badges distinguish live fetches from independent cross-checks and source-only citations.
- The 2 Nov audit note preserves the targeted-read record. The current row dataset and Verified shortlist carry the newly integrated findings, but neither replaces reading the operator rules at the time of entry.
- The local build checks generated pages and internal references. It does not prove that external links work or that a contest remains open.
- The upstream file is pinned by repository commit and SHA-256, copied unchanged, and parsed as strict JSON rather than executed.

Source repository commit 466f7c1e7a14b52b4a0d36beb84a00d68fd409b7; source file SHA-256 13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211. Pinned source captured 1 Nov 2026. Base verification snapshot: 2026-11-01.

---

Generated by `scripts/render-docs.js` for the verification date 2026-11-01.
Site: https://sassnarep3-star.github.io/Own1/

Every figure in this document is computed from `data/ledger.json`, `data/verification.json`
and `data/irregularities.json` at build time. Source dataset: commit `466f7c1e7a14b52b4a0d36beb84a00d68fd409b7`,
SHA-256 `13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211`.