// Check every outbound link used by the site and record what the network actually returned.
// Runs on a GitHub runner (full internet access) — the sandbox that edits the repo cannot reach these hosts.
// Output: data/link-health.json  { generated, results: { url: { ok, status, finalUrl, error, checkedAt } } }
//
// Interpretation rules baked into the site:
//   ok=false with status 404/410          -> link is dead
//   ok=false with status 401/403/429      -> bot-blocked; NOT evidence the page is gone
//   ok=false with error only              -> DNS/TLS/timeout; retry before concluding anything

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const entries = JSON.parse(fs.readFileSync(path.join(root, 'data/entries.json'), 'utf8'));

const urls = new Set();
for (const e of entries) {
  if (e.officialUrl) urls.add(e.officialUrl);
  for (const ev of e.evidence || []) if (ev.url) urls.add(ev.url);
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const TIMEOUT_MS = 20000;
const CONCURRENCY = 8;

async function check(url) {
  const checkedAt = new Date().toISOString();
  const attempt = async (method) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: ctrl.signal,
        headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      });
      // Drain a little so the socket closes cleanly; ignore body errors.
      try { await res.arrayBuffer(); } catch {}
      return { ok: res.ok, status: res.status, finalUrl: res.url || url, error: '', checkedAt };
    } catch (err) {
      return { ok: false, status: 0, finalUrl: url, error: String(err?.cause?.code || err?.name || err).slice(0, 120), checkedAt };
    } finally {
      clearTimeout(timer);
    }
  };

  let out = await attempt('GET');
  // 405/501 mean the method was rejected — retry once as GET is already used, so try HEAD as a fallback probe.
  if (out.status === 405 || out.status === 501) out = await attempt('HEAD');
  return out;
}

async function main() {
  const list = [...urls];
  const results = {};
  let i = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (i < list.length) {
      const url = list[i++];
      results[url] = await check(url);
      const s = results[url].status || results[url].error;
      process.stderr.write(`[${Object.keys(results).length}/${list.length}] ${s} ${url}\n`);
    }
  });
  await Promise.all(workers);

  const bad = Object.entries(results).filter(([, r]) => !r.ok);
  const out = {
    generated: new Date().toISOString(),
    total: list.length,
    ok: list.length - bad.length,
    failing: bad.length,
    results,
  };
  fs.writeFileSync(path.join(root, 'data/link-health.json'), JSON.stringify(out, null, 1) + '\n');
  console.log(`checked ${list.length} urls — ${out.ok} ok, ${out.failing} not ok`);
}

main();
