/* Prize Atlas — client-side dashboard.
 *
 * The whole site is static. This file loads data/entries.json, computes the
 * published actionability score, and renders the tables, shortlist and filters.
 *
 * Score rubric (also documented on methodology.html so it cannot drift silently):
 *   +25 free entry confirmed      +20 printed cash prize     +15 open when checked
 *   +10 deadline or window        +10 eligibility printed    +10/+6 effort stated
 *   +10 official page checked
 * Unverified leads always score 0 and never appear on the shortlist.
 */
(function () {
  'use strict';

  var BASE = document.body.dataset.base || './';
  var VIEW = document.body.dataset.view || '';
  var PAGE_CATEGORY = document.body.dataset.category || '';
  var CATEGORIES = [];

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var $ = function (id) { return document.getElementById(id); };
  var isDate = function (s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || ''); };

  function score(r) {
    if (r.status === 'lead') return 0;
    var s = 0;
    if (r.entryCost === 'free') s += 25;
    if (r.cash === true && r.prize) s += 20;
    if (r.openNow === true) s += 15;
    if (r.deadline || r.deadlineNote) s += 10;
    if (r.eligibility) s += 10;
    if (r.effort === 'low') s += 10;
    else if (r.effort) s += 6;
    s += 10;
    return Math.min(100, s);
  }

  function prizeValue(r) {
    if (!r.prize) return -1;
    var nums = String(r.prize).match(/\$[\d,]+(?:\.\d+)?(?:\s?(?:million|M))?/gi) || [];
    var best = 0;
    nums.forEach(function (n) {
      var m = n.replace(/[$,]/g, '').toLowerCase().match(/^([\d.]+)/);
      if (!m) return;
      var v = parseFloat(m[1]);
      if (/million|\d\s?m\b/.test(n.toLowerCase())) v *= 1000000;
      if (v > best) best = v;
    });
    return best;
  }

  function daysFromToday(iso) {
    var t = Date.parse(iso + 'T00:00:00Z');
    if (isNaN(t)) return null;
    var now = new Date();
    var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((t - today) / 86400000);
  }

  function fmtDate(iso) {
    var d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d.getTime())) return iso;
    return d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }

  function deadlineCell(r) {
    if (r.deadline && isDate(r.deadline)) {
      var d = daysFromToday(r.deadline);
      var when = d === null ? '' : d < 0 ? 'closed' : d === 0 ? 'today' : d + ' day' + (d === 1 ? '' : 's') + ' left';
      var cls = d !== null && d < 0 ? 'pill-muted' : 'pill-ok';
      return '<span class="nowrap">' + esc(fmtDate(r.deadline)) + '</span>' +
        (when ? ' <span class="pill ' + cls + '">' + when + '</span>' : '') +
        (r.deadlineNote ? '<span class="subtle">' + esc(r.deadlineNote) + '</span>' : '');
    }
    if (r.deadlineNote) return '<span class="subtle" style="margin-top:0">' + esc(r.deadlineNote) + '</span>';
    return '<span class="dash">—</span>';
  }

  var EVIDENCE = {
    verified: '<span class="pill pill-ok">Verified</span>',
    platform: '<span class="pill pill-info">Platform</span>',
    lead: '<span class="pill pill-warn">Lead</span>'
  };
  var ENTRY = { free: ['pill-ok', 'Free'], conditional: ['pill-warn', 'Conditional'], paid: ['pill-bad', 'Paid'] };

  function entryCell(r) {
    if (!r.entryCost) {
      return r.entry ? '<span class="smalltext">' + esc(r.entry) + '</span>' : '<span class="dash">—</span>';
    }
    var e = ENTRY[r.entryCost] || ['pill-muted', r.entryCost];
    var same = r.entry && r.entry.toLowerCase().replace(/[^a-z]/g, '').indexOf(e[1].toLowerCase()) === 0;
    return '<span class="pill ' + e[0] + '">' + e[1] + '</span>' +
      (r.entry && !same ? '<span class="subtle">' + esc(r.entry) + '</span>' : '');
  }

  function catLabel(id) {
    var c = CATEGORIES.filter(function (x) { return x.id === id; })[0];
    return c ? c.label : id;
  }

  function sourceCell(r) {
    if (!r.source) return '<span class="dash">no operator source</span>';
    return '<a class="source-link" href="' + esc(r.source) + '" target="_blank" rel="noopener noreferrer">' +
      (r.status === 'lead' ? 'Lead page' : 'Official page') + ' ↗</a>';
  }

  function rowHtml(r) {
    var s = score(r);
    return '<tr class="row-main" id="' + esc(r.id) + '" data-id="' + esc(r.id) + '" aria-expanded="false" tabindex="0">' +
      '<td class="cell-name" data-label="Competition">' +
        '<span class="c-name">' + esc(r.name) + '</span>' +
        '<span class="subtle">' + esc(catLabel(r.category)) + (r.effort ? ' · effort: ' + esc(r.effort) : '') + '</span>' +
        '<button class="detail-btn" type="button" aria-hidden="true" tabindex="-1">Details</button>' +
      '</td>' +
      '<td data-label="Evidence">' + (EVIDENCE[r.status] || esc(r.status)) + (s ? '<span class="subtle">score ' + s + '</span>' : '') + '</td>' +
      '<td data-label="Prize">' + (r.prize ? esc(r.prize) : '<span class="dash">—</span>') + (r.cash === false ? '<span class="subtle">non-cash</span>' : '') + '</td>' +
      '<td data-label="Entry">' + entryCell(r) + '</td>' +
      '<td data-label="Deadline">' + deadlineCell(r) + '</td>' +
      '<td data-label="Source">' + sourceCell(r) + '</td>' +
    '</tr>' +
    '<tr class="detail" data-for="' + esc(r.id) + '" hidden><td colspan="6">' + detailHtml(r) + '</td></tr>';
  }

  function detailHtml(r) {
    var parts = [];
    parts.push('<dl class="detail-grid">');
    parts.push('<div><dt>Eligibility</dt><dd>' + (r.eligibility ? esc(r.eligibility) : '<span class="dash">not printed on the page read</span>') + '</dd></div>');
    parts.push('<div><dt>Effort</dt><dd>' + (r.effort ? esc(r.effort) : '<span class="dash">not stated</span>') + '</dd></div>');
    parts.push('<div><dt>Open when checked</dt><dd>' + (r.openNow === true ? 'yes' : r.openNow === false ? 'no — closed or between editions' : '<span class="dash">not stated</span>') + '</dd></div>');
    parts.push('<div><dt>Checked</dt><dd>' + (r.verifiedOn ? esc(r.verifiedOn) : '<span class="dash">never</span>') + '</dd></div>');
    if (r.entry)        parts.push('<div><dt>Entry detail</dt><dd>' + esc(r.entry) + '</dd></div>');
    if (r.deadlineNote) parts.push('<div><dt>Deadline detail</dt><dd>' + esc(r.deadlineNote) + '</dd></div>');
    parts.push('</dl>');
    if (r.note) parts.push('<p style="margin:8px 0 0;font-size:12.5px;color:var(--ink-2)">' + esc(r.note) + '</p>');
    if (r.flags && r.flags.length) {
      parts.push('<ul class="flaglist">' + r.flags.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>');
    }
    return parts.join('');
  }

  function tableHtml(rows) {
    return '<div class="tablewrap"><table class="responsive" id="entry-table">' +
      '<thead><tr><th>Competition</th><th>Evidence</th><th>Prize</th><th>Entry</th><th>Deadline</th><th>Source</th></tr></thead>' +
      '<tbody>' + rows.map(rowHtml).join('') + '</tbody></table></div>';
  }

  function toggleRow(tr) {
    var id = tr.dataset.id;
    var detail = document.querySelector('tr.detail[data-for="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
    if (!detail) return;
    var open = tr.getAttribute('aria-expanded') === 'true';
    tr.setAttribute('aria-expanded', open ? 'false' : 'true');
    detail.hidden = open;
  }

  /* ---------------- filters ---------------- */
  function wiring(initial) {
    var q = $('q'), fCat = $('f-cat'), fStatus = $('f-status'), fEntry = $('f-entry'),
        fSort = $('f-sort'), fCash = $('f-cash'), fOpen = $('f-open');
    var rowsEl = $('rows'), countEl = $('count');

    var params = new URLSearchParams(location.search);
    if (q && params.get('q')) q.value = params.get('q');
    if (fCat && params.get('cat')) fCat.value = params.get('cat');
    if (fStatus && params.get('status')) fStatus.value = params.get('status');
    if (fEntry && params.get('entry')) fEntry.value = params.get('entry');
    if (fSort && params.get('sort')) fSort.value = params.get('sort');
    if (fCash && params.get('cash') === '1') fCash.checked = true;
    if (fOpen && params.get('open') === '1') fOpen.checked = true;

    function apply() {
      var term = (q && q.value ? q.value : '').trim().toLowerCase();
      var out = initial.filter(function (r) {
        if (term) {
          var hay = [r.name, r.prize, r.entry, r.note, r.eligibility, r.source, catLabel(r.category),
                     (r.flags || []).join(' ')].join(' ').toLowerCase();
          if (hay.indexOf(term) === -1) return false;
        }
        if (fCat && fCat.value && r.category !== fCat.value) return false;
        if (fStatus && fStatus.value && r.status !== fStatus.value) return false;
        if (fEntry && fEntry.value) {
          if (fEntry.value === 'unknown' ? !!r.entryCost : r.entryCost !== fEntry.value) return false;
        }
        if (fCash && fCash.checked && !(r.cash === true && r.prize)) return false;
        if (fOpen && fOpen.checked && r.openNow !== true) return false;
        return true;
      });

      var sort = fSort ? fSort.value : 'score';
      out.sort(function (a, b) {
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'prize') return prizeValue(b) - prizeValue(a) || a.name.localeCompare(b.name);
        if (sort === 'deadline') {
          var da = a.deadline && isDate(a.deadline) ? a.deadline : '9999-12-31';
          var db = b.deadline && isDate(b.deadline) ? b.deadline : '9999-12-31';
          return da.localeCompare(db) || a.name.localeCompare(b.name);
        }
        return score(b) - score(a) || a.name.localeCompare(b.name);
      });

      rowsEl.innerHTML = out.length ? tableHtml(out)
        : '<p class="empty">No entries match these filters. <button class="linkbtn" type="button" id="empty-reset">Reset</button></p>';
      if (countEl) countEl.textContent = out.length + ' of ' + initial.length + ' entries shown';

      var p = new URLSearchParams();
      if (q && q.value) p.set('q', q.value);
      if (fCat && fCat.value) p.set('cat', fCat.value);
      if (fStatus && fStatus.value) p.set('status', fStatus.value);
      if (fEntry && fEntry.value) p.set('entry', fEntry.value);
      if (fSort && fSort.value !== 'score') p.set('sort', fSort.value);
      if (fCash && fCash.checked) p.set('cash', '1');
      if (fOpen && fOpen.checked) p.set('open', '1');
      var qs = p.toString();
      history.replaceState(null, '', qs ? '?' + qs : location.pathname);

      var er = $('empty-reset');
      if (er) er.addEventListener('click', reset);
    }

    function reset() {
      [q, fCat, fStatus, fEntry, fSort].forEach(function (el) { if (el) el.value = ''; });
      if (fStatus) fStatus.value = initial.statusDefault || '';
      if (fCash) fCash.checked = false;
      if (fOpen) fOpen.checked = false;
      apply();
    }

    [q, fCat, fStatus, fEntry, fSort, fCash, fOpen].forEach(function (el) {
      if (!el) return;
      el.addEventListener(el.tagName === 'INPUT' && el.type === 'search' ? 'input' : 'change', apply);
      if (el.type === 'checkbox') el.addEventListener('change', apply);
    });
    var resetBtn = $('reset');
    if (resetBtn) resetBtn.addEventListener('click', reset);

    rowsEl.addEventListener('click', function (e) {
      var tr = e.target.closest('tr.row-main');
      if (tr) toggleRow(tr);
    });
    rowsEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var tr = e.target.closest('tr.row-main');
      if (tr) { e.preventDefault(); toggleRow(tr); }
    });

    apply();
  }

  /* ---------------- blocks ---------------- */
  function renderStats(rows) {
    var vals = {
      total: rows.length,
      verified: rows.filter(function (r) { return r.status === 'verified'; }).length,
      freecash: rows.filter(function (r) { return r.entryCost === 'free' && r.cash === true && r.prize; }).length,
      open: rows.filter(function (r) { return r.openNow === true; }).length
    };
    Object.keys(vals).forEach(function (k) {
      document.querySelectorAll('[data-stat="' + k + '"]').forEach(function (el) { el.textContent = vals[k]; });
    });
  }

  function renderPicks(rows) {
    var el = $('top-picks');
    if (!el) return;
    var picks = rows.filter(function (r) {
      return r.status === 'verified' && r.entryCost === 'free' && r.openNow === true && r.cash === true && r.prize;
    }).sort(function (a, b) { return score(b) - score(a) || a.name.localeCompare(b.name); }).slice(0, 6);

    if (!picks.length) { el.innerHTML = '<p class="empty">No fully verified free-cash entry is open today.</p>'; return; }
    el.innerHTML = picks.map(function (r) {
      return '<article class="pick">' +
        '<div class="pick-top"><span class="pick-name">' + esc(r.name) + '</span><span class="pick-score">' + score(r) + '</span></div>' +
        '<p class="pick-prize">' + esc(r.prize) + '</p>' +
        '<div class="pick-meta"><span>Free entry</span>' + (r.deadline ? '<span>closes ' + esc(fmtDate(r.deadline)) + '</span>' : '<span>open now</span>') + '</div>' +
        '<a href="' + esc(r.source) + '" target="_blank" rel="noopener noreferrer">Official rules ↗</a>' +
        '</article>';
    }).join('');
  }

  function tierBlock(title, note, rows) {
    if (!rows.length) return '';
    return '<section class="section"><div class="section-head"><div><h2>' + title + '</h2><p>' + note + '</p></div><span class="pill pill-muted">' + rows.length + ' entries</span></div>' +
      '<div class="panel">' + tableHtml(rows) + '</div></section>';
  }

  function renderTiers(rows) {
    var el = $('tier-list');
    if (!el) return;
    var verified = rows.filter(function (r) { return r.status === 'verified'; });
    var live = function (r) { return r.openNow !== false; };
    var t1 = verified.filter(function (r) { return r.entryCost === 'free' && r.cash === true && r.prize && r.openNow === true; });
    var t2 = verified.filter(function (r) { return r.entryCost === 'free' && r.openNow === true && !(r.cash === true && r.prize); });
    var t3 = verified.filter(function (r) { return r.openNow === false; });
    var t4 = verified.filter(function (r) { return live(r) && (r.entryCost === 'paid' || r.entryCost === 'conditional'); });
    var t5 = verified.filter(function (r) { return live(r) && !r.entryCost; });
    var platforms = rows.filter(function (r) { return r.status === 'platform'; });
    var byScore = function (a, b) { return score(b) - score(a) || a.name.localeCompare(b.name); };
    [t1, t2, t3, t4, t5, platforms].forEach(function (g) { g.sort(byScore); });

    el.innerHTML =
      tierBlock('Tier 1 — free entry and cash both confirmed, open now', 'The only entries where three separate verified facts line up: free entry, a printed cash prize, and a contest that was still open on 1 November 2026.', t1) +
      tierBlock('Tier 2 — free entry confirmed, cash not confirmed', 'Free to enter and open, but the operator prints no cash figure (or the prize is merchandise or tickets). Worth doing for other reasons; do not count on money.', t2) +
      tierBlock('Tier 3 — verified but closed or between editions', 'The facts are documented so the row stays useful when the window reopens. Nothing here can be entered on the verification date.', t3) +
      tierBlock('Tier 4 — verified but not free to enter', 'Entry costs money, needs a funded account, or is only free under conditions. Kept for completeness and clearly separated from the free list.', t4) +
      tierBlock('Tier 5 — entry cost not published', 'The prize or the work is documented, but the operator page read does not state a fee either way. Treat the cost as unknown rather than free, and check the rules page before committing.', t5) +
      tierBlock('Platforms and indexes', 'The index was read; each event inside sets its own terms. Use these to find contests, then verify the individual event.', platforms) +
      '<section class="section"><div class="notice notice-warn"><strong>' + rows.filter(function (r) { return r.status === 'lead'; }).length + ' unverified leads are deliberately excluded.</strong> They have no confirmed prize, entry cost or deadline, so they cannot be ranked. Browse them on the <a href="review.html">Flagged for review</a> page.</div></section>';
  }

  /* ---------------- boot ---------------- */
  function boot(rows, cats) {
    CATEGORIES = cats;
    var fCat = $('f-cat');
    if (fCat) {
      cats.forEach(function (c) {
        var n = rows.filter(function (r) { return r.category === c.id; }).length;
        var o = document.createElement('option');
        o.value = c.id; o.textContent = c.label + ' (' + n + ')';
        fCat.appendChild(o);
      });
      if (PAGE_CATEGORY) fCat.value = PAGE_CATEGORY;
    }

    renderStats(rows);
    renderPicks(rows);
    renderTiers(rows);

    if ($('rows')) {
      var initial;
      if (VIEW === 'category') initial = rows.filter(function (r) { return r.category === PAGE_CATEGORY; });
      else if (VIEW === 'review') initial = rows.filter(function (r) { return r.status === 'lead' || (r.flags && r.flags.length); });
      else initial = rows;
      initial.statusDefault = VIEW === 'review' ? 'lead' : '';
      wiring(initial);
    }
  }

  var dataUrl = BASE + 'data/entries.json';
  var catsUrl = BASE + 'data/categories.json';

  Promise.all([
    fetch(dataUrl).then(function (r) { if (!r.ok) throw new Error('entries.json ' + r.status); return r.json(); }),
    fetch(catsUrl).then(function (r) { if (!r.ok) throw new Error('categories.json ' + r.status); return r.json(); })
  ]).then(function (res) { boot(res[0], res[1]); }).catch(function (err) {
    var rowsEl = $('rows');
    if (rowsEl) rowsEl.innerHTML = '<p class="empty">The entry data could not be loaded (' + esc(err.message) + '). The <a href="' + BASE + 'all.html">static table</a> has every entry.</p>';
    var picks = $('top-picks');
    if (picks) picks.innerHTML = '<p class="empty">Data unavailable — open the <a href="' + BASE + 'all.html">static table</a>.</p>';
  });
})();
