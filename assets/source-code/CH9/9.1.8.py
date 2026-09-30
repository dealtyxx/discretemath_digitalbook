def is_zero_element(op, zero, a):
    return op(a, zero) == zero and op(zero, a) == zero     #两侧都要满足
multiply = lambda x, y: x * y           #乘法零元
print(is_zero_element(multiply, 0, 5))    #乘法零元