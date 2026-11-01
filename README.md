# Prize Atlas

A static, mobile-first dashboard for **free-to-enter competitions that pay real cash** — built from the reference ledger at [karagemop466-tech/FreeMoneyApps](https://karagemop466-tech.github.io/FreeMoneyApps/), with every claim either read on an official page or published as blank and flagged.

**Live site:** https://sassnarep3-star.github.io/Own1/

## What is in here

| Path | What it is |
| --- | --- |
| `index.html` | Dashboard: key figures, triage shortlist, category cards, all 212 rows in one filterable table, executive summary |
| `category/*.html` | Nine category pages (sports, tech, forecasting, creative, market, skill, trivia, pools, directories) |
| `analysis.html` | Findings: coverage, where the money is, free-entry traps, the link problem, how to use a coding agent |
| `methodology.html` | The verification rules and the exact official pages read, per row |
| `review.html` | Flagged for review: unverified rows, dead/reused links, contradictions, paid-entry traps |
| `supplemental/index.html` | Independent second audit (three hackathon leads, seven extra flags) |
| `archive/*.html` | An alternate build of this research by a parallel session, kept working and linked from the method page |
| `data/verification.json`, `data/audit.json`, `data/ledger.json` | Verbatim-quote verification of 12 rows, 11 rule-based audit findings over the imported ledger, and the mirrored ledger |
| `entry/*.html`, `sources.html`, `playbook.html` | Fourth build by a parallel session: per-lead pages, a source ledger and a competition playbook |
| `ledger/index.html` | Third build by a parallel session: all 206 imported rows with an automated audit, 28 rows checked against official pages, its own flagged and method pages |
| `data/verification/batchA.jsonl` | That session's 28 row-by-row official-page reads; its verified and discrepancy rows are attributed in the main table |
| `data/verification/batchB.jsonl` | Five further official reads from this session (Deriv promoted, USA.gov confirmed, HeroX and AFL partial, RoboForex 404) |
| `research/EVIDENCE.csv` | Flat export of all 29 page-checked rows: source, entry cost, prize, deadline, eligibility, reading date, evidence URL, reading session and flags |
| `data/entries.json` | The dataset: 212 rows with per-row `evidence`, `entryFree` and `flags` |
| `data/triage.json` | Editorial scoring inputs, one rationale per checked row |
| `tools/build.mjs` | Zero-dependency generator that renders every page from the data |
| `tests/validate.mjs` | Data contract + link/asset + mobile checks, run in CI |

`EXECUTIVE_SUMMARY.md`, `REQUIREMENTS.md`, `research/SOURCES.md` and `COORDINATION.md` carry the written analysis and the task log.

## Data policy

- **Checked** rows were read on the linked operator page on the date in their `evidence.checkedAt` field. Prize, entry cost, deadline and eligibility are copied from that page.
- **Unverified** rows are leads only. Their prize, entry-cost, deadline, kind and eligibility cells are forced blank by `tests/validate.mjs`; they display an *Unverified* badge.
- Blank means *not confirmed* — never zero, never free. Only an explicit statement such as "The Competition is free to enter" produces a *Free entry* badge.
- Nothing is converted, combined, rounded, extrapolated or estimated; no win probability is published.

## Local preview and checks

```bash
python3 -m http.server 8000 --bind 0.0.0.0   # then open the preview
node tools/build.mjs                          # regenerate all HTML from data/
node tests/validate.mjs                       # must print OK
```

No dependencies, no build step at deploy time. GitHub Pages serves the repository root of `main` (`.nojekyll` present).

## Adding or verifying a row

1. Open the operator's official page; copy the exact wording for prize, entry cost, deadline and eligibility.
2. Fill only what the page states. Leave everything else blank.
3. Add an `evidence` block: `url`, `checkedAt`, `confirmed[]`, `notStated[]`, `limits`.
4. Set `sourceStatus` to `checked` and `entryFree` to `yes`, `no` or blank.
5. Add a `triage.json` entry with a written rationale if the row should appear in the shortlist.
6. Run `node tools/build.mjs && node tests/validate.mjs`, then commit.
