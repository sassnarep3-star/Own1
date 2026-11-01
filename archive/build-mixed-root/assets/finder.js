(function(){
  var tbl=document.querySelector('[data-table]'); if(!tbl) return;
  var rows=[].slice.call(tbl.tBodies[0].rows), q=document.querySelector('[data-q]'), sels=[].slice.call(document.querySelectorAll('select[data-f]')), cnt=document.querySelector('[data-count]');
  function apply(){
    var t=(q&&q.value||'').toLowerCase().trim(), n=0;
    rows.forEach(function(r){
      var ok=!t||r.textContent.toLowerCase().indexOf(t)>-1;
      sels.forEach(function(s){ if(ok&&s.value&&r.dataset[s.dataset.f]!==s.value) ok=false; });
      r.hidden=!ok; if(ok)n++;
    });
    if(cnt) cnt.textContent=n+' of '+rows.length+' shown';
  }
  function fromHash(){
    var h=location.hash.replace(/^#/,''); if(!h||h.indexOf('=')<0) return;
    h.split('&').forEach(function(p){var kv=p.split('='),k=kv[0],v=decodeURIComponent(kv[1]||'');
      if(k==='q'&&q) q.value=v; sels.forEach(function(s){ if(s.dataset.f===k) s.value=v; }); });
  }
  if(q) q.addEventListener('input',apply);
  sels.forEach(function(s){s.addEventListener('change',apply)});
  var rb=document.querySelector('[data-reset]'); if(rb) rb.addEventListener('click',function(){ if(q)q.value=''; sels.forEach(function(s){s.value=''}); apply(); });
  window.addEventListener('hashchange',function(){fromHash();apply()});
  fromHash(); apply();
})();
