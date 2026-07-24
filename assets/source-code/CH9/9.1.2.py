def add(a,b):
    return a+b
def multiply(a,b):
    return a*b
def commutative_law(op, a, b):
    return op(a, b) == op(b, a)
print(commutative_law(add, 4, 5))    #示例：加法和乘法的交换律
print(commutative_law(multiply, 4, 5))