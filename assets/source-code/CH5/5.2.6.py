from sympy import symbols
from sympy.logic.boolalg import Implies, Not, Or, And
from sympy import simplify
A, B, C = symbols('A B C')
expr1=Implies(Implies(A, B), C)     #公式(A→B)→C和(A∨C)∧(¬B∨C)
expr2=And(Or(A, C), Or(Not(B), C))
#使用sympy的simplify函数检查这两个表达式是否等价
print(simplify(expr1) == simplify(expr2))