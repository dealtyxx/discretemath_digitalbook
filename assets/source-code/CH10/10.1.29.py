from sympy.combinatorics import Permutation
sigma = Permutation([1, 2, 0, 4, 5, 3, 7, 8, 6, 9])    #定义置换σ
cycles_sigma = sigma.cyclic_form               #获取σ的不相交轮换形式
type_sigma = [len(cycle) for cycle in cycles_sigma]
print(f"置换 σ: {sigma}")
print(f"σ 的不相交轮换形式: {cycles_sigma}")
print(f"σ 的类型: {type_sigma}")
tau = Permutation([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])       #定义置换τ
cycles_tau = tau.cyclic_form                    #获取τ的不相交轮换形式
type_tau = [len(cycle) for cycle in cycles_tau]
print(f"置换 τ: {tau}")
print(f"τ 的不相交轮换形式: {cycles_tau}")
print(f"τ 的类型: {type_tau}")