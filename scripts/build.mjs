#!/usr/bin/env node
// Generates every HTML page from data/*.json + src/*.mjs.
//   node scripts/build.mjs          write the pages
//   node scripts/build.mjs --check  fail if the committed pages are stale
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  indexPage, shortlistPage, categoriesPage, categoryPage,
  summaryPage, methodologyPage, reviewPage, allPage, notFoundPage, archivePage,
} from '../src/pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const rows = read('data/entries.json');
const cats = read('data/categories.json');
const irregularities = read('data/irregularities.json');

const freeCash = rows.filter((r) => r.entryCost === 'free' && r.cash === true && r.prize).length;
const summaryStats = {
  total: rows.length,
  verified: rows.filter((r) => r.status === 'verified').length,
  platform: rows.filter((r) => r.status === 'platform').length,
  leads: rows.filter((r) => r.status === 'lead').length,
  freeCash,
  flags: rows.reduce((n, r) => n + r.flags.length, 0),
};

const pages = new Map();
const put = (file, base, html) => pages.set(file, html.replaceAll('{BASE}', base));

put('index.html', './', indexPage(cats, rows));
put('shortlist.html', './', shortlistPage());
put('categories.html', './', categoriesPage(cats, rows));
put('summary.html', './', summaryPage(summaryStats));
put('methodology.html', './', methodologyPage());
put('review.html', './', reviewPage(irregularities, rows));
put('all.html', './', allPage(cats, rows));
put('404.html', './', notFoundPage());
const archiveCandidates = [
  'ledger/index.html', 'verification.html', 'best-picks.html', 'flagged.html', 'sources.html',
  'executive-summary.html', 'cross-session.html', 'supplemental/index.html', 'playbook.html',
  'entry/kaggle.html', 'data/verification.json', 'data/ledger.json', 'data/audit.json',
  'VERIFICATION.md', 'EXECUTIVE_SUMMARY.md', 'IRREGULARITIES.md', 'tools/build_site.py',
];
put('archive.html', './', archivePage(archiveCandidates.filter((f) => fs.existsSync(path.join(ROOT, f)))));
for (const cat of cats) put(`category/${cat.id}.html`, '../', categoryPage(cat, rows));

// Category ids used by data but missing a page (or vice versa) would be a broken site.
const missing = [...new Set(rows.map((r) => r.category))].filter((c) => !cats.some((k) => k.id === c));
if (missing.length) {
  console.error(`Unknown category id(s) in data/entries.json: ${missing.join(', ')}`);
  process.exit(1);
}

// Sitemap for the pages this build owns (archive pages are listed by their own generator).
const SITE_URL = 'https://sassnarep3-star.github.io/Own1/';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pages.keys(), 'archive.html']
  .map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>2026-11-01</lastmod></url>`)
  .join('\n')}
</urlset>
`;
pages.set('sitemap.xml', sitemap);

const check = process.argv.includes('--check');
let stale = 0;
for (const [file, html] of pages) {
  const abs = path.join(ROOT, file);
  if (check) {
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
    if (current !== html) {
      stale++;
      console.error(`stale: ${file}`);
    }
  } else {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, html);
  }
}

if (check) {
  if (stale) {
    console.error(`\n${stale} page(s) are out of date. Run: node scripts/build.mjs`);
    process.exit(1);
  }
  console.log(`build check OK: ${pages.size} pages match data/`);
} else {
  console.log(
    `built ${pages.size} pages · ${summaryStats.total} entries (${summaryStats.verified} verified, ${summaryStats.platform} platform, ${summaryStats.leads} leads) · ${summaryStats.freeCash} verified free+cash · ${summaryStats.flags} flags`
  );
}
