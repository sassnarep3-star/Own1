#!/usr/bin/env python3
"""Static site generator for the Free Cash Competition Ledger.

Inputs (all in this repo, all reproducible):
  data/ledger.json        mirrored catalogue of 206 listings (verbatim from the reference site)
  data/verification.json  official-source evidence gathered this pass (12 rows, quoted)
  data/audit.json         output of tools/audit.py (deterministic integrity findings)

Output: plain HTML at the repository root + category/*.html. No frameworks, no build
service, no JavaScript required to read the data. Deployed by GitHub Pages from main /.

Run:  python3 tools/build_site.py
"""
from __future__ import annotations

import html
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://sassnarep3-star.github.io/Own1/"
SITE_NAME = "Free Cash Competition Ledger"
BUILD_DATE = "2026-11-01"

LEDGER = json.loads((ROOT / "data" / "ledger.json").read_text(encoding="utf-8"))
VER = json.loads((ROOT / "data" / "verification.json").read_text(encoding="utf-8"))
AUDIT = json.loads((ROOT / "data" / "audit.json").read_text(encoding="utf-8"))

LISTINGS = LEDGER["listings"]
TYPES = LEDGER["types"]
TYPE_BY_ID = {t["id"]: t for t in TYPES}
LEVELS = {v["id"]: v for v in LEDGER.get("verificationLevels", [])}
VER_BY_ID = {e["id"]: e for e in VER["entries"]}
STATS = AUDIT["stats"]
FINDINGS = AUDIT["findings"]

FREE_LABEL = {
    "full": "Free to enter (per catalogue)",
    "partial": "Some free events",
    "paid-cash": "Cash needs an entry fee",
}
STATUS_LABEL = {
    "live": "Live",
    "mixed": "Mixed",
    "caution": "Caution",
    "ended": "Ended / out of season",
    "inactive": "Inactive",
}
VER_LABEL = {
    "verified": "Verified",
    "partially-verified": "Partly verified",
    "contradicted": "Contradicted",
    "not-verified": "Not verified",
}

# ---------------------------------------------------------------------------
# Editorial weighting. Every number here is a stated editorial choice, not a
# measurement. It is published on the methodology page so it can be argued with.
# ---------------------------------------------------------------------------
AGENT_LEVERAGE = {  # how much a coding/research agent can plausibly improve your output
    "tech": 15,
    "forecasting": 12,
    "creative": 8,
    "market": 6,
    "sports": 5,
    "trivia": 4,
    "skill": 4,
    "directory": 0,
    "pools": 0,
}
AGENT_FIT_LABEL = {
    "tech": "High", "forecasting": "High", "creative": "Situational",
    "market": "Low", "sports": "Low", "trivia": "Low", "skill": "Low",
    "directory": "Not a contest", "pools": "Not a contest",
}
FRICTION = {"account": 10, "eligibility": 7, "kyc": 3, "tax": 3}
MAX_SCORE = 30 + 15 + 20 + 15 + 10


def esc(value) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


def score(x: dict) -> tuple[int, list[str]]:
    """Deterministic priority score with its component breakdown."""
    parts: list[str] = []
    v = VER_BY_ID.get(x["id"])
    status = x["status"]
    free = x["freePath"]

    # 1. free entry, weighted by evidence quality (max 30)
    entry = 0
    if v and v["status"] == "verified" and "entry_fee" in v["fields"]:
        entry = 30
        parts.append("free entry confirmed on the operator's page (+30)")
    elif v and v["status"] == "contradicted" and "freePath" in (v.get("contradicted_fields") or []):
        entry = 0
        parts.append("free entry contradicted by the operator's page (+0)")
    elif free == "full":
        entry = 18
        parts.append("catalogue says free, not confirmed this pass (+18)")
    elif free == "partial":
        entry = 8
        parts.append("some free events only (+8)")

    # 2. can you enter it today (max 15)
    avail = 0
    if status == "live":
        avail = 15
        parts.append("live (+15)")
    elif status == "caution":
        avail = 8
        parts.append("live with caution (+8)")
    elif status == "mixed":
        avail = 5
        parts.append("mixed free/paid product (+5)")
    else:
        parts.append("ended / out of season (+0)")
    if v and v["status"] == "contradicted" and "status" in (v.get("contradicted_fields") or []):
        avail = 0
        parts.append("availability contradicted by operator page, reset to +0")

    # 3. is the money documented on an official page (max 20)
    prize_pts = 0
    if v and v.get("prize_top") and "prize_text" not in (v.get("contradicted_fields") or []):
        prize_pts = 20
        parts.append("prize documented on official page (+20)")
    elif re.search(r"\$\s?\d", x.get("prizeUsd", "")):
        prize_pts = 10
        parts.append("dollar figure published but unverified (+10)")
    else:
        parts.append("no documented figure (+0)")

    # 4. editorial: can an agent move the needle (max 15)
    agent = AGENT_LEVERAGE.get(x["type"], 0)
    parts.append(f"{TYPE_BY_ID[x['type']]['name']} agent leverage ({agent:+d})")

    # 5. friction to get paid (max 10)
    friction = FRICTION.get(x["verification"]["level"], 0)
    parts.append(f"{LEVELS.get(x['verification']['level'], {}).get('name', 'unknown')} friction (+{friction})")

    total = entry + avail + prize_pts + agent + friction
    return round(total / MAX_SCORE * 100), parts


SCORES = {x["id"]: score(x) for x in LISTINGS}

# ---------------------------------------------------------------------------
# shell
# ---------------------------------------------------------------------------
NAV = [
    ("index.html", "Dashboard"),
    ("best-picks.html", "Best picks"),
    ("all.html", "All 206"),
    ("verification.html", "Verification"),
    ("flagged.html", f"Flagged ({len(FINDINGS) + 2})"),
    ("methodology.html", "Method"),
    ("executive-summary.html", "Summary"),
    ("sources.html", "Sources"),
    ("cross-session.html", "Cross-session"),
]


def shell(title: str, description: str, rel: str, body: str, current: str, extra_head: str = "") -> str:
    def cur(href: str) -> str:
        return ' aria-current="page"' if href == current else ""

    nav = "".join(
        f'<a href="{rel}{href}"{cur(href)}>{esc(label)}</a>' for href, label in NAV
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%230f766e'/><text x='18' y='45' font-size='36' font-family='monospace' fill='white'>$</text></svg>">
<link rel="stylesheet" href="{rel}assets/css/style.css">
{extra_head}</head>
<body data-rel="{rel}">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="top-inner">
    <a class="brand" href="{rel}index.html">
      <span class="mark">$</span>
      <span>Free Cash Ledger<small>206 competitions · verified {BUILD_DATE}</small></span>
    </a>
    <nav class="main" aria-label="Main">{nav}</nav>
  </div>
</header>
<div class="wrap" id="main">
{body}
<footer class="site">
  <p><b>{esc(SITE_NAME)}</b> — an independent catalogue mirroring the “Free Money &amp; Contest Ledger”
  (<a href="https://karagemop466-tech.github.io/FreeMoneyApps/" rel="noopener noreferrer">reference site</a>)
  with per-row source links and a separate verification layer.</p>
  <p>Not affiliated with any listed operator. Official rules always win. US federal tax reporting generally
  applies to prizes of $600 or more — confirm with a tax professional. Nothing here is legal or financial advice.
  Sweepstakes and casino-style gambling products are out of scope.</p>
  <p>Data as published by the reference catalogue on 2026-08-19 (pass “S”), audited and partly re-verified on
  {BUILD_DATE}. Prize amounts change; open the operator’s rules before you enter.
  <a href="{rel}methodology.html">Method &amp; limits</a> · <a href="{rel}flagged.html">Flagged for review</a> ·
  <a href="{rel}sources.html">Sources</a> · <a href="{rel}cross-session.html">Cross-session</a></p>
  <p><b>Built in parallel with other agent sessions.</b> Their pages still ship and are linked here:
  <a href="{rel}review.html">their review queue</a> ·
  <a href="{rel}supplemental/index.html">their supplemental evidence</a> ·
  <a href="https://github.com/sassnarep3-star/Own1/blob/main/research/SOURCES.md" rel="noopener noreferrer">their source audit</a>.</p>
</footer>
</div>
<script src="{rel}assets/js/site.js"></script>
</body>
</html>
"""


def badge(text: str, cls: str = "") -> str:
    return f'<span class="badge {cls}">{esc(text)}</span>'


def ver_badge(x: dict) -> str:
    v = VER_BY_ID.get(x["id"])
    if not v:
        return badge("source data only", "b-unverified")
    cls = {"verified": "b-verified", "contradicted": "b-contradicted",
           "partially-verified": "b-partially"}.get(v["status"], "b-unverified")
    return badge(VER_LABEL[v["status"]], cls)


def prize_cell(x: dict, rel: str = "") -> str:
    v = VER_BY_ID.get(x["id"])
    if v and v.get("prize_top") and "prize_text" not in (v.get("contradicted_fields") or []):
        p = v["prize_top"]
        amount = f"{p['currency']} {p['amount']:,}"
        return f'<span class="prize"><b>{esc(amount)}</b><br><a href="{esc(rel)}verification.html#{esc(x["id"])}">quote &amp; scope →</a></span>'
    if v and v["status"] == "contradicted" and "prize_text" in (v.get("contradicted_fields") or []):
        return '<span class="prize blank">withheld — catalogue figure contradicted</span>'
    return '<span class="prize blank">not verified this pass</span>'


def free_cell(x: dict) -> str:
    v = VER_BY_ID.get(x["id"])
    cls = {"full": "b-free", "partial": "b-partial", "paid-cash": "b-paid"}[x["freePath"]]
    out = badge(FREE_LABEL[x["freePath"]], cls)
    if v and "freePath" in (v.get("contradicted_fields") or []):
        out += badge("contradicted: fee applies", "b-contradicted")
    return out


def links_cell(x: dict) -> str:
    out = [f'<a class="btn primary" href="{esc(x["signupUrl"])}" rel="noopener noreferrer nofollow">Official site ↗</a>']
    if x.get("rulesUrl") and x["rulesUrl"] != x["signupUrl"]:
        out.append(f'<a class="btn" href="{esc(x["rulesUrl"])}" rel="noopener noreferrer nofollow">Rules ↗</a>')
    if x.get("tosUrl") and x["tosUrl"] not in (x["signupUrl"], x.get("rulesUrl")):
        out.append(f'<a class="btn" href="{esc(x["tosUrl"])}" rel="noopener noreferrer nofollow">Terms ↗</a>')
    if x.get("iosUrl"):
        out.append(f'<a class="btn" href="{esc(x["iosUrl"])}" rel="noopener noreferrer nofollow">iOS ↗</a>')
    return '<div class="links">' + "".join(out) + "</div>"


def detail_json(x: dict) -> dict:
    return {
        "prizeUsd": x.get("prizeUsd", ""),
        "prizeNote": x.get("prizeNote", ""),
        "minCashout": x.get("minCashout", ""),
        "payoutMethods": x.get("payoutMethods", []),
        "eligibility": x.get("eligibility", ""),
        "restricted": x.get("restricted", ""),
        "verificationLevel": LEVELS.get(x["verification"]["level"], {}).get("name", ""),
        "verificationSteps": x["verification"].get("steps", []),
        "lastChecked": x.get("lastChecked", ""),
        "code": x.get("code", ""),
        "signupSteps": x.get("signupSteps", []),
        "howToWin": x.get("howToWin", []),
        "howToGetMoney": x.get("howToGetMoney", []),
        "tosNotes": x.get("tosNotes", []),
        "redFlags": x.get("redFlags", []),
        "sources": x.get("sources", []),
    }


def row_html(x: dict, rel: str = "") -> str:
    s, _ = SCORES[x["id"]]
    search = " ".join([x["id"], x["name"], x.get("short", ""), TYPE_BY_ID[x["type"]]["name"],
                       STATUS_LABEL.get(x["status"], ""), x.get("prizeUsd", "")]).lower()
    prize_num = 0
    v = VER_BY_ID.get(x["id"])
    if v and v.get("prize_top"):
        prize_num = v["prize_top"]["amount"]
    return f"""      <div class="row" id="{esc(x['id'])}" data-id="{esc(x['id'])}" data-name="{esc(x['name'])}"
           data-free="{esc(x['freePath'])}" data-live="{1 if x['status'] == 'live' else 0}"
           data-score="{s}" data-prize="{prize_num}" data-search="{esc(search)}">
        <div class="cell">
          <div class="name"><a href="#{esc(x['id'])}">{esc(x['name'])}</a></div>
          <p class="short">{esc(x.get('short', ''))}</p>
          <div class="badges">
            {badge(TYPE_BY_ID[x['type']]['name'])}
            {badge(STATUS_LABEL.get(x['status'], x['status']), 'b-' + esc(x['status']))}
            {ver_badge(x)}
          </div>
          <details class="more" data-entry="{esc(x['id'])}">
            <summary>Details</summary>
            <div class="detail-slot"></div>
          </details>
        </div>
        <div class="cell"><span class="lbl">Free to enter</span>{free_cell(x)}</div>
        <div class="cell"><span class="lbl">Prize (as published)</span>
          <div class="prize">{esc(x.get('prizeUsd', ''))}</div></div>
        <div class="cell"><span class="lbl">Verified prize</span>{prize_cell(x, rel)}</div>
        <div class="cell"><span class="lbl">Official source</span>
          {links_cell(x)}
          {badge('priority ' + str(s) + '/100')}
        </div>
      </div>"""


def table_block(rows: list[dict], page_id: str, *, rel: str = "", show_toolbar: bool = True) -> str:
    rows = sorted(rows, key=lambda x: (-SCORES[x['id']][0], x['name']))
    toolbar = ""
    if show_toolbar:
        toolbar = """  <div class="toolbar">
    <input id="q" type="search" placeholder="Search name, category, prize…" aria-label="Search competitions">
    <label class="chip"><input type="checkbox" id="freeOnly"> Free to enter only</label>
    <label class="chip"><input type="checkbox" id="liveOnly"> Live only</label>
    <select id="sort" aria-label="Sort">
      <option value="score">Sort: priority score</option>
      <option value="prize">Sort: verified prize</option>
      <option value="name">Sort: name</option>
    </select>
    <span class="count" id="shown">—</span>
  </div>
"""
    return f"""  <div class="legend" style="font-size:12.5px;color:#64748b;margin:0 0 10px;line-height:1.9">
    <b style="color:#101828">Legend</b> ·
    <span class="badge b-free">Free to enter</span> catalogue says entry is free ·
    <span class="badge b-partial">Some free events</span> mixed ·
    <span class="badge b-paid">Cash needs an entry fee</span> ·
    <span class="badge b-verified">Verified</span> checked against the operator’s page ·
    <span class="badge b-partially">Partly verified</span> some fields only ·
    <span class="badge b-contradicted">Contradicted</span> operator page disagrees ·
    <span class="badge b-unverified">Source data only</span> not re-checked.
    “Prize (as published)” is the catalogue’s own wording; “Verified prize” is only filled from a quoted official page.
  </div>
{toolbar}  <div class="table" id="catalogue">
    <div class="thead">
      <div>Competition</div><div>Free to enter</div><div>Prize (as published)</div>
      <div>Verified prize</div><div>Official source</div>
    </div>
{chr(10).join(row_html(x, rel) for x in rows)}
  </div>
"""


# ---------------------------------------------------------------------------
# pages
# ---------------------------------------------------------------------------
def page_dashboard() -> str:
    enterable = [x for x in LISTINGS if x["freePath"] == "full" and x["status"] in ("live", "caution")]
    verified_rows = [x for x in LISTINGS if x["id"] in VER_BY_ID and VER_BY_ID[x["id"]]["status"] == "verified"]
    contradicted = [x for x in LISTINGS if VER_BY_ID.get(x["id"], {}).get("status") == "contradicted"]
    top = sorted((x for x in LISTINGS if SCORES[x["id"]][0] > 0), key=lambda x: -SCORES[x["id"]][0])[:5]

    type_cards = "".join(
        f"""    <a class="card" href="category/{esc(t['id'])}.html">
      <div class="n">{STATS['by_type'].get(t['id'], 0)}</div>
      <h3>{esc(t['name'])}</h3>
      <p>{esc(t.get('blurb', ''))}</p>
      <div class="bar"><i style="width:{round(100 * STATS['by_type'].get(t['id'], 0) / stats_max())}%"></i></div>
      <p><small>{free_live(t['id'])} free &amp; live · agent fit: {esc(AGENT_FIT_LABEL[t['id']])}</small></p>
    </a>"""
        for t in TYPES
    )

    picks = "".join(
        f"""      <tr>
        <td><b>{i + 1}</b></td>
        <td><a href="category/{esc(x['type'])}.html#{esc(x['id'])}">{esc(x['name'])}</a><br><small>{esc(TYPE_BY_ID[x['type']]['name'])}</small></td>
        <td>{esc(prize_short(x))}</td>
        <td>{esc(VER_BY_ID[x['id']]['fields'].get('entry_fee', {}).get('value', 'see catalogue')) if x['id'] in VER_BY_ID else 'catalogue only'}</td>
        <td><code>{SCORES[x['id']][0]}</code></td>
        <td><a href="{esc(x['signupUrl'])}" rel="noopener noreferrer nofollow">Official ↗</a></td>
      </tr>"""
        for i, x in enumerate(top)
    )

    body = f"""
<section class="hero">
  <p class="kicker">Dashboard · built {BUILD_DATE}</p>
  <h1 class="page">Free-to-enter competitions that can pay real cash — organised, sourced, and honest about what we have not checked.</h1>
  <p class="lede">This is a working desk, not a tip jar. Every one of the {STATS['listings']} competitions below is
  linked to its operator’s own page, tagged with whether entry is genuinely free, and marked when the prize
  could not be confirmed from an official source. {STATS['free_and_enterable_today']} can be entered today without
  paying a fee according to the catalogue; {len(VER_BY_ID)} rows were re-checked line by line this pass and
  {len(contradicted)} of those turned out to be wrong.</p>
  <div class="stats">
    <div class="stat"><b>{STATS['listings']}</b><span>competitions catalogued</span></div>
    <div class="stat"><b>{STATS['free_and_enterable_today']}</b><span>free &amp; enterable today</span></div>
    <div class="stat"><b>{len(VER_BY_ID)}</b><span>re-verified vs official page</span></div>
    <div class="stat"><b>{len(contradicted)}</b><span>contradicted by the source</span></div>
    <div class="stat"><b>{len(FINDINGS)}</b><span>integrity findings</span></div>
    <div class="stat"><b>{STATS['status'].get('ended', 0)}</b><span>listed but out of season</span></div>
  </div>
  <div class="notice warn">
    <b>Read this before you spend time.</b> The catalogue we were given is not a ranked list of winners — it is a
    long inventory in which the biggest section (sports pick’em, {STATS['by_type'].get('sports', 0)} rows) is also
    the one with the smallest cash prizes and the least use for a coding agent. The rows where an AI assistant can
    genuinely raise your odds are concentrated in <a href="category/tech.html">tech &amp; data</a>
    ({STATS['by_type'].get('tech', 0)}), <a href="category/forecasting.html">forecasting</a>
    ({STATS['by_type'].get('forecasting', 0)}) and judged <a href="category/creative.html">creative</a>
    ({STATS['by_type'].get('creative', 0)}) contests. <a href="best-picks.html">Start with the ranked shortlist →</a>
  </div>
</section>

<h2 class="sec">Where the money is, by category</h2>
<p class="sub">Counts come straight from the mirrored data. Nothing is estimated.</p>
<div class="cards">
{type_cards}
</div>

<h2 class="sec">Top five to spend time on</h2>
<p class="sub">Computed from the published priority heuristic — free entry evidence, availability, documented prize,
agent leverage and payout friction. <a href="best-picks.html">Full ranking and the weighting →</a></p>
<div class="table"><table class="prose" style="width:100%;border-collapse:collapse">
  <thead><tr><th>#</th><th>Competition</th><th>Verified prize</th><th>Free entry</th><th>Score</th><th>Link</th></tr></thead>
  <tbody>
{picks}
  </tbody>
</table></div>

<h2 class="sec">What this pass actually found</h2>
<div class="prose">
<ul>
  <li><b>One row sells entry as free but charges money.</b> The Tom Howard/Margaret Reid Poetry Contest is tagged
  “Free USD path” and “live”; its own page states a <b>$27 entry fee</b> and that entries are closed until
  April 15, 2027. <a href="verification.html#tom-howard-poetry">Evidence →</a></li>
  <li><b>One row’s prize ladder does not match 2026 sources.</b> Weather Photographer of the Year is free to enter,
  but the catalogue’s £5,000 / £2,500 / £750 prizes conflict with two independent 2026 listings. The verified
  prize is left blank rather than guessed. <a href="verification.html#weather-potw">Evidence →</a></li>
  <li><b>{FINDINGS[0]['count']} of {STATS['listings']} rows cite no official source at all</b> — eight Fantasy
  Premier League mini-leagues sourced to affiliate blogs and Reddit, plus four demo-trading contests and one
  fantasy league cited only to third-party sites. <a href="flagged.html">All findings →</a></li>
  <li><b>{STATS['status'].get('ended', 0)} rows are out of season</b>, and 26 of them are still counted in the
  reference site’s headline “free path” number. <b>{next((f['count'] for f in FINDINGS if f['rule'] == 'R4'), 0)} rows are
  pool tools or directories</b>, not competitions with a prize of their own.</li>
  <li><b>{STATS['free_and_enterable_today']} rows can plausibly be entered free today</b>, but only
  {len(verified_rows)} were confirmed against an operator page in this pass. The rest are marked
  <span class="badge b-unverified">source data only</span> on purpose — see
  <a href="methodology.html">method &amp; limits</a>.</li>
</ul>
</div>

<h2 class="sec">Deadlines worth knowing today</h2>
<div class="notice bad">
  <b>Time-sensitive, from a parallel session’s source audit</b> (quoted, not re-read by this one):
  ARC Prize 2026 submission deadline <b>2026-11-02</b> with a paper deadline <b>2026-11-08</b>;
  Metaculus US Midterms 2026 (<b>$10,000</b> pool) closing around <b>2026-11-04</b>;
  DrivenData’s GEMS Prize Challenge (<b>$300,000</b>) ending <b>2026-12-03</b> 23:59 UTC.
  <a href="cross-session.html">Sources and attribution →</a>
</div>

<h2 class="sec">How to use the tables</h2>
<div class="prose">
<p>Every row carries: the operator’s own link, the free-entry label, the prize <i>as the catalogue published it</i>,
and a separate column for what we could confirm from an official page. Where we could not confirm an amount, the
verified column says so instead of showing a number. Tap <b>Details</b> on a row for signup steps, payout rails,
identity checks and the source data’s own watch-outs. Search, filter and sort work without reloading.</p>
</div>
"""
    return shell(f"{SITE_NAME} — 206 free-to-enter cash competitions, sourced and verified",
                 "A mobile-first dashboard of 206 free-to-enter competitions that can pay real cash, with an official "
                 "source link on every row, per-row verification, and every irregularity flagged.", "", body, "index.html")


def stats_max() -> int:
    return max(STATS["by_type"].values())


def free_live(tid: str) -> int:
    return sum(1 for x in LISTINGS if x["type"] == tid and x["freePath"] == "full" and x["status"] in ("live", "caution"))


def prize_short(x: dict) -> str:
    v = VER_BY_ID.get(x["id"])
    if v and v.get("prize_top") and "prize_text" not in (v.get("contradicted_fields") or []):
        p = v["prize_top"]
        return f"{p['currency']} {p['amount']:,}"
    return "not verified"


def page_best_picks() -> str:
    ranked = sorted((x for x in LISTINGS if SCORES[x["id"]][0] > 0), key=lambda x: (-SCORES[x["id"]][0], x["name"]))
    top = ranked[:25]
    rows = "".join(
        f"""      <tr>
        <td><b>{i + 1}</b></td>
        <td><a href="category/{esc(x['type'])}.html#{esc(x['id'])}">{esc(x['name'])}</a><br><small>{esc(TYPE_BY_ID[x['type']]['name'])} · {esc(STATUS_LABEL[x['status']])}</small></td>
        <td><code>{SCORES[x['id']][0]}</code></td>
        <td>{esc(prize_short(x))}</td>
        <td>{esc('confirmed free' if (x['id'] in VER_BY_ID and 'entry_fee' in VER_BY_ID[x['id']]['fields']) else FREE_LABEL[x['freePath']])}</td>
        <td>{esc(AGENT_FIT_LABEL[x['type']])}</td>
        <td><a href="{esc(x['signupUrl'])}" rel="noopener noreferrer nofollow">Official ↗</a></td>
      </tr>"""
        for i, x in enumerate(top)
    )

    breakdown = "".join(
        f"<li><b>{esc(x['name'])}</b> — score {SCORES[x['id']][0]}: " + "; ".join(esc(p) for p in SCORES[x['id']][1]) + "</li>"
        for x in top[:10]
    )

    body = f"""
<section class="hero">
  <p class="kicker">Ranked shortlist</p>
  <h1 class="page">Where to spend your time first.</h1>
  <p class="lede">Ranked by a published, reproducible heuristic — not by vibes, and not by the size of the headline
  prize. The single biggest factor is whether the operator’s own page confirms free entry, because a
  pay-to-enter “free” competition costs you money every time you lose.</p>
</section>

<div class="notice">
  <b>The score is editorial.</b> Five components, all published: confirmed free entry (0–30), enterable today
  (0–15), prize documented on an official page (0–20), how much a coding agent can plausibly help (0–15, set per
  category), and payout friction (0–10). It is a way to sort 206 rows, not a forecast of your odds.
  <a href="methodology.html">The exact weights →</a>
</div>

<h2 class="sec">The shortlist</h2>
<p class="sub">Top 25 of {len(ranked)} rows with a non-zero score. Full component breakdown below.</p>
<div class="tablewrap prose">
<table>
  <thead><tr><th>#</th><th>Competition</th><th>Score</th><th>Verified prize</th><th>Entry</th><th>Agent fit</th><th>Link</th></tr></thead>
  <tbody>
{rows}
  </tbody>
</table>
</div>

<h2 class="sec">Why these, in the order of the score</h2>
<div class="prose"><ul>{breakdown}</ul></div>

<h2 class="sec">What an AI coding agent can and cannot do here</h2>
<div class="prose">
<p>This is the part the original catalogue does not answer, and it changes the strategy:</p>
<ul>
  <li><b>Tech &amp; data (14 rows) — the best fit by a wide margin.</b> Kaggle, DrivenData, AIcrowd, Zindi and
  friends reward a reproducible pipeline, careful validation and fast iteration, which is exactly what an agent
  multiplies. Prizes are the largest in the catalogue (DrivenData currently shows a $300,000 challenge; Kaggle
  hackathons show $35,000–$450,000 labels), and entry is open to anyone.</li>
  <li><b>Forecasting (3 rows) — the most under-rated.</b> Metaculus states you can “participate for free and win
  cash prizes”, and two of its $50,000 pools (Summer and Fall 2026 FutureEval) are explicitly <i>bot tournaments</i>. Read that as a formal
  invitation to bring an automated system. Prize pools are smaller but the field is thinner than Kaggle’s.</li>
  <li><b>Judged creative (18 rows) — situational, and often banned.</b> Photo and writing prizes pay well and are
  free to enter, but Winning Writers’ rules, for example, state that entries “may not contain any AI-generated
  text”. Check the AI clause before pointing an agent at a creative prize.</li>
  <li><b>Sports pick’em (129 rows) — volume, not value.</b> Two-thirds of the catalogue. Free, fun, low prize per
  entry, and almost entirely luck: an agent adds little. Pick one or two pools you already follow.</li>
  <li><b>Market / demo trading (19 rows) — mostly not cash you can withdraw.</b> Many “prizes” are trading
  bonuses or account credits, and several rows are sourced only to affiliate pages. Treat these as practice
  environments, not income.</li>
</ul>
<p><b>Practical sequencing:</b> one tech contest (Kaggle or DrivenData) as the main effort, one Metaculus
tournament as the low-cost second, and one free creative prize only if its rules permit assisted drafting.</p>
</div>
"""
    return shell("Best free-to-enter cash competitions, ranked — Free Cash Ledger",
                 "A transparent priority ranking of free-to-enter competitions that pay cash, with the scoring "
                 "components shown for every row.", "", body, "best-picks.html")


def page_all() -> str:
    body = f"""
<section class="hero">
  <p class="kicker">Full catalogue</p>
  <h1 class="page">All {len(LISTINGS)} competitions.</h1>
  <p class="lede">Every row from the reference catalogue, with its operator link, its free-entry label, the prize as
  originally published, and a separate column for what was actually verified. Search and filters work on the page;
  the data is static HTML underneath.</p>
</section>
<div class="notice">
  <b>Column discipline.</b> “Prize (as published)” is copied from the source catalogue and is <i>not</i> a verified
  claim. “Verified prize” is only filled where an official page was read on {BUILD_DATE} and the quote is on
  <a href="verification.html">the verification page</a>. Blank means blank — never inferred.
</div>
{table_block(LISTINGS, 'all', rel='')}
<p style="font-size:13px;color:#64748b;margin-top:14px">Sorted by priority score by default. Rows marked
<span class="badge b-unverified">source data only</span> have not been re-checked against the operator this pass.</p>
"""
    return shell(f"All {len(LISTINGS)} free-to-enter cash competitions — Free Cash Ledger",
                 "The complete 206-row catalogue with an official source link on every row, searchable and filterable.",
                 "", body, "all.html")


def page_category(t: dict) -> str:
    rows = [x for x in LISTINGS if x["type"] == t["id"]]
    rows.sort(key=lambda x: -SCORES[x["id"]][0])
    free_live_n = free_live(t["id"])
    verified_n = sum(1 for x in rows if x["id"] in VER_BY_ID)
    others = "".join(
        f'<a class="btn" href="{esc(o["id"])}.html">{esc(o["name"])} ({STATS["by_type"].get(o["id"], 0)})</a>'
        for o in TYPES if o["id"] != t["id"]
    )
    body = f"""
<section class="hero">
  <p class="kicker"><a href="../index.html">Dashboard</a> / Category</p>
  <h1 class="page">{esc(t['name'])} <span style="color:#64748b;font-size:.6em">({len(rows)})</span></h1>
  <p class="lede">{esc(t.get('blurb', ''))}</p>
  <div class="stats">
    <div class="stat"><b>{len(rows)}</b><span>rows in this category</span></div>
    <div class="stat"><b>{free_live_n}</b><span>free &amp; enterable today</span></div>
    <div class="stat"><b>{verified_n}</b><span>re-verified this pass</span></div>
    <div class="stat"><b>{esc(AGENT_FIT_LABEL[t['id']])}</b><span>AI-agent fit (editorial)</span></div>
  </div>
</section>
{table_block(rows, 'cat-' + t['id'], rel='../')}
<h2 class="sec">Other categories</h2>
<div class="links">{others}</div>
"""
    return shell(f"{t['name']} — free-to-enter cash competitions — Free Cash Ledger",
                 f"{t.get('blurb', '')} {len(rows)} competitions, each with an official source link.", "../",
                 body, f"category/{t['id']}.html")


def page_verification() -> str:
    blocks = []
    order = {"verified": 0, "partially-verified": 1, "contradicted": 2}
    entries = sorted(VER["entries"], key=lambda e: (order.get(e["status"], 3), e["name"]))
    for e in entries:
        x = next((l for l in LISTINGS if l["id"] == e["id"]), None)
        fields = "".join(
            f"""<tr><th scope="row">{esc(k.replace('_', ' '))}</th>
              <td><b>{esc(f['value'])}</b>{f'<div class="quote">“{esc(f["quote"])}”</div>' if f.get('quote') else ''}</td></tr>"""
            for k, f in e["fields"].items()
        )
        pt = e.get("prize_top")
        prize_line = (f"<p><b>Verified prize recorded:</b> {esc(pt['currency'])} {pt['amount']:,} — {esc(pt.get('scope', ''))}</p>"
                      if pt else '<p><b>Verified prize recorded:</b> <span class="blank">none — withheld</span></p>')
        mism = e.get("catalogue_matches", {})
        mismatch_line = ""
        bad = [k for k, v in mism.items() if v is False]
        if bad:
            mismatch_line = ('<p class="notice bad" style="margin:8px 0"><b>Contradicts the catalogue on:</b> '
                             + esc(", ".join(bad)) + '.</p>')
        extra = ""
        if e.get("conflicting_sources"):
            extra = ("<h4>Conflicting sources</h4><ul>" +
                     "".join(f'<li><a href="{esc(u)}" rel="noopener noreferrer nofollow">{esc(u)}</a></li>'
                             for u in e["conflicting_sources"]) + "</ul>")
        if e.get("ai_clause"):
            extra += f"<h4>AI clause</h4><p>{esc(e['ai_clause'])}</p>"
        if e.get("bot_note"):
            extra += f"<h4>Agent-relevant note</h4><p>{esc(e['bot_note'])}</p>"
        cls = {"verified": "high", "contradicted": "high", "partially-verified": "medium"}.get(e["status"], "info")
        blocks.append(f"""
<div class="finding {cls if e['status'] != 'verified' else 'low'}" id="{esc(e['id'])}">
  <h3>{esc(e['name'])} {ver_badge({'id': e['id']})}</h3>
  <div class="meta2">{esc(e['status'])} · evidence: {esc(e['evidence_kind'])} · checked {esc(VER['checked_on'])} · id {esc(e['id'])}</div>
  <p>{esc(e['notes'])}</p>
  {mismatch_line}
  <div class="tablewrap"><table class="prose" style="margin:6px 0 10px">
    <tbody>{fields}</tbody>
  </table></div>
  {prize_line}
  <p><b>Official page read:</b> <a href="{esc(e['official_url'])}" rel="noopener noreferrer nofollow">{esc(e['official_url'])}</a></p>
  {f'<p><b>Operator site:</b> <a href="{esc(e["operator_url"])}" rel="noopener noreferrer nofollow">{esc(e["operator_url"])}</a></p>' if e.get('operator_url') else ''}
  {f'<p><b>Row in the catalogue:</b> <a href="{esc("category/" + x["type"] + ".html#" + x["id"])}">{esc(x["name"])}</a></p>' if x else ''}
  {extra}
  {f'<h4>Also referenced</h4><p><a href="{esc(e["extra_source"])}" rel="noopener noreferrer nofollow">{esc(e["extra_source"])}</a></p>' if e.get('extra_source') else ''}
</div>""")

    body = f"""
<section class="hero">
  <p class="kicker">Verification ledger · checked {BUILD_DATE}</p>
  <h1 class="page">What was checked, against which page, and what it said.</h1>
  <p class="lede">{len(VER['entries'])} of {len(LISTINGS)} rows were opened against an operator page this pass.
  Every field below carries the operator’s URL, a verbatim quote, and the date it was read. The other
  {len(LISTINGS) - len(VER['entries'])} rows are marked <span class="badge b-unverified">source data only</span> —
  that is a limit of this pass, stated on purpose rather than papered over with a plausible number.</p>
  <div class="stats">
    <div class="stat"><b>{sum(1 for e in VER['entries'] if e['status'] == 'verified')}</b><span>verified</span></div>
    <div class="stat"><b>{sum(1 for e in VER['entries'] if e['status'] == 'partially-verified')}</b><span>partly verified</span></div>
    <div class="stat"><b>{sum(1 for e in VER['entries'] if e['status'] == 'contradicted')}</b><span>contradicted</span></div>
    <div class="stat"><b>{len(LISTINGS) - len(VER['entries'])}</b><span>not checked this pass</span></div>
  </div>
</section>

<div class="notice warn">
  <b>Method, and its limits.</b> {esc(VER['method'])}
  <br><br>Evidence kinds used: <b>official-page</b> (the operator’s page was opened and read),
  <b>official-page-index</b> (the operator’s page text was returned through a search index — URL is still the
  operator’s), <b>secondary-official-terms</b> (a third party quoting the operator’s terms; the operator page was
  not opened — weaker evidence, and labelled as such).
  This sandbox’s shell has no route to operator sites, so no `curl` status codes exist to report; link liveness was
  never asserted for rows that were not opened.
</div>

<h2 class="sec">Evidence, row by row</h2>
<p class="sub">Ordered: verified first, then partial, then contradicted.</p>
{''.join(blocks)}

<h2 class="sec">Why only {len(VER['entries'])}?</h2>
<div class="prose">
<p>Because a number that was not read on an official page is a guess, and this project’s rule is that a guess is
worse than a blank. Rows were prioritised by value: the rows where a real cash prize is claimed to be free, plus
every row that a reasonable person would consider spending a weekend on. If you want a row promoted, the route is
mechanical — open the operator page, record the URL, quote the text, re-run <code>tools/verify_check.py</code>.</p>
</div>
"""
    return shell("Verification ledger — what was checked against official sources — Free Cash Ledger",
                 "Per-row verification of free-to-enter cash competitions against operator pages, with verbatim "
                 "quotes and checked dates.", "", body, "verification.html")


def page_flagged() -> str:
    rows_by_id = {x["id"]: x for x in LISTINGS}
    blocks = []
    for f in FINDINGS:
        extra = ""
        if f.get("rows"):
            items = []
            for r in f["rows"][:60]:
                bits = [f'<b>{esc(r.get("name", r.get("id")))}</b>']
                if r.get("prize"):
                    bits.append(f'prize: {esc(r["prize"])}')
                if r.get("url"):
                    bits.append(f'<a href="{esc(r["url"])}" rel="noopener noreferrer nofollow">operator page ↗</a>')
                if r.get("sources"):
                    bits.append("cited: " + " · ".join(esc(s) for s in r["sources"]))
                if r.get("short"):
                    bits.append(esc(r["short"]))
                items.append("<li>" + " — ".join(bits) + "</li>")
            extra = "<ul>" + "".join(items) + "</ul>"
        if f.get("groups"):
            extra += "<ul>" + "".join(
                f'<li><code>{esc(g["url"])}</code> shared by {g["count"] if "count" in g else len(g["ids"])} rows: '
                + ", ".join(f'<a href="category/{esc(rows_by_id[i]["type"])}.html#{esc(i)}">{esc(i)}</a>' for i in g["ids"])
                + "</li>" for g in f["groups"]) + "</ul>"
        if f.get("per_key"):
            extra += "<ul>" + "".join(f"<li><code>{esc(k)}</code>: {v} ids</li>" for k, v in f["per_key"].items()) + "</ul>"
        blocks.append(f"""
<div class="finding {esc(f['severity'])}" id="{esc(f['id'])}">
  <h3>{esc(f['title'])}</h3>
  <div class="meta2"><span class="sev {esc(f['severity'])}">{esc(f['severity'])}</span> · rule {esc(f['rule'])}{f" · {f['count']} rows" if f['count'] else ""}</div>
  <p>{esc(f['detail'])}</p>
  {extra}
</div>""")

    contradict = [e for e in VER["entries"] if e["status"] == "contradicted"]
    contradict_html = "".join(f"""
<div class="finding high" id="conf-{esc(e['id'])}">
  <h3>Contradicted by the operator’s page: {esc(e['name'])}</h3>
  <div class="meta2">verified {esc(VER['checked_on'])} · {esc(e['evidence_kind'])}</div>
  <p>{esc(e['notes'])}</p>
  <ul>
    {''.join(f'<li><b>{esc(k.replace("_", " "))}</b>: {esc(v["value"])} — “{esc(v["quote"])}”</li>' for k, v in e['fields'].items() if v.get('quote'))}
  </ul>
  <p><a href="{esc(e['official_url'])}" rel="noopener noreferrer nofollow">Official page ↗</a></p>
</div>""" for e in contradict)

    body = f"""
<section class="hero">
  <p class="kicker">Flagged for review</p>
  <h1 class="page">Everything that does not add up, with the source that shows it.</h1>
  <p class="lede">These items do not block publication — they are published here so you can decide. Each one is
  mechanical: it comes from <code>tools/audit.py</code> over the mirrored data, or from a page read on
  {BUILD_DATE}. Nothing in this list is an opinion about a company; it is a mismatch between what a row claims and
  what its own citation shows.</p>
</section>

<div class="notice bad">
  <b>{len(FINDINGS)} audit findings + {len(contradict)} contradicted rows.</b> Severity is about how much a row could
  cost you: <b>high</b> means a prize or a fee claim has no official support or is outright wrong;
  <b>medium</b> means the row is misleading; <b>low/info</b> means the catalogue’s own presentation is inconsistent.
</div>

<h2 class="sec">Contradicted by the operator</h2>
{contradict_html}

<h2 class="sec">Catalogue integrity findings</h2>
{''.join(blocks)}

<h2 class="sec">What is deliberately left blank on the site</h2>
<div class="prose">
<ul>
  <li>Any prize amount not read on an official page — including the large trading-demo prize ladders that are cited
  only to affiliate sites.</li>
  <li>The Weather Photographer of the Year prize, where two 2026 sources disagree with the catalogue.</li>
  <li>HIPA’s “$20,000–$50,000 category prizes”: the $50,000 upper bound has no support in the sources read.</li>
  <li>Entry fees for Kaggle and DrivenData: the pages read do not state a fee, and “no fee stated in marketing copy”
  is not the same as “free”, so the row is not marked confirmed-free.</li>
</ul>
</div>
"""
    return shell("Flagged for review — irregularities in the free competition catalogue — Free Cash Ledger",
                 "Every integrity finding and contradicted row in the free-to-enter cash competition catalogue, "
                 "with operator source links.", "", body, "flagged.html")


def page_methodology() -> str:
    body = f"""
<section class="hero">
  <p class="kicker">Method</p>
  <h1 class="page">How this was built, and exactly where it stops being reliable.</h1>
  <p class="lede">Three layers: a verbatim mirror of the source catalogue, a deterministic audit over that data, and
  a separate verification layer that only ever adds a value when an official page was read. The layers are kept
  apart on purpose so that “the catalogue says” and “we confirmed” can never be confused.</p>
</section>

<div class="prose">
<h2>1. Mirror</h2>
<p><code>data/source-data.js</code> is a byte-for-byte copy of the reference site’s <code>assets/data.js</code>
(SHA-256 <code>13986a17b8b9aa7b3240232e6138155967cfa9347256faa7b5c7d1565ed73211</code>), taken from
<a href="https://github.com/karagemop466-tech/FreeMoneyApps">karagemop466-tech/FreeMoneyApps</a>.
<code>data/ledger.json</code> is that object re-serialised as JSON with no edits and no added fields. If a number is
wrong, it is wrong in the same way in both files — which is the point.</p>

<h2>2. Audit (mechanical)</h2>
<p><code>python3 tools/audit.py</code> runs {len(FINDINGS)} literal checks over the mirror: missing official-tier
source, dollar figure with no official citation, shared sign-up URL, non-contest rows, ended rows inside the
headline free count, “prize not currently knowable” phrases, free labels contradicted by fee language, non-cash
currency in payout copy, prose-only prizes, the “added this pass” derivation, and the stale masthead date. It never
infers a value. Output: <code>data/audit.json</code>, rendered on <a href="flagged.html">Flagged</a>.</p>

<h2>3. Verification (official pages only)</h2>
<p><code>data/verification.json</code> holds {len(VER['entries'])} rows. Each field needs a URL, a verbatim quote and
a status; <code>tools/verify_check.py</code> refuses to build if a claim has no quote and is not explicitly marked
“not stated”. A contradicted row must declare <i>which</i> catalogue fields are contradicted, and a row whose prize
is contradicted cannot carry a verified prize.</p>

<h2>4. Priority score (editorial, published)</h2>
<p>Total maximum {MAX_SCORE} points, normalised to 100. The components:</p>
<div class="tablewrap">
<table>
  <thead><tr><th>Component</th><th>Points</th><th>Rule</th></tr></thead>
  <tbody>
    <tr><td>Free entry, evidenced</td><td>0–30</td><td>30 if an operator page confirms free entry; 18 if the catalogue claims free and it was not checked; 8 for “some free events”; 0 for paid-cash or a contradicted fee.</td></tr>
    <tr><td>Enterable today</td><td>0–15</td><td>15 live, 8 caution, 5 mixed, 0 ended. Reset to 0 if the operator page contradicts availability.</td></tr>
    <tr><td>Prize documented</td><td>0–20</td><td>20 if a figure was read on an official page; 10 if the catalogue publishes a dollar figure without an official citation; 0 otherwise.</td></tr>
    <tr><td>Agent leverage</td><td>0–15</td><td>Editorial, per category: tech 15, forecasting 12, creative 8, market 6, sports 5, trivia/skill 4, directory/pools 0.</td></tr>
    <tr><td>Payout friction</td><td>0–10</td><td>Account-only 10, eligibility check 7, full KYC 3, tax paperwork 3.</td></tr>
  </tbody>
</table>
</div>
<p><b>What the score is not:</b> a probability of winning, an expected value, or advice. It cannot price a lottery
ticket, and it does not know how many people enter. It exists so that 206 rows can be ordered without hand-waving.</p>

<h2>5. What was deliberately not done</h2>
<ul>
  <li><b>No currency conversion.</b> A €10,000 prize is shown as €10,000. Converting would invent an exchange rate
  that no source in this repo supports, so rows are not ranked against each other across currencies.</li>
  <li><b>No prize inferred from prose.</b> “Cash rooms advertise prizes up to tens of dollars” does not become
  $10 in a table.</li>
  <li><b>No link-liveness claims.</b> The build shell cannot reach operator domains, so no row is described as
  “link checked” unless a human-or-agent page read is recorded in <code>verification.json</code>.</li>
  <li><b>No removal of a source’s rows.</b> Wrong rows are kept, marked, and flagged — deleting them would hide the
  fact that they were published.</li>
</ul>

<h2>6. Reproduce it</h2>
<pre style="background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;overflow-x:auto;font-family:var(--mono);font-size:13px">python3 tools/audit.py          # data/ledger.json -> data/audit.json
python3 tools/verify_check.py   # validates data/verification.json
python3 tools/build_site.py     # renders HTML to the repo root
python3 tools/check_links.py    # internal links + anchors, must be 0 broken</pre>

<h2>7. Environment limits, stated honestly</h2>
<p>Outbound shell network in this sandbox reaches GitHub, npm and PyPI only. Operator sites were therefore read with
the agent’s page-fetch tool, and only for the {len(VER['entries'])} rows on the verification page. Everything else
carries the operator’s link and no claim. Two other agent sessions had overlapping claims on this repository when
this one began; that is logged in <a href="https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md">COORDINATION.md</a>.</p>
</div>
"""
    return shell("Method, scoring and limits — Free Cash Ledger",
                 "How the catalogue was mirrored, audited and verified, the exact priority-score weights, and the "
                 "limits of the verification pass.", "", body, "methodology.html")


def page_sources() -> str:
    evidence = "".join(
        f"""<tr><td>{esc(e['name'])}</td><td>{esc(e['status'])}</td>
        <td><a href="{esc(e['official_url'])}" rel="noopener noreferrer nofollow">{esc(urlparse(e['official_url']).netloc)}</a></td>
        <td>{esc(e['evidence_kind'])}</td></tr>"""
        for e in VER["entries"]
    )
    per_type = []
    for t in TYPES:
        rows = [x for x in LISTINGS if x["type"] == t["id"]]
        seen, items = set(), []
        for x in rows:
            for u in [x["signupUrl"]] + [s["url"] for s in x.get("sources", []) if s.get("tier") == "official"]:
                if u in seen:
                    continue
                seen.add(u)
                items.append(f'<li><a href="{esc(u)}" rel="noopener noreferrer nofollow">{esc(u)}</a></li>')
        per_type.append(f"<h3>{esc(t['name'])} ({len(rows)} rows, {len(items)} operator links)</h3><ul>{''.join(items)}</ul>")

    domains = {}
    for x in LISTINGS:
        for u in [x["signupUrl"], x.get("rulesUrl"), x.get("tosUrl")]:
            if u:
                d = urlparse(u).netloc
                domains[d] = domains.get(d, 0) + 1
    top_domains = sorted(domains.items(), key=lambda kv: -kv[1])[:20]
    dom_html = "".join(f"<li><code>{esc(d)}</code> — {n} links</li>" for d, n in top_domains)

    body = f"""
<section class="hero">
  <p class="kicker">Sources</p>
  <h1 class="page">Every link, and the pages this pass actually read.</h1>
  <p class="lede">Two lists: the {len(VER['entries'])} operator pages opened for verification on {BUILD_DATE}, and
  the operator links carried by the catalogue itself, grouped by category. External liveness was not probed for
  rows that were not opened — see <a href="methodology.html">limits</a>.</p>
</section>

<h2 class="sec">Evidence used this pass</h2>
<div class="tablewrap prose">
<table>
  <thead><tr><th>Competition</th><th>Status</th><th>Page read</th><th>Evidence kind</th></tr></thead>
  <tbody>{evidence}</tbody>
</table>
</div>

<h2 class="sec">Operator links by category</h2>
<div class="prose">{''.join(per_type)}</div>

<h2 class="sec">Most-linked domains</h2>
<div class="prose"><ul>{dom_html}</ul>
<p>Repeated domains are a data-quality signal, not a ranking: eleven Fantasy Premier League rows all point at
<code>fantasy.premierleague.com</code>, which publishes no cash prize of its own. That is finding F03 on
<a href="flagged.html">Flagged</a>.</p></div>
"""
    return shell("Sources — operator links used by the catalogue — Free Cash Ledger",
                 "Every operator link in the catalogue by category, plus the exact pages read during verification.",
                 "", body, "sources.html")


def cross_session_rows() -> list[dict]:
    """Their data, their words. Never re-written into this catalogue's schema."""
    path = ROOT / "data" / "entries.json"
    if not path.exists():
        return []
    try:
        rows = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []
    return [r for r in rows if r.get("sourceStatus") == "checked"]


def page_cross_session() -> str:
    rows = cross_session_rows()
    trs = "".join(
        f"""<tr>
          <td><b>{esc(r.get('name', r.get('id')))}</b><br><small>{esc(r.get('category', ''))}</small></td>
          <td>{esc(r.get('prize') or '—')}</td>
          <td>{esc(r.get('entry') or '—')}</td>
          <td><a href="{esc(r.get('source', ''))}" rel="noopener noreferrer nofollow">{esc(urlparse(r.get('source', '')).netloc)} ↗</a></td>
        </tr>"""
        for r in rows
    )
    body = f"""
<section class="hero">
  <p class="kicker">Parallel sessions · integrated {BUILD_DATE}</p>
  <h1 class="page">The other build that reached <code>main</code> first.</h1>
  <p class="lede">Three agent sessions worked this repository at the same time. One of them shipped a full site
  (“Prize Atlas”, 208 leads, 7 official pages read) to <code>main</code> before this session finished. Nothing of
  theirs was thrown away: their dataset, review queue, research notes and supplemental page all still ship, and this
  page is the bridge between the two builds.</p>
</section>

<div class="notice">
  <b>Attribution matters.</b> The rows below were checked against operator pages by the other session on
  2026-11-01 and are reproduced from <code>data/entries.json</code> in their own words. <b>This session did not
  re-read those pages</b>, so they are not counted in this site’s {len(VER_BY_ID)}-row verification layer. Treat them
  as a second opinion, with the operator link attached.
</div>

<h2 class="sec">Leads the other session verified</h2>
<div class="tablewrap prose">
<table>
  <thead><tr><th>Lead</th><th>Prize (their words)</th><th>Entry (their words)</th><th>Page read</th></tr></thead>
  <tbody>{trs or '<tr><td colspan="4">data/entries.json not found in this checkout.</td></tr>'}</tbody>
</table>
</div>

<h2 class="sec">Time-sensitive items from their source audit</h2>
<div class="prose">
<p>Quoted from <a href="research/SOURCES.md">research/SOURCES.md</a> (their file, unedited). These are the items most
likely to expire while you read this:</p>
<ul>
  <li><b>ARC Prize 2026</b> — they recorded a <b>November 2</b> submission deadline and a <b>November 8</b> paper
  deadline, with an open-source requirement, and note that network/API automation cannot run inside Kaggle
  evaluation. <a href="https://arcprize.org/competitions/2026" rel="noopener noreferrer nofollow">arcprize.org/competitions/2026 ↗</a></li>
  <li><b>Metaculus US Midterms 2026</b> — $10,000 pool, closing around <b>November 4</b>.
  <a href="https://www.metaculus.com/tournament/midterms-2026/" rel="noopener noreferrer nofollow">metaculus.com/tournament/midterms-2026 ↗</a></li>
  <li><b>GEMS Prize Challenge (DrivenData)</b> — $300,000 total, ending <b>December 3, 2026</b> 23:59 UTC.
  <a href="https://www.drivendata.org/competitions/306/competition-doe-gems/" rel="noopener noreferrer nofollow">drivendata.org/competitions/306 ↗</a></li>
  <li><b>ESPN NFL Pick’em</b> — they read the rules page and recorded “free” plus a <b>$102,000</b> total including a
  $5,000 random draw, and flagged that ESPN’s own FAQ contradicts itself on the entry limit (5 vs 10). A second
  session re-read the same page and quoted <b>“Every game we offer is completely free.”</b>
  <a href="https://fantasy.espn.com/games/nfl-pickem-2026/howtoplay#CompleteRules" rel="noopener noreferrer nofollow">ESPN rules ↗</a></li>
</ul>
</div>

<h2 class="sec">Their files, still live</h2>
<div class="prose"><ul>
  <li><a href="review.html">review.html</a> — their flagged review queue, rendering their full 208-row dataset.</li>
  <li><a href="supplemental/index.html">supplemental/index.html</a> — their supplemental evidence page (hackathon rules,
  Challenge.gov sunset, Papaya free-vs-cash distinction, IRS guidance on the tax statement).</li>
  <li><a href="research/SOURCES.md">research/SOURCES.md</a> — their source audit: exactly which pages were read and
  what each one does and does not prove.</li>
  <li><a href="data/entries.json">data/entries.json</a> — their 208-lead dataset, blanks preserved on purpose.</li>
  <li><a href="tests/validate.mjs">tests/validate.mjs</a> + <a href=".github/workflows/validate.yml">validate.yml</a> —
  their CI test, still run on every push. This session reconciled one assertion in it (the page-list check) and logged
  that change in <code>COORDINATION.md</code>.</li>
</ul></div>

<h2 class="sec">Why the root pages come from this session</h2>
<div class="prose">
<p>Both builds render the same nine categories from the same 206-row upstream catalogue. This one keeps every source
field (sign-up steps, payout rails, identity checks, watch-outs), a separate verification layer with quoted evidence,
and a mechanical audit. Theirs strips unverified rows to blank fields — an excellent conservative policy, and the
reason their checked rows are quoted here with attribution instead of being re-typed. The merge resolution is recorded
in <a href="https://github.com/sassnarep3-star/Own1/blob/main/COORDINATION.md">COORDINATION.md</a> §6.</p>
</div>
"""
    return shell("Cross-session integration — the parallel build on main — Free Cash Ledger",
                 "What a parallel agent session verified before this build merged: their checked leads, "
                 "time-sensitive deadlines, and where their files still live.", "", body, "cross-session.html")


def page_exec() -> str:
    md = (ROOT / "EXECUTIVE_SUMMARY.md").read_text(encoding="utf-8")
    html_body = md_to_html(md)
    body = f"""
<section class="hero">
  <p class="kicker">Executive summary · {BUILD_DATE}</p>
  <h1 class="page">The short version.</h1>
  <p class="lede">What the source catalogue contains, what survived verification, what did not, and what to do next.
  The same text ships as <code>EXECUTIVE_SUMMARY.md</code> in the repository.</p>
</section>
<div class="prose">{html_body}</div>
"""
    return shell("Executive summary — Free Cash Ledger",
                 "Executive summary of the free-to-enter cash competition catalogue, its audit and verification results.",
                 "", body, "executive-summary.html")


def md_to_html(md: str) -> str:
    """Tiny, deliberately limited Markdown renderer for our own summary file."""
    out: list[str] = []
    in_ul = in_ol = in_table = False
    in_code = False

    def close_lists():
        nonlocal in_ul, in_ol
        if in_ul:
            out.append("</ul>")
            in_ul = False
        if in_ol:
            out.append("</ol>")
            in_ol = False

    def inline(s: str) -> str:
        s = esc(s)
        s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
        s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
        s = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2" rel="noopener noreferrer nofollow">\1</a>', s)
        return s

    for line in md.splitlines():
        s = line.rstrip()
        if s.startswith("```"):
            close_lists()
            out.append("<pre style=\"background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;overflow-x:auto;font-size:13px\">" if not in_code else "</pre>")
            in_code = not in_code
            continue
        if in_code:
            out.append(esc(s))
            continue
        if not s.strip():
            close_lists()
            if in_table:
                out.append("</tbody></table></div>")
                in_table = False
            continue
        if s.startswith("|"):
            if set(s.replace("|", "").strip()) <= set("-: "):
                continue
            cells = [c.strip() for c in s.strip("|").split("|")]
            if not in_table:
                out.append('<div class="tablewrap"><table>')
                out.append("<thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in cells) + "</tr></thead><tbody>")
                in_table = True
            else:
                out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in cells) + "</tr>")
            continue
        if in_table:  # any non-table line ends an open table first
            out.append("</tbody></table></div>")
            in_table = False
        m = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m:
            close_lists()
            lvl = min(len(m.group(1)) + 1, 4)
            out.append(f"<h{lvl}>{inline(m.group(2))}</h{lvl}>")
            continue
        if re.match(r"^\s*[-*]\s+", s):
            if not in_ul:
                close_lists()
                out.append("<ul>")
                in_ul = True
            out.append("<li>" + inline(re.sub(r"^\s*[-*]\s+", "", s)) + "</li>")
            continue
        if re.match(r"^\s*\d+\.\s+", s):
            if not in_ol:
                close_lists()
                out.append("<ol>")
                in_ol = True
            out.append("<li>" + inline(re.sub(r"^\s*\d+\.\s+", "", s)) + "</li>")
            continue
        if s.startswith(">"):
            close_lists()
            out.append(f'<blockquote>{inline(s.lstrip("> ").strip())}</blockquote>')
            continue
        close_lists()
        out.append(f"<p>{inline(s)}</p>")
    close_lists()
    if in_table:
        out.append("</tbody></table></div>")
    return "\n".join(out)


def page_404() -> str:
    body = """
<section class="hero">
  <p class="kicker">404</p>
  <h1 class="page">That page is not here.</h1>
  <p class="lede">The ledger has a dashboard, a ranked shortlist, a full catalogue, nine category pages, a
  verification ledger and the flagged list. Try one of those.</p>
  <div class="links">
    <a class="btn primary" href="index.html">Dashboard</a>
    <a class="btn" href="best-picks.html">Best picks</a>
    <a class="btn" href="all.html">All 206</a>
    <a class="btn" href="verification.html">Verification</a>
    <a class="btn" href="flagged.html">Flagged</a>
  </div>
</section>
"""
    return shell("Page not found — Free Cash Ledger", "Page not found.", "", body, "")


def main() -> int:
    written = []

    def write(path: Path, content: str):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        written.append(path)

    write(ROOT / "index.html", page_dashboard())
    write(ROOT / "best-picks.html", page_best_picks())
    write(ROOT / "all.html", page_all())
    for t in TYPES:
        write(ROOT / "category" / f"{t['id']}.html", page_category(t))
    write(ROOT / "verification.html", page_verification())
    write(ROOT / "flagged.html", page_flagged())
    write(ROOT / "methodology.html", page_methodology())
    write(ROOT / "sources.html", page_sources())
    write(ROOT / "executive-summary.html", page_exec())
    write(ROOT / "cross-session.html", page_cross_session())
    write(ROOT / "404.html", page_404())
    write(ROOT / ".nojekyll", "")
    write(ROOT / "robots.txt", f"User-agent: *\nAllow: /\nSitemap: {BASE_URL}sitemap.xml\n")

    details_path = ROOT / "data" / "details.json"
    details_path.write_text(json.dumps({x["id"]: detail_json(x) for x in LISTINGS}, ensure_ascii=False),
                            encoding="utf-8")
    written.append(details_path)

    pages = ["index.html", "best-picks.html", "all.html", "verification.html", "flagged.html",
             "methodology.html", "sources.html", "executive-summary.html", "cross-session.html"] + \
            [f"category/{t['id']}.html" for t in TYPES]
    urls = "".join(
        f"  <url><loc>{BASE_URL}{p}</loc><lastmod>{BUILD_DATE}</lastmod></url>\n" for p in pages
    )
    write(ROOT / "sitemap.xml",
          f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')

    total = sum(len(p.read_text(encoding="utf-8")) for p in written if p.suffix in (".html",))
    print(f"wrote {len(written)} files, {total:,} bytes of HTML")
    for p in written:
        print("  ", p.relative_to(ROOT), f"{p.stat().st_size:,}b")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
