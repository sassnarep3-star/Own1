# IRREGULARITIES.md — flagged for review

**Generated** 2026-11-01 from `python3 tools/audit.py` over `data/ledger.json`, plus the two rows contradicted by
their operator pages in `data/verification.json`. Machine-readable: [`data/audit.json`](data/audit.json).
Published on the live site as `flagged.html`.

Nothing here is an opinion about a company. Each item is a mismatch between what a catalogue row claims and what its
own citation shows. **None of these block publication** — they are published so a human can decide.

Severity: **high** = a fee or prize claim has no official support or is wrong; **medium** = the row misleads;
**low/info** = the catalogue's own presentation is inconsistent.

---

## Contradicted by the operator's own page

### C1 · Tom Howard/Margaret Reid Poetry Contest — labelled free, charges $27; labelled live, is closed
- Catalogue: `freePath: full` (“Free USD path”), `status: live`, prize “$12,000 total”.
- Operator: <https://winningwriters.com/our-contests/tom-howard-margaret-reid-poetry-contest>
  - “Fee: $27 per submission (one submission may contain up to 3 poems).”
  - “This contest is currently closed. It will open again on April 15, 2027.”
- Effect: a pay-to-enter, closed contest was presented as free money. Prize figure itself is correct.

### C2 · Weather Photographer of the Year — prize ladder not reproducible
- Catalogue: £5,000 winner / £2,500 mobile / £750 young.
- Operator confirms free entry: <https://www.rmets.org/weather-photographer-of-the-year> — “open to photographers of
  all skill levels worldwide and is free to enter”.
- Two 2026 listings publish £1,500 / £500 / £500:
  [all-about-photo](https://www.all-about-photo.com/photo-contests/photo-contest/5661/rmets-weather-photographer-of-the-year-2026),
  [Digital Camera World](https://www.digitalcameraworld.com/photography/awards-and-competitions/award-winning-photographers-all-started-somewhere-these-are-the-10-photo-contests-to-enter-this-august).
- Effect: verified prize withheld (blank) on the site; row flagged.

---

## F01 · 12 listings cite no official-tier source *(high)*

The source file's own stated rule: “any listing that states a specific prize figure must cite the operator's own
rules or game page”, with a tier of `official | affiliate | forum`. These rows cite only affiliate or forum pages:

| Row | Cited instead |
| --- | --- |
| `thelines-survivor` | thelines.com (affiliate) |
| `fantasy-arena` | allaboutfpl.com (affiliate) |
| `fplhub` | fpltips.com (affiliate) |
| `fplmanager-india` | allaboutfpl.com (affiliate) |
| `fplstore` | fpltips.com (affiliate) |
| `bona-fide` | reddit.com/r/FantasyPL (forum) |
| `olka` | reddit.com/r/FantasyPL (forum) |
| `pitchbooking` | reddit.com/r/FantasyPL (forum) |
| `roboforex-demo` | tradingbrokers.com (affiliate) |
| `fbs-pro-demo` | fofan.org (affiliate) |
| `npbfx-demo` | ndfxbonus.com (affiliate) |
| `tff-fantezi-lig` | shiftdelete.net (affiliate) |

## F02 · Three dollar prize ladders cite no official page *(high)*

| Row | Published prize | Cited only to |
| --- | --- | --- |
| `roboforex-demo` | 1st $700 … 10th $50 | tradingbrokers.com |
| `fbs-pro-demo` | 1st $450 … 5th $50 ($1,000 fund) | fofan.org |
| `npbfx-demo` | 1st $1,000 (+ iPhone) … 20th $50 | ndfxbonus.com |

These figures are reproduced in the tables as *source data, unverified*, and are never shown in the verified column.

## F03 · 19 rows share five sign-up URLs *(high)*

- `https://fantasy.premierleague.com/` — **11 rows** (fpl-official, ffs-fpl, football-mad, fantasy-arena, lazyfpl,
  fplhub, bona-fide, olka, fplmanager-india, fplstore, pitchbooking). The FPL game itself publishes **no cash prize**;
  the cash claims come from third-party mini-leagues with private rules. Any money would come from a private party,
  not an operator.
- `https://www.papaya.com/` — solitaire-cash, bingo-cash
- `https://gaming.uefa.com/en/uclfantasy` — ucl-fantasy, ffs-ucl
- `https://championsleague.cev.eu/` — cev-volley-fantasy, cev-predictor
- `https://tipping.afl.com.au/` — afl-tipping, aflw-tipping

## F04 · 9 listings are not competitions *(medium)*

Directories and pool-hosting tools publish no prize of their own; the money is the user's own group.

`reedsy-dir`, `mlcontests` (directories) · `officepoolstop`, `funofficepools`, `mysurvivorpool`, `gridirongames`,
`squarespool`, `myfantasyleague`, `trofeo` (pool tools).

## F05 · 26 ended rows sit inside the headline “free path” count *(medium)*

The reference site's JavaScript counts `freePath === "full"` with no status filter. 27 rows carry status
`ended`; 26 of them are `freePath: full`, so 26 out-of-season rows are inside the 189 headline. They cannot be entered today. Full list in `data/audit.json` (F05).

## F06 · 18 rows say the prize is not currently knowable *(medium)*

Phrases matched literally: “not currently published”, “not running”, “not verified”, “not confirmed”, “no longer”,
“n/a”, “tbd”, “confirm”, “varies”. Examples: `fox-super6` (“Not currently published — confirm on the live game
page”), `pickwatch` (“Not running for 2026”), `givling` (“Trivia removed — no longer a trivia contest”).
The verified prize column is blank for these rows by construction.

## F07 · 6 “free” rows whose own copy mentions a fee *(medium)*

`freePath` is `full`, but the description mentions an entry fee, buy-in, paid entry or deposit. The fee may correctly
apply only to a separate cash room — but the label and the copy disagree on the same row and need a human read.

## F08 · 15 “free” rows name a non-cash currency in the payout copy *(low)*

Gems, Gemz, tickets, Z coins, bonus cash. Not withdrawable dollars. The rows are kept but are not ranked as cash
prizes.

## F09 · 102 of 206 prizes are prose, not a figure *(info)*

“Cash rooms advertise prizes up to tens of dollars per event” does not become `$10` in a table. No amount is derived
from prose.

## F10 · “Added this pass” is one sub-list, not the set of additions *(low)*

The site renders the badge from `addedThisPass` (10 ids) and `addedThisPassC` (60 ids). The file also carries passes
G–S (10 ids each). Union of every `addedThisPass*` list: **192 ids**. Most later additions never receive the “New”
badge, and the headline “60 Added this pass” is a subset, not a count of additions.

## F11 · Masthead date disagrees with the data *(low)*

The reference `index.html` prints **“Pass C · 17 Aug 2026”** in the masthead while `assets/data.js` declares
`reviewed: 2026-08-19`, `pass: "S"`. A reader trusting the masthead is three passes and two days behind.

---

## Deliberately blank on the site (not an error)

- Any prize not read on an official page — including the three trading-demo ladders above.
- HIPA's category range upper bound ($50,000): unsupported by sources read.
- Kaggle / DrivenData entry fees: not stated on pages read, therefore not marked “confirmed free”.
- All currency figures in their original currency. No conversion, because no source in this repo supports a rate.

## Reproduce

```bash
python3 tools/audit.py        # writes data/audit.json
python3 tools/verify_check.py # validates data/verification.json
python3 tools/build_site.py   # rewrites flagged.html from both
```
