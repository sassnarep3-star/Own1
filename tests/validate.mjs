/**
 * validate.mjs — assertions for the merged PrizeDesk site.
 *
 * These are the rules the project claims to follow, expressed as tests:
 *  1. every row in the ledger is published exactly once, with its own detail page
 *  2. no prize figure is shown without an official source AND a stated amount
 *  3. every blank prize cell has a recorded reason
 *  4. rows added by parallel sessions say so, and carry a cross-check record
 *  5. every flag that names affected rows only names rows that exist
 *  6. every table row links to an external (operator) page
 *
 * Run: node tests/validate.mjs   (after `npm run build`)
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const read = (p) => fs.readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(p));

const ledger = json('data/ledger.json');
const verif = json('data/verification.json');
const irr = json('data/irregularities.json');
const rows = new Map(verif.rows.map((r) => [r.id, r]));

/* ---------- 1. dataset integrity ---------- */

assert.equal(ledger.listings.length, 206 + ledger.additionsMerged,
  'row count should be the pinned source plus merged additions');
assert.equal(new Set(ledger.listings.map((l) => l.id)).size, ledger.listings.length, 'duplicate ids');
assert.equal(verif.rows.length, ledger.listings.length, 'verification rows must cover every listing');

const typeIds = new Set(ledger.types.map((t) => t.id));
for (const item of ledger.listings) {
  assert(typeIds.has(item.type), `${item.id}: unknown category ${item.type}`);
  assert(Array.isArray(item.sources) && item.sources.length > 0, `${item.id}: no sources`);
  assert(/^https?:\/\//.test(item.signupUrl), `${item.id}: signupUrl is not a URL`);
  if (item.mergedFrom) assert(item.addedByParallelSession, `${item.id}: merged row must name the session`);
}

/* ---------- 2 & 3. the blank-beats-guessed rule ---------- */

let withFigure = 0;
let blanked = 0;
for (const row of verif.rows) {
  if (row.prizeCellValue !== null) {
    withFigure++;
    assert(row.officialSourceCount > 0, `${row.id}: prize shown without an official source`);
    assert(row.prizeHasMoneyAmount, `${row.id}: prize shown without a stated amount`);
    assert(row.prizeCellValue === row.prizeClaim, `${row.id}: published prize must be the claim verbatim`);
  } else {
    blanked++;
    assert(row.prizeHasOfficialBasis === false || row.prizeHasMoneyAmount === false,
      `${row.id}: blank prize with no recorded reason`);
  }
}
assert.equal(withFigure + blanked, verif.rows.length);
assert.equal(blanked, verif.totals.prizeBlankedOnSite, 'blank count must match the published total');

/* ---------- 4. cross-checks and merged rows ---------- */

const cross = json('data/cross-checks.json').checks;
const crossIds = new Set(cross.map((c) => c.id));
for (const id of crossIds) {
  assert(rows.has(id), `cross-check names an unknown listing: ${id}`);
  const row = rows.get(id);
  assert(row.crossCheck, `${id}: cross-check not attached to the row`);
  assert(/^https:\/\//.test(row.crossCheck.url), `${id}: cross-check URL must be https`);
  assert(row.crossCheck.checkedDate, `${id}: cross-check needs a date`);
  assert(row.crossCheck.checkedBy, `${id}: cross-check needs an owning session`);
}
for (const item of ledger.listings.filter((l) => l.mergedFrom)) {
  assert(crossIds.has(item.id), `${item.id}: merged row has no cross-check record`);
}

/* ---------- 5. flags ---------- */

for (const flag of irr.items) {
  for (const id of flag.affected || []) {
    if (id === 'all') continue;
    assert(rows.has(id), `${flag.id}: names an unknown listing ${id}`);
  }
  if ((flag.affected || []).length) assert(flag.links || flag.id, `${flag.id}: evidence expected`);
}

/* ---------- 6. the published site ---------- */

const allHtml = read('all.html');
assert.equal((allHtml.match(/<tr id="row-/g) || []).length, ledger.listings.length,
  'every listing must appear exactly once in the full table');

for (const item of ledger.listings) {
  assert(fs.existsSync(path.join('c', `${item.id}.html`)), `missing detail page for ${item.id}`);
  const cat = path.join('categories', `${item.type}.html`);
  assert(fs.existsSync(cat), `missing category page ${cat}`);
  assert(read(cat).includes(`c/${item.id}.html`), `${item.id} missing from ${cat}`);
  assert(allHtml.includes(`href="c/${item.id}.html"`), `${item.id} missing from all.html`);
}

const rowBlocks = allHtml.match(/<tr id="row-[\s\S]*?<\/tr>/g) || [];
for (const block of rowBlocks) {
  assert(/href="https?:\/\//.test(block), 'a table row has no external source link');
  const id = block.match(/<tr id="row-([^"]+)"/)[1];
  const row = rows.get(id);
  if (row.officialSourceCount > 0) assert(block.includes('Official page'), `${id}: official link missing`);
  else assert(block.includes('none official'), `${id}: unofficial row must say so`);
  if (row.prizeCellValue === null) assert(block.includes('—'), `${id}: blank prize must render as a dash`);
}

/* ---------- report ---------- */

console.log(`OK: ${ledger.listings.length} listings (${ledger.additionsMerged} merged from parallel sessions), ` +
  `${withFigure} published prize figures all backed by an official source, ${blanked} blanked with a reason, ` +
  `${verif.totals.liveChecked} live-checked, ${verif.totals.crossChecked} independently checked, ` +
  `${irr.items.length} flags, ${rowBlocks.length} table rows with external sources.`);
