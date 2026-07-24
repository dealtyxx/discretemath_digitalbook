from math import gcd
def check_commutative_Zn_star(a, b, n):
    if gcd(a, n) != 1 or gcd(b, n) != 1:
        return False
    return (a * b) % n == (b * a) % n
a, b, n = 3, 5, 7           #验证模n整数乘法群是否是交换群
is_commutative = check_commutative_Zn_star(a, b, n)
print(f"模 {n} 整数乘法群: (a * b) % n = (b * a) % n -> ({a} * {b}) % {n} = ({b} * {a}) % {n} -> {is_commutative}")