from sympy import symbols
from sympy.logic.boolalg import Implies, Not, Or, And
from sympy import simplify
A, B, C = symbols('A B C')
expr1 = And(Implies(A, C), Implies(B, C))     #公式(A→C)∧(B→C)和(A∨B)→C
expr2 = Implies(Or(A, B), C)
#使用sympy的simplify函数检查这两个表达式是否等价
print(simplify(expr1) == simplify(expr2))