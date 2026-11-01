/* Prize Atlas — progressive enhancement.
   The site is fully readable without JavaScript: every table row is in the HTML.
   This file only adds search, filters and sorting on top of that markup. */
(function () {
  'use strict';

  var tables = Array.prototype.slice.call(document.querySelectorAll('[data-table]'));
  if (!tables.length) return;

  tables.forEach(function (root) {
    var tbody = root.querySelector('tbody');
    if (!tbody) return;

    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    rows.forEach(function (row, i) {
      row.dataset.i = String(i);
      var title = row.querySelector('.cell-title');
      row.dataset.name = (title ? title.textContent : row.textContent).trim().toLowerCase();
    });

    var controls = {
      q: root.querySelector('[data-filter="q"]'),
      cat: root.querySelector('[data-filter="cat"]'),
      tier: root.querySelector('[data-filter="tier"]'),
      flags: root.querySelector('[data-filter="flags"]'),
      sort: root.querySelector('[data-filter="sort"]')
    };
    var counter = root.querySelector('[data-count]');
    var scroll = root.querySelector('.table-scroll');

    var empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.hidden = true;
    empty.textContent = root.dataset.empty || 'No rows match those filters.';
    if (scroll && scroll.parentNode) scroll.parentNode.insertBefore(empty, scroll.nextSibling);

    function value(el) { return el ? el.value.trim() : ''; }

    function sortRows(list) {
      var mode = value(controls.sort);
      if (!mode) return list.slice().sort(function (a, b) { return Number(a.dataset.i) - Number(b.dataset.i); });
      if (mode === 'name') return list.slice().sort(function (a, b) { return a.dataset.name.localeCompare(b.dataset.name); });
      if (mode === 'prize') {
        return list.slice().sort(function (a, b) {
          return (Number(b.dataset.prize) || 0) - (Number(a.dataset.prize) || 0) ||
            a.dataset.name.localeCompare(b.dataset.name);
        });
      }
      if (mode === 'deadline') {
        return list.slice().sort(function (a, b) {
          var da = a.dataset.deadline || '';
          var db = b.dataset.deadline || '';
          if (!da && !db) return a.dataset.name.localeCompare(b.dataset.name);
          if (!da) return 1;
          if (!db) return -1;
          return da.localeCompare(db);
        });
      }
      return list;
    }

    function apply() {
      var q = value(controls.q).toLowerCase();
      var cat = value(controls.cat);
      var tier = value(controls.tier);
      var flag = value(controls.flags);

      var visible = rows.filter(function (row) {
        if (q && row.dataset.text.indexOf(q) === -1) return false;
        if (cat && row.dataset.cat !== cat) return false;
        if (tier && row.dataset.tier !== tier) return false;
        if (flag && (row.dataset.flags || '').indexOf(flag) === -1) return false;
        return true;
      });

      sortRows(visible).forEach(function (row) { tbody.appendChild(row); });

      rows.forEach(function (row) { row.hidden = true; });
      visible.forEach(function (row) { row.hidden = false; });

      if (counter) {
        var noun = root.querySelector('.data-table-verified') ? 'verified row' : 'listing';
        counter.textContent = 'Showing ' + visible.length + ' of ' + rows.length + ' ' + noun + (rows.length === 1 ? '' : 's');
      }
      if (empty) empty.hidden = visible.length > 0;
    }

    var timer;
    function onInput() {
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, 120);
    }

    if (controls.q) {
      controls.q.addEventListener('input', onInput);
      controls.q.addEventListener('search', apply);
    }
    ['cat', 'tier', 'flags', 'sort'].forEach(function (key) {
      if (controls[key]) controls[key].addEventListener('change', apply);
    });

    apply();
  });
})();
