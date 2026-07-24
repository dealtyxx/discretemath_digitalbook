A = {1, 2, 3}
R = {(1, 2), (2, 3)}
R_ref = R.union({(a, a) for a in A})     #计算自反闭包
R_sym = R.union({(b, a) for a, b in R})    #计算对称闭包
R_trans = R.copy()    #使用简单的迭代方法计算传递闭包
changed = True
while changed:
    changed = False
    new_relations = set()
    for a, b in R_trans:
        for c in A:
            if (b, c) in R_trans and (a, c) not in R_trans:
                new_relations.add((a, c))
                changed = True
    R_trans = R_trans.union(new_relations)
print(R_ref), print(R_sym), print(R_trans)