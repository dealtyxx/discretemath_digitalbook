from itertools import product
implies = lambda p, q: (not p) or q
def unary_preds(D):       #枚举D上全部一元谓词的解释
    for values in product([True, False], repeat=len(D)):
        yield dict(zip(D, values))
def binary_preds(D):      #枚举D上全部二元谓词的解释
    pairs = [(x, y) for x in D for y in D]
    for values in product([True, False], repeat=len(pairs)):
        yield dict(zip(pairs, values))
def formula_1(D, P):      #∀xP(x)→∃xP(x)
    return implies(all(P[x] for x in D), any(P[x] for x in D))
def formula_2(D, P):      #∀x∃yP(x,y)→∃x∀yP(x,y)
    return implies(all(any(P[(x, y)] for y in D) for x in D),
                   any(all(P[(x, y)] for y in D) for x in D))
def kind(results):        #根据全部解释下的真值判定公式类型
    if all(results):
        return "在这些解释下均为真（永真式的候选）"
    return "可满足式" if any(results) else "矛盾式"
for n in range(1, 4):     #个体域规模取1~3
    D = list(range(1, n + 1))
    r1 = [formula_1(D, P) for P in unary_preds(D)]
    r2 = [formula_2(D, P) for P in binary_preds(D)]
    print(f"|D|={n}: 公式1 {sum(r1)}/{len(r1)} 为真，{kind(r1)}；公式2 {sum(r2)}/{len(r2)} 为真，{kind(r2)}")
D = [1, 2]
P_eq = {(x, y): x == y for x in D for y in D}      #例6.2.10 反例：P(x,y)解释为x=y
print(formula_2(D, P_eq))
