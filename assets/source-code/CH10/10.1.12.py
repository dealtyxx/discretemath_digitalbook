def check_commutative_Zn(a, b, n):
    return (a + b) % n == (b + a) % n
a, b, n = 5, 3, 7    #验证模n整数加法群是否是交换群
is_commutative = check_commutative_Zn(a, b, n)
print(f"模 {n} 整数加法群: (a + b) % n = (b + a) % n -> ({a} + {b}) % {n} = ({b} + {a}) % {n} -> {is_commutative}")