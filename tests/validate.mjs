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
