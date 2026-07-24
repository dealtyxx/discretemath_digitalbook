def is_subgroup_h2():
    H = {0, 5, 10}
    Z15 = 15
    closure = all(((x + y) % Z15) in H for x in H for y in H)    #检查封闭性
    identity = 0 in H    #检查单位元
    inverse = all(((Z15 - x) % Z15) in H for x in H)           #检查逆元
    return closure and identity and inverse
print(is_subgroup_h2())