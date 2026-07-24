def chinese_remainder_theorem(equations):
    N = 1    #计算N为所有模数的乘积
    for q, ni in equations:
        N *= ni
    x = 0    #计算每个方程的部分乘积和逆元
    for ai, ni in equations:
        Ni = N // ni
        Mi = pow(Ni, -1, ni)    #计算Ni模ni的逆元Mi
        x += ai * Ni * Mi    #累加解
    return x % N    #返回最小非负解
equations = [(2, 3), (3, 5)]    #x=2 mod 3和x=3 mod 5的方程组
solution = chinese_remainder_theorem(equations)
print(solution)