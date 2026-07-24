from sympy import symbols, Or, And, Not, Implies, satisfiable
L, Y, G = symbols('L Y G')         #定义符号
condition1 = Implies(L, G)         #L→G
condition2 = Implies(Y, Not(G))    #Y→¬G
condition3 = Implies(Not(G), Or(L, Y))       #¬G→(L∨Y)
combined_condition = And(condition1, condition2, condition3)   #组合条件
solution = satisfiable(combined_condition, all_models=True)    #求解
print("满足条件的选派方案有以下几种:")
for s in solution:
    print(s)