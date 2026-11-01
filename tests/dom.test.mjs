// Headless render test: proves the interactive tables actually build their rows in a browser-like DOM.
// Catches the failure mode where a JavaScript error leaves the dashboard saying "Loading…" forever.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '..');
const pages = ['index.html', 'category/tech.html', 'category/sports.html', 'review.html'];

let failures = 0;
for (const rel of pages) {
  const file = path.join(root, rel);
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    url: 'file://' + file,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
  });
  const { window } = dom;

  // jsdom does not fetch relative scripts from file:// reliably, so inject them in order.
  for (const script of ['data/site-data.js', 'assets/app.js']) {
    const p = path.join(root, script);
    assert.ok(fs.existsSync(p), `missing ${script}`);
    window.eval(fs.readFileSync(p, 'utf8'));
  }

  const doc = window.document;
  const mounts = [...doc.querySelectorAll('#picks, #rows')];
  assert.ok(mounts.length > 0, `${rel}: no table mount found`);

  for (const mount of mounts) {
    const rows = mount.querySelectorAll('tbody tr').length;
    const text = mount.textContent || '';
    assert.ok(!/Loading…/.test(text), `${rel}#${mount.id}: still shows "Loading…" — script did not run`);
    assert.ok(rows > 0, `${rel}#${mount.id}: rendered zero rows`);
    // Every rendered row must carry a source cell that is either a link or an explicit "no link" note.
    for (const tr of mount.querySelectorAll('tbody tr')) {
      const sourceCell = [...tr.querySelectorAll('td')].pop();
      assert.ok(
        sourceCell.querySelector('a') || /No operator link/i.test(sourceCell.textContent),
        `${rel}: row without a source link or explicit no-link label`
      );
    }
  }

  // The filter controls must be wired: typing nonsense should reduce the visible row count.
  const panel = doc.querySelector('#rows')?.closest('.panel');
  if (panel) {
    const before = doc.querySelectorAll('#rows tbody tr').length;
    const search = panel.querySelector('.f-search');
    search.value = 'zzzz-no-such-competition';
    search.dispatchEvent(new window.Event('input', { bubbles: true }));
    const after = doc.querySelectorAll('#rows tbody tr').length;
    assert.equal(after, 0, `${rel}: search filter did not filter (${before} → ${after})`);
    assert.ok(/No listings match/i.test(doc.querySelector('#rows').textContent), `${rel}: no empty state shown`);
    search.value = '';
    search.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(doc.querySelectorAll('#rows tbody tr').length, before, `${rel}: clearing search did not restore rows`);
  }

  const cellCount = doc.querySelectorAll('#rows tbody tr').length;
  console.log(`${rel}: rendered ${mounts.length} table(s), ${cellCount} rows, filters wired`);
  window.close();
}

if (failures) process.exit(1);
console.log('OK — all interactive tables render and filter in a headless DOM.');
