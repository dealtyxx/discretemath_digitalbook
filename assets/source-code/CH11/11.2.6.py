import math
#检查自然数集在整除关系下是否构成格
def check_lattice_divisibility_natural(S):
    for a in S:
        for b in S:
            lcm = abs(a*b) // math.gcd(a, b)     #最小公倍数
            gcd = math.gcd(a, b)              #最大公约数
            if lcm not in S or gcd not in S:
                return False
    return True
S = {1, 2, 4, 8}
is_lattice_div_nat = check_lattice_divisibility_natural(S)
print(f"{{1, 2, 4, 8}} forms a lattice under divisibility: {is_lattice_div_nat}")