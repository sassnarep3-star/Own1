# Prize Atlas

A mobile-first dashboard of **free-to-enter competitions that pay real cash**, built so that every displayed fact traces to a quoted official page and every gap is visible.

**Live:** https://sassnarep3-star.github.io/Own1/

- **211 leads** in the ledger, imported from the reference catalog by name and link only.
- **20 entries** have had their official page read on 2026-11-01, with the exact quotes stored in `research/facts.mjs`.
- **185 leads remain unverified** with prize, fee and deadline cells deliberately blank.
- **203 outbound links** were tested by an automated runner: 166 responded, 10 failed outright, 27 were bot-blocked.

Start with the [executive summary](EXECUTIVE_SUMMARY.md), then the [sources ledger](https://sassnarep3-star.github.io/Own1/sources.html) and the [flagged queue](https://sassnarep3-star.github.io/Own1/review.html).

## Local preview

No dependencies, no framework, no build tooling to install.

```bash
python3 -m http.server 8000 --bind 0.0.0.0     # then open the preview URL
node scripts/build-data.mjs && node scripts/build-site.mjs   # regenerate pages
node tests/validate.mjs                        # the verification gate
```

## How the data works

```
research/facts.mjs      hand-written evidence: URL, fact, exact quote, date read  ← the only place values enter
research/legacy-leads.json  the inherited catalog: names, categories, links only
research/flags.mjs      cross-cutting irregularities, each with a source
data/link-health.json   machine-measured HTTP status of every outbound URL
        ↓  node scripts/build-data.mjs
data/entries.json       merged dataset + editorial fit score
        ↓  node scripts/build-site.mjs
index.html · category/* · entry/* · review.html · sources.html · playbook.html · data/site-data.js
```

### Adding a verified fact

1. Read the organiser's own page. Not a listicle, not the reference catalog.
2. Add or extend the entry in `research/facts.mjs`: `officialUrl`, the field, and one `evidence` item per claim containing the **exact quote**.
3. Leave any field the page does not state as `null`/`''`. Do not fill it in.
4. Run the two build scripts and `node tests/validate.mjs`.

### What the gate enforces

`tests/validate.mjs` fails the build if: an unverified row carries a prize, fee, deadline or fit score; a checked row has no evidence; quoted evidence comes from a different host than the row links; a local link is broken; two elements share an id on a page; the client payload disagrees with the dataset; or a checked row is missing from `research/facts.mjs`.

### Link health

`.github/workflows/link-health.yml` requests every outbound URL on a GitHub runner (weekly, or on demand) and publishes the report to the `link-health-data` branch. Copy it to `data/link-health.json` and rebuild to refresh the per-row link status. Interpretation baked into the UI: **403/429 = bot block, not a dead page**; DNS, TLS, timeout and 404 = hard failure.

## Automation

- `validate.yml` — runs the verification gate on every push and PR.
- `link-health.yml` — non-blocking; records real HTTP results, never gates a deploy.

## Judgement, clearly labelled

The **fit score** on each checked entry is editorial, not evidence: free entry (40) + cash (20) + AI-agent fit (4–20) + effort (3–10) + urgency (0–10). It ranks *how much is confirmed and how well the work suits an agent*, not the odds of winning. The [playbook](https://sassnarep3-star.github.io/Own1/playbook.html) explains the reasoning; the [sources page](https://sassnarep3-star.github.io/Own1/sources.html) holds the facts.

Research, not financial, legal or tax advice.

## `/atlas` — the operator-verified subsite

`atlas/index.html` is a second layer, built by a separate generator, under one stricter rule: **prize,
entry, deadline and eligibility are written only when the operator's own page was opened.** Everything
else stays blank with an explicit flag.

| | Root layer (this build) | `/atlas` subsite |
| --- | --- | --- |
| Generator | `npm run build` → `scripts/build-data.mjs`, `scripts/build-site.mjs` | `node scripts/build-atlas.mjs` |
| Data | `data/verification.json`, `data/entries.json`, `data/stats.json` | `data/verified.json`, `data/legacy.json`, `data/atlas-findings.json`, `data/atlas-entries.json`, `data/atlas-categories.json` |
| Rows checked against an operator page | 20 page-checked + 6 partly | 44, each with prize, entry, deadline, eligibility and the page read |
| Unconfirmed catalogue claims | shown per row, tagged unverified | quarantined in a *legacy claim (unverified)* column |
| Findings | on `review.html` and `sources.html` | 17 sourced findings on `atlas/review.html` |
| Mobile tables | filterable, horizontally scrollable | become labelled cards under 900px |

Atlas pages: `atlas/index.html` (dashboard), `atlas/shortlist.html`, `atlas/categories.html` and
`atlas/category/<id>.html`, `atlas/summary.html`, `atlas/review.html`, `atlas/method.html`,
`atlas/ledger-pass.html`.

Its own gate: `node tests/validate-atlas.mjs` → **3,773 assertions**, including "no verified field is
copied from a legacy claim", "lead rows never populate prize/fee/deadline", "every internal link in the
repository resolves" and "every published page is reachable from the dashboard". CI rebuilds `atlas/`,
fails on any diff, then runs that gate.

> The two generators never write the same file: the root build owns the root pages and `category/*`,
> `scripts/build-atlas.mjs` owns `atlas/**`. Atlas data files are namespaced `atlas-*` so the two
> evidence sets cannot silently overwrite each other.

