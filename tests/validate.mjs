import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const rows=JSON.parse(fs.readFileSync('data/entries.json','utf8'));
assert.equal(rows.length,208);
assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
const categories=['sports','tech','forecasting','creative','market','skill','trivia','pools','directory'];
for(const r of rows){assert(categories.includes(r.category),r.id);assert(['checked','unverified'].includes(r.sourceStatus),r.id);if(r.source)assert(/^https:\/\//.test(r.source),r.id);if(r.sourceStatus==='unverified')for(const key of ['prize','entry','deadline','kind'])assert.equal(r[key],'',`${r.id}: ${key} must be blank`);if(r.sourceStatus==='checked')assert(r.source,`${r.id}: no source`)}
const pages=['index.html','review.html',...categories.map(c=>`category/${c}.html`)];
for(const p of pages){let html=fs.readFileSync(p,'utf8');assert(html.includes('name="viewport"'),p);assert(html.includes('id="rows"'),p);for(const href of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){let url=href[1];if(/^(https?:|mailto:)/.test(url))continue;assert(fs.existsSync(path.resolve(path.dirname(p),url)),`${p}: broken local reference ${url}`)}}
console.log(`OK: ${rows.length} unique leads, ${rows.filter(r=>r.sourceStatus==='checked').length} checked official pages, ${rows.filter(r=>!r.source).length} missing operator link; ${pages.length} pages and all local references pass.`);

// Render the real app with a minimal DOM to exercise the evidence filter and
// labeled mobile cells without downloading browser tooling.
const {runInNewContext} = await import('node:vm');
const elements = new Map();
function element(id, tagName='DIV') {
  return elements.get(id) || (elements.set(id, {
    id, tagName, value: '', innerHTML: '', textContent: '',
    handlers: {}, setAttribute(){}, after(other){elements.set(other.id,other)},
    addEventListener(name,fn){this.handlers[name]=fn}
  }), elements.get(id));
}
for(const id of ['rows','result-count','search','status','kind','all-count','checked-count','review-count','category-grid']) element(id, id==='search'?'INPUT':id==='status'||id==='kind'?'SELECT':'DIV');
const app=fs.readFileSync('assets/app.js','utf8');
runInNewContext(app, {
  document:{body:{dataset:{base:'./',page:'home',category:''}},getElementById:id=>elements.get(id)||null,createElement:tag=>element('entry-filter',tag.toUpperCase())},
  fetch:async()=>({ok:true,json:async()=>rows})
});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(element('checked-count').textContent,7);
assert.equal((element('rows').innerHTML.match(/<tr><td/g)||[]).length,7);
assert(element('rows').innerHTML.includes('data-label="Cash prize"'));
assert(element('rows').innerHTML.includes('Official page'));
element('entry-filter').value='confirmed-free';
element('entry-filter').handlers.change();
assert.equal((element('rows').innerHTML.match(/<tr><td/g)||[]).length,3,'Only confirmed-free checked rows should pass');
assert(!element('rows').innerHTML.includes('ARC Prize (via Kaggle)'),'Unknown entry cost must not count as free');
console.log('OK: rendered mobile labels and confirmed-free evidence filter.');
