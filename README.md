# Prize Atlas

A static, mobile-friendly research dashboard for cash-prize competition leads. **Only seven rows have official pages read for their displayed details** as of 2026-11-01; other rows are explicitly unverified. See [executive summary and source audit](research/SOURCES.md) and [coordination board](COORDINATION.md).

## Local preview

Run `python3 -m http.server 8000 --bind 0.0.0.0` from the repository root and open the preview. No build or dependencies are needed. GitHub Pages serves the repository root from `main`.

## Data policy

`data/entries.json` contains 206 unverified/checked legacy leads imported by name and category from [the reference ledger](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js), plus two newly checked contest leads. Financial details and deadlines are shown only where read from an official page. An unverified source URL is a research lead, **not** evidence the prize exists. Blank fields are deliberate. Sources and irregularities: [research/SOURCES.md](research/SOURCES.md).

---

# Verified Contest Ledger (`ledger/`)

Live: **https://sassnarep3-star.github.io/Own1/ledger/** — all 206 upstream rows with an automated audit, 28 rows checked against official pages, a **Flagged for Review** page, verified top picks, category pages and CSV/JSON exports. Prize figures appear only when read from an official page; otherwise they are blank and flagged.

| Path | What |
|---|---|
| `ledger/index.html`, `picks.html`, `all.html`, `categories/*.html` | Dashboard, verified top picks, all-entries table, one page per category |
| `ledger/flagged.html` | Flagged for Review: discrepancies, unverified items, irregularities, with source links |
| `ledger/summary.html`, `ledger/method.html` | Executive summary (ledger part), method and log of official URLs fetched |
| `EXECUTIVE_SUMMARY.md` | Integrated executive summary (Prize Atlas part + ledger part) |
| `data/upstream/` | Unchanged snapshot of the upstream ledger (claims, **not** verified) |
| `data/verification/` | Verification records (`batchA.jsonl`) and verified picks (`picks.json`) |
| `data/audit.json`, `data/ledger.json`, `data/ledger.csv` | Automated audit; merged output (upstream claims + check results) |
| `scripts/` | `audit.js`, `build.js`, `linkcheck.js` |

Rebuild and check: `node scripts/audit.js && node scripts/build.js && node scripts/linkcheck.js && node tests/validate.mjs`
