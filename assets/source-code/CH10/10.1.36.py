from sympy.combinatorics import Permutation, PermutationGroup
e = Permutation([0, 1, 2])             #定义对称群S3和子群A3
p12 = Permutation([1, 0, 2])
p13 = Permutation([2, 1, 0])
p23 = Permutation([0, 2, 1])
p123 = Permutation([1, 2, 0])
p132 = Permutation([2, 0, 1])
S3 = PermutationGroup([e, p12, p13, p23, p123, p132])
A3 = PermutationGroup([e, p123, p132])
left_cosets = []                      #计算S3/A3的左陪集
representatives = []
for g in S3.generate():
    if not any(g in coset for coset in left_cosets):
        coset = {g * h for h in A3.generate()}
        left_cosets.append(coset)
        representatives.append(g)
print("商群 S3/A3 的左陪集表示为:")
for idx, coset in enumerate(left_cosets):
    print(f"左陪集 {idx + 1}: {coset}")
    print(f"代表元: {representatives[idx]}")