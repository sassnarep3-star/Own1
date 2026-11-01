// Build the site dataset from (a) the reference-catalog leads and (b) facts read from official pages.
// Rule: a field is only ever populated from research/facts.mjs, which cites the official page it came from.
// Anything else stays null/'' so the UI renders "not confirmed" rather than a guess.

import fs from 'node:fs';
import path from 'node:path';
import { facts, READ_ON } from '../research/facts.mjs';

const root = path.resolve(import.meta.dirname, '..');
const legacy = JSON.parse(fs.readFileSync(path.join(root, 'research/legacy-leads.json'), 'utf8'));

// Categories are organisational groupings, not claims. Order controls navigation.
export const CATEGORIES = [
  { id: 'tech', name: 'AI, data & code', blurb: 'Model-building and engineering competitions with cash prizes', icon: '⌘' },
  { id: 'forecasting', name: 'Forecasting', blurb: 'Prediction tournaments scored on accuracy', icon: '◎' },
  { id: 'creative', name: 'Writing, art & photography', blurb: 'Judged creative prizes', icon: '✳' },
  { id: 'sports', name: 'Sports picks & fantasy', blurb: 'Season-long and weekly prediction games', icon: '◈' },
  { id: 'market', name: 'Markets & trading', blurb: 'Paper-trading and demo competitions', icon: '▥' },
  { id: 'skill', name: 'Skill cash games', blurb: 'Mostly pay-to-enter skill tournaments and esports', icon: '⚡' },
  { id: 'trivia', name: 'Trivia & quizzes', blurb: 'Quiz and knowledge formats', icon: '?' },
  { id: 'pools', name: 'Pool software', blurb: 'Tools for group pools — prizes are usually funded by players, not the operator', icon: '▦' },
  { id: 'directory', name: 'Directories', blurb: 'Lists and indexes that point to competitions', icon: '↗' },
];

// Extra leads verified in this session that were not in the reference catalog.
const EXTRA = [
  { id: 'nfl-big-data-bowl', name: 'NFL Big Data Bowl 2027', category: 'tech' },
  { id: 'wergle-flomp', name: 'Wergle Flomp Humor Poetry Contest', category: 'creative' },
  { id: 'gems-prize-2026', name: 'GEMS Prize Challenge (DOE)', category: 'tech' },
  { id: 'midterms-2026', name: 'US Midterms 2026 (Metaculus)', category: 'forecasting' },
];

const byId = new Map();
for (const lead of legacy) byId.set(lead.id, lead);
for (const extra of EXTRA) if (!byId.has(extra.id)) byId.set(extra.id, { ...extra, source: '', sourceStatus: 'unverified' });

// Domains that are clearly not the operator's own site. Used only to warn, never to verify.
const NON_OPERATOR_HOSTS = [
  'apps.apple.com', 'play.google.com', 'x.com', 'twitter.com',
  'myfxbook.com', 'ustrottingnews.com', 'motocrossactionmag.com',
  'golfgamecentral.com', 'thegolfwire.com', 'tottenhamhotspur.com',
  'leicestertigers.com', 'betfanatics.com', 'reedsy.com', 'mlcontests.com',
];

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

const entries = [];
for (const [id, lead] of byId) {
  const f = facts[id] || null;
  const officialUrl = f?.officialUrl || lead.source || '';
  const hosts = new Set();
  for (const ev of f?.evidence || []) hosts.add(hostOf(ev.url));
  if (officialUrl) hosts.add(hostOf(officialUrl));
  const nonOperator = [...hosts].filter((h) => NON_OPERATOR_HOSTS.includes(h));

  const entry = {
    id,
    name: f?.name || lead.name,
    category: lead.category,
    status: f?.status || 'unverified',
    operator: f?.operator || '',
    officialUrl,
    freeEntry: f ? f.freeEntry ?? null : null,
    cashPrize: f ? f.cashPrize ?? null : null,
    prize: f?.prize || '',
    deadline: f?.deadline || null,
    cycle: f?.cycle || '',
    eligibility: f?.eligibility || '',
    effort: f?.effort || null,
    agentFit: f?.agentFit || null,
    notes: f?.notes || '',
    evidence: f?.evidence || [],
    readOn: f ? READ_ON : null,
    legacyStatus: lead.legacyStatus || '',
    legacyChecked: lead.legacyChecked || '',
    sourceKind: officialUrl ? (nonOperator.length ? 'not-operator' : 'unverified-link') : 'none',
    flags: [],
  };

  // Explicit, rule-based flags. Each one is a statement about the record, not about the operator.
  if (entry.status === 'verified' && entry.freeEntry === true) entry.flags.push('free-entry-confirmed');
  if (entry.status === 'verified' && entry.freeEntry === false) entry.flags.push('paid-entry-confirmed');
  if (entry.status === 'verified' && entry.cashPrize === true) entry.flags.push('cash-confirmed');
  if (entry.status === 'verified' && entry.cashPrize === false) entry.flags.push('not-a-cash-competition');
  if (entry.status === 'verified' && !entry.prize) entry.flags.push('prize-amount-not-stated');
  if (entry.status === 'verified' && !entry.freeEntry && entry.freeEntry !== false) entry.flags.push('fee-not-stated');
  if (entry.status === 'unverified') entry.flags.push('official-page-not-read');
  if (entry.status === 'partial') entry.flags.push('official-page-incomplete');
  if (entry.sourceKind === 'none') entry.flags.push('no-source-link');
  if (entry.sourceKind === 'not-operator') entry.flags.push('source-not-operator');
  if (entry.id === 'tom-howard-poetry') entry.flags.push('paid-entry-vs-ledger');
  if (entry.id === 'givling') entry.flags.push('reclassified');
  if (entry.id === 'tradingview-leap') entry.flags.push('stale-edition');
  if (entry.id === 'espn-pickem') entry.flags.push('source-self-contradiction');
  entries.push(entry);
}

// Deterministic order: category order, then name.
const catIndex = new Map(CATEGORIES.map((c, i) => [c.id, i]));
entries.sort((a, b) => (catIndex.get(a.category) - catIndex.get(b.category)) || a.name.localeCompare(b.name));

// Optional link-health overlay produced by scripts/linkcheck.mjs on a GitHub runner.
let linkHealth = {};
const healthPath = path.join(root, 'data/link-health.json');
if (fs.existsSync(healthPath)) {
  const raw = JSON.parse(fs.readFileSync(healthPath, 'utf8'));
  linkHealth = raw.results || {};
}

const stats = {
  readOn: READ_ON,
  total: entries.length,
  verified: entries.filter((e) => e.status === 'verified').length,
  partial: entries.filter((e) => e.status === 'partial').length,
  unverified: entries.filter((e) => e.status === 'unverified').length,
  freeConfirmed: entries.filter((e) => e.freeEntry === true).length,
  paidConfirmed: entries.filter((e) => e.freeEntry === false).length,
  cashConfirmed: entries.filter((e) => e.cashPrize === true).length,
  noSource: entries.filter((e) => !e.officialUrl).length,
  categories: CATEGORIES.length,
};

fs.writeFileSync(path.join(root, 'data/entries.json'), JSON.stringify(entries, null, 1) + '\n');
fs.writeFileSync(
  path.join(root, 'data/stats.json'),
  JSON.stringify({ ...stats, categories: CATEGORIES, linkHealthGenerated: linkHealth.__generated || null }, null, 1) + '\n'
);

console.log(
  `entries=${stats.total} verified=${stats.verified} partial=${stats.partial} unverified=${stats.unverified} ` +
  `free=${stats.freeConfirmed} paid=${stats.paidConfirmed} cash=${stats.cashConfirmed} noSource=${stats.noSource}`
);
