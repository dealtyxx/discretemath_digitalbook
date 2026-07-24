G = set(range(20))               #使用有限的整数集合来表示G(有限集合示例)
H = {4 * k for k in range(-5, 6)}    #H是所有4的倍数的集合
def left_cosets(G, H):             #计算左陪集
    cosets = []
    for a in G:
        coset = {a + h for h in H}
        if coset not in cosets:
            cosets.append(coset)
    return cosets
def right_cosets(G, H):    #计算右陪集
    return left_cosets(G, H)
left_cosets_result = left_cosets(G, H)     #输出左陪集和右陪集
right_cosets_result = right_cosets(G, H)
print("整数加法群的左陪集和右陪集:")
for i, coset in enumerate(left_cosets_result):
    print(f"左陪集 {i}: {sorted(coset)}")
for i, coset in enumerate(right_cosets_result):
    print(f"右陪集 {i}: {sorted(coset)}")