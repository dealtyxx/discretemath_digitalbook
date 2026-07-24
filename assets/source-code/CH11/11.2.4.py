import math
#检查整数集在整除关系下是否构成格
def check_lattice_divisibility(S):
    for a in S:
        for b in S:
            lcm = abs(a*b) // math.gcd(a, b)    #最小公倍数
            gcd = math.gcd(a, b)             #最大公约数
            if lcm not in S or gcd not in S:
                return False
    return True
S = {1, 2, 3, 6}
is_lattice_divisibility = check_lattice_divisibility(S)
print(f"{{1, 2, 3, 6}} forms a lattice under divisibility: {is_lattice_divisibility}")