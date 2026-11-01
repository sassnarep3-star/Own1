# Executive Summary — Prize Atlas (Own1)

**Prepared:** 2026-11-01 UTC · **Live site:** https://sassnarep3-star.github.io/Own1/
**Status:** this version supersedes the first-pass summary of the same date (session `90c9f78c-own1`), which described a 208-row site in which all but 7 rows were unverified name-and-link leads. Its accurate points are carried forward; its coverage figures are now out of date.

---

## 1. What this project is

A research ledger and dashboard for **free-to-enter competitions that pay real cash**. The job is not to list everything — it is to answer one question quickly: *which of these is worth my time this week?*

Two rules govern every page:

1. **No unsourced values.** A prize, fee, deadline or eligibility line appears only with a quote from the organiser's own page, plus the date that page wasread.
2. **Blank beats wrong.** If the official page does not state it, the cell stays empty and the row is flagged. A fee that is not stated is *not* $0.

## 2. Where the data comes from

- **Inherited catalog (211 rows):** names, categories and links imported from [FreeMoneyApps `assets/data.js`](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js) (206 listings, stamped 2026-08-19), plus five leads added during audits. Its prize, fee and status claims were **not** trusted. Its older `100_VERIFIED_CONTESTS.md` is self-described as superseded and was not used.
- **Verified layer (17 entries, 44 quoted facts):** each was read on 2026-11-01 from the operator's own page; the quote and URL are stored in [`research/facts.mjs`](../research/facts.mjs) and rendered on the entry's page.
- **Parity checked (4 entries):** boards requiring JavaScript or sign-in (Zindi, Topcoder, AIcrowd, XPRIZE) rendered no listings, so nothing was asserted.
- **Link health (203 unique URLs):** an automated runner requested every outbound link and recorded the real HTTP result. 166 responded, 10 failed outright, 27 were bot-blocked.

## 3. Coverage, stated honestly

| Measure | Value |
| --- | --- |
| Leads in the ledger | 211 |
| Official pages read and quoted | 17 |
| Partly checked (no assertion possible) | 4 |
| Unverified leads, all fields blank | 190 |
| Confirmed free entry | 10 |
| Confirmed paid entry (corrected) | 1 |
| Confirmed cash prize | 13 |
| Leads with no operator link | 2 |
| Links that failed a real check | 10 |

**The honest headline: 8% of this catalog has been verified.** That is not a shortfall to hide — it is the actual state of the evidence, and the site is built so the difference is impossible to miss. Merging the reference catalog's August 2026 claims into the tables would have produced a prettier, fully-populated, unreliable site. This is the alternative.

## 4. What the verified layer actually found

**Genuine, open, free-to-enter cash competitions (verified):**

| Competition | Entry | Prize | Closes |
| --- | --- | --- | --- |
| Codex x TwitchCon Hackathon | Free (no purchase necessary) | $25,000 in prizes | **2026-11-02** |
| US Midterms 2026 (Metaculus) | Free | $10,000 pool | 2026-11-04 |
| PayPal AI Hackathon | Free | Stated totals conflict — not asserted | 2026-11-12 |
| Metaculus tournaments (13 funded) | Free | Largest active pool $50,000 | Rolling |
| ESPN NFL Pick'em | Free | $102,000 total | Season |
| Wergle Flomp Humor Poetry | Free | $5,100 total | 2027-04-01 |
| Sony World Photography Awards | Free | $25,000 / $5,000 | 2027-01-12 |
| Environmental + Weather Photographer of the Year | Free | Not stated on page → blank | Annual |

**Verified cash competitions that are not free entries:** Tom Howard/Margaret Reid Poetry ($27 per submission).

**Verified cash competitions with no published fee:** ARC Prize 2026 ($2M), Kaggle featured events ($450,000 / $100,000 / $35,000 live), DrivenData GEMS ($300,000). The fee cell is blank, not "free" — these platforms have never charged me, but the pages read do not say so.

## 5. Irregularities found (all published with sources)

1. **A paid contest was listed as free.** Tom Howard/Margaret Reid charges $27 per submission and is closed until 2027-04-15.
2. **A link points at a closed edition.** TradingView "The Leap" resolves to the TradeStation July 2026 rules; that competition ended 2026-08-14.
3. **A crowdfunding queue was listed as a prize contest.** Givling awards funding via queue points and random spinners, partly earned by purchases and ad-watching. Its inherited "ended" label was also stale.
4. **Ten links are genuinely broken.** Four domains no longer resolve (including `supercoach.news.com.au`, `fantasy.football.scot`, `fantazilig.tff.org`, `fantasyracing.telegraph.co.uk`); one has an expired certificate; two return 404; two time out; one has a certificate name mismatch.
5. **ESPN contradicts itself** on whether 10 or 5 entries are allowed on the same page.
6. **PayPal's hackathon page and its own rules disagree** on the prize total; no figure is asserted.
7. **Challenge.gov was sunset** on 2026-03-30 yet still appears in the reference catalog.
8. **Two contests publish no cash amount** (EPOTY, Weather Photographer of the Year) — the prize cells are blank rather than filled from memory.
9. **AI rules differ sharply.** Winning Writers prohibits AI-written entries; ARC Prize bans internet access during evaluation; Codex x TwitchCon explicitly permits AI coding assistants. Entering the wrong way voids the effort.

## 6. What an AI agent is actually good for here

Bounded, objectively-scored work: model-building (Kaggle, DrivenData, ARC), forecasting tournaments (including Metaculus's explicitly-bot FutureEval tournament), and hackathons where AI assistants are permitted. It is weak at judged originality, and several creative contests forbid it outright. The site's fit score makes this weighting explicit instead of pretending every competition is equally suitable.

## 7. Recommendation

1. **This week:** Codex x TwitchCon closes 2026-11-02 (assistants allowed, highest agent fit in the ledger). US Midterms closes 2026-11-04 at low effort. Both are free.
2. **Next 30 days:** the PayPal hackathon (2026-11-12) and the Metaculus Cup / FutureEval windows for recurring practice.
3. **Ongoing:** treat the 190 unverified rows as a *reading queue*, not an opportunity list. Verification is one page-read per row, and the site now makes adding one a one-file edit.

## 8. Known limits

- Verification is a snapshot. Every fact carries its read date; rules change without notice.
- Eligibility was captured only where the page stated it; the Codex and PayPal sanction carve-outs are the sort of detail that voids a win.
- No probability of winning, expected value or time-to-win estimate is offered anywhere — the sources do not support one.
- Nothing here is legal, tax or financial advice. US prize income is taxable; the reference site's blanket "$600+" rule is not a legal rule ([IRS Pub. 525](https://www.irs.gov/publications/p525)).
- Link status is machine-measured; a 403 is a bot block, not a dead page, and is labelled as such.

## 9. Where to look

| Page | Purpose |
| --- | --- |
| [Dashboard](https://sassnarep3-star.github.io/Own1/) | Ranked shortlist, category browse, all 211 leads |
| [Playbook](https://sassnarep3-star.github.io/Own1/playbook.html) | How to choose, filter, and use an agent |
| [Sources](https://sassnarep3-star.github.io/Own1/sources.html) | Every quoted fact and its URL |
| [Flagged for review](https://sassnarep3-star.github.io/Own1/review.html) | Unverified rows, broken links, contradictions |
| [COORDINATION.md](../COORDINATION.md) | Multi-session task board, PR and deploy record |

## Related: Verified Contest Ledger (session a479d584-own1)

A separate build under [`ledger/`](ledger/index.html): all 206 upstream rows with an automated audit, 28 rows checked against official pages (6 verified, 9 partial, 8 differ or broken link, 5 not confirmable, 178 not checked), a [Flagged for Review](ledger/flagged.html) page, verified top picks and its own [executive summary](ledger/summary.html). Where both builds read the same official page (ARC Prize, Metaculus, Kaggle, DrivenData, Checkmate, ESPN NFL Pick'em) the prize figures agree; one status label differs (Checkmate; see the ledger's flagged page, section E).
