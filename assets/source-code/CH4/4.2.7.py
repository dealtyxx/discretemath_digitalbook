import math
def f1(x):
    return 2 * x + 1
def g1(x):
    return x ** 2
def f2(x):
    return math.exp(x)
def g2(x):
    return math.log(x)
def f3(x):
    return 2 * x
def g3(x):
    return x ** 2
def h3(x):
    return math.sin(x)
def f4(x):
    return x ** 3
def g4(x):
    return math.cos(x)
def h4(x):
    return 1 / x
def composite_function(f, g):    #复合函数计算
    return lambda x: g(f(x))
gf1 = composite_function(f1, g1)    #计算复合函数
gf2 = composite_function(f2, g2)
hgf3 = composite_function(f3, composite_function(g3, h3))
hgf4 = composite_function(f4, composite_function(g4, h4))
x_values = [0, 1, 2]
print("gf1(x) = g(f1(x)) = (2x + 1)^2 = 4x^2 + 4x + 1")
for x in x_values:
    print(f"gf1({x}) = {gf1(x)}")
print("\ngf2(x) = g(f2(x)) = ln(e^x) = x")
for x in x_values:
    print(f"gf2({x}) = {gf2(x)}")
print("\nhgf3(x) = h(g(f3(x))) = sin((2x)^2) = sin(4x^2)")
for x in x_values:
    print(f"hgf3({x}) = {hgf3(x)}")
print("\nhgf4(x) = h(g(f4(x))) = 1/cos(x^3)")
for x in x_values:
    print(f"hgf4({x}) = {hgf4(x)}")