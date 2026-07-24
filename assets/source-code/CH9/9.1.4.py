import numpy as np
B = {0, 1}
mul_table = np.array([    #定义⊙运算表
    [0, 0],
    [0, 1]])
add_table = np.array([     #定义○运算表
    [0, 1],
    [1, 0]])
def mul(a, b):
    return mul_table[a][b]
def add(a, b):
    return add_table[a][b]
def is_distributive_over(mul, add, B):    #验证⊙对于○的可分配性
    for a in B:
        for b in B:
            for c in B:
                if mul(a, add(b, c)) != add(mul(a, b), mul(a, c)):
                    return False
    return True
def is_distributive_over_inverse(add, mul, B):    #验证○对于⊙的可分配性
    for a in B:
        for b in B:
            for c in B:
                if add(a, mul(b, c)) != mul(add(a, b), add(a, c)):
                    return False
    return True
print("⊙对于○是否可分配:", is_distributive_over(mul, add, B))
print("○对于⊙是否可分配:", is_distributive_over_inverse(add, mul, B))