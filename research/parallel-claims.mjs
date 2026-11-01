// Claims recorded by other sessions that this session could NOT confirm against an official page.
// They are published, with their links, on the "Flagged for review" page — never in the prize column.
// `claim` is quoted from the other session's dataset; `reason` says why it is not promoted to verified.

export const parallelClaims = [
  { id: 'solitaire-cash', claim: 'Cash prizes in paid entry-fee tournaments; free rooms pay Gems, not dollars', url: 'https://www.papaya.com/faq', reason: 'No quote recorded; the Papaya FAQ does distinguish free Gem rooms from cash competitions, which the claim matches, but the row was not re-read here.' },
  { id: 'bingo-cash', claim: 'Cash prizes in paid entry-fee tournaments; free rooms pay Gems, not dollars', url: 'https://www.papaya.com/faq', reason: 'Shares the Solitaire Cash operator FAQ; same caveat.' },
  { id: 'espn-survivor', claim: '$25,000 grand prize', url: 'https://fantasy.espn.com/games/nfl-survivor-2026/howtoplay', reason: 'Prize amount not re-read in this session.' },
  { id: 'fox-super6', claim: 'Weekly cash prizes for the top 6; no dollar amount printed on the page', url: 'https://www.foxsports.com/fox-super-6', reason: 'Not re-read; the claim itself says no amount is published, so no number is asserted.' },
  { id: 'vocal', claim: 'Varies by Challenge', url: 'https://vocal.media/resources/challenges-frequently-asked-questions', reason: 'Not re-read; too vague to assert in a prize column.' },
  { id: 'herox', claim: 'Prize-bearing challenges listed', url: 'https://www.challenge.gov/', reason: 'Challenge.gov was sunset on 2026-03-30, so the linked source is not a live challenge board.' },
  { id: 'fpl-official', claim: 'No cash prize asserted', url: 'https://fantasy.premierleague.com/', reason: 'Not re-read; no prize value recorded by either session.' },
  { id: 'fantasy-efl', claim: 'Merchandise, match tickets, hospitality places and a club season ticket — no cash prize printed', url: 'https://fantasy.efl.com/prizes', reason: 'Not re-read; the claim is that the prizes are non-cash, which would make it ineligible as a cash path.' },
  { id: 'mlb-beat-the-streak', claim: '$5,600,000 annuity or $3,000,000 lump sum grand prize; $10,000 top-streak prize; deadline 2026-09-27', url: 'https://www.mlb.com/beat-the-streak', reason: 'The stated deadline has passed, and the amount was not re-read here. Do not rely on this figure without opening the rules.' },
  { id: 'nascar-fantasy-live', claim: 'Deadline 2026-11-08', url: 'https://www.nascar.com/fantasy-live/', reason: 'No prize value or fee recorded; deadline not re-read.' },
  { id: 'deriv-tournaments', claim: '$1,000 first, $600 second, $400 third per monthly tournament', url: 'https://deriv.com/newsroom/updates/free-trading-tournaments-virtual-funds-cash-prizes', reason: 'Not re-read; the source is a newsroom post rather than a rules page.' },
  { id: 'hfm-demo', claim: '$2,000 / $1,000 / $500 — paid as trading bonuses, not cash', url: 'https://www.hfm.com/int/en/promotions/demo-contest', reason: 'Not re-read; the claim is that the prizes are bonus credit, not withdrawable cash, which disqualifies it as a cash path.' },
  { id: 'kaggle-gemma4-agent', claim: '$110,000 total: $65,000 main track ($37,000 / $18,000 / $10,000), $35,000 paper award, $10,000 small-model bonus; deadline 2026-12-02', url: 'https://www.kaggle.com/competitions/gemma-4-developer-agent-paper', reason: 'Only the $35,000 paper-track figure was visible on the Kaggle index in this session; the $110,000 breakdown was not re-read.' },
  { id: 'kaggle-nfl-big-data-bowl-2027', claim: '$100,000 total: $45,000 Open Track, $45,000 University Track, $10,000 grand prize; deadline 2027-01-06', url: 'https://www.kaggle.com/competitions/nfl-big-data-bowl-2027', reason: 'The $100,000 total is confirmed on the Kaggle index; the track split and deadline were not re-read.' },
  { id: 'kaggle-name-that-llm', claim: '$50,000 total: 10 prizes of $5,000; deadline 2027-01-13', url: 'https://www.kaggle.com/competitions/name-that-llm', reason: 'Not re-read in this session.' },
];
