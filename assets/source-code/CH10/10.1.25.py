def invert_permutation(permutation):
    inverse = []
    for cycle in permutation:
        inverse.append(tuple(reversed(cycle)))
    return inverse
sigma = [(1, 2, 3, 4)]                       #定义轮换
inverse_sigma = invert_permutation(sigma)    #求轮换的逆
print(inverse_sigma)