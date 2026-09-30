S3 = ['e', '(1 2)', '(1 3)', '(2 3)', '(1 2 3)', '(1 3 2)']    #置换群S3的元素
H = ['e', '(1 2)']                              #子群H
def perm(s):                                   #把轮换记号转成映射{1:..,2:..,3:..}
    c = [] if s == 'e' else [int(x) for x in s.strip('()').split()]
    return {x: (c[(c.index(x) + 1) % len(c)] if x in c else x) for x in (1, 2, 3)}
multiplication_table = {a: {b: next(c for c in S3 if perm(c) == {x: perm(a)[perm(b)[x]] for x in (1, 2, 3)})
                            for b in S3} for a in S3}   #置换乘法规则：右边先作用，(ab)(x)=a(b(x))
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