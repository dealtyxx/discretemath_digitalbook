from math import isqrt

def prime_factors(n):
    if type(n) is not int or n < 1:
        raise ValueError("素因数分解只接受正整数")
    factors = []    #用于存储素数因数
    exponent = []    #用于存储相应素数因数的指数
    while n % 2 == 0:    #找到n中的所有2的因数，并计算其指数
        factors.append(2)
        n //= 2
    for i in range(3, isqrt(n) + 1, 2):    #使用整数平方根，避免大整数浮点误差
        while n % i == 0:
            factors.append(i)
            n //= i
    if n > 1:    #若n仍然大于1，那么它本身就是素数因数
        factors.append(n)
    unique_factors = sorted(set(factors))    #确定顺序，保证因数与指数一一对应
    for factor in unique_factors:
        exponent.append(factors.count(factor))
    return unique_factors, exponent
n = 100    #输入一个整数n来分解
factors, exponents = prime_factors(n)
print(f"{n}的素因数分解为：")
for factor, exponent in zip(factors, exponents):
    print(f"{factor}^{exponent}", end=" * ")
print("\b\b")
