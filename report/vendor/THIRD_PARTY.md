# Third-party libraries (vendored for offline viewing)

These minified libraries are bundled so `report/index.html` opens with no network.
All are permissively licensed; copyright remains with their authors.

| file | library | version | license |
|---|---|---|---|
| `echarts.min.js` | Apache ECharts | 5.5.1 | Apache-2.0 |
| `cytoscape.min.js` | Cytoscape.js | 3.30.2 | MIT |
| `katex.min.js`, `auto-render.min.js` | KaTeX | 0.16.11 | MIT |

KaTeX CSS + fonts load from the jsDelivr CDN (see `<link>` in `index.html`).
To rebuild from source, fetch the matching versions from each project's releases.
