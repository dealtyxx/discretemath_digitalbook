def is_inverse_element(add_op, mul_op, add_identity, mul_identity, a):
    add_inverse = -a            #加法逆元
    if a != 0:                  #除零检查
        mul_inverse = 1 / a     #乘法逆元
    else:
        mul_inverse = None    #0没有乘法逆元
    return (add_op(a, add_inverse) == add_identity,
            mul_inverse is not None and mul_op(a, mul_inverse) == mul_identity)
add = lambda x, y: x + y         #加法单位元
multiply = lambda x, y: x * y     #乘法单位元
def commutative_law(op, a, b):
    return op(a, b) == op(b, a)
#验证加法和乘法逆元
print(is_inverse_element(add, multiply, 0, 1, 5))
print(is_inverse_element(add, multiply, 0, 1, 0))