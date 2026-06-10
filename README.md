# λ-Normalization Census

[![Code: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-green.svg)](data/LICENSE)
[![OEIS A275057](https://img.shields.io/badge/OEIS-A275057-orange.svg)](https://oeis.org/A275057)
[![deps: none](https://img.shields.io/badge/deps-stdlib%20only-success.svg)](#reproduce)

> A reproducible **open dataset + engine** for the *normalization geometry* of the untyped λ-calculus, built around the open **Barendregt–Geuvers–Klop (BGK) conjecture** (does weak normalization imply strong normalization in pure type systems?).

We classify λ-terms as **SN** (strongly normalizing), **separator** (weakly normalizing but **not** strongly — the "WN∖SN gap"), or **non-WN**, by exhaustive enumeration and Monte-Carlo sampling, and we tabulate quantities that — as far as the literature shows — were previously unrecorded.

## Headline results

- **Smallest closed WN-but-not-SN term has natural size 13:** `(λa.λb.b) Ω` (an erasing function applied to Ω). Apparently undocumented; the WN∖SN gap is not tabulated in the combinatorics-of-λ literature.
- **The separator-density curve** (WN∖SN fraction vs term size) — measured here, plotted [in the report](report/) — appears to be new.
- **Model validated:** our closed-term count sequence is *exactly* **[OEIS A275057](https://oeis.org/A275057)** (Lescanne 2016, natural-size de Bruijn).
- **Consistent with theory, honestly framed:** Bendkowski–Grygiel–Lescanne–Zaionc (2017) prove **SN-density → 0** in this model; our *decided*-SN stays ≥ 99% because the non-SN mass hides in a **growing undecided tail** (a "decidability horizon"). This is the *opposite* of David et al. (2013), whose size convention (variables cost 0) gives SN-density → 1.
- **BGK conservation lab** (companion): exhaustive check that the erasure-free λI fragment has **0 separators across 3.13 M terms**, the perpetual-strategy law (`diverges ⟺ ¬SN`) holds with **0 violations / 762 k**, and Klop's ι-translation transfer `SN(M) ⟺ SN(ι(M))` holds with **0 violations / 711 k**.

## Repository layout

```
src/                 pure-stdlib Python engine (no dependencies)
  bgk_lab.py           reduction-graph analyzer (SN/WN deciders, perpetual strategy, ι-translation) + BGK experiments
  debruijn_census.py   natural-size de Bruijn counter + uniform sampler + classifier (the census)
  normalize_check.py   standalone β-reduction sanity checks
  build_census_dataset.py   assembles the open dataset (JSON + CSV) with Wilson CIs
data/                open data
  census_dataset.{json,csv}   per-size SN/SEP/NWN/UND counts, densities, CIs, smallest-separator witness
  bgk_lab_results.json        full BGK lab run (7 experiments)
  crabcc_kernel_index.json    bonus: crabcc symbol-index stats of Linux 7.0.12
docs/                research notes (fully cited)
  normalization-census.md
  bgk-conjecture-deep-dive.md
report/              self-contained interactive report (open report/index.html)
```

## Reproduce

No dependencies — just Python 3.9+ (standard library only).

```bash
# the normalization census (exact n≤16, Monte-Carlo to n=90) — writes JSON to stdout
python3 src/debruijn_census.py census > my_census.json

# rebuild the open dataset (JSON + CSV) from a run
python3 src/build_census_dataset.py

# the BGK conservation / separator / perpetual / ι-translation lab (arg = seconds/experiment)
python3 src/bgk_lab.py 240   > bgk_results.json

# sanity self-tests (counts vs OEIS A275057, sampler exactness, classifier preview)
python3 src/debruijn_census.py selftest
```

The census is embarrassingly parallel (`multiprocessing`); it was run on a 16-core box but scales to any core count.

## The dataset

`data/census_dataset.csv` columns: `n, method, total, SN, SEP, NWN, UND, decided, dens_SN_of_total, dens_SN_of_decided, dens_SEP_of_decided, frac_undecided`. `method` is `exact` (full enumeration, n≤16) or `montecarlo` (K=50 000 uniform samples). **SN** = strongly normalizing, **SEP** = separator (WN∧¬SN), **NWN** = no normal form, **UND** = undecided within the engine's bounded reduction-graph caps (node 3000, size 200). Monte-Carlo rows carry Wilson 95% CIs in the JSON.

## Interactive report

`report/index.html` is a self-contained dark-theme report (ECharts + Cytoscape + KaTeX, vendored — opens offline): the conservation experiments, the separator-density curve, the reduction-graph zoo, and a crabcc × Linux-kernel bonus panel.

## Provenance & honesty

This is **machine-assisted research**: experiments were designed, run, verified, and written up with substantial AI orchestration, then cross-checked against primary sources (cited in `docs/`). Every quantitative claim is *computed*, not asserted. We distinguish proven theorems (cited) from our empirical measurements, and we state the undecided remainder explicitly. The BGK conjecture itself remains **open**; nothing here resolves it — the experiments corroborate the *mechanism* (erasure as the obstruction to WN⟹SN).

## Citing

See [`CITATION.cff`](CITATION.cff). Please also cite the primary sources in `docs/` (Bendkowski–Grygiel–Lescanne–Zaionc 2017; David et al. 2013; Lescanne / OEIS A275057).

## License

Code: [MIT](LICENSE). Data & docs: [CC BY 4.0](data/LICENSE).

## Acknowledgements

Standing on: Church (1941); Barendregt, Bergstra, Klop, Volken; Sørensen; Geuvers; de Vrijer; David–Grygiel–Kozik–Raffalli–Theyssier–Zaionc; Bendkowski–Grygiel–Lescanne–Zaionc; Lescanne (OEIS A275057). Tooling: [`crabcc`](https://github.com/crabcc-labs/crabcc).

---
*If this is useful for your work, [sponsorship](https://github.com/sponsors/peterlodri-sec) supports continued open compute + data.*
