def find_factors(n):
    factors = []
    for i in range(1, n + 1):
        if n % i == 0:
            factors.append(i)
    return factors
#群的阶
order_G = 20
subgroup_orders = find_factors(order_G)      #找出所有可能的子群的阶
print(f"阶为{order_G}的群的所有可能子群的阶: {subgroup_orders}")