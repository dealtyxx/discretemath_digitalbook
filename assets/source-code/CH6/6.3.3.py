from itertools import product
implies = lambda p, q: (not p) or q
def check(name, names, premises, conclusion, max_size=3):
    #在规模1~max_size的个体域上枚举全部解释，寻找前提都真而结论为假的反例
    for n in range(1, max_size + 1):
        D = range(n)
        for values in product(product([True, False], repeat=n), repeat=len(names)):
            I = dict(zip(names, values))            #I["F"][x]即F(x)的真值
            if all(p(D, I) for p in premises) and not conclusion(D, I):
                print(f"{name}：无效推理，反例 |D|={n}", {k: list(v) for k, v in I.items()})
                return
    print(f"{name}：在规模不超过{max_size}的个体域上未找到反例")   #有限检验不能代替证明，一阶逻辑不可判定
#例6.3.1 ∀x(M(x)→H(x)), ∃xM(x) ⇒ ∃xH(x)
check("例6.3.1", ["M", "H"],
      [lambda D, I: all(implies(I["M"][x], I["H"][x]) for x in D),
       lambda D, I: any(I["M"][x] for x in D)],
      lambda D, I: any(I["H"][x] for x in D))
#例6.3.5 ∀x(F(x)→(A(x)∧B(x))), ∃x(F(x)∧Y(x)) ⇒ ∃x(F(x)∧Y(x)∧A(x)∧B(x))
check("例6.3.5", ["F", "Y", "A", "B"],
      [lambda D, I: all(implies(I["F"][x], I["A"][x] and I["B"][x]) for x in D),
       lambda D, I: any(I["F"][x] and I["Y"][x] for x in D)],
      lambda D, I: any(I["F"][x] and I["Y"][x] and I["A"][x] and I["B"][x] for x in D))
#错误推理：∃xP(x), ∃xQ(x) ⇒ ∃x(P(x)∧Q(x))，ES两次引入了同一个常元c
check("错误推理", ["P", "Q"],
      [lambda D, I: any(I["P"][x] for x in D), lambda D, I: any(I["Q"][x] for x in D)],
      lambda D, I: any(I["P"][x] and I["Q"][x] for x in D))
