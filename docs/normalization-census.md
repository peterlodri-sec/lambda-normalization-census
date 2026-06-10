---
type: research
title: "A Normalization Census of the Untyped λ-Calculus (natural-size de Bruijn)"
updated: 2026-06-10T00:00:00
tags:
  - research
  - lambda-calculus
  - normalization
  - combinatorics
  - open-data
status: evergreen
related:
  - "[[2026-06-10-barendregt-geuvers-klop-conjecture]]"
  - "[[index]]"
---

# A Normalization Census of the Untyped λ-Calculus

> **One-line result.** In the standard natural-size de Bruijn model, we exhaustively (n≤16) and by Monte-Carlo (n≤55) classify closed λ-terms as **SN / WN-but-not-SN / non-WN**, confirm the closed-term count sequence is exactly **OEIS A275057**, and report the **smallest closed WN-but-not-SN term: natural size 13** — a quantity that appears undocumented in the literature. The data is consistent with the proven fact that **SN-density → 0** in this model, via a *decidability horizon*: the non-SN mass accumulates in the growing fraction of terms our bounded engine cannot decide.

This is the empirical capstone of the [[2026-06-10-barendregt-geuvers-klop-conjecture|BGK deep-dive]]: the BGK conjecture is about WN⟹SN in pure type systems; here we ask the *asymptotic* version in the untyped λ-calculus — **how dense are the WN-but-not-SN "separators"?**

## 1. Model (precisely specified)

Closed untyped λ-terms in de Bruijn notation, **natural size** (Bendkowski–Grygiel–Lescanne–Zaionc): every constructor costs 1, so a de Bruijn index $k$ has size $k+1$:
$$|\underline{k}| = k+1,\qquad |\lambda M| = 1+|M|,\qquad |M\,N| = 1+|M|+|N|.$$
The count of closed terms of size $n$ obeys $L(n,m)$ with
$$L(n{+}1,m)=\sum_{k=0}^{n}L(k,m)L(n{-}k,m)+L(n,m{+}1)+[\,m\ge n{+}1\,],\quad a(n)=L(n,0).$$
**We verified our computed sequence $0,1,1,3,6,17,41,116,313,895,2550,7450,21881,\dots$ is term-for-term [OEIS A275057](https://oeis.org/A275057)** ("closed λ-terms of natural size," Lescanne 2016) — so the model is exactly the standard one, not a variant.

## 2. Method

Each term is classified by a **bounded, α-quotiented reduction-graph analysis** (the validated `bgk_lab` engine): build the reachable graph up to caps (node_cap 3000, size_cap 200); **SN** ⟺ finite acyclic graph, **¬SN** ⟺ a β-cycle, **WN** ⟺ a *true* normal form is reachable. Four classes:

| class | meaning |
|---|---|
| **SN** | strongly normalizing |
| **SEP** | weakly normalizing but **not** strongly (a *separator*) |
| **NWN** | not even weakly normalizing (no normal form) |
| **UND** | undecided within caps |

Exhaustive enumeration for $n\le 16$; uniform Monte-Carlo (rank-unranking sampler over $L(n,m)$, $K=50000$/size) for $n\in\{17,\dots,55\}$. Run on a 16-core box.

## 3. Results

**Smallest separator.** The first closed WN-but-not-SN term appears at **natural size 13**:
$$(\lambda a.\lambda b.\,b)\,\Omega \;=\; \lambda\lambda 0\;(\lambda(0\,0)\;\lambda(0\,0)),\qquad |\cdot| = 3 + 9 + 1 = 13.$$
It is WN (the outer redex erases Ω, leaving $\lambda b.b$) and ¬SN (Ω loops). 13 = (smallest closed erasing function, size 3) + (smallest closed non-SN term Ω, size 9) + 1. The smallest closed **non-WN** term is Ω itself at size **9**.

**Densities (selected; full data in the dataset).**

| n | method | total/K | SN | SEP | NWN | UND | SN/decided | UND frac |
|---|---|---|---|---|---|---|---|---|
| 9 | exact | 313 | 312 | 0 | 1 | 0 | 1.0000 | 0 |
| 13 | exact | 21,881 | 21,803 | **3** | 51 | 24 | 0.99657 | 0.0011 |
| 16 | exact | 591,007 | 587,927 | 146 | 1,630 | 1,304 | 0.99699 | 0.0022 |
| 22 | MC 50k | — | 49,501 | 31 | 197 | 271 | 0.99541 | 0.0054 |
| 28 | MC 50k | — | 49,195 | 52 | 196 | 557 | 0.99496 | 0.0111 |
| 38 | MC 50k | — | 48,242 | 98 | 227 | 1,433 | 0.99323 | 0.0287 |

Two clear empirical trends as $n$ grows: the **separator (WN∖SN) fraction rises** (≈0.014% at n=13 → ≈0.20% at n=38, of decided terms), and the **undecided fraction climbs** (0 → ~2.9%).

## 4. Interpretation — the decidability horizon

There is an apparent paradox: **Bendkowski–Grygiel–Lescanne–Zaionc (2017, Cor. 4) prove SN-density → 0** in *exactly this model* ("asymptotically almost every λ-term is neither strongly normalising, nor typeable, nor in normal form"), yet our *decided* SN fraction stays ≥ 99%. The resolution is honest and important: SN-ness is undecidable, and our engine can only decide the **easy** terms — overwhelmingly SN at these sizes. The non-SN mass that the theorem promises lives in the **undecided tail**, which our data shows growing monotonically with $n$. So our numbers are *consistent* with SN-density → 0; they simply cannot *witness* the asymptotic collapse directly — they map the decidable frontier and quantify the hard core. This decidability horizon is itself a finding about where the difficulty concentrates. (Strikingly, the Monte-Carlo run *itself* became intractable at $n=70$ — per-term classification cost exploded as the undecided fraction grew — an accidental but vivid demonstration of the very horizon, so we report through $n=55$.)

**The size convention controls the answer.** David–Grygiel–Kozik–Raffalli–Theyssier–Zaionc (2013, *LMCS* 9(1):2) prove the **opposite** — SN-density → **1** — but in a model where **variables cost 0** (unary-binary trees, size = inner nodes). There, variables can sit arbitrarily far from their binders for free, forcing head-normal/SN shapes; in the natural model, deep indices are expensive, so variables localize and non-SN subterms like Ω saturate almost all terms. Our census lives squarely in the latter (A275057) regime.

## 5. What is novel here

- **First empirical tabulation of the WN∖SN separator density**, and the **smallest closed separator (size 13)** — both apparently unrecorded; the asymptotic separator/WN density is *not computed* in either foundational paper (WN itself is the uncharacterized quantity).
- A clean **open dataset** (exact + Monte-Carlo, with Wilson CIs) tying the A275057 combinatorics to the SN/WN/¬WN decision.
- The **decidability-horizon** observation reconciling a high decided-SN fraction with the proven SN-density → 0.

## 6. Open questions (genuinely open)

- The asymptotic density of **WN** (and hence of the WN∖SN gap) in the natural model — uncomputed.
- The exact **growth rate of the smallest separator** under richer term families / typed restrictions.
- Whether the separator-density curve has a closed-form / limit.

## 7. Open data & code
- `census_dataset.json` / `census_dataset.csv` — per-size counts, densities, Wilson CIs, smallest-separator witness, A275057 counts.
- `debruijn_census.py` (counter + uniform sampler + classifier), `bgk_lab.py` (reduction engine).

## 8. Sources
- M. Bendkowski, K. Grygiel, P. Lescanne, M. Zaionc, **"Combinatorics of λ-terms: a natural approach,"** J. Logic & Computation 27(8):2611–2630, 2017 (arXiv:1609.07593); SOFSEM 2016 / arXiv:1506.02367. — natural-size model; **SN-density 0** (Cor. 4).
- R. David, K. Grygiel, J. Kozik, C. Raffalli, G. Theyssier, M. Zaionc, **"Asymptotically almost all λ-terms are strongly normalizing,"** Logical Methods in CS 9(1):2, 2013 (arXiv:0903.5505). — variables-size-0 model; **SN-density 1** (Thm 6.18); CL opposite (Thm 7.3).
- OEIS [A275057](https://oeis.org/A275057) (P. Lescanne, 2016) — closed λ-terms, natural size.
- R. C. de Vrijer (1987); van Raamsdonk–Severi–Sørensen–Xi (1999) — perpetual / maximal reductions (engine background).

> **Honesty note.** Densities are over a *decided* subpopulation with a clearly-stated, growing undecided remainder; Monte-Carlo points carry sampling error (Wilson 95% CIs in the dataset). No asymptotic claim is made beyond what the cited theorems prove; our contribution is exact small-n data, the separator gap, and the smallest-separator constant.
