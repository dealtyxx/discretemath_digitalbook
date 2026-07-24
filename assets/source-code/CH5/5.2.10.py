from sympy import symbols
from sympy.logic.boolalg import Not, Or, And, Implies
A, B = symbols('A B')    #定义逻辑变量
expr = And(A, Implies(And(Or(A, B), Not(A)), B))     #构造逻辑表达式
print(expr.subs({A: True, B: False}))
print(expr.subs({A: False, B: False}))
print(expr.subs({A: False, B: True}))
print(expr.subs({A: True, B: True}))