/* Progressive enhancement only. Every page is fully readable with JavaScript off:
   the tables and links are static HTML; this adds search, filtering, sorting and the
   expandable detail panels. */
(function () {
  "use strict";

  var details = null;
  var detailsPromise = null;
  var rel = (document.body && document.body.dataset.rel) || "";

  /* Detail panels are fetched once, on first use, so that the 206-row catalogue page
     stays small enough to use on a phone. Nothing here is needed to read or click the
     tables — those are static HTML. */
  function loadDetails() {
    if (detailsPromise) return detailsPromise;
    detailsPromise = fetch(rel + "data/details.json", { cache: "force-cache" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) { details = j || {}; return details; })
      .catch(function () { details = {}; return details; });
    return detailsPromise;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function block(title, list) {
    if (!list || !list.length) return "";
    return "<h4>" + esc(title) + "</h4><ul>" +
      list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }

  function renderDetail(id) {
    var d = details[id];
    if (!d) return '<p class="blank">No further detail in the source data. If the table above is empty, the detail file failed to load — the essentials are still in the row.</p>';
    var kv = "";
    function row(k, v) {
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return;
      kv += "<dt>" + esc(k) + "</dt><dd>" + esc(Array.isArray(v) ? v.join(", ") : v) + "</dd>";
    }
    row("Prize (as published)", d.prizeUsd);
    row("Prize note", d.prizeNote);
    row("Cash-out", d.minCashout);
    row("Pays via", d.payoutMethods);
    row("Who can enter", d.eligibility);
    row("Blocked / limits", d.restricted);
    row("Verification level", d.verificationLevel);
    row("Last checked (source)", d.lastChecked);
    if (d.code) row("Code", d.code);

    var srcs = (d.sources || []).map(function (s) {
      return '<a href="' + esc(s.url) + '" rel="noopener noreferrer nofollow">' + esc(s.title || s.url) +
        "</a> <span class=\"badge\">" + esc(s.tier) + "</span>";
    });

    return '<div class="detail">' +
      (kv ? '<dl class="kv">' + kv + "</dl>" : "") +
      block("How to sign up", d.signupSteps) +
      block("How the competition works", d.howToWin) +
      block("How to get paid", d.howToGetMoney) +
      block("Identity / payout verification", d.verificationSteps) +
      block("Terms notes", d.tosNotes) +
      block("Watch-outs", d.redFlags) +
      (srcs.length ? "<h4>Sources recorded in the source data</h4><ul><li>" + srcs.join("</li><li>") + "</li></ul>" : "") +
      '<p class="blank" style="font-size:12px;margin-top:10px">Reproduced verbatim from the source catalogue; not re-verified unless this entry appears on the <a href="' +
      (document.body.dataset.rel || "") + 'verification.html">verification page</a>.</p>' +
      "</div>";
  }

  document.querySelectorAll("details.more").forEach(function (el) {
    var id = el.getAttribute("data-entry");
    var slot = el.querySelector(".detail-slot");
    var loaded = false;
    el.addEventListener("toggle", function () {
      if (!el.open || loaded || !slot) return;
      slot.innerHTML = '<p class="blank">Loading…</p>';
      loadDetails().then(function () {
        slot.innerHTML = renderDetail(id);
        loaded = true;
      });
    });
  });

  /* ---- filter + sort ---- */
  var table = document.getElementById("catalogue");
  if (!table) return;

  var rows = Array.prototype.slice.call(table.querySelectorAll(".row[data-id]"));
  var q = document.getElementById("q");
  var freeOnly = document.getElementById("freeOnly");
  var liveOnly = document.getElementById("liveOnly");
  var sortSel = document.getElementById("sort");
  var countEl = document.getElementById("shown");

  function apply() {
    var term = (q && q.value || "").trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (r) {
      var text = r.dataset.search || "";
      var ok = true;
      if (term && text.indexOf(term) === -1) ok = false;
      if (freeOnly && freeOnly.checked && r.dataset.free !== "full") ok = false;
      if (liveOnly && liveOnly.checked && r.dataset.live !== "1") ok = false;
      r.hidden = !ok;
      if (ok) shown++;
    });
    if (countEl) countEl.textContent = shown + " of " + rows.length;
  }

  [q, freeOnly, liveOnly].forEach(function (el) {
    if (!el) return;
    el.addEventListener(el.tagName === "INPUT" && el.type === "search" ? "input" : "change", apply);
  });

  if (sortSel) {
    sortSel.addEventListener("change", function () {
      var mode = sortSel.value;
      var sorted = rows.slice().sort(function (a, b) {
        if (mode === "name") return (a.dataset.name || "").localeCompare(b.dataset.name || "");
        if (mode === "score") return (+b.dataset.score || 0) - (+a.dataset.score || 0);
        var x = +a.dataset.prize, y = +b.dataset.prize;
        if (!x && !y) return (a.dataset.name || "").localeCompare(b.dataset.name || "");
        if (!x) return 1;
        if (!y) return -1;
        return y - x;
      });
      sorted.forEach(function (r) { table.appendChild(r); });
    });
  }

  apply();
  var hash = location.hash && location.hash.slice(1);
  if (hash) {
    var target = document.getElementById(hash);
    if (target) {
      var d = target.querySelector("details.more");
      if (d) { d.open = true; }
      target.scrollIntoView({ block: "center" });
    }
  }
})();
