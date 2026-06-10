---
type: research
title: "Barendregt–Geuvers–Klop Conjecture — Deep Dive"
updated: 2026-06-10T00:00:00
tags:
  - research
  - type-theory
  - lambda-calculus
  - normalization
  - pure-type-systems
status: evergreen
related:
  - "[[index]]"
  - "[[overview]]"
---

# The Barendregt–Geuvers–Klop Conjecture — Deep Dive

> **Status (verified Jun 2026):** OPEN. TLCA *List of Open Problems* **#9**; Geuvers (1993) thesis Conjecture 8.1.x; Wikipedia "unsolved problem in computer science." No published full proof; no separating counterexample. Proven only for restricted classes (Sørensen 1997; Barthe–Hatcliff–Sørensen 2001; Roux–van Doorn 2014; Mull 2022/23).

**The conjecture.** *Every weakly normalizing pure type system is strongly normalizing* — i.e. there is no PTS in which every typable term has **some** normal form (WN) yet **some** term admits an infinite reduction (¬SN).

This note assembles three deep dives plus a machine-checked corroboration:
1. The **conservation engine** (why the *typed* world can hope for WN⇒SN) — full reconstruction of the λI Conservation Theorem and Bergstra–Klop.
2. Why the **CPS / λI translation** technique that proves the known sub-cases **breaks under dependency**.
3. **Mull (2023)** — the irrelevancy-eliminating translation, the most recent progress, and exactly what it buys.
4. **Empirical corroboration** — an executable normalization checker, run locally and fanned out across 16 cores on `dev-cx53`.

A **corrections ledger** (§8) records where an adversarial verification pass refined the claims (15 of 21 load-bearing claims needed precision fixes — theorem numbers, exact definitions).

---

## 0. Definitions (so every symbol is fixed)

A **Pure Type System (PTS)** $\lambda S$ is a triple $(\mathcal S,\mathcal A,\mathcal R)$: sorts $\mathcal S$; axioms $\mathcal A\subseteq\mathcal S\times\mathcal S$ ($\langle s_1,s_2\rangle$ = "$s_1:s_2$"); rules $\mathcal R\subseteq\mathcal S\times\mathcal S\times\mathcal S$ governing Π-formation. Seven schematic typing rules (axiom, start, weakening, product, application, abstraction, conversion) are parameterized by $\mathcal A,\mathcal R$ (Barendregt, *Introduction to generalized type systems*, JFP 1(2):125–154, 1991; Handbook chapter *Lambda calculi with types*, 1992).

The **λ-cube** = the eight PTSs with $\mathcal S=\{\ast,\Box\}$, axiom $(\ast:\Box)$, and $\{(\ast,\ast,\ast)\}\subseteq\mathcal R\subseteq\{(\ast,\ast,\ast),(\ast,\Box,\Box),(\Box,\ast,\ast),(\Box,\Box,\Box)\}$. Top corner (all four) = **Calculus of Constructions**.

- **WN:** every typable term has *some* reduction to normal form.
- **SN:** *every* reduction sequence terminates. Trivially $\mathrm{SN}\subseteq\mathrm{WN}$; the conjecture is a partial converse.
- **Functional** ≠ **singly-sorted**: functional = *both* $\mathcal A$ and $\mathcal R$ deterministic in their last component; singly-sorted = only $\mathcal A$ functional.

**The seed of the whole problem (untyped):** in the λK-calculus,
$$(\lambda x.y)\,\Omega,\qquad \Omega=(\lambda z.zz)(\lambda z.zz)$$
is WN (contract the outer redex, *erasing* $\Omega$, reach $y$) but not SN (reduce $\Omega\to\Omega\to\cdots$). The villain is **erasure**. Everything below is about whether the type discipline can stop a non-terminating subterm from being parked in an erasable position and then discarded.

---

## 1. The conservation engine: λI and Bergstra–Klop

### 1.1 λI-calculus
$\Lambda_I$ = terms in which **every abstraction $\lambda x.M$ has $x\in\mathrm{FV}(M)$** — no abstraction can erase. Consequences: every redex inside a λI-term is **non-erasing**; $\Lambda_I$ is closed under β-reduction; and **free variables are invariant under reduction** (a λK $K$-step can shrink $\mathrm{FV}$; λI never does).

### 1.2 Conservation Theorem (origin: **Church 1941**)
> **For any λI-term $M$: $M$ is WN $\iff$ $M$ is SN.** Equivalently, on $\Lambda_I$, $\mathrm{WN}=\mathrm{SN}$.

Originally **Church (1941)**; in Barendregt, *The Lambda Calculus: Its Syntax and Semantics* (1984) it is **Theorem 9.1.5** (Ch. 9, "The λI-calculus"). *(My earlier "11.3.x" recollection was wrong — see ledger §8.)* The local/step form, which is the engine:

> **Conservation, step form (λI-redexes are perpetual).** If $M\to N$ contracts a redex inside a λI-term, then $\infty M \iff \infty N$ (here $\infty M$ ≡ "$M$ has an infinite reduction"). I.e. contracting a non-erasing redex can neither create nor destroy the existence of an infinite reduction.

The "$\Leftarrow$" is trivial; the content is "$\Rightarrow$" = **SN-reflection**: $N\in\mathrm{SN}\Rightarrow M\in\mathrm{SN}$.

### 1.3 Proof skeleton (perpetual strategy + Finite Developments)
**Step form ⇒ full theorem.** Take a normalizing reduction $M=M_0\to\cdots\to M_n=\mathrm{nf}$. Each $M_i\in\Lambda_I$, so each contracted redex is non-erasing. A normal form is SN; walk the chain *backwards* applying the step form: $\neg\infty M_n\Rightarrow\cdots\Rightarrow\neg\infty M_0$. Hence $M\in\mathrm{SN}$.

**Step form itself** uses the **perpetual strategy** $F_\infty$ (Barendregt–Bergstra–Klop–Volken 1976): given the *special sequence* of redexes ($R_0$ = leftmost redex; $R_{n+1}$ = leftmost redex of $\mathrm{Arg}(R_n)$ if that argument is not normal), $F_\infty$ contracts the **first $I$-redex** of that sequence (else the last). Two facts close it:
- **$F_\infty$ is perpetual:** $\infty M\Rightarrow\infty F_\infty(M)$.
- **Projection over a non-erasing step annihilates no step.** In the reduction-diagram construction (well-defined by the **Finite Developments Theorem** — all developments of a marked redex-set terminate and are confluent), a step vanishes under projection over $R$ *only* in Bergstra–Klop's recorded situation $R\sqsubseteq B$ with $R$ a $K$-redex (erasing). When $R$ is non-erasing ($x\in\mathrm{FV}(A)$), the argument $B$ and every residual inside it survive in $A[x{:=}B]$, so **no step is annihilated** → the projected reduction is still infinite → $\infty N$.

### 1.4 Bergstra–Klop (1982): the general law
> **Every non-erasing redex is perpetual — in the full λK-calculus.** If $M\to M'$ contracts $(\lambda x.A)B$ with $x\in\mathrm{FV}(A)$, then $\infty M\Rightarrow\infty M'$, i.e. $M'\in\mathrm{SN}\Rightarrow M\in\mathrm{SN}$.

(Bergstra & Klop, *Strong normalization and perpetual reductions in the lambda calculus*, EIK 18:403–417, 1982.) λI is the special case where *all* redexes are non-erasing — which is why this implies Conservation. The 1982 paper goes further and characterizes *which erasing redexes are perpetual*: a $K$-redex $(\lambda x.A)B$ is perpetual $\iff A\geq_\infty B$ (every SN-substitution that makes $B$ diverge already makes $A$ diverge). So:

> **All perpetual redexes:** $(\lambda x.A)B$ perpetual $\iff x\in\mathrm{FV}(A)$ **or** $A\geq_\infty B$.

**Slogan:** *erasure is the only way a β-step can lose an infinite reduction.*

| | λI (all redexes non-erasing) | λK, one non-erasing redex | λK, erasing $K$-redex |
|---|---|---|---|
| WN ⟺ SN? | **Yes** (Church / Barendregt 9.1.5) | — | No: $(\lambda x.y)\Omega$ |
| Step reflects SN? | Yes | **Yes** (Bergstra–Klop) | iff $A\geq_\infty B$ |
| Proof engine | $F_\infty$ + Finite Developments | same | $F^\ast$ + standardization + $\geq_\infty$ |

---

## 2. The λI-translation device: reducing SN to WN

The positive results all work by **moving the erasing world into the non-erasing one**, via a translation $\overline{(\cdot)}$ that *retains* what would be erased (Klop's **ι-translation**; refined by Sørensen, Xi, Gandy, Loader; systematized by Gørtz–Reuß–Sørensen 2003).

Klop's extended calculus $\lambda I_{[,]}$ adds a **memory/pairing operator** $[T,U]$ with rule $[T,U]\,T'\to[T\,T',U]$. The translation $i(\cdot)$:
$$i(\lambda x.t)=\lambda x.i(t)\ \text{ if }x\in\mathrm{FV}(t);\qquad i(\lambda x.t)=\lambda x.[\,i(t),x\,]\ \text{ if }x\notin\mathrm{FV}(t)\ \text{(erasing → park }x).$$
So an erasing redex's argument is **retained in a thunk** instead of discarded:
$$i((\lambda x.M)N)=(\lambda x.[i(M),x])\,i(N)\to[\,i(M),i(N)\,].$$
Any divergence that lived in $N$ now lives in the still-present $i(N)$ — it can no longer hide behind erasure.

**The chain** (this is the heart of every sub-case proof):
$$M\in\mathrm{WN}_\beta \;\overset{(\ast)}{\Longrightarrow}\; \overline M\in\mathrm{WN}\;\overset{\text{λI-conservation}}{\Longrightarrow}\;\overline M\in\mathrm{SN}\;\overset{(\dagger)}{\Longrightarrow}\;M\in\mathrm{SN}.$$
- $(\ast)$ normal forms transfer through the translation;
- **conservation** (§1.2) is the *only* place the magic happens — legitimate precisely because the translation removed erasure;
- $(\dagger)$ the translation simulates each source step by $\geq 1$ target step (strict on retained subterms), so SN reflects back.

Sources: Klop 1980 (thesis); Sørensen, *Strong normalization from weak normalization in typed λ-calculi*, Inf. & Comput. 133(1):35–71, 1997; Gørtz, Reuß & Sørensen, *Strong normalization from weak normalization by translation into the λI-calculus*, HOSC 16(3):253–285, 2003. (Modern verbatim restatements: Kikuchi CSL 2013; Kikuchi–Lengrand FoSSaCS 2008.)

---

## 3. Why dependency breaks the technique

The CPS/λI translation must be **type-preserving** — $\Gamma\vdash M:A \Rightarrow \overline\Gamma\vdash\overline M:\overline A$ — or the chain in §2 cannot even start (you need: $M$ typable ⇒ $\overline M$ typable ⇒ WN ⇒ …). Two ways dependency destroys this:

### 3.1 The abstraction clause forces type-directed recursion
$$\langle\lambda x{:}\sigma.M\rangle=\lambda k{:}\tau.\,k\,(\lambda x{:}\langle\sigma\rangle.\langle M\rangle),\qquad\text{“what is }\tau\text{?”}$$
Type preservation forces $\tau=\neg\rho^{+}=\rho^{+}\!\to\!\bot$, the negation of the **value** translation of the abstraction's own type $\rho$ *(not $\langle\rho\rangle$ — ledger §8)*. So **term-translation now calls type-translation.**
- **Non-dependent PTS** ($(s_1,s_2,s_3)\in\mathcal R\Rightarrow s_1\geq s_2\geq s_3$ in sort order — forbids $(\ast,\Box)$): types are stratified strictly above terms, so type-translation never calls back into term-translation. Well-founded. Also $B[x{:=}N]=B$ (no dependency), so the substitution lemma is trivial. The chain closes.
- **Dependent PTS** (rules $(\ast,\Box,\Box)$, $(\ast,\ast,\ast)$, …): a type $\Pi x{:}A.B$ contains the term $x$; after application the result type is $B[x{:=}N]$ — a type containing a term. Now type- and term-translation are **mutually recursive with no well-founded measure** ("$\rho$ may contain $M$ as a subterm" — BHS, HOSC 12(2):125–170, 1999, §1.3). The definition itself fails to be well-founded.

### 3.2 Substitution doesn't commute with translation (the concrete clash)
Type preservation for [App] needs $\big(B[e'/x]\big)^{+}=B^{+}[\,?/x\,]$. In CBV CPS the bound variable $x$ holds a **value** of type $A^{+}$, but the translated argument $e'^{\div}$ is a **non-returning computation** of type $A^{\div}=(A^{+}\!\to\!\bot)\!\to\!\bot$ — there is no canonical value to substitute. Bowman–Cong–Rioux–Ahmed (POPL 2018, §3) make it concrete: the CPS image of $e\,e'$ fails to type-check because $f\,x$ demands a continuation of type $(B^{+}[x/x]\to\bot)$ while $k$ has type $(B^{+}[e'^{+}/x]\to\bot)$ — "*somehow we need $x\equiv e'^{+}$*," which is unprovable for a generically bound $x$.

**Worked instance.** With $A=\mathrm{Nat}$, $B=\mathrm{Vec}\,x$, $e':\!=n$: the answer continuation $k$ must have type $(\mathbf{Vec}\,n^{+})\to\bot$, but the inner application $f\,x$ demands $k:(\mathbf{Vec}\,x)\to\bot$. Equal **iff** $x\equiv n^{+}$ — false for a bound variable ranging over all of $\mathbf{Nat}$. The substitution-vs-translation square does not commute. This is *exactly* why BHS (2001) restrict to **non-dependent** systems.

### 3.3 A different difficulty: impredicativity (System F)
System F ($(\Box,\ast,\ast)$) *is* non-dependent (no terms inside types), so the λI translation **is** available. But proving SN of F *from scratch* cannot be done by recursion on types: $\forall\alpha.\sigma$ quantifies over a universe containing itself, and $\sigma[\tau/\alpha]$ can be **bigger** than $\forall\alpha.\sigma$ (e.g. instantiate $\mathrm{id}:\forall\alpha.\alpha\to\alpha$ at $\tau=\forall\alpha.\alpha\to\alpha$ itself). A logical relation $\llbracket\forall\alpha.\sigma\rrbracket=\bigcap_\tau\llbracket\sigma[\tau/\alpha]\rrbracket$ is ill-founded. **Girard's reducibility candidates** quantify over the *semantic* set of candidates $\mathbf{CR}$ instead of syntactic types, breaking the circularity. Takeaway: the *syntactic* WN⇒SN/λI method covers the predicative non-dependent fragment; impredicativity needs *semantic* methods; full dependency defeats type-preservation outright.

---

## 4. Mull (2023): the irrelevancy-eliminating translation

Nathan Mull, *An Irrelevancy-Eliminating Translation of Pure Type Systems*, TYPES 2022, LIPIcs vol. 269, art. 7 (pub. 2023). **The first improvement on the conjecture since Roux–van Doorn 2014** — by the author's own description, "somewhat modest": it removes normalization-irrelevant clutter and then **bootstraps** an existing result.

### 4.1 Setup — tiered PTS
A PTS is **persistent** if functional + axiom-injective in the 2nd component + $\mathcal R\subseteq\{(s,s',s')\}$ (rules abbreviated $(s,s')$). It is **$n$-tiered** if sorts form a single axiom-chain $s_1:s_2:\cdots:s_n$ and $\mathcal R\subseteq\{(s_i,s_j)\}$. The λ-cube = 2-tiered systems with $(s_1,s_1)$; $\lambda U$ = a 3-tiered system. By Roux–van Doorn's modularity (normalization of a disjoint union ⟺ of each summand), **it suffices to study tiered systems** for persistent/bounded/separable PTS.

### 4.2 The key definitions (corrected — ledger §8)
- **Negatable** (sort level, Def. 14): $s_i$ is negatable iff $(s_i,s_i)\in\mathcal R$ (a self/"circular" rule). A **non-negatable** sort has no such self-rule.
- **Irrelevant** (Def. 20): $s_i$ is $[n]$-irrelevant iff **no rule has $s_i$ as its 2nd component** (nothing maps into it). *(Distinct from "negatable" — the two were conflated in a first pass.)*
- The translation strips **completely-irrelevant** sorts/rules (top-sort-like + irrelevant) to a fixed point: $\lambda S^{\downarrow}=\tau(\lambda S)$ (rule-elimination), $\lambda S^{\Downarrow}=\theta(\tau(\lambda S))$ (then sort-collapse).

### 4.3 The theorems
> **Thm 46.** For any tiered PTS $\lambda S$: if $\lambda S^{\Downarrow}$ is SN, then $\lambda S$ is SN.
> **Thm 47.** For any tiered PTS $\lambda S$: if WN⇒SN holds for $\lambda S^{\downarrow}$, then WN⇒SN holds for $\lambda S$. In particular, if $\lambda S^{\downarrow}$ satisfies the conditions of Barthe et al. (2001, Thm 5.21), then WN⇒SN for $\lambda S$.

The translation is **typability-preserving and infinite-reduction-path-preserving**; the load-bearing technical step is a complexity measure $\mu$ (sum of the shallow-λ-depths of certain redexes) that strictly decreases under reduction, via **Lévy's redex-creation lemma**.

### 4.4 What it buys
Bootstrapping Thm 47 onto BHS yields a **new class with dependent rules and non-negatable sorts** for which WN⇒SN holds — systems that lie *outside* BHS directly (because, e.g., a sort $s_2$ is not negatable) but fall under BHS *after* irrelevancy elimination. **Crucially, Roux–van Doorn (2014) prove no new WN⇒SN for a single fixed PTS** — their three theorems are *normalization-preservation under combination* (disjoint union; quantification; one-direction Poly-extension). Mull is the piece that converts that modularity into reach over genuinely dependent specifications.

**The gap that remains after Mull:** systems whose irrelevancy-reduced core is still genuinely dependent/impredicative and outside BHS — the CoC-shaped heart of the cube — where neither an unconditional SN proof helps (it proves SN directly, not WN⇒SN uniformly) nor the translation applies.

---

## 5. Empirical corroboration (executable, not asserted)

A stdlib-Python checker (`/tmp/bgk/normalize_check.py`) implements capture-avoiding β-reduction, an α-canonical (de Bruijn) reduction-graph analyzer deciding WN (reachable normal form) and SN (β-cycle ⇒ ¬SN) for small terms, the perpetual strategy, and an exhaustive term generator. Run **locally and re-run on `dev-cx53` (16 cores, Py 3.13.13)**; a parallel `multiprocessing` sweep (`big_search.py`) fanned out across all cores.

```
C1  (λx.y)Ω        : normal-order → y in 1 step (WN ✓);  β-cycle present (¬SN)   → separator ✓
C3  perpetual strat: stays on (λx.y)Ω forever — walks INTO the erased Ω
```

**Parallel exhaustive search on dev-cx53 (16 cores, ~900k terms in <2 min):**

| Calculus | bound | terms | separators (WN∧¬SN) |
|---|---|---|---|
| **λI** (non-erasing) | size ≤ 13 | **188,927** | **0** ← Conservation Thm, confirmed |
| λK (general) | size ≤ 10 | 38,438 | 0 |
| λK | size ≤ 11 | 162,550 | 0 |
| λK | size ≤ 12 | 710,814 | **3, smallest = size 12** |

Clean empirical signature of the whole story: **erasure-free λI never separates WN from SN** (exhaustive to ~190k terms), while **λK first produces WN-but-not-SN terms at exactly size 12** — the $(\lambda x.y)\Omega$ family. The non-erasing $(\lambda x.x)\Omega$ is *not* WN, so it is no counterexample to conservation. *(This is corroboration of the mechanism, not a proof about PTSs — the search is over untyped λ-terms.)*

Access to the compute box: `ssh -i ~/.ssh/id_ed25519_nixai_probe dev@100.105.72.88` (see [[reference/dev-cx53|dev-cx53]] notes — scp drops; pipe scripts over stdin).

---

## 6. The map: proven vs open

| Result | Class covered | Method |
|---|---|---|
| Sørensen 1997 | a uniform class of **non-dependent** PTS | λI-translation / marking |
| Barthe–Hatcliff–Sørensen 2001 (TCS 269:317–361) | non-dependent class incl. left cube + $\lambda U$ | CPS / λI |
| Roux–van Doorn 2014 (RTA-TLCA) | *modularity* (preservation under combination) | structural theory |
| Mull 2022/23 (LIPIcs TYPES 2022 art. 7) | + dependent rules / non-negatable sorts, via bootstrapping | irrelevancy-eliminating translation |

**Soft evidence FOR the conjecture:** every PTS known to fail SN ($\lambda U$, $\lambda\ast$) *also* fails WN — no PTS has ever separated WN from SN.

**What a genuine solution needs:**
- **(Positive)** a type-preserving erasure-eliminating translation that survives **full dependency** — i.e. solve §3.1's mutual-recursion / §3.2's substitution-commutation in general (Mull's line, minus the non-negatable restriction); or
- **(Negative)** an explicit PTS $(\mathcal S,\mathcal A,\mathcal R)$ + a typable WN-but-not-SN term — revolutionary, since §6's evidence says it shouldn't exist.

The live obstacle is making erasure-elimination **type-preserving in the presence of dependent products**.

---

## 7. Sources
- Barendregt, *Introduction to generalized type systems*, JFP 1(2):125–154, 1991; *Lambda calculi with types*, Handbook of Logic in CS vol. 2, 1992.
- Barendregt, *The Lambda Calculus: Its Syntax and Semantics*, 1984 (λI Conservation = **Thm 9.1.5**, Ch. 9).
- Church 1941 (origin of λI conservation); Barendregt–Bergstra–Klop–Volken 1976 ($F_\infty$).
- Bergstra & Klop, *Strong normalization and perpetual reductions in the lambda calculus*, EIK 18:403–417, 1982.
- Sørensen, Inf. & Comput. 133(1):35–71, 1997; Gørtz–Reuß–Sørensen, HOSC 16(3):253–285, 2003.
- Barthe–Hatcliff–Sørensen, *CPS Translations and Applications: The Cube and Beyond*, HOSC 12(2):125–170, 1999; *WN implies SN in a class of non-dependent PTS*, TCS 269(1–2):317–361, 2001.
- Bowman–Cong–Rioux–Ahmed, *Type-Preserving CPS Translation of Σ and Π Types is Not Not Possible*, POPL 2018.
- Roux & van Doorn, *The Structural Theory of Pure Type Systems*, RTA-TLCA 2014.
- Mull, *An Irrelevancy-Eliminating Translation of Pure Type Systems*, LIPIcs TYPES 2022 art. 7 (2023).
- Geuvers, *Logics and Type Systems* (PhD thesis, 1993); TLCA *List of Open Problems* #9.

---

## 8. Corrections ledger (from adversarial verification)

The deep-dive workflow's verification stage refined **15 of 21** load-bearing claims. The substantive ones:

1. **λI Conservation Theorem** is originally **Church (1941)**; in Barendregt (1984) it is **Thm 9.1.5** (Ch. 9), *not* "11.3.x." (My §1 originally misremembered the number.)
2. **Roux–van Doorn (2014)** prove **no** new WN⇒SN for a single PTS — only normalization-**preservation under combination** (disjoint union / ∀-quantification / one-direction Poly-extension).
3. **"Negatable"** (Mull Def. 14) = sort with a **self-rule** $(s_i,s_i)\in\mathcal R$; **"irrelevant"** (Def. 20) = never a rule's 2nd component. Distinct notions; do not conflate.
4. **CPS abstraction continuation type** is $\tau=\neg\rho^{+}=\rho^{+}\!\to\!\bot$ (negation of the *value* translation), not $\langle\rho\rangle$ (which is the type of the whole translated abstraction).
5. **CPS dependent failure** is concretely the **substitution-non-commutation** of Bowman et al. (POPL 2018 §3): $f\,x$ wants continuation $(B^{+}[x/x]\to\bot)$, $k$ has $(B^{+}[e'^{+}/x]\to\bot)$; gap = unprovable $x\equiv e'^{+}$.
6. **BHS "difficulties with dependent types"** is HOSC 1999 **§1.3** (not §1.4, which is a roadmap).
7. **Mull's load-bearing lemma**: a measure $\mu$ (sum of shallow-λ-depths of the relevant redexes) strictly decreases under reduction, via **Lévy's redex-creation lemma**.
8. **BHS non-dependent condition** = $(s_1,s_2,s_3)\in\mathcal R\Rightarrow s_1\geq s_2\geq s_3$ in the sort order (forbids the $(\ast,\Box)$ rule).

> **Honest closing.** The conjecture is open; nobody has a short proof and this note does not claim one. What is settled here is *what is true about the problem*: the conservation mechanism that makes WN⇒SN plausible, the precise technical wall (type-preserving erasure-elimination under dependency) that stops the known proofs, the exact reach of the latest progress, and an executable demonstration of the underlying erasure phenomenon.
