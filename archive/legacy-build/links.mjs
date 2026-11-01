#!/usr/bin/env node
// External link reachability. Advisory, not a publish gate: operator sites
// rate-limit and block automated requests, and a 200 response is not evidence
// that a prize exists. Run in CI after deploy and read the report.
//   node tests/links.mjs [--strict]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/entries.json'), 'utf8'));

const urls = [...new Set(rows.map((r) => r.source).filter(Boolean))].sort();
const UA = 'PrizeAtlasLinkCheck/1.0 (+https://github.com/sassnarep3-star/Own1)';

async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    let res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA }, signal: controller.signal });
    if ([403, 405, 406, 429].includes(res.status)) {
      // Some servers reject HEAD or bot traffic but serve humans fine.
      const head = res.status;
      res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA, accept: 'text/html,*/*' }, signal: controller.signal });
      if ([403, 405, 406, 429].includes(res.status) && head === res.status) return { url, state: 'blocked', code: res.status };
    }
    return { url, state: res.ok ? 'ok' : 'broken', code: res.status };
  } catch (err) {
    return { url, state: 'unreachable', code: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
const queue = urls.slice();
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) results.push(await check(queue.shift()));
  })
);

results.sort((a, b) => (a.state === b.state ? a.url.localeCompare(b.url) : a.state.localeCompare(b.state)));
const counts = results.reduce((m, r) => ((m[r.state] = (m[r.state] || 0) + 1), m), {});

const lines = [
  '# External link report',
  '',
  `Checked ${results.length} unique operator URLs on ${new Date().toISOString().slice(0, 10)}.`,
  '',
  `- ok: ${counts.ok || 0}`,
  `- blocked (bot protection, needs a human check): ${counts.blocked || 0}`,
  `- broken: ${counts.broken || 0}`,
  `- unreachable: ${counts.unreachable || 0}`,
  '',
  '| State | Code | URL | Entry |',
  '| --- | --- | --- | --- |',
  ...results.map((r) => {
    const owner = rows.find((x) => x.source === r.url);
    return `| ${r.state} | ${r.code} | ${r.url} | ${owner ? owner.name : ''} |`;
  }),
  '',
];
fs.writeFileSync(path.join(ROOT, 'research/link-report.md'), lines.join('\n'));

console.log(JSON.stringify(counts));
for (const r of results.filter((r) => r.state !== 'ok')) console.log(`${r.state}\t${r.code}\t${r.url}`);

if (process.argv.includes('--strict') && (counts.broken || counts.unreachable)) {
  console.error(`\n${counts.broken + counts.unreachable} links failed. See research/link-report.md`);
  process.exit(1);
}
