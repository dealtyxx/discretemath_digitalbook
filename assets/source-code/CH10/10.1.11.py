def check_commutative_Z(a, b):
    return a + b == b + a
#验证整数加法群是否是交换群
a, b = 5, 3
is_commutative = check_commutative_Z(a, b)
print(f"整数加法群: a + b = b + a -> {a} + {b} = {b} + {a} -> {is_commutative}")