from sympy import symbols
from sympy.logic.boolalg import Not, Or, And, Implies
from sympy.logic.inference import satisfiable
A, B, C = symbols('A B C')     #定义逻辑变量
expr = And(Not(Implies(A, Or(A, B))), C)    #构造逻辑表达式
#检查表达式是否为永假式，即表达式的非（Not）是否为永真式
is_contradiction = not satisfiable(expr)
print(is_contradiction)