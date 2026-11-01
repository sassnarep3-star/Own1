# VERIFICATION.md — what was checked, against what, and what it said

**Checked:** 2026-11-01 · **Rows checked:** 12 of 206 · **Owner:** session `d21e8702-own1`
**Machine-readable evidence:** [`data/verification.json`](data/verification.json) · **Site page:** `verification.html`

## The rule this file enforces

> Every table row must have a source link to an official site. If a value can't be confirmed from an official
> source, leave it blank and flag it as unverified. Never infer or fill in values.

Concretely:

| Layer | Contains | Never contains |
| --- | --- | --- |
| `data/ledger.json` | The catalogue exactly as the reference site published it | Anything we checked or corrected |
| `data/verification.json` | URL + verbatim quote + checked date + status | A value without a quote |
| `Verified prize` column on the site | A number, only if read on an operator page | A converted currency, a midpoint, an estimate |
| Everything else | The operator link and the catalogue's own words | A verification claim |

`tools/verify_check.py` fails the build if any entry has a claim without a URL, a status outside the allowed set, or
a verified prize on a row whose prize is contradicted.

## Results

| Status | Count | Rows |
| --- | --- | --- |
| **Verified** | 7 | Wergle Flomp Humor Poetry Contest · ARC Prize 2026 · Metaculus Tournaments · Checkmate Gaming free tournaments · World Press Photo · Sony World Photography Awards · Istanbul Photo Awards |
| **Partly verified** | 3 | Kaggle Competitions · DrivenData · HIPA |
| **Contradicted** | 2 | Tom Howard/Margaret Reid Poetry Contest · Weather Photographer of the Year (RMetS) |
| **Not checked this pass** | 194 | Everything else — operator link only, no claim |

### The two contradictions

**1. Tom Howard/Margaret Reid Poetry Contest** — catalogue says `Free USD path`, `live`.
Operator page: <https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest>

> “Fee: $27 per submission (one submission may contain up to 3 poems). Enter as many submissions as you wish.”

> “This contest is currently closed. It will open again on April 15, 2027.”

Both the free-entry label and the availability status are wrong on the same row. The prize figure ($12,000 total;
two $3,500 prizes; ten $500 honourable mentions) *is* correct and was kept.

**2. Weather Photographer of the Year (RMetS)** — catalogue says £5,000 / £2,500 / £750.
Operator page confirms free entry: <https://www.rmets.org/weather-photographer-of-the-year>

> “This annual competition is open to photographers of all skill levels worldwide and is free to enter.”

But two independent 2026 listings publish £1,500 / £500 / £500
([all-about-photo](https://www.all-about-photo.com/photo-contests/photo-contest/5661/rmets-weather-photographer-of-the-year-2026),
[Digital Camera World](https://www.digitalcameraworld.com/photography/awards-and-competitions/award-winning-photographers-all-started-somewhere-these-are-the-10-photo-contests-to-enter-this-august)),
and a third reports a £2,000 pool. Because the sources disagree with each other and the operator's prize page was not
opened directly, **the verified prize is left blank** and the row is flagged.

### Confirmed figures worth knowing

| Row | Confirmed | Source |
| --- | --- | --- |
| Wergle Flomp | No fee · $5,100 total · 1st $2,000 · closes 1 Apr 2027 | [winningwriters.com](https://winningwriters.com/our-contests/wergle-flomp-humor-poetry-contest-free) |
| ARC Prize 2026 | $2,000,000 · 3 tracks · hosted on Kaggle | [arcprize.org](https://arcprize.org/) |
| Metaculus | “participate for free and win cash prizes” · 19 live tournaments · $3,400–$50,000 pools · 5 with no pool | [metaculus.com/tournaments](https://www.metaculus.com/tournaments/) |
| Checkmate Gaming | “Totally free to enter with real cash prizes” · free-entry prizes $40–$120 today; a $1,500 event on the same page is paid entry | [checkmategaming.com](https://www.checkmategaming.com/free-tournaments) |
| Kaggle | prizes labelled $35,000 / $100,000 / $450,000 on live hackathons; entry fee not stated on the page read | [kaggle.com/competitions](https://www.kaggle.com/competitions) |
| DrivenData | $300,000 live prize challenge (“4 weeks left” on 2026-11-01) | [drivendata.org](https://www.drivendata.org/competitions/) |

## Evidence quality, stated rather than averaged

- `official-page` — the operator's own page was opened and read (ARC Prize, Metaculus, Kaggle, DrivenData, Checkmate
  Gaming, Winning Writers Tom Howard, RMetS).
- `official-page-index` — the operator's page text came back through a search index; the URL is still the operator's
  (Wergle Flomp, RMetS).
- `secondary-official-terms` — a third party quoting the operator's published terms; the operator page was not
  opened (World Press Photo, Sony, HIPA, Istanbul). **Weaker evidence, labelled as such on the site.**

## Deliberately left blank

- Every trading-demo prize ladder cited only to affiliate pages (RoboForex $700, FBS $450, NPBFX $1,000 top prizes) —
  see finding F02.
- HIPA's “$20,000–$50,000 category prizes”: the $50,000 upper bound has no support in the sources read.
- Kaggle's and DrivenData's entry fee: “no fee stated in marketing copy” is not proof of “free”.
- Any prize published as prose only (102 rows).

## Reproduce

```bash
python3 tools/verify_check.py   # validates the evidence file's schema, exits non-zero on any unsourced claim
python3 tools/audit.py          # recomputes the 11 integrity findings from the mirror
python3 tools/build_site.py     # renders the site
python3 tools/check_links.py    # internal links, anchors, row coverage — must print RESULT: pass
```

## Why only 12 of 206

A number that was not read on an official page is a guess. Rows were prioritised by value — the rows where a real
cash prize is claimed to be free, plus every row a reasonable person would give up a weekend for. The route to
promote a row is mechanical: open the operator page, record the URL, quote the text, re-run the checker.
