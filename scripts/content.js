'use strict';
/**
 * content.js — evidence-limited executive-summary prose shared by the site and docs.
 * Counts come from the verifier. The source review date is not confused with later
 * operator-page reads, and no row is called current solely because it has a URL.
 */

function build(ctx) {
  const n = ctx.totals;
  const sourceRows = n.rows - n.addedByParallelSessions;
  const unknownEntry = n.rows - n.freeEntryFull - n.freeEntryPartial - n.paidCash;

  return {
    title: 'Executive summary',
    updatedOn: ctx.updatedOn || ctx.verifiedOn,
    standfirst: 'What the competition catalogue contains, what official pages support, and what still needs review.',
    blocks: [
      { t: 'h2', text: '1. The project and the decision' },
      { t: 'p', text:
        'The upstream Free Money & Contest Ledger is a discovery catalogue; its page presents a long list without search, filters, or sorting. The pinned source file has ' + sourceRows + ' listings. The current combined PrizeDesk dataset has ' + n.rows + ' rows after ' + n.addedByParallelSessions + ' separately attributed additions. PrizeDesk organizes the list into nine category pages, a searchable and filterable table, a ranked shortlist, per-listing detail pages, an analysis, a verification page, and a Flagged for Review page.' },
      { t: 'p', text:
        'A row is a lead, not an offer. A source link is not proof that a competition is still open, free, or available to a particular person. Use the operator’s current rules before committing effort. This project does not estimate winning odds or expected return.' },

      { t: 'h2', text: '2. Verification snapshot' },
      { t: 'table', head: ['Measure', 'Value', 'Interpretation'], rows: [
        ['Combined listings', String(n.rows), sourceRows + ' pinned upstream rows + ' + n.addedByParallelSessions + ' attributed additions'],
        ['Categories', '9', 'Skill, trivia, sports, creative, forecasting, market, tech, directories, and pools'],
        ['Source-marked full free path', String(n.freeEntryFull), 'Source classification, not a fresh official confirmation for every row'],
        ['Some free events / paid cash / unknown path', n.freeEntryPartial + ' / ' + n.paidCash + ' / ' + unknownEntry, 'Source classifications; verify the specific contest terms'],
        ['Rows marked ended / out of season', String(n.endedListings), 'Pinned source status; check current operator status'],
        ['Live fetch outcomes in the 1 Nov snapshot', n.liveChecked + ' loaded; ' + n.liveCheckError + ' error', n.recheckedThisPass + ' fetch outcomes total'],
        ['Independent official-page checks', n.crossChecked + ' rows', n.crossChecks + ' check records; dates and readers are recorded per row'],
        ['Official-tier sources cited but not re-opened in that snapshot', String(n.officialSourceCited), 'Source URL recorded, but no fresh fetch in that pass'],
        ['No official-tier source in that snapshot', String(n.noOfficialSource), 'Claims need an operator source before verified values can be shown'],
        ['Prize cells blanked by the verifier', String(n.prizeBlankedOnSite), 'No official support or no stated amount'],
        ['Flagged irregularities', String(ctx.flags.length), 'Published on Flagged for Review'],
        ['Pinned source review date', ctx.sourceReviewed, n.staleDays + ' days before the 1 Nov base verification snapshot']
      ]},
      { t: 'p', text:
        'The source classifies ' + n.freeEntryFull + ' rows as having a full free path, ' + n.freeEntryPartial + ' as having some free events, ' + n.paidCash + ' as requiring paid cash entry, and ' + unknownEntry + ' as unknown. These are imported source labels, not verified current entry terms for all rows. A value the official page does not state stays unknown or blank.' },

      { t: 'h2', text: '3. What matters for an AI-assisted entrant' },
      { t: 'ul', items: [
        'Metaculus Fall 2026 FutureEval is explicitly a bot-only tournament; its page states a $50,000 pool and a 6 Jan 2027 close. Metaculus general rules say no entry fee is required but normally exclude bots from prizes unless contest-specific terms permit them. The official resource page describes the bot competition. Model/API and search use can still have operating costs (flag I-30).',
        'Metaculus US Midterms 2026 has a stated $10,000 pool and a 4 Nov close. General Metaculus rules allow AI assistance for a human forecaster only when final forecasts reflect that person’s own decisions and understanding. Check the contest-specific terms.',
        'Codex x TwitchCon rules state no purchase/payment is necessary and require an OpenAI Codex-built Twitch-connected project, a repository, a public YouTube demo, a project description, and the Codex session ID. The event page states $25,000 total cash; first place is $10,000. The rules deadline is 2 Nov 2026 at 2 p.m. Pacific, so confirm immediately whether entry is still open.',
        'The GEMS Prize page states a $300,000 total pool and 3 Dec 2026 close. Its entry-cost status is not confirmed as free; the latest verification pass also flags U.S.-based eligibility and a closing-time discrepancy (I-29). Read the official rules before considering it.',
        'Global Virtual Hackathon is free and explicitly permits/expects AI tools, but eligibility is restricted to student teams aged 14–18 with a supervising teacher; its $1,000 first prize and two $250 runner-up prizes are per division.'
      ]},
      { t: 'p', text:
        'No Singapore-specific eligibility conclusion is established for any competition. Confirm geography, age, prize delivery, sanctions, local law, and any contest-specific restrictions before investing time.' },

      { t: 'h2', text: '4. Why the catalogue needs review' },
      { t: 'ul', items: [
        'The upstream page shows ' + sourceRows + ' listings; the combined site shows ' + n.rows + ' because it includes later attributed additions. Never describe the combined count as the upstream total.',
        'The pinned source was last reviewed on ' + ctx.sourceReviewed + '. Its ' + n.endedListings + ' ended/out-of-season labels and other status fields are not proof of current availability.',
        n.noOfficialSource + ' rows had no official-tier source in the verification snapshot; ' + n.missingRulesUrl + ' lacked a rules URL; ' + n.rulesEqualsSignup + ' used a signup URL as the rules URL; and ' + n.nonHttps + ' source URL used HTTP.',
        n.prizeBlankedOnSite + ' prize cells are blanked because the available evidence does not support an amount. Free practice, non-cash credits, paid-entry cash rooms, directories, and cash competitions are different products.',
        'A 1 Nov fetch of one App Store URL returned an error. This is a dated observation, not proof that the link remains broken today.'
      ]},

      { t: 'h2', text: '5. How to use the site' },
      { t: 'ol', items: [
        'Start with the Verified shortlist and its official-source column, then open the actual rules page before entering.',
        'Confirm cash versus points/credits, entry fee, deadline, age and location eligibility, prize delivery, and permitted use of AI.',
        'Choose a task that matches the rules: human forecasts assisted by AI are different from an autonomous bot; hackathons may require a particular tool, team, demo, or repository.',
        'Compare the work required and competition structure, not headline prize alone. Account for time, team obligations, and model/API costs; no return estimate is published here.',
        'Use Flagged for Review for unresolved sources, stale information, status problems, and contradictions. Re-check every time-sensitive claim before acting.'
      ]},

      { t: 'h2', text: '6. Official sources for manual review' },
      { t: 'links', items: [
        { label: 'Original Free Money & Contest Ledger', url: 'https://karagemop466-tech.github.io/FreeMoneyApps/', note: 'Upstream discovery catalogue; page shows 206 listings.' },
        { label: 'Verified shortlist', url: 'shortlist.html', note: 'Newly re-read opportunities with source links and contest-specific caveats.' },
        { label: 'Metaculus FutureEval Bot Tournament', url: 'https://www.metaculus.com/tournament/fall-futureeval-2026/', note: '$50,000; bot-only; closes 6 Jan 2027.' },
        { label: 'Metaculus competition rules', url: 'https://www.metaculus.com/tournament-rules/', note: 'Fees, AI assistance, bot restrictions, and eligibility.' },
        { label: 'Metaculus US Midterms 2026', url: 'https://www.metaculus.com/tournament/midterms-2026/', note: '$10,000 pool; closes 4 Nov 2026.' },
        { label: 'Codex x TwitchCon official rules', url: 'https://twitchcon-codex.devpost.com/rules', note: 'Entry, eligibility, requirements, deadline, and prize schedule.' },
        { label: 'GEMS Prize Challenge', url: 'https://www.drivendata.org/competitions/306/competition-doe-gems/', note: '$300,000 pool; entry cost not stated on the inspected page.' },
        { label: 'Global Virtual Hackathon 2026', url: 'https://gvhackathon.com/', note: 'Free entry, student eligibility, prize tiers, and timeline.' },
        { label: '2026-11-02 official-source audit', url: 'data/verification/current-state-2026-11-02.md', note: 'Original targeted reads, limitations, and verification performed.' },
        { label: 'Flagged for Review', url: 'flagged.html', note: 'Current irregularities register.' }
      ]},

      { t: 'h2', text: '7. Verification limits and provenance' },
      { t: 'ul', items: [
        'The 1 Nov base pass fetched 13 URLs (12 loaded and one error); 25 official-page check records are now retained, including the 2 Nov reads. The verification badges distinguish live fetches from independent cross-checks and source-only citations.',
        'The 2 Nov audit note preserves the targeted-read record. The current row dataset and Verified shortlist carry the newly integrated findings, but neither replaces reading the operator rules at the time of entry.',
        'The local build checks generated pages and internal references. It does not prove that external links work or that a contest remains open.',
        'The upstream file is pinned by repository commit and SHA-256, copied unchanged, and parsed as strict JSON rather than executed.'
      ]},
      { t: 'p', text:
        'Source repository commit ' + ctx.commit + '; source file SHA-256 ' + ctx.sha256 + '. Pinned source captured 1 Nov 2026. Base verification snapshot: ' + ctx.verifiedOn + '.' }
    ]
  };
}

module.exports = { build };
