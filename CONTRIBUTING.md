# Contributing

Contributions are welcome — this is a small, dependency-free research repo, easy to hack on.

## Ways to contribute

- **Extend the census.** Push the exact enumeration higher, add Monte-Carlo sizes, or tighten the engine's decision power (larger `node_cap`/`size_cap`, smarter SN deciders) and re-run. New rows → update `data/census_dataset.{json,csv}` via `src/build_census_dataset.py`.
- **New term models.** Add other size conventions (e.g. variables-cost-0 à la David et al., binary-λ-calculus / Tromp size) so densities can be compared across models in one place.
- **Better deciders.** The biggest open lever is the **undecided fraction**. A stronger SN/WN decider (e.g. perpetual-reduction bounds, type-based shortcuts) directly improves the dataset.
- **New experiments / theory checks.** Anything that computes a normalization-theoretic quantity and ships the data.
- **Report & viz.** The `report/` page is plain HTML/JS/CSS + ECharts/Cytoscape/KaTeX — design and UX PRs welcome.
- **Citations / corrections.** If a result we call "unrecorded" is in fact published, open an issue with the reference — we'll happily correct.

## Ground rules (the research bar)

1. **Computed, not asserted.** Every quantitative claim must be reproducible from code in `src/`. Include the command.
2. **State the undecided remainder.** Don't report a density without its decided/undecided split and (for sampling) a confidence interval.
3. **Cite primary sources** for any theorem, and clearly separate *proven* from *empirical*.
4. **Don't conflate models.** Always say which size convention a number is in.

## Dev setup

No dependencies. Python 3.9+.

```bash
python3 src/debruijn_census.py selftest   # must pass (counts match OEIS A275057, sampler exact)
python3 src/bgk_lab.py 8                   # quick smoke (tiny budget)
```

## PR checklist

- [ ] `debruijn_census.py selftest` passes.
- [ ] New data regenerated with `build_census_dataset.py` (don't hand-edit CSV/JSON).
- [ ] Claims cite a source or a reproducing command.
- [ ] Model / size convention stated explicitly.
- [ ] Code stays stdlib-only (no new deps) unless discussed in an issue first.

## Code style

Match the surrounding code: small pure functions, explicit term tuples, comments where a step is subtle (the reduction-graph caps and the "true normal form vs size-capped dead-end" distinction in `analyze` are the load-bearing subtleties — see the inline note there).

By contributing you agree your code is MIT-licensed and your data/docs are CC BY 4.0.
