#!/usr/bin/env python3
"""
Empirical validation harness for claims in the Barendregt-Geuvers-Klop deep-dive.

Pure-stdlib. Validates, by *executable* reduction (not assertion), the concrete
behaviours the conservation / WN=>SN story rests on:

  C1. Untyped lambda-K: (\\x.y)Omega is WN but NOT SN  (the canonical separator).
  C2. SN <=> the reduction graph (up to alpha) is finite & acyclic; a beta-cycle
      is a *witness* of non-SN. Demonstrated on Omega and (\\x.y)Omega.
  C3. Perpetual strategy: a maximal/perpetual one-step strategy walks INTO an
      erasable diverging argument, exhibiting the infinite path that normal-order
      hides. Shown on (\\x.y)Omega.
  C4. Conservation, empirically: enumerate small *lambda-I* terms (no erasing
      abstractions). For EVERY such term, WN <=> SN. Contrast with lambda-K,
      where we exhibit the smallest WN-but-not-SN terms.

Terms: ('v',name) | ('l',name,body) | ('a',f,x)
"""

from itertools import count, product

# ---------- term helpers ----------
def V(n): return ('v', n)
def L(x, b): return ('l', x, b)
def A(f, x): return ('a', f, x)

def free_vars(t):
    k = t[0]
    if k == 'v': return {t[1]}
    if k == 'l': return free_vars(t[2]) - {t[1]}
    return free_vars(t[1]) | free_vars(t[2])

_fresh = count()
def fresh(base):
    return f"{base}#{next(_fresh)}"

def subst(t, x, s):
    """capture-avoiding [x := s] t"""
    k = t[0]
    if k == 'v':
        return s if t[1] == x else t
    if k == 'a':
        return A(subst(t[1], x, s), subst(t[2], x, s))
    # lambda
    y, body = t[1], t[2]
    if y == x:
        return t                      # x bound here: stop
    if y in free_vars(s):             # would capture: rename binder
        y2 = fresh(y.split('#')[0])
        body = subst(body, y, V(y2))
        y = y2
    return L(y, subst(body, x, s))

def is_redex(t):
    return t[0] == 'a' and t[1][0] == 'l'

def contract(t):
    """contract a top-level redex (\\x.b) a  ->  b[x:=a]"""
    lam, arg = t[1], t[2]
    return subst(lam[2], lam[1], arg)

def one_step_reducts(t):
    """ALL terms reachable by contracting exactly one (any) redex."""
    outs = []
    if is_redex(t):
        outs.append(contract(t))
    k = t[0]
    if k == 'l':
        outs += [L(t[1], b) for b in one_step_reducts(t[2])]
    elif k == 'a':
        outs += [A(f, t[2]) for f in one_step_reducts(t[1])]
        outs += [A(t[1], a) for a in one_step_reducts(t[2])]
    return outs

# ---------- alpha-canonical key (de Bruijn) ----------
def db_key(t, env=None):
    if env is None: env = []
    k = t[0]
    if k == 'v':
        for i, nm in enumerate(env):
            if nm == t[1]:
                return ('b', i)        # bound, de Bruijn index
        return ('f', t[1])             # free
    if k == 'l':
        return ('l', db_key(t[2], [t[1]] + env))
    return ('a', db_key(t[1], env), db_key(t[2], env))

def size(t):
    k = t[0]
    if k == 'v': return 1
    if k == 'l': return 1 + size(t[2])
    return 1 + size(t[1]) + size(t[2])

# ---------- reduction-graph analysis (SN / WN deciders for small terms) ----------
def analyze(t, node_cap=4000, size_cap=400):
    """
    Build the alpha-quotiented reduction graph reachable from t (bounded).
    Returns dict: sn (bool|None), wn (bool|None), cycle_witness, nf_witness, nodes.
    None = 'unknown' (hit a cap).
    """
    start = db_key(t)
    nodes = {start: t}
    succ = {}
    order = [start]
    i = 0
    truncated = False
    while i < len(order):
        key = order[i]; i += 1
        term = nodes[key]
        rs = one_step_reducts(term)
        sk = []
        for r in rs:
            if size(r) > size_cap:
                truncated = True
                continue
            rk = db_key(r)
            sk.append(rk)
            if rk not in nodes:
                nodes[rk] = r
                order.append(rk)
                if len(nodes) > node_cap:
                    truncated = True
                    break
        succ[key] = sk
        if truncated and len(nodes) > node_cap:
            break

    # normal forms among explored nodes
    nf = [k for k in succ if len(succ[k]) == 0]
    wn = True if nf else (None if truncated else False)

    # cycle detection on explored subgraph (Tarjan-ish DFS)
    color = {}      # 0=grey,1=black
    cycle = [False]
    stack_set = set()
    def dfs(u):
        color[u] = 0; stack_set.add(u)
        for w in succ.get(u, []):
            if w not in color:
                dfs(w)
            elif w in stack_set:
                cycle[0] = True
        stack_set.discard(u); color[u] = 1
    for k in list(succ.keys()):
        if k not in color:
            dfs(k)
    if cycle[0]:
        sn = False
    elif truncated:
        sn = None       # could still diverge beyond the cap
    else:
        sn = True        # finite acyclic reduction graph => strongly normalizing
    return dict(sn=sn, wn=wn, nodes=len(nodes), truncated=truncated,
                nf=nf[0] if nf else None)

# ---------- normal-order (leftmost-outermost) reduction ----------
def leftmost_redex_path(t):
    """return position-path of leftmost-outermost redex, or None"""
    if is_redex(t): return []
    k = t[0]
    if k == 'l':
        p = leftmost_redex_path(t[2])
        return None if p is None else ['l'] + p
    if k == 'a':
        p = leftmost_redex_path(t[1])
        if p is not None: return ['f'] + p
        p = leftmost_redex_path(t[2])
        return None if p is None else ['x'] + p
    return None

def reduce_at(t, path):
    if not path: return contract(t)
    d, rest = path[0], path[1:]
    if d == 'l': return L(t[1], reduce_at(t[2], rest))
    if d == 'f': return A(reduce_at(t[1], rest), t[2])
    return A(t[1], reduce_at(t[2], rest))

def normal_order(t, cap=1000):
    steps = 0
    while steps < cap:
        p = leftmost_redex_path(t)
        if p is None: return t, steps, True
        t = reduce_at(t, p); steps += 1
    return t, steps, False

# ---------- perpetual strategy (Barendregt 13.4.x flavour) ----------
def perpetual_step(t):
    """
    One step of a *perpetual* strategy: prefer to keep reductions alive.
    At an outermost redex (\\x.A)B: if x does NOT occur in A (erasing) and B is
    not in normal form, step INSIDE B (don't throw the work away); otherwise
    contract. Recurse structurally so we always return a redex if one exists.
    """
    if is_redex(t):
        lam, arg = t[1], t[2]
        x, body = lam[1], lam[2]
        erasing = x not in free_vars(body)
        if erasing and leftmost_redex_path(arg) is not None:
            return A(lam, perpetual_step(arg))   # walk into the doomed argument
        return contract(t)
    k = t[0]
    if k == 'l':
        s = perpetual_step(t[2]); return None if s is None else L(t[1], s)
    if k == 'a':
        s = perpetual_step(t[1])
        if s is not None: return A(s, t[2])
        s = perpetual_step(t[2])
        return None if s is None else A(t[1], s)
    return None

def perpetual_run(t, cap=12):
    seq = [t]
    for _ in range(cap):
        s = perpetual_step(t)
        if s is None: break
        t = s; seq.append(t)
    return seq

# ---------- lambda-I generation (no erasing abstractions) ----------
def gen_terms(max_size, alphabet, lambda_I):
    """all terms up to max_size over given free-variable alphabet (closed-ish)."""
    cache = {}
    def gen(sz, used):
        key = (sz, tuple(sorted(used)))
        if key in cache: return cache[key]
        out = []
        if sz >= 1:
            out += [V(v) for v in used]                      # variables in scope
        if sz >= 2:
            for b in gen(sz - 1, used | {f"z{len(used)}"}):  # lambda
                bv = f"z{len(used)}"
                if (not lambda_I) or (bv in free_vars(b)):
                    out.append(L(bv, b))
        if sz >= 3:
            for ls in range(1, sz - 1):                       # application
                for f in gen(ls, used):
                    for x in gen(sz - 1 - ls, used):
                        out.append(A(f, x))
        cache[key] = out
        return out
    res = []
    seen = set()
    for s in range(1, max_size + 1):
        for t in gen(s, set(alphabet)):
            k = db_key(t)
            if k not in seen:
                seen.add(k); res.append(t)
    return res

def show(t):
    k = t[0]
    if k == 'v': return t[1].split('#')[0]
    if k == 'l': return f"(\\{t[1].split('#')[0]}.{show(t[2])})"
    return f"({show(t[1])} {show(t[2])})"

# =================== run the checks ===================
if __name__ == '__main__':
    selfapp = L('x', A(V('x'), V('x')))      # \x.xx
    Omega   = A(selfapp, selfapp)            # (\x.xx)(\x.xx)
    KIO     = A(L('x', V('y')), Omega)       # (\x.y) Omega   -- erases, x not in body

    print("="*64)
    print("C1/C2  (\\x.y)Omega  -- the canonical WN-but-not-SN separator")
    print("="*64)
    nf, st, ok = normal_order(KIO)
    a = analyze(KIO)
    print(f"  term            : {show(KIO)}")
    print(f"  normal-order    : -> {show(nf)} in {st} step(s)  [reached NF: {ok}]")
    print(f"  WN (some NF?)   : {a['wn']}")
    print(f"  SN (no inf path): {a['sn']}   (beta-cycle present => NOT SN)")
    print(f"  graph nodes     : {a['nodes']}")
    print(f"  => WN and not SN: {a['wn'] is True and a['sn'] is False}")

    print("\n" + "="*64)
    print("C2  Omega alone -- neither WN nor SN (self-loop)")
    print("="*64)
    a2 = analyze(Omega)
    print(f"  WN={a2['wn']}  SN={a2['sn']}  (Omega -> Omega is a 1-cycle)")

    print("\n" + "="*64)
    print("C3  Perpetual strategy walks INTO the erased argument")
    print("="*64)
    seq = perpetual_run(KIO, cap=6)
    for i, s in enumerate(seq):
        print(f"  {i}: {show(s)}")
    print(f"  -> perpetual strategy stays infinite (never reaches NF): "
          f"{leftmost_redex_path(seq[-1]) is not None}")
    print(f"  contrast normal-order: reaches NF '{show(nf)}' in {st} step")

    print("\n" + "="*64)
    print("C4  CONSERVATION, empirically")
    print("="*64)

    # (a) lambda-I exhaustive small-term search. The Conservation Theorem says
    #     lambda-I has NO WN-but-not-SN term, so we should find none.
    terms_I = gen_terms(8, ['y'], True)
    dI = uI = bothI = sepI = 0
    for t in terms_I:
        a = analyze(t, node_cap=2500, size_cap=120)
        if a['sn'] is None or a['wn'] is None: uI += 1; continue
        dI += 1
        if a['wn'] and a['sn']: bothI += 1
        if a['wn'] and not a['sn']: sepI += 1
    print(f"\n  (a) lambda-I EXHAUSTIVE, size<=8: {len(terms_I)} terms"
          f"  decided={dI} unknown={uI}")
    print(f"      WN-and-SN={bothI}   WN-but-NOT-SN={sepI}")
    print(f"      => {'NO separator (consistent with the Conservation Theorem)' if sepI==0 else 'UNEXPECTED separator!!'}")

    # (b) lambda-K: blind small enumeration is BLIND to separators -- the smallest
    #     is (\x.y)Omega at size 12 (erasing lambda 2 + Omega 9 + 1 app). So we
    #     VERIFY a curated family of known separators instead of enumerating.
    K = L('x', L('w', V('x')))                  # \x.\w.x
    I = L('x', V('x'))                          # \x.x
    fam = [
        ("(\\x.y)Omega",         KIO),
        ("(\\x.\\z.z)Omega",     A(L('x', L('z', V('z'))), Omega)),
        ("K I Omega",            A(A(K, I), Omega)),
        ("(\\x.y)(Omega Omega)", A(L('x', V('y')), A(Omega, Omega))),
    ]
    print(f"\n  (b) lambda-K curated separators (smallest possible has size {size(KIO)}):")
    allsep = True
    for nm, t in fam:
        a = analyze(t, node_cap=4000, size_cap=400)
        sep = (a['wn'] is True and a['sn'] is False)
        allsep &= sep
        print(f"      {nm:22} size={size(t):2}  WN={a['wn']} SN={a['sn']}  separator={sep}")
    # Contrast: a *non-erasing* (lambda-I) application of a lambda to Omega can
    # never discard Omega, hence is NOT WN -- so it is no counterexample to Conservation.
    nonerase = A(I, Omega)                       # (\x.x)Omega -- lambda-I, x used
    an = analyze(nonerase)
    print(f"      [contrast] (\\x.x)Omega   size={size(nonerase):2}  WN={an['wn']} SN={an['sn']}  "
          f"(lambda-I, non-erasing => NOT WN, so not a separator)")
    print(f"      => erasure is exactly what manufactures separators: all_sep={allsep}")
