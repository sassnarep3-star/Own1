#!/usr/bin/env node
/**
 * ingest.js — turn the vendored third-party ledger into our canonical dataset.
 *
 * Rules for this script:
 *   1. Never evaluate the source JavaScript. Strip the `window.LEDGER = ` prefix and the
 *      trailing semicolon, then JSON.parse. If it is not valid JSON, fail loudly.
 *   2. Copy fields verbatim. Do not "clean", reword, infer, or fill in any value.
 *   3. Assert the structural facts we publish (counts, unique ids, category coverage).
 *   4. Write data/ledger.json with a provenance block attached.
 *
 * Usage: node scripts/ingest.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'data/source/ledger.source.js');
const PROV = path.join(ROOT, 'data/source/PROVENANCE.json');
const OUT = path.join(ROOT, 'data/ledger.json');

function fail(msg) {
  console.error('INGEST FAILED: ' + msg);
  process.exit(1);
}

const raw = fs.readFileSync(SRC, 'utf8');
const prov = JSON.parse(fs.readFileSync(PROV, 'utf8'));

const sha = crypto.createHash('sha256').update(raw).digest('hex');
if (sha !== prov.sourceFileSha256) {
  fail(`source file checksum changed: expected ${prov.sourceFileSha256}, got ${sha}`);
}

const body = raw.replace(/^[\s\S]*?window\.LEDGER\s*=\s*/, '').replace(/;\s*$/, '');
let ledger;
try {
  ledger = JSON.parse(body);
} catch (err) {
  fail('source is not strict JSON: ' + err.message);
}

/* ---------- structural assertions on the source ---------- */

if (!Array.isArray(ledger.listings)) fail('listings is not an array');
if (ledger.listings.length !== prov.declaredListingCount) {
  fail(`listing count ${ledger.listings.length} != declared ${prov.declaredListingCount}`);
}

const ids = new Set();
for (const item of ledger.listings) {
  for (const field of ['id', 'name', 'type', 'status', 'freePath', 'platforms',
    'signupUrl', 'prizeUsd', 'prizeNote', 'minCashout', 'payoutMethods',
    'eligibility', 'restricted', 'verification', 'sources', 'lastChecked']) {
    if (item[field] === undefined) fail(`listing ${item.id} missing required field ${field}`);
  }
  if (ids.has(item.id)) fail('duplicate id ' + item.id);
  ids.add(item.id);
  if (!Array.isArray(item.sources) || item.sources.length === 0) {
    fail(`listing ${item.id} has no sources`);
  }
  if (!/^https:\/\//.test(item.signupUrl)) {
    // Not fatal: recorded as an irregularity by verify.js. Ingest stays faithful.
    console.warn(`note: non-https signupUrl on ${item.id}`);
  }
}

const typeIds = new Set(ledger.types.map((t) => t.id));
for (const item of ledger.listings) {
  if (!typeIds.has(item.type)) fail(`listing ${item.id} references unknown type ${item.type}`);
}

for (const key of Object.keys(ledger)) {
  if (/^addedThisPass/.test(key) || key === 'featured' || key === 'removedThisPass') {
    if (!Array.isArray(ledger[key])) fail(`${key} is not an array`);
  }
}

/* ---------- write canonical dataset ---------- */

const out = {
  generatedAt: new Date().toISOString(),
  generatedBy: 'scripts/ingest.js',
  provenance: {
    sourceRepo: prov.sourceRepo,
    sourceLiveSite: prov.sourceLiveSite,
    sourceRepoCommit: prov.sourceRepoCommit,
    sourceRepoCommitDate: prov.sourceRepoCommitDate,
    sourceFile: prov.sourceFile,
    sourceFileSha256: prov.sourceFileSha256,
    declaredReviewDate: prov.declaredReviewDate,
    declaredPass: prov.declaredPass,
    capturedAt: prov.capturedAt,
    note: prov.note
  },
  reviewed: ledger.reviewed,
  pass: ledger.pass,
  types: ledger.types,
  verificationLevels: ledger.verificationLevels,
  featured: ledger.featured,
  addedThisPass: ledger.addedThisPass,
  addedThisPassC: ledger.addedThisPassC,
  removedThisPass: ledger.removedThisPass,
  listings: ledger.listings
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');

const byType = {};
for (const item of ledger.listings) byType[item.type] = (byType[item.type] || 0) + 1;

console.log('ingest ok');
console.log('  listings:', ledger.listings.length);
console.log('  categories:', ledger.types.length);
console.log('  by type:', JSON.stringify(byType));
console.log('  written:', path.relative(ROOT, OUT));
