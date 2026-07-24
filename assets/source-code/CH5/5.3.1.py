from sympy import symbols
from sympy.logic.boolalg import Implies, Not, And
from sympy.logic.inference import satisfiable
P, Q, R, S = symbols('P Q R S')     #定义符号
premises = [P, Implies(P, Not(Q)), Implies(Not(Q), R), Implies(R, S)]    #定义前提
print(not satisfiable(And(*premises, Not(S))))    #验证S是否是一个有效的结论