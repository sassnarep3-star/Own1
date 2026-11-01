// Cross-cutting findings. Each one is a statement about a record or a source, with the official page
// that supports it. These are published on the "Flagged for review" page and never block publication.
// `severity`: 'blocker' would mean "do not act on this", 'caution' means "check before acting", 'note' is informational.

export const crossFlags = [
  {
    id: 'tom-howard-paid',
    title: 'Paid-entry contest listed as a free one',
    severity: 'caution',
    finding:
      'The reference ledger carried the Tom Howard/Margaret Reid Poetry Contest as a free creative opportunity. Its own page charges $27 per submission, and it is closed until April 15, 2027. It is now recorded as paid entry.',
    sources: [{ url: 'https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest', label: 'Official contest page' }],
  },
  {
    id: 'tradingview-stale',
    title: 'Link points at an edition that already closed',
    severity: 'caution',
    finding:
      'The TradingView "The Leap" link goes to the TradeStation July 2026 edition, whose competition period ended 2026-08-14. Entry was free and paper-trading only, but this specific URL cannot be entered.',
    sources: [{ url: 'https://www.tradingview.com/the-leap/tradestation-july-2026/rules/', label: 'Official rules' }],
  },
  {
    id: 'givling-reclassified',
    title: 'Crowdfunding queue listed as a prize competition',
    severity: 'caution',
    finding:
      'Givling is a crowdfunding queue where funding is reached by collecting Queue Points and random Spinners, partly by buying from sponsors or watching ads. It is not a judged cash competition, and the ledger\'s "ended" label was stale — the service is live.',
    sources: [{ url: 'https://givling.com/', label: 'Official site' }],
  },
  {
    id: 'espn-contradiction',
    title: 'ESPN contradicts itself on entry limits',
    severity: 'note',
    finding:
      'The same official page says "You can now create up to 10 entries" in How To Play and "you can create another entry (up to five total)" in its FAQ. Treat the Complete Rules as controlling and re-check the live UI.',
    sources: [{ url: 'https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay', label: 'ESPN How To Play and FAQ' }],
  },
  {
    id: 'espn-territories',
    title: 'Prize games often exclude territories quietly',
    severity: 'note',
    finding:
      'ESPN\'s rules void the promotion in Puerto Rico, other U.S. territories, foreign territories and Quebec. Several other pick\'em and skill-game operators carry similar carve-outs. Read rule 3 of any promotion before spending a season on it.',
    sources: [{ url: 'https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules', label: 'ESPN Complete Rules' }],
  },
  {
    id: 'challenge-gov',
    title: 'Challenge.gov was sunset',
    severity: 'caution',
    finding:
      'The reference catalog groups Challenge.gov with HeroX. The government notice states that the Challenge.gov platform was sunset on March 30, 2026, so it is not a current source of open challenges.',
    sources: [{ url: 'https://www.challenge.gov/', label: 'Government notice' }],
  },
  {
    id: 'icehacks',
    title: 'Hackathon page contradicts its own prize claim',
    severity: 'caution',
    finding:
      'The IceHacks 2026 page header advertises cash while the description says there are no cash prizes. Do not treat a Devpost header as proof of a cash award.',
    sources: [{ url: 'https://icehacks.devpost.com/', label: 'Event page' }],
  },
  {
    id: 'paypal-totals',
    title: 'Hackathon page and its rules disagree on the prize total',
    severity: 'caution',
    finding:
      'The PayPal AI Hackathon event page and its rules state different totals, and the rules include non-cash credits alongside cash. No prize figure is asserted in the catalog; read section 8 of the rules.',
    sources: [
      { url: 'https://paypalaihackathon.devpost.com/', label: 'Event page' },
      { url: 'https://paypalaihackathon.devpost.com/rules', label: 'Official rules' },
    ],
  },
  {
    id: 'qhack-ended',
    title: 'Coding event already closed',
    severity: 'caution',
    finding: 'QHack 2026 specified no purchase and cash awards, but its award-entry window closed October 23, 2026.',
    sources: [{ url: 'https://qhack.ai/terms-and-conditions/', label: 'Official terms' }],
  },
  {
    id: 'wisetech-ended',
    title: 'Competition already ran',
    severity: 'caution',
    finding:
      'The WiseTech Global Programming Competition 2026 ran August 14–15, 2026. It was free, limited to Australian residents, and required proctoring for cash prizes.',
    sources: [{ url: 'https://groklearning.com/wtg-programming-competition/', label: 'Official event page' }],
  },
  {
    id: 'papaya-gems',
    title: 'Free practice currency is not withdrawable money',
    severity: 'caution',
    finding:
      'Papaya distinguishes free Gem competitions from cash competitions. Free play does not pay withdrawable dollars, so skill-game listings must not be read as free cash paths without checking the specific promotion.',
    sources: [{ url: 'https://www.papaya.com/faq', label: 'Operator FAQ' }],
  },
  {
    id: 'tax-blanket',
    title: 'The reference site\'s blanket tax rule is not a legal rule',
    severity: 'caution',
    finding:
      'The reference site states that US tax forms apply at $600+. That is not a universal rule: reporting depends on the type of income and the circumstances. Nothing on this site is tax advice.',
    sources: [
      { url: 'https://www.irs.gov/publications/p525', label: 'IRS Publication 525' },
      { url: 'https://www.irs.gov/taxtopics/tc419', label: 'IRS Topic 419 — gambling income' },
    ],
  },
  {
    id: 'zindi-board',
    title: 'Challenge boards that cannot be verified without JavaScript or sign-in',
    severity: 'note',
    finding:
      'Zindi, Topcoder, AIcrowd and XPRIZE rendered no challenge listings to a reader without JavaScript or sign-in on the audit date. Their prizes, fees and deadlines are therefore blank rather than guessed.',
    sources: [
      { url: 'https://zindi.world/competitions', label: 'Zindi competitions' },
      { url: 'https://www.topcoder.com/challenges', label: 'Topcoder challenges' },
      { url: 'https://www.aicrowd.com/challenges', label: 'AIcrowd challenges' },
      { url: 'https://www.xprize.org/competitions', label: 'XPRIZE competitions' },
    ],
  },
  {
    id: 'prize-not-stated',
    title: 'Free to enter, but no cash amount published',
    severity: 'note',
    finding:
      'Environmental Photographer of the Year and Weather Photographer of the Year both confirm free entry on their official pages without stating a cash amount. The prize column is left blank for both instead of importing a number from elsewhere.',
    sources: [
      { url: 'https://www.epoty.org/', label: 'EPOTY' },
      { url: 'https://www.rmets.org/weather-photographer-of-the-year', label: 'Weather Photographer of the Year' },
    ],
  },
  {
    id: 'no-source',
    title: 'Two leads have no operator link at all',
    severity: 'caution',
    finding:
      'TheLines Free NFL Survivor and SquaresPool.com arrived from the reference catalog without a usable HTTPS operator URL. Rather than substitute a news article or an insecure page, both are shown with no source link.',
    sources: [{ url: 'https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js', label: 'Reference catalog (not authoritative)' }],
  },
  {
    id: 'legacy-status',
    title: 'August 2026 statuses are unreliable',
    severity: 'note',
    finding:
      'The reference catalog stamped many leads as live or ended in August 2026. Those labels are not evidence of the current state: Givling was marked ended and is live, while several "live" fantasy games run on seasonal calendars. No inherited status is displayed as a fact on this site.',
    sources: [{ url: 'https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js', label: 'Reference catalog (not authoritative)' }],
  },
  {
    id: 'arc-no-fee',
    title: 'A fee that is simply not stated is not a fee of zero',
    severity: 'note',
    finding:
      'ARC Prize, Kaggle, DrivenData and GEMS state prize money but do not state an entry fee on the pages read. Their fee cells are blank and flagged rather than marked "free", even though entering through Kaggle is widely understood to be free.',
    sources: [{ url: 'https://arcprize.org/competitions/2026', label: 'ARC Prize 2026' }],
  },
];
