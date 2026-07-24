from sympy.combinatorics import Permutation
cycle = Permutation([1, 2, 3, 0])
transpositions_cycle = [(1, 2), (1, 3), (1, 4)]
print("轮换 (1, 2, 3, 4) 可以表示为对换的乘积:", transpositions_cycle)
sigma_1 = Permutation([1, 0, 3, 2])
transpositions_sigma_1 = [(1, 2), (3, 4)]
print("置换 σ 可以表示为对换的乘积:", transpositions_sigma_1)
sigma_2 = Permutation([1, 2, 0, 4, 3])
disjoint_cycles = sigma_2.cyclic_form
print("置换 σ 可以表示为不相交轮换的乘积:", disjoint_cycles)