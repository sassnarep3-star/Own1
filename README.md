# Prize Atlas

A mobile-first dashboard for **free-to-enter cash prize competitions**, built so that every
figure on the page can be traced to the operator's own rules page — and everything that cannot be
traced is visibly blank.

**Live site:** https://sassnarep3-star.github.io/Own1/

| Entry point | What it is |
| --- | --- |
| `index.html` | Dashboard: stats, best-documented free entries, category grid, filterable table of all 211 entries |
| `shortlist.html` | Six tiers, ordered by a published rubric (free entry + confirmed cash + open now ranks first) |
| `categories.html` + `category/*.html` | Nine categories with their own tables |
| `summary.html` | Executive summary: what the evidence supports, what to ignore |
| `methodology.html` | Evidence levels, the actionability rubric, the blank-field policy, known limits |
| `review.html` | Flagged for review: 180 unverified leads plus 11 documented irregularities with source links |
| `all.html` | Every entry in one static table — works with JavaScript disabled |

## The one rule

A prize, entry cost, deadline or eligibility line appears **only** if a person opened the
operator's page and read it. Otherwise the field is empty, the row is marked *unverified lead*, and
it is published on the review page. No estimates, no aggregator figures, no "typical payout".

Current state (1 November 2026): **211 entries · 28 verified · 3 platform indexes · 180 unverified
leads · 57 flags**. Full page-by-page notes: [research/VERIFICATION.md](research/VERIFICATION.md).

## Repository layout

```
index.html shortlist.html categories.html summary.html methodology.html review.html all.html 404.html
category/<slug>.html          generated category pages
data/entries.json             the dataset (one object per competition)
data/categories.json          the nine categories and their descriptions
data/irregularities.json      documented problems, each with source links
src/template.mjs              shared shell (head, nav, footer) used by every page
src/pages.mjs                 page bodies
scripts/build.mjs             generates every .html from data/ + src/
assets/style.css              one stylesheet, no frameworks or web fonts
assets/app.js                 filters, sorting, row details, shortlist tiers
tests/validate.mjs            schema, blank-field policy, internal links, build freshness
tests/links.mjs               external link reachability (advisory, writes research/link-report.md)
research/                     verification log, source list, executive summary
COORDINATION.md               shared task board for parallel agent sessions
```

## Working on it

```bash
node scripts/build.mjs      # regenerate every page after editing data/ or src/
node tests/validate.mjs     # schema + policy + internal links (must pass before publishing)
python3 -m http.server 8000 --bind 0.0.0.0   # preview at http://localhost:8000
```

No dependencies, no build tooling beyond Node 22. GitHub Pages serves the repository root from
`main`; `.nojekyll` keeps the `assets/` and `data/` folders untouched.

## Adding or verifying an entry

1. Open the operator's own page and read the fact you want to publish.
2. Edit that row in `data/entries.json`: set `status` to `verified` (or `platform` for an index),
   fill only the fields the page prints, set `verifiedOn`, `entryCost`, `cash`, `openNow` and
   `effort`, and add a `flags` entry for anything surprising (fee, AI restriction, non-cash prize,
   contradiction).
3. Run `node scripts/build.mjs` and `node tests/validate.mjs`.
4. If the page contradicted the catalogue or could not be loaded, add it to
   `data/irregularities.json` so it appears on the review page.

The test suite refuses to publish a lead row that carries a prize figure, a `free` entry claim
without a verification date, a non-HTTPS source, or a broken internal link.

## Licence and disclaimer

Research notes and site content are provided for personal research. Not financial, legal or tax
advice. Rules change without notice — the operator's page always controls.
