from sympy import symbols
from sympy.logic.boolalg import And, Not, Or
from sympy.logic.inference import satisfiable
P, Q, R = symbols('李大人 赵将军 王公公')
knowledge = And(     #根据问题条件构造逻辑表达式
#李大人说：“赵将军是在指鹿为马。”
Or(And(P, Not(Q)), And(Not(P), Q)),
#赵将军说：“王公公是在指鹿为马。”
Or(And(Q, Not(R)), And(Not(Q), R)),
#王公公说：“李大人和赵将军都在指鹿为马。”
Or(And(R, Not(P), Not(Q)), And(Not(R), Or(P, Q))))
#寻找满足所有条件的解
solution = satisfiable(knowledge)
print(solution)