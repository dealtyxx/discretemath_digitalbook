S3 = ['e', '(1 2)', '(1 3)', '(2 3)', '(1 2 3)', '(1 3 2)']    #置换群S3的元素
H = ['e', '(1 2)']                              #子群H
multiplication_table = {                       #置换乘法规则
    'e': {'e': 'e', '(1 2)': '(1 2)', '(1 3)': '(1 3)', '(2 3)': '(2 3)', '(1 2 3)': '(1 2 3)', '(1 3 2)': '(1 3 2)'},
    '(1 2)': {'e': '(1 2)', '(1 2)': 'e', '(1 3)': '(1 2 3)', '(2 3)': '(1 3 2)', '(1 2 3)': '(1 3)', '(1 3 2)': '(2 3)'},
    '(1 3)': {'e': '(1 3)', '(1 2)': '(2 3)', '(1 3)': 'e', '(2 3)': '(1 3 2)', '(1 2 3)': '(2 3)', '(1 3 2)': '(1 2)'},
    '(2 3)': {'e': '(2 3)', '(1 2)': '(1 3 2)', '(1 3)': '(1 2)', '(2 3)': 'e', '(1 2 3)': '(1 3)', '(1 3 2)': '(1 2 3)'},
    '(1 2 3)': {'e': '(1 2 3)', '(1 2)': '(1 3)', '(1 3)': '(2 3)', '(2 3)': '(1 2)', '(1 2 3)': 'e', '(1 3 2)': '(1 3 2)'},
    '(1 3 2)': {'e': '(1 3 2)', '(1 2)': '(2 3)', '(1 3)': '(1 2 3)', '(2 3)': '(1 3)', '(1 2 3)': '(1 2)', '(1 3 2)': 'e'}
}
def multiply(p1, p2):
    return multiplication_table[p1][p2]
def left_cosets(G, H):                           #计算左陪集
    cosets = []
    for g in G:
        coset = {multiply(g, h) for h in H}
        if coset not in cosets:
            cosets.append(coset)
    return cosets
def right_cosets(G, H):                            #计算右陪集
    cosets = []
    for g in G:
        coset = {multiply(h, g) for h in H}
        if coset not in cosets:
            cosets.append(coset)
    return cosets
left_cosets_result = left_cosets(S3, H)                #输出左陪集和右陪集
right_cosets_result = right_cosets(S3, H)
print("置换群 S3 的左陪集:")
for i, coset in enumerate(left_cosets_result):
    print(f"左陪集 {i}: {sorted(coset)}")
print("\n置换群 S3 的右陪集:")
for i, coset in enumerate(right_cosets_result):
    print(f"右陪集 {i}: {sorted(coset)}")