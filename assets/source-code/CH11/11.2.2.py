import math
S = {1, 2, 3, 6}         #定义集合
def lcm(x, y):          #计算lcm
    return abs(x * y) // math.gcd(x, y)
def check_lattice(S):    #检查是否为格
    for a in S:
        for b in S:
            gcd_ab = math.gcd(a, b)
            lcm_ab = lcm(a, b)
            if gcd_ab not in S or lcm_ab not in S:
                print(f"Failed for: GCD={gcd_ab}, LCM={lcm_ab}")
                return False
    return True
is_lattice = check_lattice(S)
print(f"S forms a lattice: {is_lattice}")