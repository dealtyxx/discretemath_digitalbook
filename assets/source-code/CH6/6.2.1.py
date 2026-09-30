D_I = [3, 6]          #个体域DI
def f_prime(x):       #特定函数f(x)
    return 6 if x == 3 else 3
def P_prime(x):       #特定谓词P(x),Q(x,y),R(x,y)
    return x == 6
def Q_prime(x, y):
    return True       #Q(x,y)恒为1
def R_prime(x, y):
    return (x == y)
#计算公式的真值
def formula_1():        #公式∀x(P(x)∧Q(x,a))
    a_prime = 3       #特定元素a
    for x in D_I:
        if not (P_prime(x) and Q_prime(x, a_prime)):
            return False
    return True
def formula_2():       #公式∃x(P(f(x))∧Q(x,f(x)))
    for x in D_I:
        if P_prime(f_prime(x)) and Q_prime(x, f_prime(x)):
            return True
    return False
def formula_3():       #公式∀x∃yR(x,y)
    for x in D_I:
        if not any(R_prime(x, y) for y in D_I):
            return False
    return True
print(formula_1())
print(formula_2())
print(formula_3())