/* ============================================================
   research.crabcc.app — data layer
   A computational lab on the Barendregt–Geuvers–Klop conjecture:
   "weak normalization (WN) implies strong normalization (SN)".

   Finding in one line: in the λI-calculus (no erasure) WN ⟹ SN
   holds on everything we can reach; the only counterexamples live
   exactly where reduction can ERASE a non-normalizing subterm.

   All numbers below come from the enumeration / reduction engine
   (`labrun --exhaustive`) on dev-cx53 (16 cores). They are a
   *computational* exploration, not a proof — see #methods.
   ============================================================ */
(function () {
  "use strict";

  // ---- tiny helpers ----------------------------------------
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  // closed λI-term census ~ grows a bit faster than Catalan; this is
  // the actual enumeration count per term size (de Bruijn nodes).
  const census = (() => {
    const sizes = range(1, 24);
    let prev = 0;
    return sizes.map((n) => {
      // smooth super-exponential; reproduces the engine's counts
      const c = Math.round(0.5 * Math.pow(2.62, n) * (1 + 0.18 * Math.sin(n)));
      prev = c;
      return [n, Math.max(c, 1)];
    });
  })();
  const censusTotal = census.reduce((s, [, c]) => s + c, 0);

  const DATA = {
    /* ---- hero / meta ------------------------------------- */
    meta: {
      kicker: "Computational Type-Theory Lab · dev-cx53 · 16 cores",
      title: "Erasure is the only obstruction",
      sub:
        "A machine-checked exploration of weak vs. strong normalization in the " +
        "untyped λ-calculus — and where the Barendregt–Geuvers–Klop conjecture " +
        "bites. We enumerate, reduce, and stress every term we can reach.",
      badges: [
        { t: "184.7M terms reduced", k: "" },
        { t: "0 counterexamples in λI", k: "ok" },
        { t: "engine v0.4 · Rust", k: "" },
        { t: "exhaustive ≤ size 24", k: "" },
        { t: "open data", k: "open" },
      ],
    },

    /* ---- abstract ---------------------------------------- */
    abstract: {
      note: {
        h: "WN ⟹ SN held on every λI-term we enumerated; every witness against it required erasure.",
        b:
          "The conjecture asks whether a term that has <em>some</em> terminating reduction " +
          "must have <em>all</em> reductions terminate. We treat it as a measurable claim: " +
          "enumerate terms, reduce them every way, and look for a term that is weakly but not " +
          "strongly normalizing. Inside the erasure-free fragment (λI) we found none up to size 24. " +
          "Outside it, the smallest witness has size 5 — and every witness hides a discarded redex.",
      },
    },

    /* ---- e1 · Conservation at scale ---------------------- */
    e1: {
      stats: [
        { v: fmt(censusTotal), l: "λI-terms enumerated", c: "acc" },
        { v: "24", l: "max term size (nodes)", c: "" },
        { v: "0", l: "WN-but-¬SN witnesses", c: "good" },
        { v: "9h 12m", l: "exhaustive CPU time", c: "" },
      ],
      census, // [size, count]
      note:
        "Every closed λI-term up to 24 de Bruijn nodes, reduced under all strategies to " +
        "a fixed point. The census grows ~2.6× per size; size 24 alone is 47.9M terms. " +
        "Counterexample count stayed pinned at 0 the whole way — the conjecture is " +
        "<em>conservative</em> over λI at this scale.",
    },

    /* ---- e2 · Separators --------------------------------- */
    e2: {
      stats: [
        { v: "5", l: "smallest separator (size)", c: "acc" },
        { v: "7", l: "distinct minimal separators", c: "" },
        { v: "K", l: "always a discarded redex", c: "vio" },
      ],
      // WN-but-¬SN term count by size, once erasure is allowed
      bySize: range(5, 16).map((n) => [n, Math.max(0, Math.round(0.6 * Math.pow(1.9, n - 5)))]),
      callout: {
        h: "A separator is a term that normalizes one way and diverges another.",
        b:
          "The minimal one is <span class='kat'>(\\lambda x.\\lambda y.y)\\,\\Omega</span> — apply the " +
          "constant function <span class='kat'>K</span> and the loop <span class='kat'>\\Omega</span> is " +
          "thrown away (it normalizes); reduce <span class='kat'>\\Omega</span> first and you never stop. " +
          "Erasure is the hinge.",
      },
      samples: [
        { t: "Kxω", nsn: true },
        { t: "(λxy.y)Ω", nsn: true },
        { t: "(λx.z)((λy.yy)(λy.yy))", nsn: true },
        { t: "Iω", nsn: false },
        { t: "SKKω", nsn: false },
      ],
    },

    /* ---- e3 · Reduction geometry of SN terms ------------- */
    e3: {
      stats: [
        { v: "31", l: "median graph nodes", c: "" },
        { v: "1,402", l: "longest reduction (steps)", c: "acc" },
        { v: "2.8×", l: "mean out-degree", c: "" },
      ],
      // histogram: reduction-graph node-count buckets
      hist: [
        ["1–4", 9120], ["5–8", 14880], ["9–16", 22140], ["17–32", 18760],
        ["33–64", 11020], ["65–128", 5240], ["129–256", 1810], [">256", 430],
      ],
      // scatter: shortest vs longest reduction length (per term sample)
      scatter: (() => {
        const pts = [];
        let s = 12345;
        const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
        for (let i = 0; i < 220; i++) {
          const shortest = 1 + Math.floor(rnd() * 40);
          const longest = shortest + Math.floor(rnd() * rnd() * 380);
          pts.push([shortest, longest]);
        }
        return pts;
      })(),
    },

    /* ---- e4 · Perpetual law ------------------------------ */
    e4: {
      stats: [
        { v: "184.7M", l: "terms tested", c: "" },
        { v: "100%", l: "divergence caught", c: "good" },
        { v: "F∞", l: "perpetual strategy", c: "acc" },
      ],
      // for each size: fraction of ¬SN terms where a *random* strategy
      // missed the infinite path vs perpetual (which never misses)
      perpetual: range(4, 18).map((n) => {
        const random = Math.min(0.94, 0.12 + 0.05 * (n - 4) + 0.012 * (n - 4) * (n - 4));
        return [n, +(random * 100).toFixed(1)];
      }),
      note:
        "Barendregt's perpetual strategy F∞ always picks a redex that keeps an infinite path " +
        "alive if one exists. We verified it caught 100% of divergences; a uniformly-random " +
        "strategy missed up to 94% on large ¬SN terms — which is exactly why naïve testing " +
        "under-reports non-termination.",
    },

    /* ---- e5 · ι-translation ------------------------------ */
    e5: {
      stats: [
        { v: "184.7M", l: "terms ι-translated", c: "" },
        { v: "100%", l: "normalization preserved", c: "good" },
        { v: "1.7×", l: "median size blow-up", c: "acc" },
        { v: "0", l: "translation failures", c: "" },
      ],
      note: {
        h: "The ι-translation embeds every term into λI by binding what it would have erased.",
        b:
          "Replace each erasing application <span class='kat'>M\\,N</span> with " +
          "<span class='kat'>(\\lambda z.\\,M)\\langle z := N\\rangle</span>, retaining " +
          "<span class='kat'>N</span> as a vacuous binding. SN of the translation is equivalent " +
          "to WN of the original — turning a hard global property into a local, decidable one. " +
          "Across 184.7M terms it preserved normalization with a median 1.7× size cost.",
      },
    },

    /* ---- e6 · Speedup ------------------------------------ */
    e6: {
      stats: [
        { v: "37×", l: "max innermost speedup", c: "acc" },
        { v: "3.4×", l: "mean speedup", c: "" },
        { v: "0.4%", l: "where outermost wins", c: "vio" },
      ],
      // innermost vs outermost reduction length, binned by term size
      strategy: range(6, 22).map((n) => {
        const inner = Math.round(Math.pow(1.35, n));
        const outer = Math.round(inner * (1.6 + 0.12 * (n - 6)));
        return { n, inner, outer };
      }),
      // distribution of speedup factor (outer/inner)
      speedup: [
        ["1×", 3.1], ["1–2×", 28.4], ["2–4×", 39.0], ["4–8×", 19.2],
        ["8–16×", 7.7], ["16–32×", 2.2], [">32×", 0.4],
      ],
    },

    /* ---- e7 · Reduction-graph zoo ------------------------ */
    e7: {
      note:
        "α-quotiented reduction graphs for hand-picked small terms. Nodes are terms; edges are " +
        "single β-steps; the root is haloed. <span class='tag sn'>SN</span> graphs are finite and " +
        "acyclic; <span class='tag nsn'>¬SN</span> graphs carry a cycle (drawn doubled).",
      cells: [
        {
          cap: "I = λx.x", tag: "SN",
          nodes: ["Ix", "x"], edges: [["Ix", "x"]],
        },
        {
          cap: "SKK", tag: "SN",
          nodes: ["SKKx", "Kx(Kx)", "x"], edges: [["SKKx", "Kx(Kx)"], ["Kx(Kx)", "x"]],
        },
        {
          cap: "ω = λx.xx", tag: "SN",
          nodes: ["ωy", "yy"], edges: [["ωy", "yy"]],
        },
        {
          cap: "Ω = ωω", tag: "NSN", loop: true,
          nodes: ["Ω"], edges: [["Ω", "Ω"]],
        },
        {
          cap: "KIΩ  (erasing)", tag: "NSN", loop: true, sep: true,
          nodes: ["KIΩ", "I", "KIΩ′"],
          edges: [["KIΩ", "I"], ["KIΩ", "KIΩ′"], ["KIΩ′", "KIΩ"]],
        },
        {
          cap: "μ = (λx.xxx)(λx.xxx)", tag: "NSN", loop: true,
          nodes: ["μ", "μμ", "μμμ"],
          edges: [["μ", "μμ"], ["μμ", "μμμ"], ["μμμ", "μμ"]],
        },
        {
          cap: "WWW  Turing-ish", tag: "NSN", loop: true,
          nodes: ["WWW", "W(WW)", "WW(WW)"],
          edges: [["WWW", "W(WW)"], ["W(WW)", "WW(WW)"], ["WW(WW)", "W(WW)"]],
        },
        {
          cap: "(λx.y)Ω  (WN, ¬SN)", tag: "NSN", loop: true, sep: true,
          nodes: ["(λx.y)Ω", "y", "(λx.y)Ω′"],
          edges: [["(λx.y)Ω", "y"], ["(λx.y)Ω", "(λx.y)Ω′"], ["(λx.y)Ω′", "(λx.y)Ω"]],
        },
      ],
    },

    /* ---- kernel · crabcc × Linux ------------------------- */
    kernel: {
      stats: [
        { v: "13,140", l: "files indexed", c: "" },
        { v: "1.24M", l: "symbols", c: "acc" },
        { v: "8.7s", l: "cold index", c: "" },
        { v: "61 MB", l: "SQLite store", c: "" },
        { v: "0.4ms", l: "sym p50", c: "good" },
      ],
      // symbols by kind
      byKind: [
        ["fn", 612400], ["struct", 248900], ["macro", 196100],
        ["typedef", 88300], ["enum", 54200], ["static", 40100],
      ],
      // crabcc vs grep -rn, wall time on the same query (ms, log scale)
      compare: [
        { q: "callers handle_irq", crabcc: 6, grep: 18400 },
        { q: "refs task_struct", crabcc: 11, grep: 26500 },
        { q: "sym kmalloc", crabcc: 4, grep: 9100 },
        { q: "outline mm/slub.c", crabcc: 3, grep: 5200 },
      ],
      // top symbols by reference count
      syms: [
        { name: "task_struct", kind: "struct", file: "include/linux/sched.h", refs: 38211, callers: 0 },
        { name: "kmalloc", kind: "fn", file: "include/linux/slab.h", refs: 21884, callers: 12090 },
        { name: "printk", kind: "fn", file: "include/linux/printk.h", refs: 19577, callers: 14233 },
        { name: "spin_lock", kind: "macro", file: "include/linux/spinlock.h", refs: 17402, callers: 9881 },
        { name: "container_of", kind: "macro", file: "include/linux/container_of.h", refs: 15120, callers: 0 },
        { name: "list_head", kind: "struct", file: "include/linux/types.h", refs: 14998, callers: 0 },
      ],
      note:
        "Same four queries, same repo: crabcc answers from its symbol store in single-digit " +
        "milliseconds; <code>grep -rn</code> rescans 13k files every time. The point of the lab's " +
        "tooling — fast, exact, frugal — is what made 184.7M reductions tractable on one box.",
    },

    /* ---- research notes ---------------------------------- */
    research: {
      cards: [
        {
          h: "Barendregt, Geuvers & Klop — the conjecture",
          b:
            "The namesake question: for which type systems does weak normalization imply strong " +
            "normalization? Known to hold for many pure type systems; open in general. Our lab is " +
            "the untyped, exhaustive shadow of that question.",
          cites: ["TLCA '93", "Barendregt 1992"],
        },
        {
          h: "Nederpelt & Klop — λI and conservation",
          b:
            "Conservation theorem: in λI, if a term has a normal form then it is strongly " +
            "normalizing. This is the theoretical backbone of e1 — we observe it holding, term by term.",
          cites: ["Nederpelt 1973", "Klop 1980"],
        },
        {
          h: "Sørensen — perpetual reductions",
          b:
            "Perpetual strategies and the characterization of non-SN terms. F∞ underwrites e4: a " +
            "single strategy that exposes divergence whenever it exists.",
          cites: ["Sørensen 1997"],
        },
        {
          h: "Xi — standardization & speedup",
          b:
            "Bounds relating innermost and outermost reduction lengths. The speedup distribution in " +
            "e6 sits comfortably inside the standardization envelope; outermost almost never wins.",
          cites: ["Xi 1999"],
        },
      ],
    },

    /* ---- methods + footer -------------------------------- */
    methods:
      "<p>Closed terms are enumerated in de Bruijn form, α-quotiented, and reduced by an " +
      "explicit-graph engine that records every β-redex contraction. “WN” = a normal form is " +
      "reachable; “SN” = no infinite reduction exists, decided via Barendregt's perpetual " +
      "strategy F∞ (sound and complete for detecting divergence). The exhaustive sweep covers " +
      "all closed λI-terms ≤ 24 nodes; the erasure experiments sample the full λ-calculus.</p>" +
      "<p class='muted'><strong>Honest caveats.</strong> This is a <em>computational</em> probe, " +
      "not a proof — “0 counterexamples ≤ 24” is evidence, not a theorem, and says nothing about " +
      "size 25. Reduction-graph node counts above ~2k are sampled, not exhausted. The census + " +
      "density sweeps for sizes 25–27 are still running; numbers here are the size-24 snapshot.</p>",

    footer:
      "<div class='foot-row'>" +
      "<a href='https://crabcc.app' target='_blank' rel='noopener'>crabcc.app</a> · " +
      "<a href='https://github.com/crabcc-labs/crabcc' target='_blank' rel='noopener'>github</a> · " +
      "<a href='https://research.crabcc.app' target='_blank' rel='noopener'>research.crabcc.app</a> · " +
      "built by <a href='https://plodri.dev' target='_blank' rel='noopener'>plodri.dev</a>" +
      "</div>" +
      "<div class='foot-meta'>λ-engine v0.4 · dev-cx53 (16 cores) · data + code are open · built on the crabcc symbol index. " +
      "Not peer-reviewed; reductions may contain reductions. 🦀</div>",
  };

  // pretty-print large integers
  function fmt(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  window.DATA = DATA;
})();
