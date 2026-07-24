from sympy import symbols
from sympy.logic.boolalg import Or, Not, Implies, And
from sympy.logic.inference import satisfiable
P, Q, R, S = symbols('P Q R S')         #逻辑变量
premise1 = Implies(P, Implies(Q, S))    #前提P→(Q→S)
premise2 = Or(Not(R), P)             #前提¬R∨P
premise3 = Q                       #前提Q
premise_R = R                      #前提R（附加前提）
conclusion = Implies(R, S)             #结论R→S
#定义所有前提都成立，但结论不成立的情况
contradiction = And(And(premise1, premise2, premise3, premise_R), Not(conclusion))
result = satisfiable(contradiction)
print("结论R→S是", "有效的" if result is False else "无效的")