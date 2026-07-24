def associative_law(op, a, b, c):
    return op(a, op(b, c)) == op(op(a, b), c)
add = lambda x, y: x + y           #示例：加法和乘法的结合律
multiply = lambda x, y: x * y
print(associative_law(add, 1, 2, 3))
print(associative_law(multiply, 1, 2, 3))