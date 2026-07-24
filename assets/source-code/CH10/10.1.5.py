def is_subgroup_h1():
    H = {0, 3, 6, 9}
    Z12 = 12
    closure = all(((x + y) % Z12) in H for x in H for y in H)    #检查封闭性
    identity = 0 in H                                   #检查单位元
    inverse = all(((Z12 - x) % Z12) in H for x in H)          #检查可逆元
    return closure and identity and inverse
print(is_subgroup_h1())