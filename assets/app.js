/* Prize Atlas client logic: search, filter, sort. All numbers come from data/site-data.js,
   which is generated from data/entries.json. Nothing is computed that the build did not already assert. */
(function () {
  var SITE = window.SITE || { entries: [], categories: [], stats: {} };
  var body = document.body;
  var page = body.dataset.page || 'home';
  var base = body.dataset.base || './';
  var cat = body.dataset.category || '';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var dash = '<span class="mutedtext">—</span>';

  var STATUS_LABEL = { verified: 'Page checked', partial: 'Partly checked', unverified: 'Unverified' };
  var STATUS_CLASS = { verified: 'good', partial: 'warn', unverified: 'neutral' };

  function pill(status) {
    return '<span class="pill ' + (STATUS_CLASS[status] || 'neutral') + '">' + (STATUS_LABEL[status] || status) + '</span>';
  }
  function freeCell(e) {
    if (e.freeEntry === true) return '<span class="pill good">Free confirmed</span>';
    if (e.freeEntry === false) return '<span class="pill bad">Paid entry</span>';
    if (e.status === 'unverified') return dash;
    return '<span class="pill warn">Fee not stated</span>';
  }
  function linkCell(e) {
    if (!e.officialUrl) return '<span class="mutedtext">No operator link</span>';
    var label = e.status === 'unverified' ? 'Lead link' : 'Official page';
    var health = SITE.linkHealth && SITE.linkHealth[e.officialUrl];
    var flag = '';
    if (health) {
      if (health.ok) flag = '<span class="subtle">Link OK · checked ' + esc(health.checkedAt.slice(0, 10)) + '</span>';
      else if (health.status === 403 || health.status === 429 || health.status === 401)
        flag = '<span class="subtle">Bot-blocked (HTTP ' + health.status + ') — not evidence the page is gone</span>';
      else flag = '<span class="subtle pill bad">Link failed: ' + esc(health.status || health.error) + '</span>';
    }
    return '<a class="source" href="' + esc(e.officialUrl) + '" target="_blank" rel="noopener noreferrer">' + label + ' ↗</a>' + flag;
  }
  function nameCell(e) {
    var c = (SITE.categories || []).filter(function (x) { return x.id === e.category; })[0];
    var sub = (c ? c.name : e.category) + (e.operator ? ' · ' + e.operator : '');
    var title = e.status === 'unverified'
      ? '<span class="name">' + esc(e.name) + '</span>'
      : '<a class="name" href="' + base + 'entry/' + esc(e.id) + '.html">' + esc(e.name) + '</a>';
    return title + '<span class="subtle">' + esc(sub) + '</span>';
  }

  function table(rows, opts) {
    opts = opts || {};
    var showFit = !!opts.fit;
    var head =
      '<div class="table-wrap"><table><thead><tr>' +
      '<th>Competition</th><th>Status</th><th>Entry cost</th><th>Cash prize</th><th>Deadline</th>' +
      (showFit ? '<th class="num">Fit</th>' : '') +
      '<th>Source</th></tr></thead><tbody>';
    var body = rows.map(function (e) {
      var deadline = e.deadline ? esc(e.deadline) : dash;
      var prize = e.prize ? esc(e.prize) : (e.cashPrize === true ? '<span class="pill warn">Amount not stated</span>' : dash);
      return '<tr>' +
        '<td data-label="Competition">' + nameCell(e) + '</td>' +
        '<td data-label="Status">' + pill(e.status) + '</td>' +
        '<td data-label="Entry cost">' + freeCell(e) + '</td>' +
        '<td data-label="Cash prize">' + prize + '</td>' +
        '<td data-label="Deadline">' + deadline + '</td>' +
        (showFit ? '<td class="num" data-label="Fit score">' + (e.fit ? '<strong>' + e.fit.score + '</strong>' : dash) + '</td>' : '') +
        '<td data-label="Source">' + linkCell(e) + '</td>' +
        '</tr>';
    }).join('');
    return head + body + '</tbody></table></div>';
  }

  function initTable(mountId, initial, opts) {
    var mount = $(mountId);
    if (!mount) return;
    var panel = mount.closest('.panel') || document;
    var search = panel.querySelector('.f-search');
    var statusSel = panel.querySelector('.f-status');
    var catSel = panel.querySelector('.f-cat');
    var sortSel = panel.querySelector('.f-sort');
    var foot = panel.querySelector('.table-foot');
    var current = initial.slice();

    function apply() {
      var q = (search && search.value || '').trim().toLowerCase();
      var st = statusSel ? statusSel.value : '';
      var c = catSel ? catSel.value : '';
      var sort = sortSel ? sortSel.value : 'fit';
      current = initial.filter(function (e) {
        if (st && e.status !== st) return false;
        if (c && e.category !== c) return false;
        if (!q) return true;
        return [e.name, e.operator, e.category, e.prize, e.notes, e.officialUrl]
          .join(' ').toLowerCase().indexOf(q) !== -1;
      });
      current.sort(function (a, b) {
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'deadline') {
          if (!a.deadline && !b.deadline) return a.name.localeCompare(b.name);
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.localeCompare(b.deadline);
        }
        if (sort === 'status') {
          var order = { verified: 0, partial: 1, unverified: 2 };
          return (order[a.status] - order[b.status]) || a.name.localeCompare(b.name);
        }
        var fa = a.fit ? a.fit.score : -1, fb = b.fit ? b.fit.score : -1;
        return (fb - fa) || a.name.localeCompare(b.name);
      });
      mount.innerHTML = current.length
        ? table(current, opts)
        : '<div class="empty">No listings match those filters. Clear the search to see everything.</div>';
      if (foot) foot.textContent = current.length + ' of ' + initial.length + ' listings shown';
    }
    [search, statusSel, catSel, sortSel].forEach(function (el) {
      if (!el) return;
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
    });
    apply();
  }

  // ---- home ----
  if (page === 'home') {
    var all = SITE.entries;
    var verified = all.filter(function (e) { return e.status === 'verified'; });
    var ranked = verified.slice().sort(function (a, b) { return (b.fit ? b.fit.score : 0) - (a.fit ? a.fit.score : 0); });
    initTable('picks', ranked, { fit: true });
    initTable('rows', all, { fit: true });
  }
  // ---- category ----
  if (page === 'category') {
    initTable('rows', SITE.entries.filter(function (e) { return e.category === cat; }), { fit: true });
  }
  // ---- review ----
  if (page === 'review') {
    initTable('rows', SITE.entries.filter(function (e) { return e.status !== 'verified'; }), { fit: false });
  }
  // ---- sources ledger filter ----
  if (page === 'sources' && $('rows')) {
    var evRows = SITE.evidenceLedger || [];
    initTable('rows', evRows, { fit: false });
  }
})();
