def prime_factors(n):
    factors = []    #用于存储素数因数
    exponent = []    #用于存储相应素数因数的指数
    while n % 2 == 0:    #找到n中的所有2的因数，并计算其指数
        factors.append(2)
        n //= 2
    for i in range(3, int(n**0.5) + 1, 2):    #从3开始，逐渐找到更大的素数因数
        while n % i == 0:
            factors.append(i)
            n //= i
    if n > 1:    #若n仍然大于1，那么它本身就是素数因数
        factors.append(n)
    for factor in set(factors):     #计算每个素数因数的指数
        exponent.append(factors.count(factor))
    return list(set(factors)), exponent
n = 100    #输入一个整数n来分解
factors, exponents = prime_factors(n)
print(f"{n}的素因数分解为：")
for factor, exponent in zip(factors, exponents):
    print(f"{factor}^{exponent}", end=" * ")
print("\b\b")