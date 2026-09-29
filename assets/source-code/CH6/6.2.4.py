from itertools import product
D = [1, 2, 3]       #个体域，在有限个体域上验证（不是证明）
#枚举D上所有一元谓词：每个谓词对应D到{True,False}的一个函数
predicates = [dict(zip(D, values)) for values in product([True, False], repeat=len(D))]
A = lambda P: all(P[x] for x in D)       #∀xP(x)
E = lambda P: any(P[x] for x in D)       #∃xP(x)
laws = {
    "¬∀xP(x) ⇔ ∃x¬P(x)": lambda P, Q: (not A(P)) == any(not P[x] for x in D),
    "¬∃xP(x) ⇔ ∀x¬P(x)": lambda P, Q: (not E(P)) == all(not P[x] for x in D),
    "∀x(P(x)∧Q(x)) ⇔ ∀xP(x)∧∀xQ(x)": lambda P, Q: all(P[x] and Q[x] for x in D) == (A(P) and A(Q)),
    "∃x(P(x)∨Q(x)) ⇔ ∃xP(x)∨∃xQ(x)": lambda P, Q: any(P[x] or Q[x] for x in D) == (E(P) or E(Q)),
    #下面两条只有单向蕴含（例6.2.12），等价不成立，程序会找到反例
    "∀x(P(x)∨Q(x)) ⇔ ∀xP(x)∨∀xQ(x)": lambda P, Q: all(P[x] or Q[x] for x in D) == (A(P) or A(Q)),
    "∃x(P(x)∧Q(x)) ⇔ ∃xP(x)∧∃xQ(x)": lambda P, Q: any(P[x] and Q[x] for x in D) == (E(P) and E(Q)),
}
for name, law in laws.items():
    counter = [(P, Q) for P in predicates for Q in predicates if not law(P, Q)]     #收集反例
    if counter:
        P, Q = counter[0]
        print(f"{name}  不成立，反例 P={P} Q={Q}")
    else:
        print(f"{name}  在全部 {len(predicates) ** 2} 种解释下成立")
