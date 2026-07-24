def boolean_expression(P, Q, R, S):
    Y = P and Q and (R or S)       #计算布尔表达式Y=P and Q and (R or S)
    return Y
#测试真值表中的所有可能组合
inputs = [
    (0, 0, 0, 0),
    (0, 0, 0, 1),
    (0, 0, 1, 0),
    (0, 0, 1, 1),
    (0, 1, 0, 0),
    (0, 1, 0, 1),
    (0, 1, 1, 0),
    (0, 1, 1, 1),
    (1, 0, 0, 0),
    (1, 0, 0, 1),
    (1, 0, 1, 0),
    (1, 0, 1, 1),
    (1, 1, 0, 0),
    (1, 1, 0, 1),
    (1, 1, 1, 0),
    (1, 1, 1, 1)
]
#输出真值表
print(f"{'P':<2} {'Q':<2} {'R':<2} {'S':<2} {'Y':<2}")
for P, Q, R, S in inputs:
    Y = boolean_expression(P, Q, R, S)
    print(f"{P:<2} {Q:<2} {R:<2} {S:<2} {Y:<2}")