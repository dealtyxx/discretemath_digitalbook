from sympy import symbols, Not, Or, And, Implies
A, B = symbols('A B')
P1 = Not(A)     #计算¬A→¬B⇔¬¬A∨¬B
Q1 = Not(B)
logical_equiv1 = Implies(P1, Q1).simplify()
print("逻辑等值式 ¬A→¬B ⇔ ¬¬A∨¬B:", logical_equiv1)
P2 = Or(A, B)     #计算(A∨B)→(A∧B)⇔¬(A∨B)∨(A∧B)
Q2 = And(A, B)
logical_equiv2 = Implies(P2, Q2).simplify()
print("逻辑等值式 (A∨B)→(A∧B) ⇔ ¬(A∨B)∨(A∧B):", logical_equiv2)