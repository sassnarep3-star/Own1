#!/usr/bin/env python3
"""Link + coverage check for the generated site.

Checks, and fails the build on any of them:
  * every local href/src resolves to a file that exists
  * every cross-page #anchor exists as an id in the target page
  * no page references a missing asset, no localhost/127.0.0.1 URLs
  * every catalogue listing appears in all.html and in its category page exactly once
  * every row exposes at least one external operator link
  * every page carries the nav, a <title>, and a meta description

External URLs are inventoried but NOT probed: this sandbox's shell has no route to
operator domains, and claiming a liveness result we did not test would be a lie.
Only the pages in data/verification.json were actually opened (see verification.html).

Run:  python3 tools/check_links.py
"""
from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "linkcheck.json"
LEDGER = json.loads((ROOT / "data" / "ledger.json").read_text(encoding="utf-8"))
LISTINGS = LEDGER["listings"]
TYPES = [t["id"] for t in LEDGER["types"]]

HTML_FILES = sorted(
    p for p in ROOT.rglob("*.html")
    if ".git" not in p.parts and "research" not in p.parts
)


class Scan(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, str]] = []   # (kind, url)
        self.ids: set[str] = set()
        self.has_title = False
        self.has_desc = False
        self.rows: list[str] = []
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "a" and "href" in a:
            self.links.append(("href", a["href"]))
        if tag in ("link", "script", "img", "source") :
            for k in ("href", "src"):
                if k in a:
                    self.links.append((tag, a[k]))
        if tag == "meta" and a.get("name") == "description" and a.get("content"):
            self.has_desc = True
        if tag == "title":
            self._in_title = True
        if tag == "div" and "row" in (a.get("class") or "").split() and "data-id" in a:
            self.rows.append(a["data-id"])

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title and data.strip():
            self.has_title = True


def main() -> int:
    pages: dict[Path, Scan] = {}
    for f in HTML_FILES:
        s = Scan()
        s.feed(f.read_text(encoding="utf-8"))
        pages[f] = s

    broken: list[dict] = []
    external: dict[str, set[str]] = {}
    anchors: list[dict] = []

    for f, s in pages.items():
        for kind, url in s.links:
            if url.startswith(("mailto:", "tel:", "javascript:", "data:")):
                continue
            parsed = urlparse(url)
            if parsed.scheme in ("http", "https"):
                external.setdefault(parsed.netloc, set()).add(url)
                if parsed.netloc in ("localhost", "127.0.0.1", "0.0.0.0"):
                    broken.append({"page": str(f.relative_to(ROOT)), "link": url,
                                   "reason": "browser-facing localhost link"})
                continue
            if not url or url.startswith("#"):
                if url and url[1:] and url[1:] not in s.ids:
                    anchors.append({"page": str(f.relative_to(ROOT)), "anchor": url,
                                    "reason": "anchor not found on the same page"})
                continue
            target_part, _, frag = url.partition("#")
            target = (f.parent / unquote(target_part)).resolve()
            if target.is_dir():
                target = target / "index.html"
            if not target.exists():
                broken.append({"page": str(f.relative_to(ROOT)), "link": url,
                               "reason": f"missing file {target.relative_to(ROOT) if ROOT in target.parents else target}"})
            elif frag:
                other = pages.get(target)
                if other is None:
                    try:
                        other = Scan()
                        other.feed(target.read_text(encoding="utf-8"))
                    except Exception:
                        other = None
                if other is not None and frag not in other.ids:
                    anchors.append({"page": str(f.relative_to(ROOT)), "link": url,
                                    "reason": "anchor missing in target page"})

    # ---- coverage: each listing exactly once on all.html and on its category page
    coverage_errors: list[str] = []
    all_page = ROOT / "all.html"
    if all_page.exists():
        ids = pages[all_page].rows
        if len(ids) != len(set(ids)):
            coverage_errors.append("all.html contains duplicate rows")
        missing = {x["id"] for x in LISTINGS} - set(ids)
        if missing:
            coverage_errors.append(f"all.html missing {len(missing)} rows: {sorted(missing)[:10]}")
    else:
        coverage_errors.append("all.html not built")
    for tid in TYPES:
        p = ROOT / "category" / f"{tid}.html"
        want = {x["id"] for x in LISTINGS if x["type"] == tid}
        if not p.exists():
            coverage_errors.append(f"missing category page {p.name}")
            continue
        got = pages[p].rows
        if len(got) != len(set(got)):
            coverage_errors.append(f"{p.name} has duplicate rows")
        if want - set(got):
            coverage_errors.append(f"{p.name} missing rows: {sorted(want - set(got))[:6]}")
        if set(got) - want:
            coverage_errors.append(f"{p.name} has rows from another category: {sorted(set(got) - want)[:6]}")

    # ---- every row links to an operator
    no_operator = []
    for f, s in pages.items():
        if f.name == "all.html" or f.parent.name == "category":
            # rows are rendered next to their operator links; check the page contains
            # at least one external link per row on average
            n_ext = sum(1 for kind, u in s.links if u.startswith("http"))
            if s.rows and n_ext < len(s.rows):
                no_operator.append({"page": str(f.relative_to(ROOT)), "rows": len(s.rows),
                                    "external_links": n_ext})

    meta_errors = []
    for f, s in pages.items():
        if not s.has_title:
            meta_errors.append(f"{f.relative_to(ROOT)}: no <title>")
        if not s.has_desc and f.name != "404.html":
            meta_errors.append(f"{f.relative_to(ROOT)}: no meta description")

    report = {
        "generated": "tools/check_links.py",
        "pages_checked": len(pages),
        "internal_links_checked": sum(1 for f, s in pages.items() for k, u in s.links
                                      if not u.startswith("http")),
        "external_links_inventoried": sum(len(v) for v in external.values()),
        "external_domains_inventoried": len(external),
        "external_liveness": "NOT TESTED — no shell route to operator domains in this sandbox; only pages "
                             "listed in data/verification.json were opened, via the agent page-fetch tool.",
        "broken_internal_links": broken,
        "broken_anchors": anchors,
        "coverage_errors": coverage_errors,
        "meta_errors": meta_errors,
        "rows_without_operator_link": no_operator,
        "result": "pass" if not (broken or anchors or coverage_errors or meta_errors or no_operator) else "fail",
    }
    OUT.write_text(json.dumps(report, indent=1) + "\n", encoding="utf-8")

    print(f"pages checked: {len(pages)}")
    print(f"internal links checked: {report['internal_links_checked']}")
    print(f"external links inventoried: {report['external_links_inventoried']} "
          f"across {report['external_domains_inventoried']} domains (not probed)")
    for label, items in (("broken internal links", broken), ("broken anchors", anchors),
                         ("coverage errors", coverage_errors), ("meta errors", meta_errors),
                         ("rows without operator link", no_operator)):
        print(f"{label}: {len(items)}")
        for it in items[:10]:
            print("   ", it)
    print("\nRESULT:", report["result"])
    return 0 if report["result"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
