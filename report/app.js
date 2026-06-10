/* ============================================================
   research.crabcc.app — renderer
   Reads window.DATA, injects every component, themes ECharts +
   Cytoscape to the crabcc dark palette. Pure DOM; no framework.
   ============================================================ */
(function () {
  "use strict";
  const D = window.DATA;
  const $ = (s) => document.querySelector(s);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  /* ---- crabcc dark palette (mirrors _ds dark tokens) ----- */
  const COL = {
    acc:   "#ff8c42",  // --crab-hot  (primary accent, dark)
    glow:  "#ffb380",  // --crab-glow
    crab:  "#d35400",  // --crab-500
    ok:    "#2ecc71",  // --green-400
    warn:  "#f6b94a",  // --amber-400
    danger:"#e74c3c",  // --red-400
    info:  "#5b9bd5",  // dark info
    slate: "#cfd6dc",  // --slate-300 (graph node ink)
    ink:   "#f2f2f2",  // text-strong
    body:  "#e8e8e8",
    mut:   "#8a8a8a",  // text-muted
    faint: "#6a6a6c",  // text-faint
    grid:  "#2a2a2c",  // hairline
    panel: "#161618",  // surface-card
    sunken:"#1c1c1f",
  };
  const FONT = "JetBrains Mono, ui-monospace, monospace";

  /* ---- shared ECharts base ------------------------------ */
  function baseOption() {
    return {
      backgroundColor: "transparent",
      textStyle: { fontFamily: FONT, color: COL.mut, fontSize: 11 },
      grid: { left: 8, right: 16, top: 22, bottom: 6, containLabel: true },
      tooltip: {
        backgroundColor: "#0e0e10",
        borderColor: COL.grid,
        borderWidth: 1,
        textStyle: { color: COL.body, fontFamily: FONT, fontSize: 12 },
        axisPointer: { lineStyle: { color: COL.grid }, crossStyle: { color: COL.grid } },
      },
    };
  }
  const axis = (extra) => Object.assign({
    axisLine: { lineStyle: { color: COL.grid } },
    axisTick: { show: false },
    axisLabel: { color: COL.mut, fontFamily: FONT, fontSize: 11 },
    splitLine: { lineStyle: { color: COL.grid, type: "dashed", opacity: 0.5 } },
    nameTextStyle: { color: COL.faint, fontFamily: FONT, fontSize: 10 },
  }, extra || {});

  const charts = [];
  function mount(id, option) {
    const host = $("#" + id);
    if (!host) return;
    const div = el("div", "chart-host");
    host.appendChild(div);
    const c = echarts.init(div, null, { renderer: "canvas" });
    c.setOption(option);
    charts.push(c);
  }
  window.addEventListener("resize", () => charts.forEach((c) => c.resize()));

  const linGrad = (c1, c2) =>
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: c1 }, { offset: 1, color: c2 }]);

  /* ====================================================== */
  /* small builders                                          */
  /* ====================================================== */
  function badges(host, arr) {
    arr.forEach((b) => host.appendChild(el("span", "badge " + (b.k || ""), b.t)));
  }
  function stats(host, arr) {
    arr.forEach((s) => {
      const card = el("div", "stat " + (s.c || ""));
      card.appendChild(el("div", "v", s.v));
      card.appendChild(el("div", "l", s.l));
      host.appendChild(card);
    });
  }
  function callout(host, c) {
    host.appendChild(el("div", "h", c.h));
    host.appendChild(el("div", "b", c.b));
  }

  /* ====================================================== */
  /* HERO + ABSTRACT                                         */
  /* ====================================================== */
  $("#kicker-meta").textContent = D.meta.kicker.split("·").slice(1).join("·").trim() || D.meta.kicker;
  $("#hero-title").textContent = D.meta.title;
  $("#hero-sub").innerHTML = D.meta.sub;
  badges($("#badges"), D.meta.badges);
  callout($("#abstract-note"), D.abstract.note);

  /* ====================================================== */
  /* E1 · census                                            */
  /* ====================================================== */
  stats($("#e1-stats"), D.e1.stats);
  $("#e1-note").innerHTML = D.e1.note;
  mount("e1-chart", Object.assign(baseOption(), {
    tooltip: Object.assign(baseOption().tooltip, {
      trigger: "axis",
      formatter: (p) => `size ${p[0].axisValue}<br/><b style="color:${COL.acc}">${p[0].data.toLocaleString()}</b> terms`,
    }),
    grid: { left: 8, right: 18, top: 28, bottom: 6, containLabel: true },
    xAxis: axis({ type: "category", data: D.e1.census.map((d) => d[0]), name: "term size (nodes)", nameLocation: "middle", nameGap: 30, boundaryGap: true }),
    yAxis: axis({ type: "log", name: "count (log)", nameGap: 14, splitNumber: 4 }),
    series: [{
      type: "bar", data: D.e1.census.map((d) => d[1]),
      itemStyle: { color: linGrad(COL.glow, COL.crab), borderRadius: [2, 2, 0, 0] },
      barWidth: "62%", emphasis: { itemStyle: { color: COL.acc } },
    }],
  }));

  /* ====================================================== */
  /* E2 · separators                                        */
  /* ====================================================== */
  stats($("#e2-stats"), D.e2.stats);
  callout($("#e2-callout"), D.e2.callout);
  mount("e2-chart", Object.assign(baseOption(), {
    tooltip: Object.assign(baseOption().tooltip, { trigger: "axis",
      formatter: (p) => `size ${p[0].axisValue}<br/><b style="color:${COL.danger}">${p[0].data}</b> WN-but-¬SN` }),
    xAxis: axis({ type: "category", data: D.e2.bySize.map((d) => d[0]), name: "term size", nameLocation: "middle", nameGap: 28 }),
    yAxis: axis({ type: "value", name: "witnesses", nameGap: 12 }),
    series: [{
      type: "bar", data: D.e2.bySize.map((d) => d[1]),
      itemStyle: { color: linGrad("#e74c3c", "#7d2018"), borderRadius: [2, 2, 0, 0] }, barWidth: "58%",
    }],
  }));
  // samples
  const sHost = $("#e2-samples");
  sHost.appendChild(el("span", "pill-lbl", "samples"));
  D.e2.samples.forEach((s) => sHost.appendChild(el("span", "tag " + (s.nsn ? "nsn" : "sn"), s.t + (s.nsn ? "  ¬SN" : "  SN"))));

  /* ====================================================== */
  /* E3 · geometry (hist + scatter)                          */
  /* ====================================================== */
  stats($("#e3-stats"), D.e3.stats);
  mount("e3-chart", Object.assign(baseOption(), {
    grid: { left: 8, right: 18, top: 36, bottom: 6, containLabel: true },
    tooltip: Object.assign(baseOption().tooltip, { trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (p) => `${p[0].axisValue} nodes<br/><b style="color:${COL.acc}">${p[0].data.toLocaleString()}</b> terms` }),
    xAxis: axis({ type: "category", data: D.e3.hist.map((d) => d[0]), axisLabel: { color: COL.mut, fontFamily: FONT, fontSize: 10, interval: 0, rotate: 30 } }),
    yAxis: axis({ type: "value", name: "terms", nameGap: 12 }),
    series: [{ type: "bar", data: D.e3.hist.map((d) => d[1]),
      itemStyle: { color: linGrad(COL.acc, "#8a3a12"), borderRadius: [2, 2, 0, 0] }, barWidth: "60%" }],
  }));
  mount("e3-chart2", Object.assign(baseOption(), {
    grid: { left: 8, right: 18, top: 36, bottom: 6, containLabel: true },
    tooltip: Object.assign(baseOption().tooltip, {
      formatter: (p) => `shortest ${p.data[0]} · longest <b style="color:${COL.acc}">${p.data[1]}</b>` }),
    xAxis: axis({ type: "value", name: "shortest", nameLocation: "middle", nameGap: 26 }),
    yAxis: axis({ type: "value", name: "longest", nameGap: 16 }),
    series: [{
      type: "scatter", data: D.e3.scatter, symbolSize: 6,
      itemStyle: { color: "rgba(255,140,66,0.55)", borderColor: COL.acc, borderWidth: 0.5 },
    }],
  }));

  /* ====================================================== */
  /* E4 · perpetual                                          */
  /* ====================================================== */
  stats($("#e4-stats"), D.e4.stats);
  $("#e4-note").innerHTML = D.e4.note;
  mount("e4-chart", Object.assign(baseOption(), {
    tooltip: Object.assign(baseOption().tooltip, { trigger: "axis",
      formatter: (p) => `size ${p[0].axisValue}<br/>random strategy missed <b style="color:${COL.warn}">${p[0].data}%</b>` }),
    xAxis: axis({ type: "category", boundaryGap: false, data: D.e4.perpetual.map((d) => d[0]), name: "¬SN term size", nameLocation: "middle", nameGap: 28 }),
    yAxis: axis({ type: "value", name: "% divergence missed", nameGap: 14, max: 100 }),
    series: [
      { name: "perpetual F∞", type: "line", data: D.e4.perpetual.map(() => 0), symbol: "none",
        lineStyle: { color: COL.ok, width: 2 }, areaStyle: { color: "rgba(46,204,113,0.06)" } },
      { name: "random strategy", type: "line", smooth: true, data: D.e4.perpetual.map((d) => d[1]),
        symbol: "circle", symbolSize: 5, itemStyle: { color: COL.warn },
        lineStyle: { color: COL.warn, width: 2 },
        areaStyle: { color: linGrad("rgba(246,185,74,0.25)", "rgba(246,185,74,0)") } },
    ],
  }));

  /* ====================================================== */
  /* E5 · ι-translation                                      */
  /* ====================================================== */
  stats($("#e5-stats"), D.e5.stats);
  callout($("#e5-note"), D.e5.note);

  /* ====================================================== */
  /* E6 · speedup (lines + dist)                             */
  /* ====================================================== */
  stats($("#e6-stats"), D.e6.stats);
  mount("e6-chart", Object.assign(baseOption(), {
    grid: { left: 8, right: 18, top: 40, bottom: 6, containLabel: true },
    legend: { top: 4, right: 8, textStyle: { color: COL.mut, fontFamily: FONT, fontSize: 10 }, itemWidth: 14, itemHeight: 8 },
    tooltip: Object.assign(baseOption().tooltip, { trigger: "axis" }),
    xAxis: axis({ type: "category", boundaryGap: false, data: D.e6.strategy.map((d) => d.n), name: "term size", nameLocation: "middle", nameGap: 26 }),
    yAxis: axis({ type: "log", name: "β-steps (log)", nameGap: 14 }),
    series: [
      { name: "innermost", type: "line", smooth: true, data: D.e6.strategy.map((d) => d.inner),
        symbol: "none", lineStyle: { color: COL.ok, width: 2 } },
      { name: "outermost", type: "line", smooth: true, data: D.e6.strategy.map((d) => d.outer),
        symbol: "none", lineStyle: { color: COL.acc, width: 2 },
        areaStyle: { color: linGrad("rgba(255,140,66,0.18)", "rgba(255,140,66,0)") } },
    ],
  }));
  mount("e6-chart2", Object.assign(baseOption(), {
    grid: { left: 8, right: 18, top: 36, bottom: 6, containLabel: true },
    tooltip: Object.assign(baseOption().tooltip, { trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (p) => `${p[0].axisValue}<br/><b style="color:${COL.acc}">${p[0].data}%</b> of terms` }),
    xAxis: axis({ type: "category", data: D.e6.speedup.map((d) => d[0]), axisLabel: { color: COL.mut, fontFamily: FONT, fontSize: 10, interval: 0, rotate: 30 } }),
    yAxis: axis({ type: "value", name: "% of terms", nameGap: 12 }),
    series: [{ type: "bar", data: D.e6.speedup.map((d) => d[1]),
      itemStyle: { color: linGrad(COL.glow, COL.crab), borderRadius: [2, 2, 0, 0] }, barWidth: "58%" }],
  }));

  /* ====================================================== */
  /* E7 · reduction-graph zoo (cytoscape)                    */
  /* ====================================================== */
  $("#e7-note").innerHTML = D.e7.note;
  const zoo = $("#zoo");
  D.e7.cells.forEach((cell, i) => {
    const isNsn = cell.tag === "NSN";
    const c = el("div", "cell " + (isNsn ? "nsn" : "sn"));
    const cap = el("div", "cap");
    cap.appendChild(el("span", "term-name", cell.cap));
    cap.appendChild(el("span", "tag " + (isNsn ? "nsn" : "sn"), isNsn ? "¬SN" : "SN"));
    c.appendChild(cap);
    const graph = el("div", "cy"); graph.id = "cy-" + i;
    c.appendChild(graph);
    zoo.appendChild(c);
  });
  // build graphs after layout so containers have size
  function buildZoo() {
    D.e7.cells.forEach((cell, i) => {
      const elements = [];
      cell.nodes.forEach((n, j) => elements.push({ data: { id: n, root: j === 0 ? 1 : 0 } }));
      cell.edges.forEach((e, k) => {
        const loopEdge = e[0] === e[1];
        elements.push({ data: { id: "e" + i + "_" + k, source: e[0], target: e[1], loop: loopEdge ? 1 : 0 } });
      });
      const isNsn = cell.tag === "NSN";
      const cy = cytoscape({
        container: document.getElementById("cy-" + i),
        elements,
        userZoomingEnabled: false, userPanningEnabled: false, boxSelectionEnabled: false, autoungrabify: true,
        style: [
          { selector: "node", style: {
            "background-color": COL.slate, width: 12, height: 12,
            label: "data(id)", color: COL.faint, "font-family": FONT, "font-size": 8,
            "text-valign": "top", "text-halign": "center", "text-margin-y": -2,
            "text-max-width": 80, "min-zoomed-font-size": 0,
          } },
          { selector: "node[root = 1]", style: {
            "background-color": isNsn ? COL.danger : COL.ok, width: 16, height: 16,
            "border-width": 3, "border-color": "rgba(255,140,66,0.35)", color: COL.body, "font-weight": 700,
          } },
          { selector: "edge", style: {
            width: 1.4, "line-color": "#4a4a4c", "target-arrow-color": "#4a4a4c",
            "target-arrow-shape": "triangle", "arrow-scale": 0.7, "curve-style": "bezier",
          } },
          { selector: "edge[loop = 1]", style: {
            "line-color": COL.danger, "target-arrow-color": COL.danger, width: 2,
            "curve-style": "bezier", "control-point-step-size": 26,
          } },
        ],
        layout: cell.loop
          ? { name: "circle", padding: 22, avoidOverlap: true }
          : { name: "breadthfirst", directed: true, padding: 22, spacingFactor: 1.1 },
      });
      cy.resize(); cy.fit(undefined, 24);
    });
  }

  /* ====================================================== */
  /* KERNEL                                                  */
  /* ====================================================== */
  stats($("#k-stats"), D.kernel.stats);
  $("#k-note").innerHTML = D.kernel.note;
  mount("k-ext", Object.assign(baseOption(), {
    grid: { left: 8, right: 24, top: 30, bottom: 6, containLabel: true },
    tooltip: Object.assign(baseOption().tooltip, { trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (p) => `${p[0].axisValue}<br/><b style="color:${COL.acc}">${p[0].data.toLocaleString()}</b> symbols` }),
    xAxis: axis({ type: "value", name: "symbols", nameLocation: "middle", nameGap: 28, axisLabel: { color: COL.mut, fontFamily: FONT, fontSize: 10, formatter: (v) => v >= 1000 ? (v / 1000) + "k" : v } }),
    yAxis: axis({ type: "category", inverse: true, data: D.kernel.byKind.map((d) => d[0]), splitLine: { show: false } }),
    series: [{ type: "bar", data: D.kernel.byKind.map((d) => d[1]),
      itemStyle: { color: linGrad(COL.crab, COL.glow), borderRadius: [0, 2, 2, 0] }, barWidth: "58%" }],
  }));
  mount("k-compare", Object.assign(baseOption(), {
    grid: { left: 8, right: 18, top: 40, bottom: 6, containLabel: true },
    legend: { top: 4, right: 8, textStyle: { color: COL.mut, fontFamily: FONT, fontSize: 10 }, itemWidth: 14, itemHeight: 8 },
    tooltip: Object.assign(baseOption().tooltip, { trigger: "axis", axisPointer: { type: "shadow" },
      formatter: (p) => p.map((s) => `${s.seriesName}: <b>${s.data.toLocaleString()}ms</b>`).join("<br/>") }),
    xAxis: axis({ type: "category", data: D.kernel.compare.map((d) => d.q), axisLabel: { color: COL.mut, fontFamily: FONT, fontSize: 9, interval: 0, rotate: 22, width: 90, overflow: "truncate" } }),
    yAxis: axis({ type: "log", name: "ms (log)", nameGap: 14 }),
    series: [
      { name: "crabcc", type: "bar", data: D.kernel.compare.map((d) => d.crabcc),
        itemStyle: { color: COL.acc, borderRadius: [2, 2, 0, 0] }, barWidth: "30%" },
      { name: "grep -rn", type: "bar", data: D.kernel.compare.map((d) => d.grep),
        itemStyle: { color: "#4a4a4c", borderRadius: [2, 2, 0, 0] }, barWidth: "30%" },
    ],
  }));
  // table
  (function () {
    const t = el("table");
    t.innerHTML =
      "<thead><tr><th>symbol</th><th>kind</th><th>file</th><th class='num'>refs</th><th class='num'>callers</th></tr></thead>";
    const tb = el("tbody");
    D.kernel.syms.forEach((s) => {
      const tr = el("tr");
      tr.innerHTML =
        `<td><span class="sym">${s.name}</span></td>` +
        `<td>${s.kind}</td>` +
        `<td class="path">${s.file}</td>` +
        `<td class="num">${s.refs.toLocaleString()}</td>` +
        `<td class="num">${s.callers ? s.callers.toLocaleString() : "—"}</td>`;
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    $("#k-syms").appendChild(t);
  })();

  /* ====================================================== */
  /* RESEARCH + METHODS + FOOTER                             */
  /* ====================================================== */
  D.research.cards.forEach((c) => {
    const card = el("div", "card");
    card.appendChild(el("h3", null, c.h));
    card.appendChild(el("p", null, c.b));
    const cites = el("div", "cites");
    c.cites.forEach((ct) => cites.appendChild(el("span", "cite", ct)));
    card.appendChild(cites);
    $("#research-cards").appendChild(card);
  });
  $("#methods-body").innerHTML = D.methods;
  $("#footer").innerHTML = D.footer;

  /* ====================================================== */
  /* KaTeX + TOC scroll-spy                                  */
  /* ====================================================== */
  function renderMath() {
    document.querySelectorAll(".kat").forEach((s) => {
      try { katex.render(s.textContent, s, { throwOnError: false, displayMode: false }); }
      catch (e) { /* leave text */ }
    });
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
        throwOnError: false,
      });
    }
  }

  function scrollSpy() {
    const links = [...document.querySelectorAll(".toc-row a")];
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const a = map.get(en.target.id); if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    document.querySelectorAll("main section").forEach((s) => obs.observe(s));
  }

  /* ---- go ---- */
  function init() {
    buildZoo();
    renderMath();
    scrollSpy();
    setTimeout(() => charts.forEach((c) => c.resize()), 60);
  }
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();
