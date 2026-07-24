from sympy import symbols
from sympy.logic.boolalg import Or, Not, And, Implies
from sympy.logic.inference import satisfiable
P, Q, R, S = symbols('P Q R S')     #定义符号
premise1 = Implies(Not(P), Q)     #前提
premise2 = Implies(P, R)
premise3 = Or(Not(Q), S)
conclusion = Or(S, R)     #结论
#前提与非结论的逻辑组合应该是不可满足的，否则结论就不是必然的
unsatisfiable_combination =And(premise1, premise2, premise3, Not(conclusion))
print(satisfiable(unsatisfiable_combination))     #判断该组合是否不可满足