// Verified facts — every value here was read from the cited official page on the date shown.
// Nothing in this file may be filled in from memory, inference, or a third-party article.
// Fields left as null/'' mean "not confirmed on the official page" and must render blank.

export const READ_ON = '2026-11-01';

export const facts = {
  metaculus: {
    status: 'verified',
    operator: 'Metaculus',
    officialUrl: 'https://www.metaculus.com/tournaments/',
    freeEntry: true,
    cashPrize: true,
    prize: '$50,000 largest active pool (Fall 2026 FutureEval Bot Tournament)',
    deadline: null,
    cycle: 'Rolling — 19 tournaments listed',
    eligibility: '',
    effort: 'medium',
    agentFit: 'high',
    evidence: [
      {
        url: 'https://www.metaculus.com/tournaments/',
        fact: 'Free to enter, cash prizes for accuracy',
        quote: 'You can participate for free and win cash prizes for being accurate.',
      },
      {
        url: 'https://www.metaculus.com/tournaments/',
        fact: 'Active prize pools listed on 2026-11-01',
        quote:
          'Fall 2026 FutureEval Bot Tournament — $50,000 PRIZE POOL — Ends 2 months from now; Labor Automation Tournament — $35,000; Forecasting Our World in Data — $20,000; POTUS Predictions — $15,000; US Midterms 2026 — $10,000 — Ends 3 days from now; ACX 2026 Prediction Contest — $10,000; U.S. Democracy Threat Index — $10,000; Market Pulse Challenge 26Q4 — $7,500; Metaculus Cup Fall 2026 — $5,000; Climate Tipping Points — $5,000; AI Pathways Tournament — $5,000; The Sagan Space Tournament — $5,000; Animal Futures Tournament — $3,400. Four listed tournaments show NO PRIZE POOL.',
      },
    ],
    notes:
      'Four of the 19 listed tournaments carry no prize pool. The FutureEval Bot Tournament is explicitly a bot/agent competition, which suits an AI-agent workflow.',
  },

  'midterms-2026': {
    status: 'verified',
    operator: 'Metaculus',
    officialUrl: 'https://www.metaculus.com/tournament/midterms-2026/',
    freeEntry: true,
    cashPrize: true,
    prize: '$10,000 prize pool',
    deadline: '2026-11-04',
    cycle: 'One-off',
    eligibility: '',
    effort: 'low',
    agentFit: 'medium',
    evidence: [
      {
        url: 'https://www.metaculus.com/tournaments/',
        fact: 'Pool size and closing date as displayed',
        quote: 'US Midterms 2026 — $10,000 PRIZE POOL — 1035 — Ends 3 days from now',
      },
      {
        url: 'https://www.metaculus.com/tournaments/',
        fact: 'Free entry platform-wide',
        quote: 'You can participate for free and win cash prizes for being accurate.',
      },
    ],
    notes:
      'Deadline is derived arithmetically from "Ends 3 days from now" displayed on 2026-11-01; confirm on the tournament page before relying on it.',
  },

  'espn-pickem': {
    status: 'verified',
    operator: 'ESPN',
    officialUrl: 'https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay',
    freeEntry: true,
    cashPrize: true,
    prize: '$102,000 total — $20,000 grand prizes in Standard, Spread and Pick 5; $10,000 Confidence',
    deadline: null,
    cycle: 'NFL season — 18 weeks',
    eligibility: 'Void in Puerto Rico, other U.S. territories, foreign territories, Quebec and where prohibited',
    effort: 'low',
    agentFit: 'medium',
    evidence: [
      {
        url: 'https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay',
        fact: 'Free entry',
        quote: 'Are ESPN games free to play? Yes! Every game we offer is completely free.',
      },
      {
        url: 'https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#Prizes',
        fact: 'Prize breakdown',
        quote:
          '$102,000 in total prize money is up for grabs! Three (3) GRAND PRIZES of $20,000 each for the highest-finishing entry in the Standard, Spread and Pick 5 game modes ($60,000 in Total Prizes); One (1) GRAND PRIZE of $10,000 for the highest-finishing entry in the Confidence game mode; Eighteen (18) WEEKLY PRIZES of $500 each ... in Standard mode ... Spread mode ... Confidence mode ... One (1) RANDOM DRAWING PRIZE of $5,000 for making full picks in all 4 game modes every week of the season',
      },
      {
        url: 'https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules',
        fact: 'No purchase necessary; eligibility carve-outs',
        quote:
          'NO PURCHASE OR PAYMENT NECESSARY TO ENTER OR WIN. A PURCHASE OR PAYMENT WILL NOT IMPROVE ONE\'S CHANCES OF WINNING. VOID IN PUERTO RICO, OTHER U.S. TERRITORIES AND FOREIGN TERRITORIES, QUEBEC AND WHERE PROHIBITED BY LAW.',
      },
    ],
    notes:
      'The same official page contradicts itself on entry limits: the How To Play text says "create up to 10 entries" while the FAQ says "you can create another entry (up to five total)". Treat the Complete Rules as controlling and re-check the live UI.',
  },

  'tom-howard-poetry': {
    status: 'verified',
    operator: 'Winning Writers',
    officialUrl: 'https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest',
    freeEntry: false,
    cashPrize: true,
    prize: '$12,000 total — $3,500 Tom Howard, $3,500 Margaret Reid, 10 × $500 honorable mentions',
    deadline: '2027-10-01',
    cycle: 'Annual — opens April 15, 2027',
    eligibility: 'All countries except Iran, North Korea, Crimea, Russia, Belarus; no age restriction',
    effort: 'medium',
    agentFit: 'low',
    evidence: [
      {
        url: 'https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest',
        fact: 'Entry fee — this is NOT a free contest',
        quote: 'Fee: $27 per submission (one submission may contain up to 3 poems).',
      },
      {
        url: 'https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest',
        fact: 'Prize amounts',
        quote:
          'TOMHOWARD PRIZE: $3,500 for a poem in any style or genre; MARGARET REID PRIZE: $3,500 for a poem that rhymes or has a formal style; Honorable Mentions: 10 awards of $500 each',
      },
      {
        url: 'https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest',
        fact: 'Current status and window',
        quote:
          'Please submit during April 15-October 1, 2027 ... This contest is currently closed. It will open again on April 15, 2027.',
      },
      {
        url: 'https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest',
        fact: 'AI use restricted',
        quote:
          'Any writing that you submit to a Winning Writers contest must be composed using your own words, and may not contain any AI-generated text.',
      },
    ],
    notes:
      'The reference ledger carries this as a free-entry creative contest. The official page charges $27 per submission, so it is listed as paid entry here. AI-generated text is prohibited, so an AI agent cannot write the entry.',
  },

  arcprize: {
    status: 'verified',
    operator: 'ARC Prize Foundation',
    officialUrl: 'https://arcprize.org/competitions/2026',
    freeEntry: null,
    cashPrize: true,
    prize: '$2,000,000 across three tracks',
    deadline: '2026-11-02',
    cycle: 'Annual — 2026 cycle',
    eligibility: 'Open; prizes paid at organiser discretion, subject to open-sourcing',
    effort: 'high',
    agentFit: 'high',
    evidence: [
      {
        url: 'https://arcprize.org/competitions/2026',
        fact: 'Prize pool and submission deadline',
        quote:
          '$2M in prizes. 3 tracks. Open source progress toward AGI. ... November 2, 2026 - Submissions due; November 8, 2026 - Papers due; December 4, 2026 - Results announced',
      },
      {
        url: 'https://arcprize.org/competitions/2026',
        fact: 'Open-source requirement',
        quote:
          'All leading participants are expected to open source their solutions to be eligible for a prize. ... Internet access is not available during Kaggle evaluation (no API-based systems like GPT/Claude/etc.)',
      },
    ],
    notes:
      'No entry fee is stated anywhere on the competition page; entry runs through Kaggle, so the fee is simply not stated rather than confirmed free. Internet access is unavailable during evaluation, which rules out API-calling agents at scoring time.',
  },

  kaggle: {
    status: 'verified',
    operator: 'Kaggle (Google)',
    officialUrl: 'https://www.kaggle.com/competitions',
    freeEntry: null,
    cashPrize: true,
    prize: 'Varies by competition — e.g. ARC Prize 2026 Paper Track $450,000; NFL Big Data Bowl 2027 $100,000',
    deadline: null,
    cycle: 'Rolling',
    eligibility: '',
    effort: 'high',
    agentFit: 'high',
    evidence: [
      {
        url: 'https://www.kaggle.com/competitions',
        fact: 'Featured competitions carry prizes',
        quote:
          'Featured — Premier challenges with prizes. ARC Prize 2026 - Paper Track — $450,000 — 8 days to go; NFL Big Data Bowl 2027 — $100,000 — 2 months to go; Google - The Gemma 4 Developer Agent Paper Track — $35,000 — 11 days to go',
      },
    ],
    notes:
      'Entry fees are not stated on the competitions index; the index mixes unpaid practice ("Getting Started") competitions with prize competitions, so each event must be checked individually.',
  },

  'nfl-big-data-bowl': {
    status: 'verified',
    operator: 'NFL / Kaggle',
    officialUrl: 'https://www.kaggle.com/competitions/nfl-big-data-bowl-2027',
    freeEntry: null,
    cashPrize: true,
    prize: '$100,000',
    deadline: null,
    cycle: 'Annual',
    eligibility: '',
    effort: 'high',
    agentFit: 'high',
    evidence: [
      {
        url: 'https://www.kaggle.com/competitions',
        fact: 'Prize pool and time remaining as listed',
        quote: 'NFL Big Data Bowl 2027 — $100,000 — 2 months to go',
      },
    ],
    notes:
      'Prize pool is read from Kaggle\'s official competition index. Entry-fee wording and full eligibility are on the competition page itself and were not confirmed here.',
  },

  drivendata: {
    status: 'verified',
    operator: 'DrivenData',
    officialUrl: 'https://www.drivendata.org/competitions/',
    freeEntry: null,
    cashPrize: true,
    prize: 'Varies — one active prize competition listed: GEMS, $300,000',
    deadline: null,
    cycle: 'Rolling',
    eligibility: '',
    effort: 'high',
    agentFit: 'high',
    evidence: [
      {
        url: 'https://www.drivendata.org/competitions/',
        fact: 'Prize competitions are separated from practice and benchmarks',
        quote:
          'Prize competitions — The Geologic Enhanced Mapping System (GEMS) Prize Challenge ... $300,000 in prizes ... 4 weeks left. Benchmarks — SNOMED CT Entity Linking Benchmark — Benchmark. Practice competitions — ...',
      },
    ],
    notes:
      'Only one prize competition was active on 2026-11-01. Benchmarks and practice competitions carry no cash prize.',
  },

  'gems-prize-2026': {
    status: 'verified',
    operator: 'U.S. Department of Energy / DrivenData',
    officialUrl: 'https://www.drivendata.org/competitions/306/competition-doe-gems/',
    freeEntry: null,
    cashPrize: true,
    prize: '$300,000 in prizes',
    deadline: null,
    cycle: 'One-off',
    eligibility: '',
    effort: 'high',
    agentFit: 'high',
    evidence: [
      {
        url: 'https://www.drivendata.org/competitions/',
        fact: 'Prize pool and closing window',
        quote: 'The Geologic Enhanced Mapping System (GEMS) Prize Challenge ... $300,000 in prizes ... 4 weeks left',
      },
      {
        url: 'https://www.drivendata.org/competitions/306/competition-doe-gems/',
        fact: 'Host and subject',
        quote: 'Hosted by DOE — Identify hidden geologic faults to discover new geothermal resources.',
      },
    ],
    notes:
      'Previously recorded as ending 2026-12-03 at 23:59 UTC by an earlier session; the live listing on 2026-11-01 shows "4 weeks left", which is consistent but was not re-derived from the rules page in this session.',
  },
};

// Appended 2026-11-01 — creative, market, trivia and platform pages read this session.
Object.assign(facts, {
  'wergle-flomp': {
    status: 'verified',
    operator: 'Winning Writers',
    officialUrl: 'https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free',
    freeEntry: true,
    cashPrize: true,
    prize: '$5,100 total — $2,000 first, $750 second, $350 third, 10 × $200 honorable mentions',
    deadline: '2027-04-01',
    cycle: 'Annual — 26th year; window Aug 15, 2026 – Apr 1, 2027',
    eligibility: 'All countries except Iran, North Korea, Crimea, Russia, Belarus; no age restriction',
    effort: 'medium',
    agentFit: 'low',
    evidence: [
      { url: 'https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free', fact: 'No entry fee', quote: 'Now in its 26th year, this contest seeks today\'s best humor poems. No fee to enter. ... $5,100 in prizes. ... Submit online. No fee to enter.' },
      { url: 'https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free', fact: 'Prize amounts', quote: 'First Prize: $2,000 ... Second Prize: $750 ... Third Prize: $350 ... Honorable Mentions: 10 awards of $200 each' },
      { url: 'https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free', fact: 'Entry window', quote: 'Please submit one humor poem during August 15, 2026-April 1, 2027' },
      { url: 'https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free', fact: 'AI text prohibited', quote: 'Any writing that you submit to a Winning Writers contest must be composed using your own words, and may not contain any AI-generated text.' },
    ],
    notes: 'Open now. Genuinely free to enter with a cash prize, but AI-written entries are prohibited; AI may only be used like a beta-reader or style manual.',
  },
  'sony-world-photo': {
    status: 'verified',
    operator: 'World Photography Organisation / Sony',
    officialUrl: 'https://www.worldphoto.org/sony-world-photography-awards',
    freeEntry: true,
    cashPrize: true,
    prize: 'Series competition $25,000; Single Image competition $5,000; both include Sony equipment',
    deadline: '2027-01-12',
    cycle: 'Annual — 2027 awards',
    eligibility: 'Open worldwide; Student and Youth competitions have separate age rules',
    effort: 'medium',
    agentFit: 'low',
    evidence: [
      { url: 'https://www.worldphoto.org/sony-world-photography-awards', fact: 'Free to enter', quote: 'Since the beginning, the Awards have championed inclusivity and access by being free to enter.' },
      { url: 'https://www.worldphoto.org/sony-world-photography-awards', fact: 'Prize amounts', quote: 'Enter your best series of 5 to 10 images - you could win $25,000, a solo exhibition, a range of top Sony Digital Imaging equipment ... Enter your best single images - you could win $5,000, a range of top Sony Digital Imaging equipment' },
      { url: 'https://www.worldphoto.org/sony-world-photography-awards', fact: 'Timeline', quote: '1 June 0:00 BST — 2027 Sony World Photography Awards open for entries; 27 November 2026 16:00 GMT — Student competition closes; 5 January 2027 16:00 GMT — Single Image and Youth competition close; 12 January 2027 16:00 GMT — Series competition closes' },
    ],
    notes: 'Open for the 2027 edition. Cash prizes apply to the Series and Single Image competitions; the Student and Youth prizes are stated as equipment, not cash.',
  },
  epoty: {
    status: 'verified',
    operator: 'CIWEM (Chartered Institution of Water and Environmental Management)',
    officialUrl: 'https://www.epoty.org/',
    freeEntry: true,
    cashPrize: null,
    prize: '',
    deadline: null,
    cycle: 'Annual',
    eligibility: 'Photographers worldwide, all ages and experience levels',
    effort: 'medium',
    agentFit: 'low',
    evidence: [
      { url: 'https://www.epoty.org/', fact: 'Free entry and open eligibility', quote: 'The competition is free to enter to photographers around the world of all ages and experience levels.' },
      { url: 'https://www.epoty.org/', fact: 'Edition status on 2026-11-01', quote: 'Environmental Photographer of the Year 2025 ... The winners of the 2025 Environmental Photographer of the Year are announced!' },
    ],
    notes: 'Free entry is confirmed, but no cash amount is stated on the official page, so the prize cell is deliberately blank. The site showed the 2025 edition results on 2026-11-01.',
  },
  'weather-potw': {
    status: 'verified',
    operator: 'Royal Meteorological Society',
    officialUrl: 'https://www.rmets.org/weather-photographer-of-the-year',
    freeEntry: true,
    cashPrize: null,
    prize: '',
    deadline: null,
    cycle: 'Annual — 11th year',
    eligibility: 'Photographers of all skill levels worldwide',
    effort: 'low',
    agentFit: 'low',
    evidence: [
      { url: 'https://www.rmets.org/weather-photographer-of-the-year', fact: 'Free entry, open worldwide', quote: 'This annual competition is open to photographers of all skill levels worldwide and is free to enter.' },
      { url: 'https://www.rmets.org/weather-photographer-of-the-year', fact: 'Timeline as displayed', quote: '11 June — 20 August: Submissions open; 21 August — 2 October: Judging period; 22 October — 5 November: Public vote; 17 November: Winners announced' },
    ],
    notes: 'Free entry is confirmed. No cash amount appears on the official page, so the prize cell is blank; the listed dates carry no year, so they are recorded as displayed rather than converted.',
  },
  'tradingview-leap': {
    status: 'verified',
    operator: 'TradingView',
    officialUrl: 'https://www.tradingview.com/the-leap/tradestation-july-2026/rules/',
    freeEntry: true,
    cashPrize: null,
    prize: '',
    deadline: '2026-08-14',
    cycle: 'Recurring — this edition 20 Jul–14 Aug 2026',
    eligibility: '18+; excludes Iran, North Korea, Russia, Belarus, Cuba, Crimea/Donetsk/Luhansk; free TradingView plan users eligible',
    effort: 'low',
    agentFit: 'low',
    evidence: [
      { url: 'https://www.tradingview.com/the-leap/tradestation-july-2026/rules/', fact: 'No purchase necessary; skill competition; simulated trading', quote: 'NO PURCHASE OR PAYMENT OF ANY KIND NECESSARY TO PARTICIPATE OR WIN. THIS IS A COMPETITION OF SKILL. A PURCHASE WILL NOT INCREASE YOUR CHANCES OF WINNING. NO ACTUAL CASH WILL BE TRADED.' },
      { url: 'https://www.tradingview.com/the-leap/tradestation-july-2026/rules/', fact: 'Competition period — already ended', quote: 'begins at Jul 20, 2026, 08:00 UTC and ends at Aug 14, 2026, 08:00 UTC' },
    ],
    notes: 'The URL carried by the reference ledger points to a specific edition that closed on 2026-08-14, so it is stale. Prize amounts were not read from this page and are left blank. Note the eligibility rule on plan type is unusually specific and should be read in full before entering a future edition.',
  },
  givling: {
    status: 'verified',
    operator: 'Givling',
    officialUrl: 'https://givling.com/',
    freeEntry: null,
    cashPrize: false,
    prize: '',
    deadline: null,
    cycle: 'Ongoing',
    eligibility: '',
    effort: 'high',
    agentFit: 'low',
    evidence: [
      { url: 'https://givling.com/', fact: 'Product is a crowdfunding queue, not a judgement-based prize contest', quote: 'The only crowdfunding competition in the world where you can receive up to $100,000 in crowdfunding ... $50,000 from competitive participation and up to $50,000 via our non-competitive Exchange. ... you collect Queue Points and Spinners when you help crowdfund, buy from our sponsors, or watch ads.' },
    ],
    notes: 'Reclassified: this is a crowdfunding queue with random selection and points earned partly by purchases and ad-watching, not a cash prize awarded for winning a contest. The previous ledger listed it as "ended"; the site is live, so that status was stale.',
  },
  zindi: {
    status: 'partial',
    operator: 'Zindi',
    officialUrl: 'https://zindi.world/competitions',
    freeEntry: null,
    cashPrize: null,
    prize: '',
    deadline: null,
    cycle: 'Rolling',
    eligibility: '',
    effort: 'high',
    agentFit: 'high',
    evidence: [
      { url: 'https://zindi.world/competitions', fact: 'Challenge list is loaded dynamically', quote: 'Open Challenges: —Past Challenges: — ... Closing soon / Top prize first / Load more' },
    ],
    notes: 'The competitions page rendered without its challenge list on 2026-11-01 (client-side loading), so no prize, fee or deadline could be confirmed. Treat as a research lead only.',
  },
  topcoder: {
    status: 'partial',
    operator: 'Topcoder',
    officialUrl: 'https://www.topcoder.com/challenges',
    freeEntry: null,
    cashPrize: null,
    prize: '',
    deadline: null,
    cycle: 'Rolling',
    eligibility: '',
    effort: 'medium',
    agentFit: 'high',
    evidence: [
      { url: 'https://www.topcoder.com/challenges', fact: 'Challenge board did not render listings', quote: 'Open for Registration ... Auth0 ... Login/Logout action is not called.' },
    ],
    notes: 'The challenge board requires sign-in and returned no listings on 2026-11-01, so nothing could be confirmed about current prizes or fees.',
  },
  xprize: {
    status: 'partial',
    operator: 'XPRIZE Foundation',
    officialUrl: 'https://www.xprize.org/competitions',
    freeEntry: null,
    cashPrize: null,
    prize: '',
    deadline: null,
    cycle: 'Rolling',
    eligibility: '',
    effort: 'high',
    agentFit: 'medium',
    evidence: [
      { url: 'https://www.xprize.org/', fact: 'Prizes exist but no active open competition was confirmed', quote: 'We turn bold ideas into world-changing impact—audacious, tested, and built to scale. ... View Prize' },
    ],
    notes: 'The homepage lists historical and active prize programmes but no entry deadline, fee or current open call was confirmed on 2026-11-01. Check the individual prize page.',
  },
  aicrowd: {
    status: 'partial',
    operator: 'AIcrowd',
    officialUrl: 'https://www.aicrowd.com/challenges',
    freeEntry: null,
    cashPrize: null,
    prize: '',
    deadline: null,
    cycle: 'Rolling',
    eligibility: '',
    effort: 'high',
    agentFit: 'high',
    evidence: [
      { url: 'https://www.aicrowd.com/challenges', fact: 'Filter shell rendered without challenge cards', quote: 'Active / Draft / Running / Completed / Starting soon ... Categories' },
    ],
    notes: 'Only the filter shell of the challenge board rendered on 2026-11-01; no individual challenge, prize or deadline could be confirmed.',
  },
});
