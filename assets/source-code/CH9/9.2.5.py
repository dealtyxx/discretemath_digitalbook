def h(z):
    return z.conjugate()
def verify_linear_h(z1, z2, c):              #验证线性映射
    additivity = h(z1 + z2) == h(z1) + h(z2)
    homogeneity = h(c * z1) == c * h(z1)
    return additivity, homogeneity
z1, z2, c = complex(1, 2), complex(3, 4), 2
print("\nh(z) = z_conjugate:")
additivity, homogeneity = verify_linear_h(z1, z2, c)
print(f"加法封闭性: {additivity}")
print(f"标量乘法封闭性: {homogeneity}")
def verify_bijective_h():                   #验证双射
    injectivity = all(h(z1) != h(z2) for z1 in [complex(1, 2), complex(3, 4)] for z2 in [complex(5, 6), complex(7, 8)] if z1 != z2)    #验证单射性
    surjectivity = all(any(h(z) == w for z in [complex(1, 2), complex(3, 4)]) for w in [complex(1, -2), complex(3, -4)])          #验证满射性
    return injectivity, surjectivity
injectivity, surjectivity = verify_bijective_h()
print(f"单射性: {injectivity}")
print(f"满射性: {surjectivity}")