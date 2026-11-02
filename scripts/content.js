'use strict';
/**
 * content.js — evidence-limited executive-summary prose shared by the site and docs.
 * All dynamic counts come from the canonical verifier output. Targeted reads made
 * after that snapshot are clearly labeled as not yet merged into the row dataset.
 */

function build(ctx) {
  const n = ctx.totals;
  const unknownEntry = n.rows - n.freeEntryFull - n.freeEntryPartial - n.paidCash;

  return {
    title: 'Executive summary',
    standfirst:
      'What the competition catalogue contains, what current official sources confirm, and what still needs review.',
    blocks: [
      { t: 'h2', text: '1. The project and the decision' },
      { t: 'p', text:
        'The public Free Money & Contest Ledger is a discovery list of contests and platforms that may pay cash. Its own page describes a single list without search, filters, or sorting. PrizeDesk reorganizes the research as a mobile-first dashboard with nine category pages, a searchable/filterable table, detail pages, an analysis, a verification-method page, and a Flagged for Review page. The upstream file contains ' + (n.rows - n.addedByParallelSessions) + ' listings; this repository has ' + n.rows + ' after ' + n.addedByParallelSessions + ' separately attributed additions.' },
      { t: 'p', text:
        'A row is a lead, not an offer. A cited link is not proof that a competition is open today, free to enter, or available to a particular entrant. Use the operator’s current rules before committing effort. No win probability or expected return is estimated.' },

      { t: 'h2', text: '2. Verification snapshot' },
      { t: 'table', head: ['Measure', 'Value', 'What it means'], rows: [
        ['Combined listings', String(n.rows), (n.rows - n.addedByParallelSessions) + ' pinned upstream rows + ' + n.addedByParallelSessions + ' attributed additions'],
        ['Categories', '9', 'Skill, trivia, sports, creative, forecasting, market, tech, directories, and pools'],
        ['Source-marked full free path', String(n.freeEntryFull), 'Upstream classification; not a fresh official confirmation for every row'],
        ['Some free events / paid cash / unknown path', n.freeEntryPartial + ' / ' + n.paidCash + ' / ' + unknownEntry, 'Source classifications; check the specific event’s terms'],
        ['Rows marked ended / out of season', String(n.endedListings), 'Source snapshot; verify current status before relying on it'],
        ['Official-page fetch outcomes (1 Nov 2026)', n.liveChecked + ' loaded; ' + n.liveCheckError + ' error', n.recheckedThisPass + ' fetch outcomes total in the saved pass'],
        ['Independent cross-checks', n.crossChecked + ' rows', n.crossChecks + ' check records are retained in the repository'],
        ['Official-tier source cited, not re-opened in that pass', String(n.officialSourceCited), 'Link is recorded, but the source was not freshly fetched in that pass'],
        ['No official-tier source in that pass', String(n.noOfficialSource), 'Prize / entry claims are not officially supported there'],
        ['Prize cells blanked', String(n.prizeBlankedOnSite), 'No qualifying official source or no stated amount'],
        ['Flagged irregularities', String(ctx.flags.length), 'Published on the Flagged for Review page'],
        ['Upstream declared review date', ctx.sourceReviewed, n.staleDays + ' days before the 1 Nov verification snapshot']
      ]},
      { t: 'p', text:
        'The source marks ' + n.freeEntryFull + ' rows as having a full free path, but that is a source-dataset label, not current confirmation for every contest. Entry cost that is not stated by an official source stays unknown. The pinned source data was reviewed on ' + ctx.sourceReviewed + '; its age and the row-level coverage above limit how much should be relied on.' },

      { t: 'h2', text: '3. What the source catalogue gets wrong or leaves unclear' },
      { t: 'ul', items: [
        'Mobile discovery is difficult: the source page explicitly says it has no search box, filters, or sorting and presents a long list of detailed contest cards.',
        'The source website displays 206 listings. This repository displays 211 because five later additions are merged and attributed; the totals describe different datasets.',
        n.endedListings + ' rows are marked ended or out of season in the pinned source snapshot, so its status labels are not proof that entry is currently open.',
        n.noOfficialSource + ' rows had no official-tier source in the verification snapshot; ' + n.missingRulesUrl + ' lacked a rules URL; ' + n.rulesEqualsSignup + ' used the signup URL as their rules link; and ' + n.nonHttps + ' source URL used HTTP.',
        n.prizeBlankedOnSite + ' prize cells are blanked by the verifier. Free practice, cash-entry play, non-cash credits, pool tools, and cash-prize contests must not be presented as equivalent.',
        'The 2026-11-01 live check for one cited App Store URL returned an error page. That is a dated observation, not proof the link remains broken.'
      ]},

      { t: 'h2', text: '4. Opportunities from the targeted 2 Nov official-source refresh' },
      { t: 'p', text:
        'These are targeted reads from 2 Nov 2026, recorded separately in data/verification/current-state-2026-11-02.md. They are not yet merged into the canonical row-level verification file or rendered as live-checked rows. Values below are limited to what the cited official pages state.' },
      { t: 'ul', items: [
        'FutureEval Bot Tournament: official page states a $50,000 pool, bot-only format, and 6 Jan 2027 close. Metaculus general rules say no fee is required but generally bar bots from prizes unless contest-specific terms permit them; read the bot resources and specific terms before building. Model/API use may still cost money.',
        'US Midterms 2026 on Metaculus: official page states a $10,000 pool and 4 Nov close. General rules say no entry fee is required and allow AI assistance to human forecasters when forecasts reflect their own decisions and understanding. Contest-specific restrictions may apply.',
        'Codex x TwitchCon: official rules say no purchase/payment is required; the event page lists $25,000 total cash, with $10,000 first place. The rules require a Twitch-connected Codex project, a repository, a public YouTube demo, a project description, and a Codex session ID. Official deadline: 2 Nov 2026, 2 p.m. Pacific; check immediately whether it is still open.',
        'GEMS Prize Challenge: official DrivenData page states $300,000 total and a 3 Dec 2026, 11:59 p.m. UTC end date. The inspected page does not state entry cost, so free entry is unconfirmed.',
        'Global Virtual Hackathon: official event page states free entry and $1,000 first prize plus two $250 runner-up awards in each division. It is for students aged 14–18 in teams of 2–4 with a supervising teacher; registration closes 13 Nov AoE. Its organizer says AI tools are allowed and expected.'
      ]},
      { t: 'p', text:
        'The user’s approximate location is Singapore. This audit does not determine eligibility for a specific person or establish Singapore eligibility for any of these events. Confirm location, age, prize-delivery, sanctions, and local-law terms before investing effort.' },

      { t: 'h2', text: '5. Practical triage for an AI-assisted entrant' },
      { t: 'ol', items: [
        'Read the current operator rules and confirm free entry, cash (not credits), deadline, entrant eligibility, and how a prize is delivered.',
        'Choose a task that matches the rules: human forecasting assisted by AI is different from submitting an autonomous bot; a hackathon may require a particular tool, team, demo, or code repository.',
        'Compare work required and competition structure, not headline prize alone. A $50,000 pool or first-place award does not imply a likely or positive return.',
        'Count API/model charges, time, team obligations, identity/tax paperwork, and legal restrictions as real constraints. This site does not compute expected value or odds.',
        'Open the Flagged for Review page for stale, incomplete, conflicting, or unsupported records. Re-check any lead immediately before entering.'
      ]},

      { t: 'h2', text: '6. Official sources for manual review' },
      { t: 'links', items: [
        { label: 'Original Free Money & Contest Ledger', url: 'https://karagemop466-tech.github.io/FreeMoneyApps/', note: 'Upstream discovery list; 206 shown on the page.' },
        { label: 'Metaculus US Midterms 2026', url: 'https://www.metaculus.com/tournament/midterms-2026/', note: '$10,000 pool; closes 4 Nov 2026.' },
        { label: 'Metaculus Fall 2026 FutureEval Bot Tournament', url: 'https://www.metaculus.com/tournament/fall-futureeval-2026/', note: '$50,000; bot-only; closes 6 Jan 2027.' },
        { label: 'Metaculus competition rules', url: 'https://www.metaculus.com/tournament-rules/', note: 'Fee, eligibility, AI-assistance, and bot restrictions.' },
        { label: 'Codex x TwitchCon official rules', url: 'https://twitchcon-codex.devpost.com/rules', note: 'Entry, eligibility, deliverables, deadline, prize schedule.' },
        { label: 'GEMS Prize Challenge', url: 'https://www.drivendata.org/competitions/306/competition-doe-gems/', note: 'Prize and closing date; entry fee not stated on inspected page.' },
        { label: 'Global Virtual Hackathon 2026', url: 'https://gvhackathon.com/', note: 'Official student eligibility, free entry, prize tiers, timeline.' },
        { label: '2026-11-02 targeted audit note', url: 'data/verification/current-state-2026-11-02.md', note: 'Full facts, limits, and the verification performed.' },
        { label: 'Flagged for Review', url: 'flagged.html', note: 'Current generated irregularities register.' }
      ]},

      { t: 'h2', text: '7. Reproducibility and limits' },
      { t: 'ul', items: [
        'The upstream JavaScript data file is pinned by repository commit and SHA-256, copied without alteration, and parsed as strict JSON; it is not executed.',
        'The 2 Nov official-page reads are evidence-only at present. Do not treat those rows as live-checked in the generated table until the data pipeline is updated and the pages rebuilt.',
        'The local build checks internal links, row coverage, and output structure. It does not crawl external URLs or prove that a contest remains open.',
        'This site is an independent research index, not a sponsor or guarantee. Contest terms can change; this is not legal, tax, or financial advice.'
      ]},
      { t: 'p', text:
        'Source repository commit ' + ctx.commit + '; source file SHA-256 ' + ctx.sha256 + '. The source was captured on 1 Nov 2026. Verification snapshot date: ' + ctx.verifiedOn + '.' }
    ]
  };
}

module.exports = { build };
