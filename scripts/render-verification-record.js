#!/usr/bin/env node
/**
 * render-verification-record.js — write research/VERIFICATION-2026-11-02.md as a
 * human-readable, line-by-line export of data/verification-2026-11-02.json.
 *
 * Every confirmed value is printed with its verbatim quote and official URL.
 * Every field the official page did not state is left blank and marked unverified.
 * Rows that were not re-read are listed with their source links.
 *
 * Usage: node scripts/render-verification-record.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const v = read('data/verification-2026-11-02.json');
const verif = read('data/verification.json');
const ledger = read('data/ledger.json');
const review = read('data/review-2026-11-02.json');

const fById = new Map(v.rows.map((r) => [r.id, r]));
const vrById = new Map(verif.rows.map((r) => [r.id, r]));
const out = [];
const L = (...x) => out.push(...x);
const cells = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

L('# Verification record — ' + v.checkedAt, '');
L('**Session:** `' + v.checkedBy + '` · **Method:** ' + v.method, '');
L('**Rule:** a field is filled only when the exact wording appears on the official page listed in that row. A field that page did not state is left blank and marked unverified. No value is inferred, converted, summed or carried over from the third-party ledger.', '');
L('**Counts:** ' + v.pages.length + ' official pages fetched · ' + v.rows.length + ' rows with at least one confirmed value · ' +
  (ledger.listings.length - v.rows.length) + ' rows left blank and flagged · ' + v.newLeads.length + ' new official leads.', '');
L('**Full machine-readable record:** `data/verification-2026-11-02.json`. **Live evidence page:** https://sassnarep3-star.github.io/Own1/verified.html', '');
L('---', '');
L('## 1. Official pages fetched', '');
L('| # | Official URL | Title returned | Outcome | Rows |', '| --- | --- | --- | --- | --- |');
v.pages.forEach((p, i) => L('| ' + (i + 1) + ' | ' + p.url + ' | ' + cells(p.title) + ' | ' + p.outcome + ' | ' + (p.rows || []).join(', ') + ' |'));
L('', '---', '');
L('## 2. Line-by-line verification of rows with confirmed values', '');
const FIELDS = [
  ['prize', 'Prize'], ['entry', 'Entry cost'], ['deadline', 'Deadline'], ['status', 'Status'],
  ['eligibility', 'Eligibility'], ['aiAgent', 'AI-agent rules'], ['aiDisclosure', 'AI-use disclosure'], ['aiRules', 'Platform AI rules']
];
for (const r of v.rows) {
  L('### ' + r.id + ' — ' + r.name, '');
  L('Category: `' + r.category + '` · Official source: ' + r.sourceUrl + ' · Pages read: ' + (r.pages || []).join(', '), '');
  L('| Field | Confirmed value (operator wording) | Verbatim quote from the official page | Official URL |', '| --- | --- | --- | --- |');
  for (const [k, label] of FIELDS) {
    const f = (r.facts || {})[k];
    if (f) L('| ' + label + ' | ' + cells(f.value) + ' | ' + cells(f.quote) + ' | ' + f.url + ' |');
    else L('| ' + label + ' | *(blank — unverified)* | *(not stated on the pages read)* | — |');
  }
  L('');
  if ((r.notStated || []).length) { L('**Left blank / not stated:**', ''); r.notStated.forEach((x) => L('- ' + x)); L(''); }
  if ((r.flags || []).length) { L('**Flags on this row:**', ''); r.flags.forEach((x) => L('- ' + x)); L(''); }
}
L('---', '');
L('## 3. New official leads (not merged into the pinned dataset)', '');
L('| Lead | Prize (official wording) | Entry | Deadline | Official URL | Verbatim quote |', '| --- | --- | --- | --- | --- | --- |');
v.newLeads.forEach((l) => L('| ' + l.name + ' | ' + (l.prize || '*(blank — unverified)*') + ' | ' +
  (l.entry || '*(blank — unverified)*') + ' | ' + (l.deadline || '*(blank — unverified)*') + ' | ' + l.url + ' | ' + cells(l.quote) + ' |'));
L('', '---', '');
L('## 4. Rows left blank and flagged unverified', '');
L('These ' + (ledger.listings.length - v.rows.length) + ' rows were not re-read on ' + v.checkedAt +
  '. Their prize, entry cost, deadline, status and eligibility cells are blank in every table. Each row still carries a source link for manual review.', '');
L('| Competition | Category | Source link (official page where one exists) | Values |', '| --- | --- | --- | --- |');
for (const i of ledger.listings) {
  if (fById.has(i.id)) continue;
  const r = vrById.get(i.id);
  const official = r && r.officialSourceCount > 0 ? r.primaryOfficialUrl :
    (r && r.allSourceUrls[0] ? r.allSourceUrls[0].url : 'https://karagemop466-tech.github.io/FreeMoneyApps/');
  const note = r && r.officialSourceCount > 0 ? 'official page' : 'none official — cited page only';
  L('| ' + i.name + ' | ' + i.type + ' | ' + official + ' (' + note + ') | *(blank — unverified)* |');
}
L('', '---', '');
L('## 5. Irregularities found', '');
L('All items are published with evidence and source links on the Flagged for Review page and in `data/review-2026-11-02.json`.', '');
L('| ID | Severity | Finding |', '| --- | --- | --- |');
review.irregularities.forEach((f) => L('| ' + f.id + ' | ' + f.severity + ' | ' + cells(f.title) + ' |'));
L('', '---', '');
L('## 6. Reproduce', '');
L('```', 'npm run build', 'node scripts/checklinks.js', 'node tests/validate.mjs', 'node tests/validate-prize-atlas.mjs',
  'node scripts/render-verification-record.js', '```', '');
L('The generator `scripts/build.js` reads only committed JSON, performs no network requests and uses no clock. This record is a human-readable export of `data/verification-2026-11-02.json`, not a separate source of truth.', '');

fs.mkdirSync(path.join(ROOT, 'research'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'research/VERIFICATION-2026-11-02.md'), out.join('\n'));
console.log('wrote research/VERIFICATION-2026-11-02.md (' + out.length + ' lines)');
