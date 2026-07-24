from sympy import symbols
from sympy.logic.boolalg import And, Implies
from sympy.logic.inference import satisfiable
P, F, A, E, H, S = symbols('P F A E H S')       #定义元素
premise_1 = Implies(And(P, F), A)           #定义前提
premise_2 = Implies(And(A, E, F), H)
premise_3 = Implies(And(H, F), S)
premises = And(premise_1, premise_2, premise_3, P, E, F)
conclusion = And(A, H, S)                  #定义结论
all_statements = And(premises, conclusion)    #定义全部语句
result = satisfiable(all_statements)
if result:
    print("在给定的前提下，可以成功完成'两弹一星'的项目。")
else:
    print("在给定的前提下，无法成功完成'两弹一星'的项目。")