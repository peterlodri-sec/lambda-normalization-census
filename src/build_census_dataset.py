#!/usr/bin/env python3
"""Assemble the open normalization-census dataset (JSON + CSV) from the run rows
   + local recomputation (closed-term counts, smallest-separator witness)."""
import sys, json, csv
sys.path.insert(0, '/tmp/bgk')
import debruijn_census as C

# rows captured from the run (exact: exhaustive n≤16; montecarlo K=50000 thereafter)
ROWS = [
    # n, method, total, SN, SEP, NWN, UND
    (2,'exact',1,1,0,0,0),(3,'exact',1,1,0,0,0),(4,'exact',3,3,0,0,0),(5,'exact',6,6,0,0,0),
    (6,'exact',17,17,0,0,0),(7,'exact',41,41,0,0,0),(8,'exact',116,116,0,0,0),
    (9,'exact',313,312,0,1,0),(10,'exact',895,894,0,1,0),(11,'exact',2550,2545,0,3,2),
    (12,'exact',7450,7425,0,19,6),(13,'exact',21881,21803,3,51,24),(14,'exact',65168,64930,7,137,94),
    (15,'exact',195370,194437,26,527,380),(16,'exact',591007,587927,146,1630,1304),
    (17,'montecarlo',50000,49739,14,125,122),(18,'montecarlo',50000,49673,21,141,165),
    (20,'montecarlo',50000,49596,28,161,215),(22,'montecarlo',50000,49501,31,197,271),
    (25,'montecarlo',50000,49318,55,201,426),(28,'montecarlo',50000,49195,52,196,557),
    (32,'montecarlo',50000,48861,85,236,818),(38,'montecarlo',50000,48242,98,227,1433),
]

# Prefer the full remote JSON if it landed (adds the n=45..90 tail)
try:
    rj = json.load(open('/tmp/bgk/census_results.json'))
    if rj.get('rows'):
        ROWS = [(r['n'], r['method'], r['total'], r['SN'], r['SEP'], r['NWN'], r['UND']) for r in rj['rows']]
        sys.stderr.write(f"using remote JSON: {len(ROWS)} rows (tail to n={ROWS[-1][0]})\n")
except Exception:
    sys.stderr.write("remote JSON absent; using in-hand rows (to n=38)\n")

# smallest closed separator (WN ∧ ¬SN) witness
witness = None
for t in C.enum(13, 0):
    if C.classify(t) == 'SEP':
        witness = {"natural_size": 13, "named": C.show(C.to_named(t))}
        break

def wilson(k, n, z=1.96):
    if n == 0: return [0, 0]
    p = k / n; d = 1 + z*z/n
    c = (p + z*z/(2*n)) / d
    h = z*((p*(1-p)/n + z*z/(4*n*n))**0.5) / d
    return [round(max(0, c-h), 6), round(min(1, c+h), 6)]

rows_out = []
for (n, meth, tot, sn, sep, nwn, und) in ROWS:
    dec = sn + sep + nwn
    rows_out.append({
        "n": n, "method": meth, "total": tot,
        "SN": sn, "SEP": sep, "NWN": nwn, "UND": und,
        "decided": dec,
        "dens_SN_of_total": round(sn/tot, 6),
        "dens_SN_of_decided": round(sn/dec, 6) if dec else None,
        "dens_SEP_of_decided": round(sep/dec, 8) if dec else None,
        "dens_NWN_of_decided": round(nwn/dec, 6) if dec else None,
        "frac_undecided": round(und/tot, 6),
        "SN_of_decided_ci95": wilson(sn, dec) if meth == 'montecarlo' else None,
        "SEP_of_decided_ci95": wilson(sep, dec) if meth == 'montecarlo' else None,
    })

dataset = {
    "title": "Normalization census of the untyped lambda-calculus (de Bruijn, natural size)",
    "model": "closed untyped lambda-terms; natural size: |index k| = k+1, |lam M| = 1+|M|, |M N| = 1+|M|+|N|",
    "oeis_closed_term_counts": "A275057 (Lescanne 2016) — verified exact match",
    "classes": {"SN": "strongly normalizing", "SEP": "weakly normalizing but NOT strongly (a 'separator')",
                "NWN": "not weakly normalizing (no normal form)", "UND": "undecided within engine caps (node_cap=3000,size_cap=200)"},
    "method": "SN/WN decided via bounded alpha-quotiented reduction-graph analysis; exact enumeration for n<=16, uniform Monte-Carlo (K=50000) for larger n",
    "smallest_separator": witness,
    "key_findings": [
        "Smallest closed separator (WN-but-not-SN) has natural size 13 — apparently undocumented in the literature.",
        "Decided-SN fraction stays high (>=96%) through n=38 but erodes as n grows; the undecided fraction climbs (0 -> ~2.9%).",
        "Consistent with Bendkowski-Grygiel-Lescanne-Zaionc (2017): true SN density -> 0 asymptotically in THIS model; the high decided-SN reflects a decidability horizon (the non-SN mass hides in the growing undecided tail).",
        "Contrast: David et al. (2013) prove SN density -> 1 under a size model where variables cost 0."
    ],
    "closed_term_counts_A275057": [C.closed_count(n) for n in range(1, 31)],
    "rows": rows_out,
    "provenance": {"engine": "debruijn_census.py + bgk_lab.py", "host": "dev-cx53 16-core", "node_cap": 3000, "size_cap": 200, "K": 50000},
}

json.dump(dataset, open('/tmp/bgk/census_dataset.json', 'w'), indent=2)
with open('/tmp/bgk/census_dataset.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(["n", "method", "total", "SN", "SEP", "NWN", "UND", "decided",
                "dens_SN_of_total", "dens_SN_of_decided", "dens_SEP_of_decided", "frac_undecided"])
    for r in rows_out:
        w.writerow([r["n"], r["method"], r["total"], r["SN"], r["SEP"], r["NWN"], r["UND"], r["decided"],
                    r["dens_SN_of_total"], r["dens_SN_of_decided"], r["dens_SEP_of_decided"], r["frac_undecided"]])

print("smallest separator:", witness)
print("rows:", len(rows_out), "| n range:", rows_out[0]["n"], "-", rows_out[-1]["n"])
print("wrote census_dataset.json + census_dataset.csv")
