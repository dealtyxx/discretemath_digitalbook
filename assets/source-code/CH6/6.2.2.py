#用元组表示谓词公式：("pred",名,变元...)、("not",A)、("and"/"or"/"implies",A,B)、("forall"/"exists",变元,A)
def free_vars(f, bound=frozenset()):      #求公式中自由出现的个体变元
    op = f[0]
    if op == "pred":
        return {v for v in f[2:] if v not in bound}
    if op == "not":
        return free_vars(f[1], bound)
    if op in ("and", "or", "implies"):
        return free_vars(f[1], bound) | free_vars(f[2], bound)
    return free_vars(f[2], bound | {f[1]})     #量词把变元加入约束集合，f[2]是它的辖域
SYM = {"and": "∧", "or": "∨", "implies": "→", "forall": "∀", "exists": "∃"}
def show(f):                                    #把元组公式还原为书写形式
    op = f[0]
    if op == "pred":
        return f"{f[1]}({','.join(f[2:])})"
    if op == "not":
        return "¬" + show(f[1])
    if op in ("and", "or", "implies"):
        return "(" + show(f[1]) + SYM[op] + show(f[2]) + ")"
    return SYM[op] + f[1] + show(f[2])
formulas = [
    ("forall", "x", ("implies", ("pred", "P", "x"), ("pred", "Q", "x"))),        #例6.2.3 ∀x(P(x)→Q(x))
    ("forall", "x", ("implies", ("pred", "P", "x"), ("pred", "Q", "x", "y"))),   #例6.2.3 ∀x(P(x)→Q(x,y))
    ("and", ("forall", "x", ("pred", "P", "x")), ("pred", "R", "x")),           #x既约束出现又自由出现
]
for f in formulas:
    fv = free_vars(f)
    print(show(f), "自由变元:", fv or "无", "闭式" if not fv else "非闭式")
