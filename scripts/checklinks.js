#!/usr/bin/env node
/**
 * checklinks.js — structural QA for the generated site.
 *
 * Checks:
 *  1. every internal href/src in every generated HTML file resolves to a file on disk
 *     (or to a permitted in-page anchor)
 *  2. every in-page anchor target exists in the page that links to it
 *  3. every listing has exactly one detail page and appears on its own category page
 *     and on the full-table page
 *  4. every published table row carries at least one external source link
 *  5. no leftover template markers, no empty hrefs, no javascript: links
 *
 * Exits non-zero on any failure so it can gate a deploy.
 *
 * Usage: node scripts/checklinks.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ledger.json'), 'utf8'));
const verif = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/verification.json'), 'utf8'));

const errors = [];
const warnings = [];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const allFiles = walk(ROOT);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const htmlSet = new Set(htmlFiles.map(rel));

/* ---------- 1 & 2: internal links and anchors ---------- */

const anchorsByFile = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set();
  const re = /\sid="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) ids.add(m[1]);
  anchorsByFile.set(rel(file), ids);
}

for (const file of htmlFiles) {
  const from = rel(file);
  const dir = path.posix.dirname(from);
  const html = fs.readFileSync(file, 'utf8');

  const attrRe = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = attrRe.exec(html))) {
    const raw = m[1];
    if (!raw) { errors.push(`${from}: empty href/src`); continue; }
    if (/^(https?:|mailto:|data:|tel:)/.test(raw)) continue;

    const [target, hash] = raw.split('#');
    let resolved;
    if (target === '') resolved = from; // pure in-page anchor
    else resolved = path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, target));

    if (target !== '' && !htmlSet.has(resolved) && !fs.existsSync(path.join(ROOT, resolved))) {
      errors.push(`${from}: broken internal link -> ${raw}`);
      continue;
    }
    if (hash) {
      const hostFile = target === '' ? from : resolved;
      const ids = anchorsByFile.get(hostFile);
      if (ids && !ids.has(hash)) {
        errors.push(`${from}: anchor #${hash} not found in ${hostFile}`);
      }
    }
  }

  if (/javascript:/.test(html)) warnings.push(`${from}: contains a javascript: URL`);
  if (/\{\{|\}\}|undefined|\[object Object\]|NaN/.test(html)) {
    const bad = html.match(/.{0,40}(undefined|\[object Object\]|NaN).{0,40}/);
    errors.push(`${from}: suspicious rendered value -> ${(bad ? bad[0] : '').replace(/\s+/g, ' ').trim()}`);
  }
}

/* ---------- 3: coverage ---------- */

for (const item of ledger.listings) {
  const detail = `c/${item.id}.html`;
  if (!htmlSet.has(detail)) errors.push(`missing detail page ${detail}`);

  const catFile = `categories/${item.type}.html`;
  if (!htmlSet.has(catFile)) { errors.push(`missing category page ${catFile}`); continue; }
  const catHtml = fs.readFileSync(path.join(ROOT, catFile), 'utf8');
  if (catHtml.indexOf(`c/${item.id}.html`) === -1) {
    errors.push(`${catFile}: listing ${item.id} not linked from its category page`);
  }

  const allHtml = fs.readFileSync(path.join(ROOT, 'all.html'), 'utf8');
  if (allHtml.indexOf(`href="c/${item.id}.html"`) === -1) {
    errors.push(`all.html: listing ${item.id} missing from the full table`);
  }
  if ((allHtml.match(new RegExp(`href="c/${item.id}\\.html"`, 'g')) || []).length !== 1) {
    errors.push(`all.html: listing ${item.id} appears more than once`);
  }
}

/* ---------- 4: every row has an external source ---------- */

const allHtml = fs.readFileSync(path.join(ROOT, 'all.html'), 'utf8');
const rowRe = /<tr id="row-([^"]+)"[\s\S]*?<\/tr>/g;
let rows = 0;
let rm;
while ((rm = rowRe.exec(allHtml))) {
  rows++;
  const id = rm[1];
  const block = rm[0];
  if (!/href="https?:\/\//.test(block)) errors.push(`all.html: row ${id} has no external source link`);
  const row = verif.rows.find((r) => r.id === id);
  if (row && row.officialSourceCount > 0 && !/Official page/.test(block)) {
    errors.push(`all.html: row ${id} has an official source but shows no official link`);
  }
  if (row && row.officialSourceCount === 0 && !/none official/.test(block)) {
    errors.push(`all.html: row ${id} has no official source but is not marked as such`);
  }
}
if (rows !== ledger.listings.length) {
  errors.push(`all.html: found ${rows} table rows, expected ${ledger.listings.length}`);
}

/* ---------- report ---------- */

const filesChecked = htmlFiles.length;
console.log(`checklinks: ${filesChecked} HTML files, ${rows} table rows`);
if (warnings.length) {
  console.log('\nWARNINGS');
  warnings.slice(0, 20).forEach((w) => console.log('  ! ' + w));
}
if (errors.length) {
  console.log('\nERRORS (' + errors.length + ')');
  errors.slice(0, 60).forEach((e) => console.log('  x ' + e));
  process.exit(1);
}
console.log('ok: no broken internal links, all listings published exactly once, every row has a source');
