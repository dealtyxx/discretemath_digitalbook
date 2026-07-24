def permutation_order(cycles, n):
    from math import lcm
    orders = []
    for cycle in cycles:
        orders.append(len(cycle))    #循环的长度即为它的阶
    return lcm(*orders)
cycles = [(1, 2, 3), (4, 5)]
n = 5    #元素总数
order = permutation_order(cycles, n)
print(f"The order of the permutation is {order}")