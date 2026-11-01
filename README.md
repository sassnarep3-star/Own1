# Prize Atlas

A static, mobile-friendly research dashboard for cash-prize competition leads. **Only seven rows have official pages read for their displayed details** as of 2026-11-01; other rows are explicitly unverified. See [executive summary and source audit](research/SOURCES.md) and [coordination board](COORDINATION.md).

## Local preview

Run `python3 -m http.server 8000 --bind 0.0.0.0` from the repository root and open the preview. No build or dependencies are needed. GitHub Pages serves the repository root from `main`.

## Data policy

`data/entries.json` contains 206 unverified/checked legacy leads imported by name and category from [the reference ledger](https://github.com/karagemop466-tech/FreeMoneyApps/blob/main/assets/data.js), plus two newly checked contest leads. Financial details and deadlines are shown only where read from an official page. An unverified source URL is a research lead, **not** evidence the prize exists. Blank fields are deliberate. Sources and irregularities: [research/SOURCES.md](research/SOURCES.md).
