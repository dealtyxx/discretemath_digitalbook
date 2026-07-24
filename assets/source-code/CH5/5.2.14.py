from sympy import symbols, And, Or, Not
P, Q, R = symbols('P Q R')
def get_minterms_maxterms_two_vars(P, Q):    #P和Q构成的所有极小项和极大项
    minterms = [And(P, Q), And(P, Not(Q)), And(Not(P), Q), And(Not(P), Not(Q))]
    maxterms = [Or(P, Q), Or(P, Not(Q)), Or(Not(P), Q), Or(Not(P), Not(Q))]
    return minterms, maxterms
def get_minterms_maxterms_three_vars(P, Q, R):    #P, Q和R构成的所有极小项和极大项
    minterms = [
        And(P, Q, R), And(P, Q, Not(R)), And(P, Not(Q), R), And(P, Not(Q), Not(R)),
        And(Not(P), Q, R), And(Not(P), Q, Not(R)), And(Not(P), Not(Q), R), And(Not(P), Not(Q), Not(R))]
    maxterms = [
        Or(P, Q, R), Or(P, Q, Not(R)), Or(P, Not(Q), R), Or(P, Not(Q), Not(R)),
        Or(Not(P), Q, R), Or(Not(P), Q, Not(R)), Or(Not(P), Not(Q), R), Or(Not(P), Not(Q), Not(R))]
    return minterms, maxterms
#获取命题变元的极小项和极大项
minterms_2_vars, maxterms_2_vars = get_minterms_maxterms_two_vars(P, Q)
print("两个命题变元P和Q构成的所有极小项:")
for minterm in minterms_2_vars:
    print(minterm)
print("两个命题变元P和Q构成的所有极大项:")
for maxterm in maxterms_2_vars:
    print(maxterm)
#获取命题变元的极小项和极大项
minterms_3_vars, maxterms_3_vars = get_minterms_maxterms_three_vars(P, Q, R)
print("三个命题变元P、Q和R构成的所有极小项:")
for minterm in minterms_3_vars:
    print(minterm)
print("三个命题变元P、Q和R构成的所有极大项:")
for maxterm in maxterms_3_vars:
    print(maxterm)