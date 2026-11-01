(function () {
  const data = window.LEDGER;
  if (!data) return;

  const $ = (sel, root) => (root || document).querySelector(sel);

  const FREE_LABEL = {
    full: "Free USD path",
    partial: "Some free events",
    "paid-cash": "Cash needs entry fee"
  };
  const STATUS_LABEL = {
    live: "Active",
    mixed: "Mixed",
    caution: "Caution",
    ended: "Ended / out of season",
    inactive: "Inactive / closed"
  };
  const VERIFY_LABEL = {
    account: "Account only",
    eligibility: "Eligibility check",
    kyc: "Full KYC",
    tax: "Tax paperwork"
  };

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function typeName(id) {
    const t = data.types.find((x) => x.id === id);
    return t ? t.name : id;
  }

  function isNew(id) {
    return (data.addedThisPass || []).includes(id) || (data.addedThisPassC || []).includes(id);
  }

  function detailBlock(summary, list) {
    if (!list || !list.length) return "";
    const items = list.map((s) => `<li>${esc(s)}</li>`).join("");
    return `<details class="block"><summary>${esc(summary)}</summary><ul>${items}</ul></details>`;
  }

  function card(item) {
    const plat = (item.platforms || []).map((p) => (p === "ios" ? "iOS app" : "Browser")).join(", ");
    const tosNotes = item.tosNotes && item.tosNotes.length ? detailBlock("Terms notes", item.tosNotes) : "";
    const redFlags = item.redFlags && item.redFlags.length ? detailBlock("Watch-outs", item.redFlags) : "";
    const code = item.code ? `<p class="code">League / promo code: <b>${esc(item.code)}</b></p>` : "";

    const links = [];
    if (item.signupUrl) links.push(`<a class="btn primary" href="${esc(item.signupUrl)}" rel="noopener noreferrer">Official site →</a>`);
    if (item.iosUrl) links.push(`<a class="btn" href="${esc(item.iosUrl)}" rel="noopener noreferrer">iOS App Store</a>`);
    if (item.rulesUrl && item.rulesUrl !== item.signupUrl) links.push(`<a class="btn" href="${esc(item.rulesUrl)}" rel="noopener noreferrer">Rules</a>`);
    if (item.tosUrl && item.tosUrl !== item.rulesUrl && item.tosUrl !== item.signupUrl) links.push(`<a class="btn" href="${esc(item.tosUrl)}" rel="noopener noreferrer">Terms</a>`);
    (item.sources || []).forEach((s) => links.push(`<a class="btn subtle" href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.title)}</a>`));

    return `
      <article class="card" id="${esc(item.id)}">
        <header class="card-head">
          <h3>${esc(item.name)}</h3>
          <p class="short">${esc(item.short)}</p>
        </header>
        <div class="badges">
          ${isNew(item.id) ? `<span class="badge badge-new">New</span>` : ""}
          <span class="badge status-${esc(item.status)}">${esc(STATUS_LABEL[item.status])}</span>
          <span class="badge free-${esc(item.freePath)}">${esc(FREE_LABEL[item.freePath])}</span>
          <span class="badge">${esc(typeName(item.type))}</span>
          ${plat ? `<span class="badge">${esc(plat)}</span>` : ""}
          <span class="badge">${esc(VERIFY_LABEL[item.verification.level])}</span>
        </div>
        <div class="meta">
          <div><b>Prize</b>${esc(item.prizeUsd)}</div>
          <div><b>Cash-out floor</b>${esc(item.minCashout)}</div>
          <div><b>Pays via</b>${esc((item.payoutMethods || []).join(", "))}</div>
          <div><b>Who can enter</b>${esc(item.eligibility)}</div>
          <div><b>Blocked / limits</b>${esc(item.restricted)}</div>
          <div><b>Last checked</b>${esc(item.lastChecked)}</div>
        </div>
        ${item.prizeNote ? `<p class="prize-note">${esc(item.prizeNote)}</p>` : ""}
        ${code}
        ${detailBlock("How to sign up", item.signupSteps)}
        ${detailBlock("How the competition works", item.howToWin)}
        ${detailBlock("How to get paid", item.howToGetMoney)}
        ${detailBlock("Verification", item.verification.steps)}
        ${tosNotes}
        ${redFlags}
        <div class="links">${links.join("")}</div>
      </article>`;
  }

  function render() {
    const list = data.listings;
    const nav = $("#jumpnav");
    const grid = $("#cards");

    const order = data.types;
    const byType = {};
    list.forEach((item) => {
      (byType[item.type] = byType[item.type] || []).push(item);
    });

    // Build the jump nav with counts.
    nav.innerHTML = order
      .filter((t) => byType[t.id] && byType[t.id].length)
      .map((t) => `<a class="jump" href="#sec-${esc(t.id)}">${esc(t.name)} <span>${byType[t.id].length}</span></a>`)
      .join("");

    // Build the grouped list.
    grid.innerHTML = order
      .map((t) => {
        const items = byType[t.id] || [];
        if (!items.length) return "";
        return `
          <section class="group" id="sec-${esc(t.id)}">
            <h2 class="group-h">${esc(t.name)} <small>${items.length}</small></h2>
            ${items.map(card).join("")}
          </section>`;
      })
      .join("");

    fillStats();
  }

  function fillStats() {
    const list = data.listings;
    $("#statTotal").textContent = String(list.length);
    $("#statFree").textContent = String(list.filter((i) => i.freePath === "full").length);
    $("#statIos").textContent = String(list.filter((i) => (i.platforms || []).includes("ios") && i.status !== "inactive" && i.status !== "ended").length);
    $("#statNew").textContent = String((data.addedThisPassC || data.addedThisPass || []).length);
  }

  render();
})();
