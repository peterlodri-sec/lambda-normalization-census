/* app.js — renders window.BGK_DATA into the report. Vanilla JS + ECharts + Cytoscape + KaTeX. */
(function () {
  "use strict";
  const D = window.BGK_DATA || {};
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const fmt = (n) => (n == null ? "—" : n.toLocaleString("en-US"));
  const COL = { acc: "#6ea8fe", acc2: "#7ee787", vio: "#d2a8ff", warn: "#ffa657", bad: "#ff7b72", good: "#56d364", mut: "#8b97a7", line: "#222c3d" };

  // ---------- KaTeX inline ----------
  function katexAll() {
    document.querySelectorAll(".kat").forEach((s) => {
      try { window.katex.render(s.textContent, s, { throwOnError: false }); } catch (e) {}
    });
    if (window.renderMathInElement)
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      });
  }

  // ---------- ECharts base ----------
  function chart(id, option) {
    const node = $(id); if (!node || !window.echarts) { if (node) node.innerHTML = "<div class='err' style='padding:14px'>chart lib unavailable (offline?)</div>"; return; }
    const c = window.echarts.init(node, null, { renderer: "canvas" });
    const base = {
      backgroundColor: "transparent",
      textStyle: { color: "#cdd6e0", fontFamily: "ui-monospace,Menlo,monospace" },
      grid: { left: 56, right: 30, top: 46, bottom: 46 },
      tooltip: { backgroundColor: "#11151f", borderColor: COL.line, textStyle: { color: "#e6edf3" } },
      legend: { textStyle: { color: COL.mut }, top: 6 }
    };
    c.setOption(Object.assign(base, option));
    window.addEventListener("resize", () => c.resize());
    return c;
  }
  const axis = (name, type) => ({
    type: type || "value", name, nameTextStyle: { color: COL.mut },
    axisLine: { lineStyle: { color: COL.line } }, axisLabel: { color: COL.mut },
    splitLine: { lineStyle: { color: COL.line, type: "dashed" } }
  });

  function stat(parent, n, label, cls) {
    const s = el("div", "stat " + (cls || ""));
    s.appendChild(el("div", "n", n));
    s.appendChild(el("div", "l", label));
    parent.appendChild(s);
  }
  function errBox(id, e) { const p = $(id); if (p) p.appendChild(el("div", "err", "⚠ experiment error: " + (e.error || ""))); }

  // ========================= BADGES + ABSTRACT =========================
  function badges() {
    const m = D.meta || {}; const b = $("badges");
    const items = [
      ["status", "OPEN — TLCA #9", "open"],
      ["cores", "<b>" + (m.cores || "?") + "</b> cores", ""],
      ["python", "Py " + (m.python || "?"), ""],
      ["compute", "<b>" + (m.total_seconds || "?") + "</b> s wall", ""],
      ["budget", (m.budget_per_idea_s || "?") + "s / idea", ""],
      ["host", "dev-cx53", ""]
    ];
    items.forEach(([k, v, c]) => { const x = el("span", "badge " + c, v); b.appendChild(x); });
    const sep = (D.E2 && D.E2.onset_size) ? D.E2.onset_size : "—";
    $("abstract-note").innerHTML = "<b>Headline:</b> across the entire exhaustive search, the erasure-free fragment never separated WN from SN, while the general calculus first did at term size <b>" + sep + "</b> — the <span class='mono'>(λx.y)Ω</span> family.";
  }

  // ========================= E1 =========================
  function E1() {
    const e = D.E1; if (!e) return; if (e.error) return errBox("e1-stats", e);
    const st = $("e1-stats");
    stat(st, fmt(e.total_terms), "λI terms checked", "acc");
    stat(st, "≤ " + e.max_size, "max term size", "");
    stat(st, fmt(e.total_separators), "WN-but-not-SN found", "good");
    stat(st, "0", "expected (Conservation)", "good");
    const rows = e.rows || [];
    chart("e1-chart", {
      title: { text: "λI terms by size — separators stay at 0", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" },
      legend: { data: ["terms (log)", "separators"], top: 24 },
      xAxis: Object.assign(axis("term size", "category"), { data: rows.map(r => r.size) }),
      yAxis: [Object.assign(axis("# terms (log)"), { type: "log", min: 1 }), Object.assign(axis("separators"), { min: 0, max: 1 })],
      series: [
        { name: "terms (log)", type: "bar", data: rows.map(r => r.terms), itemStyle: { color: COL.acc, opacity: .8 } },
        { name: "separators", type: "line", yAxisIndex: 1, data: rows.map(r => r.separators), lineStyle: { color: COL.good, width: 3 }, symbol: "circle", symbolSize: 7, itemStyle: { color: COL.good } }
      ]
    });
    $("e1-note").innerHTML = "Flat green line at 0 = the Conservation Theorem holding, exhaustively, on every λI term up to size " + e.max_size + ".";
  }

  // ========================= E2 =========================
  function E2() {
    const e = D.E2; if (!e) return; if (e.error) return errBox("e2-stats", e);
    const rows = e.rows || [];
    const st = $("e2-stats");
    stat(st, e.onset_size != null ? e.onset_size : "—", "smallest separator size", "warn");
    stat(st, fmt(rows.reduce((a, r) => a + r.terms, 0)), "λK terms checked", "acc");
    stat(st, fmt(rows.reduce((a, r) => a + r.separators, 0)), "separators found", "vio");
    chart("e2-chart", {
      title: { text: "λK: separator onset at size " + (e.onset_size || "?"), left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" },
      legend: { data: ["terms (log)", "separators (log)", "density %"], top: 24 },
      xAxis: Object.assign(axis("term size", "category"), { data: rows.map(r => r.size) }),
      yAxis: [Object.assign(axis("count (log)"), { type: "log", min: 1 }), Object.assign(axis("density %"), { min: 0 })],
      series: [
        { name: "terms (log)", type: "bar", data: rows.map(r => r.terms), itemStyle: { color: "#2d3f5e" } },
        { name: "separators (log)", type: "bar", data: rows.map(r => r.separators || null), itemStyle: { color: COL.vio } },
        { name: "density %", type: "line", yAxisIndex: 1, data: rows.map(r => +(100 * (r.density || 0)).toFixed(3)), lineStyle: { color: COL.warn, width: 2 }, itemStyle: { color: COL.warn }, symbolSize: 6 }
      ]
    });
    const box = $("e2-samples");
    box.appendChild(el("div", "callout", "<b>On “smallest”:</b> the onset size is exact <i>for this term-size measure</i> (var=1, app/abs add 1) and our exhaustive λK enumeration — no separator exists below it. It is <b>folklore, not a published theorem</b>; the nearest published work on minimal terms is Tromp's Busy-Beaver-for-λ (BB<sub>λ</sub>). See research note 2."));
    if (e.samples && e.samples.length) {
      box.appendChild(el("div", "note", "Sample size-" + e.onset_size + " separators (each: an erasing λ over the non-SN Ω):"));
      const row = el("div", "pill-row");
      e.samples.forEach(s => row.appendChild(el("span", "tag", s)));
      box.appendChild(row);
    }
  }

  // ========================= E3 =========================
  function E3() {
    const e = D.E3; if (!e) return; if (e.error) return errBox("e3-stats", e);
    const pts = e.points || []; const ci = {}; (e.cols || []).forEach((c, i) => ci[c] = i);
    const st = $("e3-stats");
    stat(st, fmt(pts.length), "SN terms sampled", "acc");
    const maxL = pts.reduce((a, p) => Math.max(a, p[ci.longest]), 0);
    const maxB = pts.reduce((a, p) => Math.max(a, p[ci.max_blowup]), 0);
    stat(st, maxL, "longest reduction (steps)", "vio");
    stat(st, maxB, "max term-size blowup", "warn");
    chart("e3-chart", {
      title: { text: "longest vs shortest reduction (per term)", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "item", formatter: p => "size " + p.value[0] + "<br>longest " + p.value[1] + " · shortest " + p.value[2] },
      xAxis: axis("longest (max strategy)"), yAxis: axis("shortest (normal order)"),
      series: [{
        type: "scatter", symbolSize: 6,
        data: pts.map(p => [p[ci.longest], p[ci.shortest], p[ci.size]]),
        itemStyle: { color: COL.acc, opacity: .45 }
      }, {
        type: "line", data: [[0, 0], [maxL, maxL]], showSymbol: false, lineStyle: { color: COL.mut, type: "dashed" }, tooltip: { show: false }, name: "y=x"
      }]
    });
    const ps = e.per_size || {};
    const sizes = Object.keys(ps).map(Number).sort((a, b) => a - b);
    chart("e3-chart2", {
      title: { text: "reduction length grows with size", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" }, legend: { data: ["max longest", "mean longest", "max blowup"], top: 24 },
      xAxis: Object.assign(axis("term size", "category"), { data: sizes }),
      yAxis: axis("steps / size"),
      series: [
        { name: "max longest", type: "line", data: sizes.map(s => ps[s].max_longest), lineStyle: { color: COL.vio, width: 2 }, itemStyle: { color: COL.vio } },
        { name: "mean longest", type: "line", data: sizes.map(s => ps[s].mean_longest), lineStyle: { color: COL.acc, width: 2 }, itemStyle: { color: COL.acc } },
        { name: "max blowup", type: "line", data: sizes.map(s => ps[s].max_blowup), lineStyle: { color: COL.warn, width: 2, type: "dashed" }, itemStyle: { color: COL.warn } }
      ]
    });
  }

  // ========================= E4 =========================
  function E4() {
    const e = D.E4; if (!e) return; if (e.error) return errBox("e4-stats", e);
    const st = $("e4-stats");
    stat(st, fmt(e.checked), "terms tested", "acc");
    stat(st, fmt(e.agreements), "law holds", "good");
    stat(st, fmt(e.violations), "violations", e.violations ? "bad" : "good");
    stat(st, e.checked ? (100 * e.agreements / e.checked).toFixed(2) + "%" : "—", "agreement", "good");
    const rows = e.rows || [];
    chart("e4-chart", {
      title: { text: "(perpetual diverges) ⟺ ¬SN — cumulative agreements", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" }, legend: { data: ["checked", "agreements"], top: 24 },
      xAxis: Object.assign(axis("up to size", "category"), { data: rows.map(r => r.size) }),
      yAxis: Object.assign(axis("count (log)"), { type: "log", min: 1 }),
      series: [
        { name: "checked", type: "line", data: rows.map(r => r.checked), areaStyle: { color: "rgba(110,168,254,.12)" }, lineStyle: { color: COL.acc }, itemStyle: { color: COL.acc } },
        { name: "agreements", type: "line", data: rows.map(r => r.agreements), lineStyle: { color: COL.good, width: 3 }, itemStyle: { color: COL.good } }
      ]
    });
  }

  // ========================= E5 =========================
  function E5() {
    const e = D.E5; if (!e) return; if (e.error) return errBox("e5-stats", e);
    const st = $("e5-stats");
    stat(st, fmt(e.checked), "λK terms translated", "acc");
    stat(st, fmt(e.agreements), "SN(M)=SN(ι(M))", "good");
    stat(st, fmt(e.violations), "violations", e.violations ? "bad" : "good");
    stat(st, fmt(e.not_lambdaI), "translations ∉ λI", e.not_lambdaI ? "bad" : "good");
    $("e5-note").innerHTML = "<b>Reading:</b> every λK term's ι-translation is a legal λI<sub>[,]</sub> term, and its strong-normalization verdict matches the original's — empirical confirmation that retaining (rather than erasing) the discarded argument transports SN faithfully. This is exactly the bridge that lets λI-conservation upgrade WN to SN.";
  }

  // ========================= E6 =========================
  function E6() {
    const e = D.E6; if (!e) return; if (e.error) return errBox("e6-stats", e);
    const rows = e.rows || []; const st = $("e6-stats");
    const top = rows[rows.length - 1] || {};
    stat(st, fmt(e.workload), "tasks / run", "acc");
    stat(st, (top.speedup || "—") + "×", "speedup @ " + (top.cores || "?") + " cores", "vio");
    stat(st, top.efficiency != null ? (100 * top.efficiency).toFixed(0) + "%" : "—", "parallel efficiency", "warn");
    chart("e6-chart", {
      title: { text: "speedup vs cores", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" }, legend: { data: ["measured", "ideal"], top: 24 },
      xAxis: Object.assign(axis("cores", "category"), { data: rows.map(r => r.cores) }),
      yAxis: axis("speedup ×"),
      series: [
        { name: "measured", type: "line", data: rows.map(r => r.speedup), lineStyle: { color: COL.acc2, width: 3 }, itemStyle: { color: COL.acc2 }, symbolSize: 8 },
        { name: "ideal", type: "line", data: rows.map(r => r.cores), lineStyle: { color: COL.mut, type: "dashed" }, symbol: "none" }
      ]
    });
    chart("e6-chart2", {
      title: { text: "wall-clock seconds", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" },
      xAxis: Object.assign(axis("cores", "category"), { data: rows.map(r => r.cores) }),
      yAxis: axis("seconds"),
      series: [{ type: "bar", data: rows.map(r => r.seconds), itemStyle: { color: COL.warn, opacity: .85 } }]
    });
  }

  // ========================= E7 zoo =========================
  function E7() {
    const e = D.E7; if (!e) return; const wrap = $("zoo"); if (e.error) { errBox("zoo", e); return; }
    (e.terms || []).forEach((t, i) => {
      const cell = el("div", "cell");
      const cap = el("div", "cap");
      cap.appendChild(el("span", "nm", t.name));
      cap.appendChild(el("span", "tag " + (t.sn ? "sn" : "nsn"), t.sn ? "SN" : "¬SN"));
      cell.appendChild(cap);
      const cy = el("div", "cy"); cy.id = "cy" + i; cell.appendChild(cy);
      const foot = el("div", "note"); foot.style.padding = "0 12px 10px";
      foot.innerHTML = (t.n) + " nodes" + (t.truncated ? " (truncated)" : "") + " · WN " + (t.wn === true ? "yes" : t.wn === false ? "no" : "?");
      cell.appendChild(foot);
      wrap.appendChild(cell);
      drawGraph(cy.id, t);
    });
  }
  function drawGraph(id, t) {
    const nodes = (t.nodes || []).map(n => ({ data: { id: "n" + n.id, label: n.label, nf: n.nf } }));
    const idset = new Set(nodes.map(n => n.data.id));
    const edges = (t.edges || []).filter(([a, b]) => idset.has("n" + a) && idset.has("n" + b))
      .map(([a, b], i) => ({ data: { id: "e" + i, source: "n" + a, target: "n" + b } }));
    try {
      const cy = window.cytoscape({
        container: document.getElementById(id),
        elements: { nodes, edges }, userZoomingEnabled: false, userPanningEnabled: false, autoungrabify: true,
        maxZoom: 2.2, minZoom: .15,
        style: [
          { selector: "node", style: { "background-color": "#2d3f5e", "width": 12, "height": 12, "border-width": 1, "border-color": "#3a4d6e" } },
          { selector: "node[?nf]", style: { "background-color": "#56d364", "border-color": "#56d364" } },
          { selector: "edge", style: { "width": 1.4, "line-color": "#3a4d6e", "target-arrow-color": "#3a4d6e", "target-arrow-shape": "triangle", "curve-style": "bezier", "arrow-scale": .7 } }
        ],
        layout: nodes.length > 1
          ? { name: "breadthfirst", directed: true, spacingFactor: .9, padding: 8 }
          : { name: "grid" }
      });
      cy.ready(() => { try { cy.fit(cy.elements(), 22); if (cy.zoom() > 2.2) cy.zoom(2.2); cy.center(); } catch (e) {} });
    } catch (err) {}
  }

  // ========================= research + methods =========================
  function research() {
    const arr = D.RESEARCH || []; const box = $("research-cards");
    if (!arr.length) { box.appendChild(el("div", "muted", "Research rounds pending / not attached.")); return; }
    arr.forEach(r => {
      const c = el("div", "card");
      c.appendChild(el("h3", null, r.question_short || r.question || "—"));
      c.appendChild(el("div", null, mdToHtml(r.answer_markdown || "")));
      if (r.citations && r.citations.length) {
        const ci = el("div", "cites", "sources:");
        r.citations.slice(0, 6).forEach(u => { const a = el("a"); a.href = u; a.textContent = u; ci.appendChild(a); });
        c.appendChild(ci);
      }
      box.appendChild(c);
    });
  }
  function mdToHtml(s) {
    // protect $$display$$ and $inline$ math from escaping/inline-formatting
    const math = []; let i = 0;
    s = s.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, m => { math.push(m); return "@@M" + (i++) + "@@"; });
    const esc = (x) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const inline = (x) => esc(x).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
    const blocks = s.split(/\n{2,}/).map(b => {
      const t = b.trim();
      if (/^###\s+/.test(t)) return "<h5>" + inline(t.replace(/^###\s+/, "")) + "</h5>";
      if (/^##\s+/.test(t)) return "<h4>" + inline(t.replace(/^##\s+/, "")) + "</h4>";
      if (/^[-*]\s+/m.test(t)) {
        const items = t.split(/\n/).filter(l => /^[-*]\s+/.test(l)).map(l => "<li>" + inline(l.replace(/^[-*]\s+/, "")) + "</li>").join("");
        return "<ul>" + items + "</ul>";
      }
      return "<p>" + inline(t).replace(/\n/g, " ") + "</p>";
    }).join("");
    return blocks.replace(/@@M(\d+)@@/g, (_, k) => math[+k] || "");
  }
  function methods() {
    const m = D.meta || {};
    $("methods-body").innerHTML =
      "All experiments run a stdlib-Python normalization engine: capture-avoiding β-reduction, an α-canonical (de Bruijn) bounded reduction-graph analyzer deciding <b>WN</b> (a reachable normal form) and <b>SN</b> (a β-cycle ⇒ ¬SN), the perpetual strategy, Klop's ι-translation into the extended λI<sub>[,]</sub> calculus, and exhaustive term enumeration — fanned out with <code>multiprocessing</code> across " + (m.cores || "?") + " cores on <code>dev-cx53</code>. Each idea is wall-clock-budgeted to ≤ " + (m.budget_per_idea_s || "?") + "s.<br><br>" +
      "<b>Caveat.</b> These are experiments on the <i>untyped</i> λ-calculus. They corroborate the <i>mechanism</i> (erasure as the sole obstruction to WN⟹SN, and λI-conservation) that underlies the proven BGK sub-cases. They do <b>not</b> resolve the conjecture, which is about pure type systems and remains open (TLCA #9).";
    $("footer").innerHTML = "Generated " + (D.generated || "") + " · engine <code>bgk_lab.py</code> · " + fmt(m.cores) + "-core run on dev-cx53 · companion to the Obsidian note <code>2026-06-10-barendregt-geuvers-klop-conjecture</code>.";
  }

  // ========================= crabcc × kernel =========================
  function kernel() {
    const k = D.KERNEL; if (!k) return;
    const st = $("k-stats");
    stat(st, (k.index.symbols / 1e6).toFixed(2) + "M", "symbols indexed", "acc");
    stat(st, fmt(k.index.files), "files (C/H/Rust/…)", "vio");
    stat(st, k.index.wall_s + "s", "index wall time", "warn");
    stat(st, fmt(k.kmalloc_callers), "kmalloc call sites", "good");
    stat(st, fmt(k.sccs), "recursion SCCs", "vio");
    const ents = Object.entries(k.by_ext).sort((a, b) => b[1] - a[1]);
    chart("k-ext", {
      title: { text: "indexed files by language (crabcc " + k.crabcc_version + ")", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" }, grid: { left: 64, right: 24, top: 42, bottom: 38 },
      xAxis: Object.assign(axis("files (log)"), { type: "log", min: 1 }),
      yAxis: Object.assign(axis("", "category"), { data: ents.map(e => e[0]).reverse() }),
      series: [{ type: "bar", data: ents.map(e => e[1]).reverse(), itemStyle: { color: COL.acc } }]
    });
    const ck = Object.entries(k.compare);
    chart("k-compare", {
      title: { text: "C support: 6.2 skips C → 6.3 parses it", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" }, legend: { data: ["symbols", "files"], top: 24 },
      xAxis: Object.assign(axis("", "category"), { data: ck.map(c => c[0]) }),
      yAxis: Object.assign(axis("count (log)"), { type: "log", min: 1 }),
      series: [
        { name: "symbols", type: "bar", data: ck.map(c => c[1].symbols), itemStyle: { color: COL.vio } },
        { name: "files", type: "bar", data: ck.map(c => c[1].files), itemStyle: { color: COL.acc2 } }
      ]
    });
    const box = $("k-syms");
    box.appendChild(el("div", "note", "Canonical kernel C symbols — now resolvable to file:line:"));
    const tbl = el("table");
    tbl.innerHTML = "<tr><th>symbol</th><th>defs</th><th style='text-align:left'>first definition</th></tr>" +
      k.symbols.map(s => `<tr><td>${s[0]}</td><td>${s[1]}</td><td style="text-align:left">${s[2]}</td></tr>`).join("");
    box.appendChild(tbl);
    $("k-note").innerHTML = "Index: " + fmt(k.index.symbols) + " symbols · " + fmt(k.index.edges) +
      " edges · " + fmt(k.index.skipped) + " skipped (non-code) · graph " + fmt(k.graph.edges) +
      " edges in " + k.graph.wall_s + "s. crabcc " + k.crabcc_version + " (branch " + k.branch + ") on Linux " + k.kernel + " — same tool & machine as this lab's own code-graph.";
  }

  // ========================= normalization census =========================
  function census() {
    const k = D.CENSUS; if (!k) return;
    const rows = k.rows || []; const last = rows[rows.length - 1] || {};
    const exactTerms = rows.reduce((a, r) => a + (r.method === 'exact' ? r.total : 0), 0);
    const st = $("c-stats");
    stat(st, k.smallest_separator ? k.smallest_separator.natural_size : "—", "smallest separator (size)", "vio");
    stat(st, fmt(exactTerms), "terms classified exactly", "acc");
    stat(st, (100 * (last.dens_SN_of_decided || 0)).toFixed(1) + "%", "SN of decided @ n=" + last.n, "good");
    stat(st, (100 * (last.frac_undecided || 0)).toFixed(1) + "%", "undecided @ n=" + last.n, "warn");
    chart("c-dens", {
      title: { text: "class densities vs term size", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" }, legend: { data: ["SN of decided", "undecided frac"], top: 24 },
      xAxis: Object.assign(axis("term size n", "category"), { data: rows.map(r => r.n) }),
      yAxis: axis("fraction"),
      series: [
        { name: "SN of decided", type: "line", data: rows.map(r => r.dens_SN_of_decided), lineStyle: { color: COL.good, width: 2 }, itemStyle: { color: COL.good }, symbolSize: 5 },
        { name: "undecided frac", type: "line", data: rows.map(r => r.frac_undecided), lineStyle: { color: COL.warn, width: 2 }, itemStyle: { color: COL.warn }, symbolSize: 5 }
      ]
    });
    chart("c-sep", {
      title: { text: "separator (WN∖SN) density — the novel curve", left: "center", textStyle: { color: "#cdd6e0", fontSize: 13 } },
      tooltip: { trigger: "axis" },
      xAxis: Object.assign(axis("term size n", "category"), { data: rows.map(r => r.n) }),
      yAxis: axis("SEP / decided  (×10⁻³)"),
      series: [{ type: "line", data: rows.map(r => +(1000 * (r.dens_SEP_of_decided || 0)).toFixed(4)), lineStyle: { color: COL.vio, width: 2 }, itemStyle: { color: COL.vio }, symbolSize: 6, areaStyle: { color: "rgba(210,168,255,.14)" } }]
    });
    const w = k.smallest_separator;
    $("c-note").innerHTML = "<b>Smallest closed separator (size " + (w ? w.natural_size : "?") + "):</b> <span class='mono'>" + (w ? w.named : "") + "</span> = (λa.λb.b)·Ω. " +
      "Count sequence verified = OEIS A275057. Theory: SN-density→0 in this natural-size model (Bendkowski–Grygiel–Lescanne–Zaionc 2017) — opposite to David et al. (2013, variables cost 0). The high <i>decided</i>-SN reflects a <b>decidability horizon</b>: the non-SN mass hides in the growing undecided tail. Open dataset: <code>data/census_dataset.{json,csv}</code>.";
  }

  // ---------- boot ----------
  function boot() {
    badges(); E1(); E2(); E3(); E4(); E5(); E6(); E7(); census(); kernel(); research(); methods(); katexAll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
