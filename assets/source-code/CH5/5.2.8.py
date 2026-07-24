from sympy import symbols
from sympy.logic.boolalg import Implies, And, Not
from sympy.logic.inference import satisfiable
A, B = symbols('A B')
expr = Implies(And(Implies(A, B), A), B)     #构建原公式((A→B)∧A)→B
is_tautology = not satisfiable(Not(expr))      #验证是否为永真式
print(is_tautology)