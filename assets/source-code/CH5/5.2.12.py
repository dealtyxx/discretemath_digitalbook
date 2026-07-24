from sympy import symbols, Not, Implies, And, Or, simplify
def dual_theorem(A, A_dual):
    P = symbols('P1 P2 P3')
    A_expr = eval(A)
    A_dual_expr = eval(A_dual)
    not_A_expr = Not(A_expr)     #构建¬A(P1, P2, ..., Pn)和A*(¬P1, ¬P2, ..., ¬Pn)
    not_A_dual_expr = A_dual_expr.subs({P[i]: Not(P[i]) for i in range(len(P))})
    return not_A_dual_expr.equals(not_A_expr)     #判断是否相等
A = '(P[0] & P[1]) | (~P[2])'
A_dual = '(P[0] | P[1]) & (~P[2])'
result = dual_theorem(A, A_dual)
print(f"对偶定理验证结果：{result}")