def cancellation_law(a, b, c):
    return (a + c != b + c or a == b) and (c == 0 or a * c != b * c or a == b)     #检验a∗c=b∗c⇒a=b（乘法要求c不为0）
print(cancellation_law(5, 5, 1))