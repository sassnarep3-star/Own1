#!/usr/bin/env node
// Automated (offline) audit of the upstream ledger. Produces data/audit.json.
// These checks find *irregularities in the data itself*; they do NOT verify facts against official sources.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const L = JSON.parse(fs.readFileSync(path.join(root, 'data/upstream/ledger.json'), 'utf8'));
const TODAY = '2026-11-01';
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const host = u => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return null; } };
const reg = h => (h || '').split('.').slice(-2).join('.');

const NONCASH = /gift ?card|voucher|trip|ticket|merch|jersey|shirt|helmet|PS5|Xbox|laptop|car\b|Toyota|Corolla|buggy|bundle|membership|subscription|credit|in-game|sprays|bonus (cash|bet)|gear|\bwatch\b|cards\b|hospitality|VIP|\bbat\b|\bballs?\b|signed|Amazon|iPhone|memorabilia|Surface/i;
const CASH = /\$\s?\d|£\s?\d|€\s?\d|USD|cash/i;
const GAMBLING_HOSTS = ['betfanatics.com', 'gambling.com', 'andysbetclub.co.uk'];
const NOT_CONFIRMED = /not (currently )?(confirmed|published|running|verified)|unverified|paused|complete|removed|unknown|confirm /i;

const urlRows = {};
L.listings.forEach(e => { const k = e.signupUrl.replace(/\/$/, ''); (urlRows[k] = urlRows[k] || []).push(e.id); });
const ids = new Set(L.listings.map(e => e.id));

const rows = L.listings.map(e => {
  const flags = [];
  const f = (code, msg) => flags.push({ code, msg });
  const sh = host(e.signupUrl), srcHosts = e.sources.map(s => host(s.url));
  const official = e.sources.filter(s => s.tier === 'official');
  if (!official.length) f('NO_OFFICIAL_SOURCE', 'No source with tier "official" (tiers: ' + e.sources.map(s => s.tier).join(', ') + ').');
  if (!srcHosts.some(h => reg(h) === reg(sh)) && !/apps\.apple\.com/.test(sh)) f('SIGNUP_HOST_NOT_IN_SOURCES', 'Sign-up host ' + sh + ' differs from every source host (' + srcHosts.join(', ') + ').');
  const urls = [e.signupUrl, e.iosUrl, e.tosUrl, e.rulesUrl, ...e.sources.map(s => s.url)].filter(Boolean);
  if (urls.some(u => u.startsWith('http://'))) f('INSECURE_URL', 'At least one link is http:// not https://.');
  if (e.status === 'ended' && e.freePath === 'full') f('ENDED_BUT_FREE_FULL', 'Status is "ended" but still counted as a "true free path" in the headline stats.');
  const dup = urlRows[e.signupUrl.replace(/\/$/, '')];
  if (dup.length > 1) f('SHARED_SIGNUP_URL', 'Sign-up URL is shared with ' + (dup.length - 1) + ' other row(s); the link goes to a generic page, not an entry-specific page.');
  if (GAMBLING_HOSTS.some(g => reg(sh) === g || sh === g)) f('GAMBLING_OPERATOR_HOST', 'Operator host ' + sh + ' is a betting/gambling brand; upstream README says gambling-operator contests were removed.');
  if (e.type === 'market') f('BROKER_PROMO', 'Market-competition row: operator is a trading platform/broker promotion. Review regulatory/risk exposure and whether it fits "no deposit" intent.');
  const prize = e.prizeUsd || '';
  const hasCash = CASH.test(prize), hasNon = NONCASH.test(prize);
  const prizeKind = NOT_CONFIRMED.test(prize) && !hasCash ? 'unconfirmed' : hasCash && hasNon ? 'mixed' : hasCash ? 'cash' : hasNon ? 'non-cash' : 'unclear';
  if (prizeKind === 'non-cash') f('NON_CASH_PRIZE', 'Prize text appears non-cash: "' + prize.slice(0, 80) + '".');
  if (prizeKind === 'mixed') f('MIXED_PRIZE', 'Prize text mixes cash with non-cash items.');
  if (prizeKind === 'unconfirmed') f('PRIZE_UNCONFIRMED', 'Prize text says it is unconfirmed/ended/unknown: "' + prize.slice(0, 80) + '".');
  if (/202[45]\b/.test(e.prizeNote || '') && e.status === 'live') f('POSSIBLY_STALE_DATES', 'Status "live" but prize note cites 2024/2025 dates.');
  if (e.freePath === 'full' && /entry fee|fee|deposit|paid/i.test((e.short || '') + ' ' + (e.restricted || '')) ) f('FREE_PATH_FEE_MENTION', 'Marked free-path "full" but text mentions a fee/deposit/paid tier — read the rules.');
  const age = days(e.lastChecked, TODAY);
  if (age > 60) f('STALE_CHECK', 'Upstream "lastChecked" ' + e.lastChecked + ' is ' + age + ' days before ' + TODAY + '.');
  if (e.code && !e.codeVerified) f('UNVERIFIED_LEAGUE_CODE', 'League/join code present but codeVerified is not set.');
  const elig = (e.eligibility || '') + ' ' + prize;
  const region = /Australia|AFL|A\$|NRL|\bAUD\b/i.test(elig) ? 'AU' : /UK|Ireland|£|Telegraph|Premier League|FPL/i.test(elig) && !/\bUS\b/.test(elig) ? 'UK/EU' : /€|Turk/i.test(elig) ? 'EU/other' : /\bUS\b|United States|Contiguous US|Canada/i.test(elig) ? 'US/CA' : /world|global|international|anywhere/i.test(elig) ? 'Global' : 'Unstated';
  return { id: e.id, prizeKind, region, flags };
});

const L2 = L.listings;
const count = f => L2.filter(f).length;
const claims = {
  headlineTotal: { claimed: 206, actual: L2.length },
  headlineFree: { claimed: 189, actual: count(e => e.freePath === 'full'), note: 'includes ' + count(e => e.freePath === 'full' && e.status === 'ended') + ' ended and ' + count(e => e.freePath === 'full' && e.status === 'caution') + ' caution rows' },
  headlineIos: { claimed: 62, actual: count(e => (e.platforms || []).includes('ios') && !['inactive', 'ended'].includes(e.status)) },
  headlineNew: { claimed: 60, actual: L.addedThisPassC.length, note: 'Value is the length of the stale "addedThisPassC" list (pass C, Aug 17), not the latest pass S (10 entries).' },
  headerLabel: { shown: 'Pass C · 17 Aug 2026', dataSays: 'pass ' + L.pass + ', reviewed ' + L.reviewed },
  missingIdsInPassLists: Object.keys(L).filter(k => /^addedThisPass/.test(k)).flatMap(k => L[k].filter(i => !ids.has(i)).map(i => k + ':' + i)),
  duplicateIds: L2.length - ids.size,
};
const summary = {};
rows.forEach(r => r.flags.forEach(x => summary[x.code] = (summary[x.code] || 0) + 1));
fs.writeFileSync(path.join(root, 'data/audit.json'), JSON.stringify({ generated: TODAY, rows, claims, summary }, null, 1));
console.log(JSON.stringify({ claims, summary }, null, 1));
