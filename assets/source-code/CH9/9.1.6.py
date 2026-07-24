def idempotent_law(op, a):
    return op(a, a) == a
and_op = lambda x, y: x and y       #示例：逻辑与和逻辑或的幂等律
or_op = lambda x, y: x or y
print(idempotent_law(and_op, True))
print(idempotent_law(or_op, False))