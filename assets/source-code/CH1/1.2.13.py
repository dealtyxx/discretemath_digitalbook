a = 2
n = 9
def euler_phi(n):    #计算φ(9)
    result = n
    p = 2
    while p * p <= n:
        if n % p == 0:
            while n % p == 0:
                n //= p
            result -= result // p
        p += 1
    if n > 1:
        result -= result // n
    return result
phi_n = euler_phi(n)
print(phi_n)
result = pow(a, phi_n, n)    #检查26=1 mod 9
if result == 1:
    print(f"{a}^{phi_n} = 1 (mod {n})")
else:
    print(f"{a}^{phi_n} = {result} (mod {n})")