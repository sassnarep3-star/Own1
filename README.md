# Own1 — Free Cash Contest Finder

Live site: **https://sassnarep3-star.github.io/Own1/**

A mobile-friendly dashboard of free-to-enter competitions that can pay real cash, built from the
[Free Money & Contest Ledger](https://karagemop466-tech.github.io/FreeMoneyApps/) (206 listings) and re-checked against
official pages. Prize figures are shown **only** when read from an official page; otherwise they are blank and flagged.

| Path | What |
|---|---|
| `index.html`, `picks.html`, `all.html`, `categories/*.html` | Dashboard, verified top picks, all-entries table, one page per category |
| `flagged.html` | **Flagged for Review** — discrepancies, unverified items, irregularities, with source links |
| `summary.html` / `EXECUTIVE_SUMMARY.md` | Executive summary |
| `method.html` | Method, limits, and the log of official URLs fetched |
| `data/upstream/` | Unchanged snapshot of the upstream ledger (claims, **not** verified) |
| `data/verification/` | Verification records (`batchA.jsonl`) and verified picks (`picks.json`) |
| `data/audit.json` | Automated irregularity checks on the upstream data |
| `data/ledger.json`, `data/ledger.csv` | Merged output (upstream claims + check results) |
| `scripts/` | `audit.js`, `build.js`, `linkcheck.js` (run in that order) |
| `COORDINATION.md` | Shared task board for parallel agent sessions + PR/merge record |

Rebuild: `node scripts/audit.js && node scripts/build.js && node scripts/linkcheck.js`
