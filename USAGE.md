# Usage

Everything is **pure Python 3.9+ standard library** — no `pip install`, no virtualenv required.

```bash
git clone https://github.com/peterlodri-sec/lambda-normalization-census
cd lambda-normalization-census
```

## 1. The normalization census

Classifies closed untyped λ-terms (de Bruijn, natural size) into SN / separator / non-WN / undecided — exact for n ≤ 16, uniform Monte-Carlo (K=50 000) for larger n.

```bash
python3 src/debruijn_census.py census > my_census.json     # full run (uses all cores)
python3 src/debruijn_census.py selftest                    # counts vs OEIS A275057, sampler, preview
```

Tunables live at the bottom of `debruijn_census.py` (`run_census(ex_max=…, mc_plan=[…], K=…)`).

Then assemble the publishable dataset (per-size densities + Wilson CIs + smallest-separator witness):

```bash
python3 src/build_census_dataset.py        # writes census_dataset.json + census_dataset.csv
```

## 2. The BGK conservation lab

Seven experiments around weak vs. strong normalization (conservation in λI, the λK separator onset, reduction geometry, the perpetual-strategy law, Klop's ι-translation transfer, a parallel-speedup benchmark, and a reduction-graph zoo). The argument is the wall-clock budget **per experiment** in seconds.

```bash
python3 src/bgk_lab.py 240 > bgk_results.json
```

Key functions you can import (`from bgk_lab import …`):

| symbol | does |
|---|---|
| `analyze(term, node_cap, size_cap)` | bounded α-quotiented reduction-graph analysis → `{sn, wn, …}` |
| `one_step`, `contract`, `subst` | capture-avoiding β-reduction |
| `perpetual_step` / `perpetual_diverges` | the perpetual (maximal) strategy |
| `iota` | Klop's ι-translation into the extended λI₍,₎ calculus |
| `gen_by_size(n, alphabet, lambda_I)` | exhaustive term enumeration |

Term representation: `('v', name) | ('l', x, body) | ('a', f, x) | ('p', T, U)` (the last is Klop's memory pair).

## 3. The interactive report

```bash
open report/index.html       # macOS  (or: xdg-open / just open the file)
```

Self-contained (ECharts + Cytoscape + KaTeX are vendored under `report/vendor/`), opens offline. To regenerate `report/data.js` from fresh run outputs, see `src/build_census_dataset.py` and the report's `data.js` shape (`window.BGK_DATA = {...}`).

## Data files

- `data/census_dataset.{json,csv}` — the census (see README for the column spec).
- `data/bgk_lab_results.json` — a full 7-experiment BGK lab run.
- `data/crabcc_kernel_index.json` — bonus: crabcc 6.3 symbol-index stats over Linux 6.18 LTS.
