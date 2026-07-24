def sieve_of_eratosthenes(N):
    is_prime = [True] * (N + 1)    #创建一个布尔数组，用于标记是否为素数
    is_prime[0] = is_prime[1] = False    #0和1不是素数
    for p in range(2, int(N**0.5) + 1):    #从2开始，遍历到sqrt(N)
        if is_prime[p]:
            for i in range(p * p, N + 1, p):    #将p的倍数标记为非素数
                is_prime[i] = False
    primes = [p for p in range(2, N + 1) if is_prime[p]]    #收集所有素数
    return primes
N = 300    #找出小于或等于N的所有素数
prime_numbers = sieve_of_eratosthenes(N)
print(f"小于或等于{N}的所有素数：")
print(prime_numbers)