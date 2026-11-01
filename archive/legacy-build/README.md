# Archived generators — reference only, do not run

Three build pipelines were created for this repository by different sessions on 2026-11-01. Only one is canonical; the others are kept here so their work and method stay auditable without being able to overwrite the live site.

| Pipeline | Files | Status |
| --- | --- | --- |
| **Canonical** | `scripts/build-data.mjs`, `scripts/build-site.mjs`, `research/facts.mjs`, `assets/app.js`, `assets/style.css` | Active. Generates `index.html`, `category/*`, `entry/*`, `review.html`, `sources.html`, `playbook.html`, `data/entries.json`, `data/site-data.js`. Enforced by `tests/validate.mjs`, `tests/dom.test.mjs` and `.github/workflows/validate.yml`. |
| Parallel build A (`d21e8702-own1`) | `tools/build_site_legacy.py`, `tools/*.py` | Archived in place in `tools/`. Its published pages (`all.html`, `best-picks.html`, `404.html`, `methodology.html`, `verification.html`, `flagged.html`, `cross-session.html`, `executive-summary.html`, `ledger/`) remain live and linked from `sources.html`. |
| Parallel build B (`4e1fdad5-own1`) | `archive/legacy-build/build.mjs`, `build.js`, `src/**` | Archived here. Its published pages (`shortlist.html`, `categories.html`, `summary.html`, `archive.html`, plus the pages above) remain live. |

Why only one generator: two generators writing the same paths means the last one to run silently wins, and CI cannot tell which build is authoritative. The canonical pipeline is the one whose data model forces a verbatim quote and a read date behind every displayed value, and whose tests fail on an unsourced claim.

To revive a legacy build, move its files back and be explicit in `COORDINATION.md` about which pipeline owns the shared pages.
