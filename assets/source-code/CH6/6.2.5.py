from itertools import product
implies = lambda p, q: (not p) or q
def preds(D):        #枚举D上全部一元谓词的解释
    return [dict(zip(D, v)) for v in product([True, False], repeat=len(D))]
def check(name, left, right):     #在个体域规模1~3的全部解释下比较两个公式的真值
    for n in range(1, 4):
        D = list(range(n))
        for P, Q, R in product(preds(D), repeat=3):
            for x in D:           #自由变元x也要取遍个体域
                if left(D, P, Q, R, x) != right(D, P, Q, R, x):
                    print(name, "不等价")
                    return
    print(name, "在全部解释下等价")
#例6.2.16 (P(x)→∀yQ(y))∧∃zR(z) ⇔ ∀y∃z((¬P(x)∨Q(y))∧R(z))
check("例6.2.16",
      lambda D, P, Q, R, x: implies(P[x], all(Q[y] for y in D)) and any(R[z] for z in D),
      lambda D, P, Q, R, x: all(any((not P[x] or Q[y]) and R[z] for z in D) for y in D))
#例6.2.18 ∀xP(x)∨∃yQ(y)→∀xR(x) ⇔ ∃x∀y∀z(P(x)∨Q(y)→R(z))
check("例6.2.18",
      lambda D, P, Q, R, x: implies(all(P[u] for u in D) or any(Q[y] for y in D), all(R[u] for u in D)),
      lambda D, P, Q, R, x: any(all(all(implies(P[u] or Q[y], R[z]) for z in D) for y in D) for u in D))
#错误的前移：把¬∀xP(x)直接写成∀x¬P(x)
check("错误前移",
      lambda D, P, Q, R, x: not all(P[u] for u in D),
      lambda D, P, Q, R, x: all(not P[u] for u in D))
