#!/usr/bin/env node
// Internal link/anchor checker for the generated site. External links are counted, not fetched (no outbound access in CI sandbox).
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const skip=new Set(['.git','data','node_modules','scripts']);
const htmls=[];(function walk(d){fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{if(e.isDirectory()){if(!skip.has(e.name))walk(path.join(d,e.name))}else if(e.name.endsWith('.html'))htmls.push(path.join(d,e.name))})})(root);
let bad=0,internal=0,external=new Set(),checked=0;
const ids={};const idsOf=f=>ids[f]||(ids[f]=new Set([...fs.readFileSync(f,'utf8').matchAll(/\sid="([^"]+)"/g)].map(m=>m[1])));
for(const f of htmls){
  const s=fs.readFileSync(f,'utf8');
  for(const m of s.matchAll(/(?:href|src)="([^"]*)"/g)){
    const u=m[1].replace(/&amp;/g,'&');checked++;
    if(/^https?:/.test(u)){external.add(u);continue}
    if(/^(data:|mailto:|javascript:)/.test(u))continue;
    internal++;
    let [p,h]=u.split('#');
    const target=p?path.resolve(path.dirname(f),p):f;
    if(!fs.existsSync(target)){console.log('BROKEN',path.relative(root,f),'→',u);bad++;continue}
    if(h&&target.endsWith('.html')&&!h.includes('=')&&!idsOf(target).has(h)){console.log('MISSING ANCHOR',path.relative(root,f),'→',u);bad++}
  }
}
console.log(`pages: ${htmls.length}, links checked: ${checked}, internal: ${internal}, unique external (not fetched): ${external.size}, broken: ${bad}`);
process.exit(bad?1:0);
