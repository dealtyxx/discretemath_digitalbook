Z6 = {0, 1, 2, 3, 4, 5}
H = {0, 3}
K = {0, 2, 4}
H_inter_K = H.intersection(K)
#验证H∩K是否为正规子群
is_normal_subgroup = all((g + h - g) % 6 in H_inter_K for g in Z6 for h in H_inter_K)
print("H ∩ K =", H_inter_K)
print("H ∩ K is a normal subgroup of Z6:", is_normal_subgroup)