import math
def permutation_order(permutation):     #阶为各不相交轮换长度的最小公倍数
    return math.lcm(*(len(cycle) for cycle in permutation))
rho = [(1, 2, 3, 4, 5)]                 #轮换
order_rho = permutation_order(rho)    #求轮换的阶
print(order_rho)