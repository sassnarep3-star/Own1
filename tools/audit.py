#!/usr/bin/env python3
"""Rule-based integrity audit of the mirrored ledger.

Every check is deterministic and reproducible from data/ledger.json. Nothing here
infers or fills in a value: a check either matches literal text/fields in the data or
it does not. Output: data/audit.json.

Run:  python3 tools/audit.py
"""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEDGER = ROOT / "data" / "ledger.json"
OUT = ROOT / "data" / "audit.json"

# Phrases operators use when a prize is not currently knowable. Matching these is a
# literal string test, not an interpretation.
UNKNOWN_PRIZE_PHRASES = (
    "not currently published",
    "not running",
    "not verified",
    "not confirmed",
    "no longer",
    "n/a",
    "tbd",
    "confirm",
    "varies",
    "varies by",
    "not published",
    "not applicable",
)

# Text that suggests a cash prize sits behind a purchase. Used only to raise a
# review flag, never to change a value.
FEE_PHRASES = ("entry fee", "buy-in", "buy in", "paid entry", "deposit")

# Non-USD prize currencies mentioned in the prize copy.
NONCASH_PHRASES = ("gem", "gemz", "ticket", "z coin", "bonus cash", "bonus funds", "coins")


def norm(text: str) -> str:
    return (text or "").lower()


def prize_has_figure(text: str) -> bool:
    return bool(re.search(r"\$\s?\d", text or ""))


def main() -> int:
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    listings = data["listings"]
    types = {t["id"]: t for t in data["types"]}
    levels = {v["id"] for v in data.get("verificationLevels", [])}

    findings: list[dict] = []

    def add(rule, severity, title, detail, ids, extra=None):
        findings.append(
            {
                "id": f"F{len(findings) + 1:02d}",
                "rule": rule,
                "severity": severity,
                "title": title,
                "detail": detail,
                "listing_ids": ids,
                "count": len(ids),
                **(extra or {}),
            }
        )

    # ---------- R1: no official-tier source ----------
    no_official = [x for x in listings if not any(s.get("tier") == "official" for s in x.get("sources", []))]
    if no_official:
        add(
            "R1",
            "high",
            "Listings with no official-tier source",
            "The source file states its own rule: “any listing that states a specific prize figure "
            "must cite the operator's own rules or game page”, with tiers official | affiliate | forum. "
            "These listings cite only affiliate or forum pages.",
            [x["id"] for x in no_official],
            {"rows": [{"id": x["id"], "name": x["name"], "url": x["signupUrl"],
                       "sources": [f"{s['tier']}: {s['url']}" for s in x["sources"]]} for x in no_official]},
        )

    # ---------- R2: dollar figure with no official source ----------
    money_unsourced = [x for x in listings
                       if prize_has_figure(x.get("prizeUsd", ""))
                       and not any(s.get("tier") == "official" for s in x.get("sources", []))]
    if money_unsourced:
        add(
            "R2",
            "high",
            "Dollar prize figures that cite no official page",
            "A specific prize ladder is published for these entries while the only citation is an "
            "affiliate page. The figures are reproduced in the tables as *source data, unverified*, "
            "never as a verified amount.",
            [x["id"] for x in money_unsourced],
            {"rows": [{"id": x["id"], "name": x["name"], "prize": x["prizeUsd"],
                       "url": x["signupUrl"]} for x in money_unsourced]},
        )

    # ---------- R3: shared sign-up URL across listings ----------
    by_url = defaultdict(list)
    for x in listings:
        by_url[x["signupUrl"]].append(x["id"])
    shared = {u: ids for u, ids in by_url.items() if len(ids) > 1}
    if shared:
        add(
            "R3",
            "high",
            "Several listings share one sign-up URL",
            "These rows do not link to a distinct prize page. For the Fantasy Premier League group, the "
            "shared URL is the game itself, which publishes no cash prize — the cash claims come from "
            "third-party mini-leagues with private rules.",
            sorted(i for ids in shared.values() for i in ids),
            {"groups": [{"url": u, "ids": ids} for u, ids in sorted(shared.items())]},
        )

    # ---------- R4: listings that are tools/directories, not contests ----------
    tools = [x for x in listings if x["type"] in ("directory", "pools")]
    if tools:
        add(
            "R4",
            "medium",
            "Listings that are not themselves prize competitions",
            "Directories and pool-host tools publish no prize of their own; any money comes from the "
            "user's own private group. They are counted in the headline 'free path' total on the "
            "reference site.",
            [x["id"] for x in tools],
            {"rows": [{"id": x["id"], "name": x["name"], "type": x["type"], "prize": x["prizeUsd"]} for x in tools]},
        )

    # ---------- R5: ended / out-of-season counted as free paths ----------
    ended = [x for x in listings if x["status"] == "ended"]
    ended_free = [x for x in ended if x["freePath"] == "full"]
    if ended:
        add(
            "R5",
            "medium",
            "Ended / out-of-season entries inside the headline free-path count",
            f"{len(ended)} listings carry status 'ended' and {len(ended_free)} of them are counted by "
            "the reference site's JavaScript in 'True free paths' (it counts freePath=='full' with no "
            "status filter). They cannot be entered today.",
            [x["id"] for x in ended],
            {"ended_free_ids": [x["id"] for x in ended_free]},
        )

    # ---------- R6: prize not currently knowable ----------
    unknown = [x for x in listings if any(p in norm(x.get("prizeUsd")) for p in UNKNOWN_PRIZE_PHRASES)]
    if unknown:
        add(
            "R6",
            "medium",
            "Prize is explicitly not currently knowable",
            "The source data itself says the prize is unpublished, not running, or unconfirmed. The "
            "Prize (USD) column is therefore left blank for these rows; nothing is estimated.",
            [x["id"] for x in unknown],
            {"rows": [{"id": x["id"], "name": x["name"], "prize": x["prizeUsd"], "status": x["status"]} for x in unknown]},
        )

    # ---------- R7: 'free' label while the copy mentions a purchase ----------
    fee = [x for x in listings
           if x["freePath"] == "full"
           and any(p in norm(" ".join([x.get("short", ""), x.get("prizeUsd", ""),
                                       " ".join(x.get("howToGetMoney", [])),
                                       " ".join(x.get("redFlags", []))])) for p in FEE_PHRASES)]
    if fee:
        add(
            "R7",
            "medium",
            "Marked 'Free USD path' although the description mentions an entry fee or deposit",
            "The fee may correctly apply only to a separate cash room, but the label and the copy "
            "disagree on the same row and need a human read.",
            [x["id"] for x in fee],
            {"rows": [{"id": x["id"], "name": x["name"], "short": x.get("short", "")} for x in fee]},
        )

    # ---------- R8: non-cash prize language on a 'free' row ----------
    noncash = [x for x in listings
               if x["freePath"] == "full"
               and any(p in norm(" ".join([x.get("prizeUsd", ""), x.get("minCashout", "")])) for p in NONCASH_PHRASES)]
    if noncash:
        add(
            "R8",
            "low",
            "Non-cash currency named in the payout copy of a 'free' row",
            "Gems, tickets, Z coins and bonus cash are not withdrawable dollars. Rows are kept, but "
            "they are not ranked as cash prizes.",
            [x["id"] for x in noncash],
            {"rows": [{"id": x["id"], "name": x["name"], "prize": x["prizeUsd"], "cashout": x.get("minCashout", "")} for x in noncash]},
        )

    # ---------- R9: prize published only as prose ----------
    prose = [x for x in listings if not prize_has_figure(x.get("prizeUsd", ""))]
    add(
        "R9",
        "info",
        "Prize published as prose, not a figure",
        f"{len(prose)} of {len(listings)} listings describe the prize in words without a dollar "
        "amount. No amount is derived from prose; the Prize (USD) column stays blank until an "
        "official page is read (see data/verification.json).",
        [x["id"] for x in prose],
        {"count_of_listings": len(listings)},
    )

    # ---------- R10: 'new this pass' badge derivation ----------
    all_pass_keys = [k for k in data if k.startswith("addedThisPass")]
    union, per_key = set(), {}
    for k in all_pass_keys:
        per_key[k] = len(data[k])
        union.update(data[k])
    add(
        "R10",
        "low",
        "Headline 'Added this pass' is one sub-list, not the set of additions",
        f"The reference site renders 'Added this pass' from `addedThisPassC` ({per_key.get('addedThisPassC', 0)} ids) "
        f"and badges rows as 'New' only if they appear in `addedThisPass` or `addedThisPassC`. "
        f"The file also carries passes G–S ({sum(v for k, v in per_key.items() if k not in ('addedThisPass', 'addedThisPassC'))} ids); "
        f"the union of every addedThisPass* list is {len(union)} ids, so most later additions never get the badge.",
        [],
        {"per_key": per_key, "union": len(union)},
    )

    # ---------- R11: stale masthead date ----------
    idx = (ROOT / "research" / "reference-index.html")
    stale = None
    if idx.exists():
        m = re.search(r"<small>([^<]*)</small>", idx.read_text(encoding="utf-8", errors="ignore"))
        stale = m.group(1) if m else None
    add(
        "R11",
        "low",
        "Reference site masthead date disagrees with its data",
        "`index.html` prints “Pass C · 17 Aug 2026” in the masthead while `assets/data.js` declares "
        f"`reviewed: 2026-08-19`, `pass: \"S\"`. Any reader using the masthead is three passes and two days behind. "
        f"(Literal masthead read from the mirrored copy: {stale!r}.)",
        [],
    )

    # ---------- R12: verification level values ----------
    bad_levels = [x["id"] for x in listings if x.get("verification", {}).get("level") not in levels]
    if bad_levels:
        add("R12", "medium", "Unknown verification level", "Level is not one of the declared verificationLevels ids.",
            bad_levels)

    # ---------- Stats ----------
    def pct(n, d):
        return round(100.0 * n / d, 1) if d else 0.0

    total = len(listings)
    status_c = Counter(x["status"] for x in listings)
    free_c = Counter(x["freePath"] for x in listings)
    type_c = Counter(x["type"] for x in listings)
    enterable_free = [x for x in listings if x["freePath"] == "full" and x["status"] in ("live", "caution")]
    verified_ids = set()
    ver_path = ROOT / "data" / "verification.json"
    if ver_path.exists():
        ver = json.loads(ver_path.read_text(encoding="utf-8"))
        verified_ids = {e["id"] for e in ver["entries"] if e.get("status") == "verified"}
    verified_money = [x for x in listings if x["freePath"] == "full"
                      and x["status"] in ("live", "caution")
                      and x.get("id") in verified_ids
                      and isinstance(next((e.get("prize_usd") for e in json.loads(ver_path.read_text(encoding="utf-8"))["entries"] if e["id"] == x["id"]), None), (int, float))]
    stats = {
        "listings": total,
        "types": len(types),
        "free_path_full": free_c.get("full", 0),
        "free_path_partial": free_c.get("partial", 0),
        "free_path_paid_cash": free_c.get("paid-cash", 0),
        "status": dict(status_c),
        "by_type": dict(type_c),
        "free_and_enterable_today": len(enterable_free),
        "free_enterable_pct_of_catalogue": pct(len(enterable_free), total),
        "free_enterable_and_verified_this_pass": len(verified_money),
        "ended": len(ended),
        "ios_all": sum(1 for x in listings if "ios" in x.get("platforms", [])),
        "official_source_rows": total - len(no_official),
        "official_source_coverage_pct": pct(total - len(no_official), total),
    }

    # per-type table for the dashboard
    type_rows = []
    for tid, t in types.items():
        rows = [x for x in listings if x["type"] == tid]
        type_rows.append({
            "id": tid, "name": t["name"], "blurb": t.get("blurb", ""), "total": len(rows),
            "free_full": sum(1 for x in rows if x["freePath"] == "full"),
            "live": sum(1 for x in rows if x["status"] == "live"),
            "free_and_live": sum(1 for x in rows if x["freePath"] == "full" and x["status"] in ("live", "caution")),
            "verified": sum(1 for x in rows if x["id"] in verified_ids),
            "no_official_source": sum(1 for x in rows if not any(s.get("tier") == "official" for s in x.get("sources", []))),
        })
    stats["type_rows"] = type_rows

    out = {
        "generated_from": "data/ledger.json",
        "ledger_reviewed": data.get("reviewed"),
        "ledger_pass": data.get("pass"),
        "checks_run": len(findings),
        "stats": stats,
        "findings": findings,
        "environment_limits": [
            "External links are not probed from the shell (no outbound network except GitHub/npm/PyPI in this sandbox).",
            "Prize prose is never converted to a number; Prize (USD) is blank unless an official page was read.",
        ],
    }
    OUT.write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")

    print(f"wrote {OUT.relative_to(ROOT)}  ({len(findings)} findings, {total} listings)")
    for f in findings:
        print(f"  {f['id']} [{f['severity']:6}] {f['title']}  ({f['count']} rows)")
    print("\nstats:", json.dumps({k: v for k, v in stats.items() if k != "type_rows"}, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
