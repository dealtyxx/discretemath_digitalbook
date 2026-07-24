def is_zero_element(op, zero, a):
    return op(a, zero) == zero
multiply = lambda x, y: x * y           #乘法单位元
print(is_zero_element(multiply, 0, 5))    #乘法零元