from sympy import symbols, Poly
x = symbols('x')
f = Poly(2*x**2 + 3*x + 1)    #定义多项式
g = Poly(x**2 + 2)
h_add = f + g               #多项式加法
h_mul = f * g               #多项式乘法
print("整数环上的多项式环")
print(f"f(x) = {f.as_expr()}")
print(f"g(x) = {g.as_expr()}")
print(f"f(x) + g(x) = {h_add.as_expr()}")
print(f"f(x) * g(x) = {h_mul.as_expr()}")