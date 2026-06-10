#!/usr/bin/env python3
"""
bgk_lab.py — self-contained normalization laboratory for the BGK deep-dive.
Pure stdlib + multiprocessing. Run:  python3 bgk_lab.py [seconds_per_idea]
Emits one JSON document on stdout: { meta, E1..E7 }.
Each experiment is wall-clock-budgeted (default 540s = 9 min, "max 10m/idea").
"""
import sys, time, json, math
from multiprocessing import Pool, cpu_count

# ============================== core λ-calculus ==============================
def V(n): return ('v', n)
def L(x, b): return ('l', x, b)
def A(f, x): return ('a', f, x)

def free_vars(t, acc=None):
    k = t[0]
    if k == 'v': return {t[1]}
    if k == 'l': return free_vars(t[2]) - {t[1]}
    if k == 'a': return free_vars(t[1]) | free_vars(t[2])
    if k == 'p': return free_vars(t[1]) | free_vars(t[2])
    return set()

_ctr = [0]
def fresh(b):
    _ctr[0] += 1
    return f"{b}#{_ctr[0]}"

def subst(t, x, s):
    k = t[0]
    if k == 'v': return s if t[1] == x else t
    if k == 'a': return A(subst(t[1], x, s), subst(t[2], x, s))
    if k == 'p': return ('p', subst(t[1], x, s), subst(t[2], x, s))
    y, body = t[1], t[2]
    if y == x: return t
    if y in free_vars(s):
        y2 = fresh(y.split('#')[0]); body = subst(body, y, V(y2)); y = y2
    return L(y, subst(body, x, s))

def is_redex(t): return t[0] == 'a' and t[1][0] == 'l'

def contract(t):
    lam, arg = t[1], t[2]
    return subst(lam[2], lam[1], arg)

def one_step(t):
    outs = []
    if is_redex(t): outs.append(contract(t))
    k = t[0]
    if k == 'l':
        outs += [L(t[1], b) for b in one_step(t[2])]
    elif k == 'a':
        outs += [A(f, t[2]) for f in one_step(t[1])]
        outs += [A(t[1], a) for a in one_step(t[2])]
    elif k == 'p':
        outs += [('p', f, t[2]) for f in one_step(t[1])]
        outs += [('p', t[1], a) for a in one_step(t[2])]
    return outs

def db_key(t, env=()):
    k = t[0]
    if k == 'v':
        for i, nm in enumerate(env):
            if nm == t[1]: return ('b', i)
        return ('f', t[1])
    if k == 'l': return ('l', db_key(t[2], (t[1],) + env))
    if k == 'a': return ('a', db_key(t[1], env), db_key(t[2], env))
    if k == 'p': return ('p', db_key(t[1], env), db_key(t[2], env))

def size(t):
    k = t[0]
    if k == 'v': return 1
    if k == 'l': return 1 + size(t[2])
    return 1 + size(t[1]) + size(t[2])

def show(t):
    k = t[0]
    if k == 'v': return t[1].split('#')[0]
    if k == 'l': return f"λ{t[1].split('#')[0]}.{show(t[2])}"
    if k == 'p': return f"[{show(t[1])},{show(t[2])}]"
    a = show(t[1]); b = show(t[2])
    if t[2][0] == 'a': b = f"({b})"
    return f"{a} {b}"

# -------- reduction graph (α-quotiented), bounded --------
def graph(t, node_cap=4000, size_cap=220):
    start = db_key(t); nodes = {start: t}; succ = {}; order = [start]; i = 0; trunc = False
    while i < len(order):
        key = order[i]; i += 1; term = nodes[key]; sk = []
        for r in one_step(term):
            if size(r) > size_cap: trunc = True; continue
            rk = db_key(r); sk.append(rk)
            if rk not in nodes:
                nodes[rk] = r; order.append(rk)
                if len(nodes) > node_cap: trunc = True; break
        succ[key] = sk
        if trunc and len(nodes) > node_cap: break
    return nodes, succ, trunc

def has_cycle(succ):
    color = {}; onstack = set(); found = [False]
    # iterative DFS to avoid recursion limits
    for s in list(succ.keys()):
        if s in color: continue
        stack = [(s, iter(succ.get(s, [])))]; color[s] = 1; onstack.add(s)
        while stack:
            node, it = stack[-1]; adv = False
            for w in it:
                if w not in color:
                    color[w] = 1; onstack.add(w); stack.append((w, iter(succ.get(w, [])))); adv = True; break
                elif w in onstack:
                    found[0] = True
            if not adv:
                onstack.discard(node); color[node] = 2; stack.pop()
        if found[0]: return True
    return found[0]

def analyze(t, node_cap=4000, size_cap=220):
    nodes, succ, trunc = graph(t, node_cap, size_cap)
    # A node with empty successors is a TRUE normal form only if it genuinely has
    # no redex. If its reducts were dropped (size_cap) it merely LOOKS terminal —
    # counting it as an NF falsely sets wn=True (the size-cap false-NF bug).
    true_nf = []
    for k in succ:
        if not succ[k]:
            if one_step(nodes[k]):       # had reducts, all pruned by size_cap
                trunc = True
            else:
                true_nf.append(k)        # genuinely no redex → real normal form
    wn = True if true_nf else (None if trunc else False)
    cyc = has_cycle(succ)
    sn = False if cyc else (None if trunc else True)
    return dict(sn=sn, wn=wn, nodes=len(nodes), trunc=trunc,
                nodes_map=nodes, succ=succ, nf=true_nf)

# longest path (only meaningful when acyclic / SN): DP over DAG
def longest_path(succ):
    memo = {}
    def dfs(u):
        if u in memo: return memo[u]
        memo[u] = 0
        best = 0
        for w in succ.get(u, []):
            best = max(best, 1 + dfs(w))
        memo[u] = best; return best
    # iterative to be safe
    order = list(succ.keys())
    # simple memoized recursion guarded by sys recursion limit bump
    sys.setrecursionlimit(100000)
    return max((dfs(u) for u in order), default=0)

def shortest_to_nf(succ, start):
    from collections import deque
    nf = set(k for k in succ if not succ[k])
    if start in nf: return 0
    dq = deque([(start, 0)]); seen = {start}
    while dq:
        u, d = dq.popleft()
        for w in succ.get(u, []):
            if w in nf: return d + 1
            if w not in seen: seen.add(w); dq.append((w, d + 1))
    return None

# -------- normal-order + perpetual strategies --------
def lo_path(t):
    if is_redex(t): return []
    k = t[0]
    if k == 'l':
        p = lo_path(t[2]); return None if p is None else ['l'] + p
    if k == 'a':
        p = lo_path(t[1])
        if p is not None: return ['f'] + p
        p = lo_path(t[2]); return None if p is None else ['x'] + p
    return None

def reduce_at(t, path):
    if not path: return contract(t)
    d, rest = path[0], path[1:]
    if d == 'l': return L(t[1], reduce_at(t[2], rest))
    if d == 'f': return A(reduce_at(t[1], rest), t[2])
    return A(t[1], reduce_at(t[2], rest))

def normal_order_len(t, cap=2000):
    n = 0
    while n < cap:
        p = lo_path(t)
        if p is None: return n, True
        t = reduce_at(t, p); n += 1
    return n, False

def perpetual_step(t):
    if is_redex(t):
        lam, arg = t[1], t[2]; x, body = lam[1], lam[2]
        if (x not in free_vars(body)) and lo_path(arg) is not None:
            return A(lam, perpetual_step(arg))
        return contract(t)
    k = t[0]
    if k == 'l':
        s = perpetual_step(t[2]); return None if s is None else L(t[1], s)
    if k == 'a':
        s = perpetual_step(t[1])
        if s is not None: return A(s, t[2])
        s = perpetual_step(t[2]); return None if s is None else A(t[1], s)
    return None

def perpetual_diverges(t, bound=400):
    seen = set()
    for _ in range(bound):
        s = perpetual_step(t)
        if s is None: return False          # reached normal form
        k = db_key(s)
        if k in seen: return True           # cycle on perpetual path
        seen.add(k); t = s
    return True                              # didn't normalize within bound

# -------- Klop ι-translation into extended λI[,] --------
def iota(t):
    k = t[0]
    if k == 'v': return t
    if k == 'a': return A(iota(t[1]), iota(t[2]))
    x, body = t[1], t[2]
    ib = iota(body)
    if x in free_vars(body): return L(x, ib)
    return L(x, ('p', ib, V(x)))            # park x → legal λI abstraction

def is_lambda_I(t):
    k = t[0]
    if k == 'v': return True
    if k == 'l': return (t[1] in free_vars(t[2])) and is_lambda_I(t[2])
    if k in ('a', 'p'): return is_lambda_I(t[1]) and is_lambda_I(t[2])
    return True

# extended reduction already handled by one_step ('p' + π done below)
def one_step_ext(t):
    outs = []
    if is_redex(t): outs.append(contract(t))
    if t[0] == 'a' and t[1][0] == 'p':       # π : [T,U] T' -> [T T', U]
        T, U = t[1][1], t[1][2]
        outs.append(('p', A(T, t[2]), U))
    k = t[0]
    if k == 'l':
        outs += [L(t[1], b) for b in one_step_ext(t[2])]
    elif k == 'a':
        outs += [A(f, t[2]) for f in one_step_ext(t[1])]
        outs += [A(t[1], a) for a in one_step_ext(t[2])]
    elif k == 'p':
        outs += [('p', f, t[2]) for f in one_step_ext(t[1])]
        outs += [('p', t[1], a) for a in one_step_ext(t[2])]
    return outs

def analyze_ext(t, node_cap=6000, size_cap=260):
    start = db_key(t); nodes = {start: t}; succ = {}; order = [start]; i = 0; trunc = False
    while i < len(order):
        key = order[i]; i += 1; term = nodes[key]; sk = []
        for r in one_step_ext(term):
            if size(r) > size_cap: trunc = True; continue
            rk = db_key(r); sk.append(rk)
            if rk not in nodes:
                nodes[rk] = r; order.append(rk)
                if len(nodes) > node_cap: trunc = True; break
        succ[key] = sk
        if trunc and len(nodes) > node_cap: break
    cyc = has_cycle(succ)
    sn = False if cyc else (None if trunc else True)
    nf = any(not succ[k] for k in succ)
    wn = True if nf else (None if trunc else False)
    return dict(sn=sn, wn=wn, nodes=len(nodes), trunc=trunc)

# ============================== term enumeration ==============================
def gen_terms(max_size, alphabet, lambda_I):
    cache = {}
    def gen(sz, used):
        key = (sz, tuple(sorted(used)))
        if key in cache: return cache[key]
        out = []
        if sz >= 1: out += [V(v) for v in used]
        if sz >= 2:
            bv = f"z{len(used)}"
            for b in gen(sz - 1, used | {bv}):
                if (not lambda_I) or (bv in free_vars(b)): out.append(L(bv, b))
        if sz >= 3:
            for ls in range(1, sz - 1):
                for f in gen(ls, used):
                    for x in gen(sz - 1 - ls, used): out.append(A(f, x))
        cache[key] = out; return out
    res = []; seen = set()
    for s in range(1, max_size + 1):
        for t in gen(s, set(alphabet)):
            k = db_key(t)
            if k not in seen: seen.add(k); res.append(t)
    return res

def gen_by_size(sz, alphabet, lambda_I):
    return [t for t in gen_terms(sz, alphabet, lambda_I) if size(t) == sz]

# ============================== experiment workers ==============================
def w_classify(t):
    a = analyze(t, node_cap=3000, size_cap=180)
    if a['sn'] is None or a['wn'] is None: return (0, 0)
    return (1, 1 if (a['wn'] and not a['sn']) else 0)

def w_sep_detail(t):
    a = analyze(t, node_cap=3000, size_cap=180)
    if a['sn'] is None or a['wn'] is None: return None
    if a['wn'] and not a['sn']: return show(t)
    return None

def w_geometry(t):
    a = analyze(t, node_cap=3000, size_cap=180)
    if a['sn'] is not True: return None       # only SN terms have finite geometry
    lp = longest_path(a['succ'])
    sp = shortest_to_nf(a['succ'], db_key(t))
    maxsz = max((size(v) for v in a['nodes_map'].values()), default=size(t))
    return (size(t), lp, sp if sp is not None else 0, maxsz, a['nodes'])

def w_perpetual(t):
    a = analyze(t, node_cap=3000, size_cap=180)
    if a['sn'] is None: return None
    pdiv = perpetual_diverges(t)
    # law: perpetual diverges  <=>  not SN
    return (1, 1 if (pdiv == (a['sn'] is False)) else 0)

def w_transfer(t):
    a = analyze(t, node_cap=3000, size_cap=180)
    if a['sn'] is None: return None
    it = iota(t)
    if not is_lambda_I(it): return ('NOT_I', show(t))
    ae = analyze_ext(it, node_cap=4000, size_cap=240)
    if ae['sn'] is None: return None
    return (1, 1 if (a['sn'] == ae['sn']) else 0, None if a['sn'] == ae['sn'] else show(t))

# ============================== experiments ==============================
def budget_ok(t0, budget): return (time.time() - t0) < budget

def E1_conservation(budget, pool, alpha):
    t0 = time.time(); rows = []
    for s in range(1, 16):                       # λI: cap size 15 (size-16 took 538s)
        if not budget_ok(t0, budget): break
        terms = gen_by_size(s, alpha, True)
        if not terms: continue
        res = pool.map(w_classify, terms, chunksize=200)
        dec = sum(r[0] for r in res); sep = sum(r[1] for r in res)
        rows.append(dict(size=s, terms=len(terms), decided=dec, separators=sep))
        if not budget_ok(t0, budget): break
    return dict(name="Conservation (λI exhaustive)", rows=rows,
                total_terms=sum(r["terms"] for r in rows),
                total_separators=sum(r["separators"] for r in rows),
                max_size=max((r["size"] for r in rows), default=0),
                seconds=round(time.time() - t0, 1))

def E2_separators(budget, pool, alpha):
    t0 = time.time(); rows = []; samples = []
    for s in range(1, 14):                       # λK: cap size 13 (~3M; size 14 ≈ 13M, too big)
        if not budget_ok(t0, budget): break
        terms = gen_by_size(s, alpha, False)
        if not terms: continue
        res = pool.map(w_classify, terms, chunksize=400)
        dec = sum(r[0] for r in res); sep = sum(r[1] for r in res)
        rows.append(dict(size=s, terms=len(terms), decided=dec, separators=sep,
                         density=(sep / dec if dec else 0.0)))
        if sep and len(samples) < 8:
            det = [x for x in pool.map(w_sep_detail, terms, chunksize=400) if x]
            samples = det[:8]
        if not budget_ok(t0, budget): break
    onset = next((r["size"] for r in rows if r["separators"] > 0), None)
    return dict(name="λK separator census", rows=rows, onset_size=onset,
                samples=samples, seconds=round(time.time() - t0, 1))

def E3_geometry(budget, pool, alpha):
    t0 = time.time(); pts = []; per_size = {}
    for s in range(1, 13):                       # SN-geometry: cap size 12
        if not budget_ok(t0, budget): break
        terms = gen_by_size(s, alpha, False)
        if not terms: continue
        res = [r for r in pool.map(w_geometry, terms, chunksize=300) if r]
        for (sz, lp, sp, maxsz, nodes) in res:
            pts.append([sz, lp, sp, maxsz, nodes])
        if res:
            lps = [r[1] for r in res]
            per_size[s] = dict(n=len(res), max_longest=max(lps),
                               mean_longest=round(sum(lps) / len(lps), 2),
                               max_blowup=max(r[3] for r in res))
        if not budget_ok(t0, budget): break
    # downsample scatter for the webpage
    if len(pts) > 4000:
        step = len(pts) // 4000
        pts = pts[::step]
    return dict(name="Reduction geometry (SN terms)", points=pts,
                cols=["size", "longest", "shortest", "max_blowup", "graph_nodes"],
                per_size=per_size, seconds=round(time.time() - t0, 1))

def E4_perpetual(budget, pool, alpha):
    t0 = time.time(); agree = 0; total = 0; rows = []
    for s in range(1, 13):                       # perpetual law: cap size 12
        if not budget_ok(t0, budget): break
        for lamI in (True, False):
            terms = gen_by_size(s, alpha, lamI)
            if not terms: continue
            res = [r for r in pool.map(w_perpetual, terms, chunksize=300) if r]
            a = sum(r[0] for r in res); ok = sum(r[1] for r in res)
            agree += ok; total += a
        if not budget_ok(t0, budget): break
        rows.append(dict(size=s, checked=total, agreements=agree))
    return dict(name="Perpetual-strategy law: diverge ⟺ ¬SN",
                checked=total, agreements=agree,
                violations=total - agree, rows=rows,
                seconds=round(time.time() - t0, 1))

def E5_transfer(budget, pool, alpha):
    t0 = time.time(); agree = 0; total = 0; notI = 0; rows = []; mism = []
    for s in range(1, 13):
        if not budget_ok(t0, budget): break
        terms = gen_by_size(s, alpha, False)
        if not terms: continue
        res = [r for r in pool.map(w_transfer, terms, chunksize=200) if r]
        for r in res:
            if r[0] == 'NOT_I': notI += 1; continue
            total += 1; agree += r[1]
            if r[1] == 0 and r[2] and len(mism) < 8: mism.append(r[2])
        rows.append(dict(size=s, checked=total, agreements=agree))
        if not budget_ok(t0, budget): break
    return dict(name="λI-translation transfer: SN(M) ⟺ SN(ι(M))",
                checked=total, agreements=agree, violations=total - agree,
                not_lambdaI=notI, mismatches=mism, rows=rows,
                seconds=round(time.time() - t0, 1))

def _bench_chunk(args):
    seed, n = args
    # deterministic-ish workload: analyze a fixed list of medium terms repeatedly
    base = gen_by_size(9, ['y'], False)[:n]
    c = 0
    for t in base:
        a = analyze(t, node_cap=2000, size_cap=140)
        c += a['nodes']
    return c

def E6_speedup(budget, alpha):
    t0 = time.time()
    # heavier, uniform workload so per-task compute dominates Pool overhead:
    work = gen_by_size(11, alpha, False)[:40000]
    rows = []
    cores_list = sorted(set([c for c in (1, 2, 4, 8, 16) if c <= cpu_count()] + [cpu_count()]))
    base_t = None
    for c in cores_list:
        if not budget_ok(t0, budget): break
        best = None
        for _ in range(2):                       # take min of 2 runs (denoise)
            s = time.time()
            with Pool(c) as p:
                p.map(w_classify, work, chunksize=max(1, len(work) // (c * 8)))
            dt = time.time() - s
            best = dt if best is None else min(best, dt)
        if base_t is None: base_t = best
        rows.append(dict(cores=c, seconds=round(best, 3),
                         speedup=round(base_t / best, 2),
                         efficiency=round((base_t / best) / c, 3)))
    return dict(name="Parallel speedup (analyze workload)",
                workload=len(work), rows=rows,
                seconds=round(time.time() - t0, 1))

def E7_zoo(budget):
    t0 = time.time()
    Delta = L('x', A(V('x'), V('x'))); Omega = A(Delta, Delta)
    I = L('x', V('x')); K = L('x', L('y', V('x')))
    S = L('x', L('y', L('z', A(A(V('x'), V('z')), A(V('y'), V('z'))))))
    terms = {
        "I = λx.x": I,
        "K = λx.λy.x": K,
        "S = λx.λy.λz.xz(yz)": S,
        "Ω = ΔΔ": Omega,
        "(λx.y)Ω  [separator]": A(L('x', V('y')), Omega),
        "S K K  (→ I)": A(A(S, K), K),
        "(λx.xx)(λy.y)": A(Delta, I),
        "K I Ω": A(A(K, I), Omega),
    }
    zoo = []
    for name, t in terms.items():
        a = analyze(t, node_cap=400, size_cap=120)
        idx = {k: i for i, k in enumerate(a['succ'].keys())}
        nodes = [dict(id=i, label=show(a['nodes_map'][k]),
                      nf=(not a['succ'][k])) for k, i in idx.items()]
        edges = [[idx[u], idx[w]] for u in a['succ'] for w in a['succ'][u]]
        zoo.append(dict(name=name, sn=a['sn'], wn=a['wn'],
                        n=len(nodes), nodes=nodes[:120], edges=edges[:300],
                        truncated=a['trunc']))
    return dict(name="Reduction-graph zoo", terms=zoo,
                seconds=round(time.time() - t0, 1))

# ============================== main ==============================
OUTFILE = "/tmp/bgk_results.json"

def main():
    budget = float(sys.argv[1]) if len(sys.argv) > 1 else 540.0
    alpha = ['y']
    t_start = time.time()
    out = {"meta": {"cores": cpu_count(), "budget_per_idea_s": budget,
                    "python": sys.version.split()[0]}}
    _write(out)
    with Pool(cpu_count()) as pool:
        _run(out, "E1", lambda: E1_conservation(budget, pool, alpha))
        _run(out, "E2", lambda: E2_separators(budget, pool, alpha))
        _run(out, "E3", lambda: E3_geometry(budget, pool, alpha))
        _run(out, "E4", lambda: E4_perpetual(budget, pool, alpha))
        _run(out, "E5", lambda: E5_transfer(budget, pool, alpha))
    _run(out, "E6", lambda: E6_speedup(budget, alpha))
    _run(out, "E7", lambda: E7_zoo(min(budget, 60)))
    out["meta"]["total_seconds"] = round(time.time() - t_start, 1)
    _write(out)
    print(json.dumps(out))            # also to stdout

def _run(out, key, fn):
    try:
        out[key] = fn()
        sys.stderr.write(f"[{time.strftime('%H:%M:%S')}] done {key}: {out[key].get('seconds')}s\n")
    except Exception as e:
        import traceback
        out[key] = {"error": str(e), "trace": traceback.format_exc()[-800:]}
        sys.stderr.write(f"[{time.strftime('%H:%M:%S')}] ERROR {key}: {e}\n")
    sys.stderr.flush()
    _write(out)                       # incremental persist after every experiment

def _write(out):
    try:
        with open(OUTFILE, "w") as f: json.dump(out, f)
    except Exception:
        pass

if __name__ == '__main__':
    main()
