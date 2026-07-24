def is_prime(n):
    if n <= 1:
        return False    #1和负数不是素数
    if n == 2:
        return True    #2是素数
    if n % 2 == 0:
        return False    #偶数除了2之外都不是素数
    for m in range(3, int(n ** 0.5) + 1, 2):
        if n % m == 0:    #从3开始，只检查奇数，因为偶数已经在上面排除了
            return False    #若n能被m整除，那么n不是素数
    return True    #若没有找到能整除n的m，那么n是素数
n = 17011
if is_prime(n):
    print(f"{n} 是素数")
else:
    print(f"{n} 不是素数")