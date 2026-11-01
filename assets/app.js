/**
 * Prize Atlas — progressive enhancement only.
 *
 * The HTML is fully pre-rendered: every table row and every value is already in the
 * document, so the site works with JavaScript disabled and by direct file open.
 * This script only hides rows that do not match the current filters.
 */
(function () {
  'use strict';

  var q = document.getElementById('f-q');
  var evidence = document.getElementById('f-evidence');
  var free = document.getElementById('f-free');
  var category = document.getElementById('f-cat');
  var meta = document.getElementById('table-meta');
  var table = document.querySelector('table[data-filterable] tbody');
  if (!table) return;

  var rows = Array.prototype.slice.call(table.querySelectorAll('tr'));

  function normalise(value) {
    return (value || '').toLowerCase().trim();
  }

  function matches(row) {
    var term = normalise(q && q.value);
    if (term) {
      var haystack = normalise(row.getAttribute('data-search'));
      if (haystack.indexOf(term) === -1) return false;
    }
    var ev = evidence && evidence.value;
    if (ev && row.getAttribute('data-status') !== ev) return false;
    var fr = free && free.value;
    if (fr === 'blank') {
      if (row.getAttribute('data-free')) return false;
    } else if (fr && row.getAttribute('data-free') !== fr) {
      return false;
    }
    var cat = category && category.value;
    if (cat && row.getAttribute('data-category') !== cat) return false;
    return true;
  }

  function apply() {
    var shown = 0;
    rows.forEach(function (row) {
      var ok = matches(row);
      row.hidden = !ok;
      if (ok) shown += 1;
    });
    if (meta) {
      meta.innerHTML = '<b>' + shown + '</b> of ' + rows.length + ' rows shown';
    }
  }

  [q, evidence, free, category].forEach(function (control) {
    if (!control) return;
    control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', apply);
  });

  // Reset filters when the page is restored from the back/forward cache.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) apply();
  });

  apply();
})();
