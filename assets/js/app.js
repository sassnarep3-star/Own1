/* PrizeDesk — table controls (search, filter, sort).
   Progressive enhancement only: with JavaScript off every row is already on the page. */
(function () {
  'use strict';

  var table = document.querySelector('[data-ledger-table]');
  if (!table) return;

  var tbody = table.tBodies[0];
  var rows = Array.prototype.slice.call(tbody.rows);
  var search = document.getElementById('q');
  var sort = document.getElementById('sort');
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-chip]'));
  var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

  // Remember the authored order so "Source order" can restore it.
  rows.forEach(function (row, i) { row.dataset.order = String(i); });

  var activeChips = {};

  function matchesChip(row) {
    for (var key in activeChips) {
      if (!activeChips[key]) continue;
      if (key === 'free' && row.dataset.free !== 'full') return false;
      if (key === 'live' && row.dataset.status !== 'live') return false;
      if (key === 'checked' && row.dataset.checked !== 'yes') return false;
      if (key === 'usd' && row.dataset.figure !== 'yes') return false;
      if (key === 'flags' && Number(row.dataset.flags || 0) === 0) return false;
    }
    return true;
  }

  function matchesSelects(row) {
    for (var i = 0; i < selects.length; i++) {
      var el = selects[i];
      var value = el.value;
      if (!value) continue;
      var field = el.getAttribute('data-filter');
      if (field === 'platform') {
        if ((row.dataset.platforms || '').indexOf(value) === -1) return false;
      } else if ((row.dataset[field] || '') !== value) {
        return false;
      }
    }
    return true;
  }

  function matchesSearch(row) {
    var q = (search && search.value ? search.value : '').trim().toLowerCase();
    if (!q) return true;
    var hay = (row.dataset.name || '') + ' ' + (row.dataset.short || '') + ' ' +
      (row.dataset.category || '') + ' ' + (row.dataset.prize || '');
    return q.split(/\s+/).every(function (term) { return hay.indexOf(term) !== -1; });
  }

  function apply() {
    var shown = 0;
    rows.forEach(function (row) {
      var ok = matchesSearch(row) && matchesSelects(row) && matchesChip(row);
      row.hidden = !ok;
      if (ok) shown++;
    });
    if (countEl) countEl.textContent = shown + ' of ' + rows.length + ' competitions shown';
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  function sortRows() {
    var mode = sort ? sort.value : 'source';
    var sorted = rows.slice().sort(function (a, b) {
      if (mode === 'prize') {
        return Number(b.dataset.usd || -1) - Number(a.dataset.usd || -1);
      }
      if (mode === 'name') {
        return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      }
      if (mode === 'verification') {
        var rank = { account: 0, eligibility: 1, kyc: 2, tax: 3 };
        return (rank[a.dataset.verif] || 9) - (rank[b.dataset.verif] || 9);
      }
      return Number(a.dataset.order) - Number(b.dataset.order);
    });
    sorted.forEach(function (row) { tbody.appendChild(row); });
  }

  if (search) {
    var timer;
    search.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(apply, 90);
    });
  }
  selects.forEach(function (el) { el.addEventListener('change', apply); });
  if (sort) sort.addEventListener('change', function () { sortRows(); apply(); });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var key = chip.getAttribute('data-chip');
      activeChips[key] = !activeChips[key];
      chip.setAttribute('aria-pressed', activeChips[key] ? 'true' : 'false');
      apply();
    });
  });

  var reset = document.getElementById('reset');
  if (reset) {
    reset.addEventListener('click', function () {
      if (search) search.value = '';
      selects.forEach(function (el) { el.value = ''; });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      activeChips = {};
      if (sort) sort.value = 'source';
      sortRows();
      apply();
    });
  }

  apply();
})();
