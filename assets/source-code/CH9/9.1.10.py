def cancellation_law(a, b, c):
    return (a + c == b + c) or (a * c == b * c)     #假设c不为0
print(cancellation_law(5, 5, 1))