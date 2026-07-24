from sympy import symbols
from sympy.logic.boolalg import Or, And, Not, Implies
from sympy.logic.boolalg import to_dnf
from sympy.logic.boolalg import to_cnf
P, Q, R, S= symbols('P Q R S')    #命题变量
formula1 = Implies(And(P, Implies(Q, R)), S)    #命题公式(P∧(Q→R))→S
formula2 = Implies(And(P, Or(Q, R)), R)        #命题公式(P∧(Q∨R))→R
dnf1 = to_dnf(formula1)      #转换为析取范式
dnf2 = to_dnf(formula2)
cnf1 = to_cnf(formula1)      #转换为合取范式
cnf2 = to_cnf(formula2)
print("原命题公式1: ", formula1, "\n析取范式: ", dnf1, "\n合取范式: ", cnf1)
print("原命题公式2: ", formula2, "\n析取范式: ", dnf2, "\n合取范式: ", cnf2)