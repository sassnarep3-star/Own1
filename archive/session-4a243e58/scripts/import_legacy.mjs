#!/usr/bin/env node
/**
 * Import the reference catalogue as *unverified leads*.
 *
 * Source: https://github.com/karagemop466-tech/FreeMoneyApps (assets/data.js, pass "S", 2026-08-19)
 *
 * Usage:
 *   git clone --depth 1 https://github.com/karagemop466-tech/FreeMoneyApps /tmp/fma
 *   node scripts/import_legacy.mjs /tmp/fma/assets/data.js > data/legacy.json
 *
 * Deliberate rules:
 *   - only the name, category, legacy claim, legacy status and one source URL are kept
 *   - prize / entryFee / deadline / eligibility / work / payout are ALWAYS empty strings
 *   - dead hostnames (verified by DNS on 2026-11-01) and http-only URLs are flagged
 *   - nothing from the reference project is treated as fact
 *
 * The dead-host list is a dated observation, not a permanent truth: re-run the DNS
 * check before trusting it, and never present a lead as a verified prize.
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/import_legacy.mjs <path-to-FreeMoneyApps/assets/data.js>');
  process.exit(2);
}

// data.js assigns window.LEDGER; evaluate it with a stub window.
const source = readFileSync(file, 'utf8');
const window = {};
new Function('window', source)(window);
const ledger = window.LEDGER;
if (!ledger || !Array.isArray(ledger.listings)) {
  console.error('could not read LEDGER.listings from that file');
  process.exit(1);
}

// Hostnames with no DNS answer on 2026-11-01 (checked with getent hosts).
const DEAD_HOSTS = new Set([
  'fantasy.football.scot',
  'fantasy.premiershiprugby.com',
  'fantasyfootball.skysports.com',
  'fantasyracing.telegraph.co.uk',
  'fantazilig.tff.org',
  'supercoach.news.com.au',
]);

const CATEGORY = {
  skill: 'skill', trivia: 'trivia', creative: 'creative', tech: 'tech',
  directory: 'directory', sports: 'sports', pools: 'pools',
  forecasting: 'forecasting', market: 'market',
};

const NON_CASH = /gift card|merch|ticket|bonus|credit|gear|swag|non-cash|scholarship|trip|points|trophy|equipment|coaching|discount|subscription|voucher|gems|coins/i;

const hostOf = (url) => {
  try { return new URL(url).hostname; } catch { return ''; }
};

const out = ledger.listings.map((l) => {
  const https = [l.signupUrl, l.rulesUrl, l.tosUrl, ...(l.sources || []).map((s) => s.url)]
    .filter((u) => u && u.startsWith('https://'));
  const http = [l.signupUrl, l.rulesUrl, l.tosUrl, ...(l.sources || []).map((s) => s.url)]
    .filter((u) => u && u.startsWith('http://'));
  const source = https[0] || http[0] || '';
  const flags = ['unverified'];

  if (!source) flags.push('no-https-source');
  if (!https.length && http.length) flags.push('http-only');
  if (DEAD_HOSTS.has(hostOf(source))) flags.push('dead-domain');
  if (l.status === 'ended') flags.push('legacy-ended');
  if (l.freePath === 'paid-cash') flags.push('entry-fee-required');
  if (NON_CASH.test(l.prizeUsd || '') || l.freePath === 'partial') flags.push('non-cash-mixed');

  return {
    id: l.id,
    name: l.name,
    category: CATEGORY[l.type] || l.type,
    recordType: 'lead',
    source,
    sourceLabel: 'Legacy-linked operator page — not re-read in this pass',
    prize: '',
    entryFee: '',
    deadline: '',
    eligibility: '',
    work: '',
    payout: '',
    notes: '',
    legacyPrizeClaim: l.prizeUsd || '',
    legacyStatus: l.status || '',
    legacyFreePath: l.freePath || '',
    legacyChecked: l.lastChecked || '',
    legacyShort: l.short || '',
    legacySourceTiers: [...new Set((l.sources || []).map((s) => s.tier))],
    flags,
  };
});

process.stdout.write(JSON.stringify(out, null, 2) + '\n');
