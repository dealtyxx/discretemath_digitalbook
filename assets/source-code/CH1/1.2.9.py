def extended_gcd(a, b):
    if b == 0:
        return (a, 1, 0)
    else:
        gcd, x, y = extended_gcd(b, a % b)
        return (gcd, y, x - (a // b) * y)
a = 48
b = 18
gcd, x, y = extended_gcd(a, b)
print(f"{a} 和 {b} 的最大公因数是 {gcd}")
print(f"满足条件的整数 x 和 y 分别为：x = {x}, y = {y}")