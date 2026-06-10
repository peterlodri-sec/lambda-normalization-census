#!/usr/bin/env python3
"""
Normalization census of the untyped λ-calculus, standard de Bruijn model with
NATURAL SIZE (Bendkowski–Grygiel–Lescanne–Zaionc):
    size(index k) = k+1      (de Bruijn index k, 0-based)
    size(λ M)     = 1 + size(M)
    size(M N)     = 1 + size(M) + size(N)

Counts L(n,m) = # de Bruijn terms of size n valid in a context of m binders
(indices < m). Closed terms of size n = L(n,0).

Reuses the validated reduction-graph analyzer from bgk_lab to classify each term
into SN / separator (WN∧¬SN) / non-WN / undecided.
"""
import sys, json, random
sys.path.insert(0, '/tmp/bgk'); sys.path.insert(0, '/tmp')
from bgk_lab import L as MKLAM, A as MKAPP, V as MKVAR, analyze, size as nsize, show  # named ctors

# ---------------- counting ----------------
import functools
@functools.lru_cache(maxsize=None)
def L(n, m):
    """# de Bruijn terms of natural-size n with indices < m."""
    if n <= 0: return 0
    total = 0
    # index: the index of de Bruijn value k has size k+1; present iff k<m → k=n-1<m
    if 1 <= n <= m:
        total += 1
    # λ M : 1 + size(M), context grows to m+1
    total += L(n - 1, m + 1)
    # app M N : 1 + a + b
    for a in range(1, n - 1):
        total += L(a, m) * L(n - 1 - a, m)
    return total

def closed_count(n): return L(n, 0)

def dbsize(t):
    """natural size of a de Bruijn term: index k -> k+1, λ -> 1+body, app -> 1+f+x."""
    if t[0] == 'i': return t[1] + 1
    if t[0] == 'l': return 1 + dbsize(t[1])
    return 1 + dbsize(t[1]) + dbsize(t[2])

# ---------------- exhaustive enumeration (de Bruijn) ----------------
# term repr: ('i',k) | ('l',M) | ('a',M,N)
def enum(n, m):
    out = []
    if n <= 0: return out
    if 1 <= n <= m:
        out.append(('i', n - 1))
    for M in enum(n - 1, m + 1):
        out.append(('l', M))
    for a in range(1, n - 1):
        AS = enum(a, m); BS = enum(n - 1 - a, m)
        for x in AS:
            for y in BS:
                out.append(('a', x, y))
    return out

# ---------------- uniform sampling (top-down by counts) ----------------
def sample(n, m, rng):
    if not (1 <= n): raise ValueError
    tot = L(n, m)
    if tot == 0: return None
    r = rng.randrange(tot)
    # index
    if 1 <= n <= m:
        if r == 0: return ('i', n - 1)
        r -= 1
    # lambda
    lam = L(n - 1, m + 1)
    if r < lam:
        return ('l', sample(n - 1, m + 1, rng))
    r -= lam
    # app: pick split a by weight L(a,m)*L(n-1-a,m)
    for a in range(1, n - 1):
        w = L(a, m) * L(n - 1 - a, m)
        if r < w:
            # within this split, index = qa*|B| + qb
            nb = L(n - 1 - a, m)
            qa, qb = divmod(r, nb)
            return ('a', sample_idx(a, m, qa, rng), sample_idx(n - 1 - a, m, qb, rng))
        r -= w
    raise RuntimeError("sampling fell through")

def sample_idx(n, m, idx, rng):
    """deterministic enumeration-rank sampler kept consistent with sample()."""
    # index
    if 1 <= n <= m:
        if idx == 0: return ('i', n - 1)
        idx -= 1
    lam = L(n - 1, m + 1)
    if idx < lam:
        return ('l', sample_idx(n - 1, m + 1, idx, rng))
    idx -= lam
    for a in range(1, n - 1):
        nb = L(n - 1 - a, m)
        w = L(a, m) * nb
        if idx < w:
            qa, qb = divmod(idx, nb)
            return ('a', sample_idx(a, m, qa, rng), sample_idx(n - 1 - a, m, qb, rng))
        idx -= w
    raise RuntimeError

# ---------------- de Bruijn → named (for analyze) ----------------
def to_named(t, stack=()):
    k = t[0]
    if k == 'i':
        return MKVAR(stack[-1 - t[1]])            # de Bruijn 0 = innermost = stack[-1]
    if k == 'l':
        nm = "v%d" % len(stack)
        return MKLAM(nm, to_named(t[1], stack + (nm,)))
    return MKAPP(to_named(t[1], stack), to_named(t[2], stack))

# ---------------- classification ----------------
def classify(dbterm, node_cap=3000, size_cap=200):
    t = to_named(dbterm)
    a = analyze(t, node_cap=node_cap, size_cap=size_cap)
    sn, wn = a['sn'], a['wn']
    if sn is True:            return 'SN'
    if sn is False and wn is True:  return 'SEP'     # WN ∧ ¬SN
    if sn is False and wn is False: return 'NWN'     # ¬WN (loops, no NF)
    return 'UND'                                     # undecided (capped)

# ---------------- the census run ----------------
def run_census(ex_max, mc_plan, K, seed=12345):
    from multiprocessing import Pool, cpu_count
    from collections import Counter
    import time
    rng = random.Random(seed)
    t0 = time.time()
    out = {"model": "untyped lambda, de Bruijn, natural size |idx k|=k+1",
           "closed_counts": [closed_count(n) for n in range(1, 41)],
           "cores": cpu_count(), "node_cap": 3000, "size_cap": 200,
           "K_montecarlo": K, "rows": [], "smallest_separator": None}
    pool = Pool(cpu_count())
    for n in range(2, ex_max + 1):
        terms = enum(n, 0)
        res = pool.map(classify, terms, chunksize=256)
        c = Counter(res)
        out["rows"].append({"n": n, "method": "exact", "total": len(terms),
                            "SN": c["SN"], "SEP": c["SEP"], "NWN": c["NWN"], "UND": c["UND"]})
        if out["smallest_separator"] is None and c["SEP"] > 0:
            for t in terms:
                if classify(t) == "SEP":
                    out["smallest_separator"] = {"size": n, "named": show(to_named(t))}
                    break
        sys.stderr.write(f"[ex n={n:2}] tot={len(terms):7} SN={c['SN']} SEP={c['SEP']} "
                         f"NWN={c['NWN']} UND={c['UND']} ({round(time.time()-t0,1)}s)\n"); sys.stderr.flush()
    for n in mc_plan:
        samples = [sample(n, 0, rng) for _ in range(K)]
        res = pool.map(classify, samples, chunksize=256)
        c = Counter(res)
        out["rows"].append({"n": n, "method": "montecarlo", "total": K,
                            "SN": c["SN"], "SEP": c["SEP"], "NWN": c["NWN"], "UND": c["UND"]})
        sys.stderr.write(f"[mc n={n:3}] K={K} SN={c['SN']} SEP={c['SEP']} "
                         f"NWN={c['NWN']} UND={c['UND']} ({round(time.time()-t0,1)}s)\n"); sys.stderr.flush()
    out["wall_s"] = round(time.time() - t0, 1)
    pool.close()
    print(json.dumps(out))

# ---------------- self-test ----------------
if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'census':
    run_census(ex_max=16,
               mc_plan=[17, 18, 20, 22, 25, 28, 32, 38, 45, 55, 70, 90],
               K=50000)
elif __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'selftest':
    print("closed-term counts L(n,0), n=1..20:")
    seq = [closed_count(n) for n in range(1, 21)]
    print(" ", seq)
    # cross-check enumeration count == formula for small n
    for n in range(1, 13):
        e = len(enum(n, 0)); f = closed_count(n)
        assert e == f, f"enum/count mismatch n={n}: {e} vs {f}"
    print("  enum==count for n≤12 ✓")
    # sampler sanity: sample many size-n, all must be size n and closed (to_named ok)
    rng = random.Random(1)
    for n in (10, 14, 18, 30):
        ok = sum(1 for _ in range(3000) if dbsize(sample(n, 0, rng)) == n)
        print(f"  sampler n={n}: {ok}/3000 correct natural size")
    # tiny classification preview
    from collections import Counter
    for n in range(2, 13):
        c = Counter(classify(t) for t in enum(n, 0))
        tot = sum(c.values())
        print(f"  n={n:2} total={tot:6} SN={c['SN']} SEP={c['SEP']} NWN={c['NWN']} UND={c['UND']}")
