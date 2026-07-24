from sympy import symbols
from sympy.logic.boolalg import Or, Not, And, Implies
from sympy.logic.inference import satisfiable
P, Q, R = symbols('P Q R')        #定义变量
premise1 = Or(P, Q)             #定义前提P∨Q
premise2 = Implies(P, R)         #定义前提P→R
premise3 = Implies(Q, R)         #定义前提Q→R
negated_conclusion = Not(R)      #定义前提¬R
#将前提和否定结论组合
combined = And(premise1, premise2, premise3, negated_conclusion)
#使用satisfiable函数来检查能否找到一个满足所有前提和否定结论的赋值
satisfiable_result = satisfiable(combined)
if satisfiable_result is False:
    print("结论R是有效的")
else:
    print("结论R是无效的")