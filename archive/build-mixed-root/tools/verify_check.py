#!/usr/bin/env python3
"""Validate data/verification.json.

Fails loudly if an evidence entry makes a claim without a URL, a date, a quote, or a
known status/evidence kind. This is the guard against a value quietly appearing on the
site without a source behind it.

Run:  python3 tools/verify_check.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VER = ROOT / "data" / "verification.json"
LEDGER = ROOT / "data" / "ledger.json"

REQUIRED = ("id", "name", "status", "evidence_kind", "official_url", "fields", "notes")
STATUSES = {"verified", "partially-verified", "contradicted", "not-verified"}
KINDS = {"official-page", "official-page-index", "secondary-official-terms"}


def main() -> int:
    ver = json.loads(VER.read_text(encoding="utf-8"))
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    ids = {x["id"] for x in ledger["listings"]}
    errors: list[str] = []

    if not ver.get("checked_on"):
        errors.append("verification.json has no checked_on date")

    seen: set[str] = set()
    for e in ver["entries"]:
        label = e.get("id", "<missing id>")
        for key in REQUIRED:
            if key not in e or e[key] in (None, "", [], {}):
                if key == "fields":
                    errors.append(f"{label}: no fields")
                elif key == "notes":
                    errors.append(f"{label}: no notes")
                else:
                    errors.append(f"{label}: missing {key}")
        if e.get("status") not in STATUSES:
            errors.append(f"{label}: bad status {e.get('status')!r}")
        if e.get("evidence_kind") not in KINDS:
            errors.append(f"{label}: bad evidence_kind {e.get('evidence_kind')!r}")
        if e.get("id") in seen:
            errors.append(f"{label}: duplicate entry")
        seen.add(e.get("id"))
        if e.get("id") not in ids:
            errors.append(f"{label}: id not present in data/ledger.json")
        url = e.get("official_url", "")
        if not url.startswith("http"):
            errors.append(f"{label}: official_url is not http(s)")
        for fname, f in (e.get("fields") or {}).items():
            if not isinstance(f, dict) or "value" not in f:
                errors.append(f"{label}.{fname}: field is not a {{value, quote}} object")
                continue
            if f["value"] in (None, ""):
                errors.append(f"{label}.{fname}: empty value")
            # Every field must quote evidence unless it is explicitly "not stated".
            q = f.get("quote", "")
            allowed_blank = str(f["value"]).lower().startswith("not stated") or \
                str(f["value"]).lower().startswith("not confirmed")
            if not q and not allowed_blank:
                errors.append(f"{label}.{fname}: no verbatim quote and not marked 'not stated'")
        pt = e.get("prize_top")
        if pt is not None:
            if not isinstance(pt.get("amount"), (int, float)):
                errors.append(f"{label}: prize_top.amount is not numeric")
            if pt.get("currency") not in {"USD", "EUR", "GBP"}:
                errors.append(f"{label}: prize_top.currency unexpected")

    # A row whose *prize* is contradicted must not carry a verified prize. A row that is
    # contradicted on some other field (e.g. entry fee) may keep a verified prize, but it
    # has to say which fields are contradicted.
    for e in ver["entries"]:
        if e["status"] != "contradicted":
            continue
        if not e.get("contradicted_fields"):
            errors.append(f"{e['id']}: contradicted row must list contradicted_fields")
        if e.get("prize_top") and "prize_text" in (e.get("contradicted_fields") or []):
            errors.append(f"{e['id']}: prize is contradicted but prize_top is still set")

    counts = {}
    for e in ver["entries"]:
        counts[e["status"]] = counts.get(e["status"], 0) + 1

    print(f"verification entries: {len(ver['entries'])}  of {len(ledger['listings'])} listings")
    print("status counts:", counts)
    print("checked_on:", ver.get("checked_on"))
    if errors:
        print("\nFAILED:")
        for x in errors:
            print("  -", x)
        return 1
    print("\nOK — every evidence entry has a URL, a quote or an explicit 'not stated', and a valid status.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
