def is_cyclic_z_n(n):
    return any(len({(k * g) % n for k in range(n)}) == n for g in range(n))    #存在g使{kg mod n}取遍Zn
#验证模n整数加法群Zn是否为循环群
n_values = [2, 3, 4, 5, 6]    #检查不同的n值
results = {n: is_cyclic_z_n(n) for n in n_values}
print(results)