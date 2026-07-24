def is_identity_element(op, identity, a):
    return op(a, identity) == a and op(identity, a) == a
add = lambda x, y: x + y        #加法单位元
print(is_identity_element(add, 0, 5))
multiply = lambda x, y: x * y    #乘法单位元
print(is_identity_element(multiply, 1, 5))