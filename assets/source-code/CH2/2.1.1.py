A = {1, 2}
B = {1, 2, 3}
C = {1, 2, 3, 4}
is_A_subset_B = A.issubset(B)    #检查A是否是B的子集
print(f"A is a subset of B: {is_A_subset_B}")
is_B_subset_C = B.issubset(C)    #检查B是否是C的子集
print(f"B is a subset of C: {is_B_subset_C}")
is_A_subset_C = A.issubset(C)    #检查A是否是C的子集
print(f"A is a subset of C: {is_A_subset_C}")