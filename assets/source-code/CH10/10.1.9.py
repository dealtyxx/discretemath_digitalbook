from itertools import permutations
def sign_of_permutation(perm):
    inversions = 0
    for i in range(len(perm)):
        for j in range(i + 1, len(perm)):
            if perm[i] > perm[j]:
                inversions += 1
    return 1 if inversions % 2 == 0 else -1
def homomorphism_kernel_Sn_to_sign(n):
    elements = list(permutations(range(1, n + 1)))
    kernel = [perm for perm in elements if sign_of_permutation(perm) == 1]
    return kernel
kernel_S3_to_sign = homomorphism_kernel_Sn_to_sign(3)    #S3到群的同态核
print(f"从S_3到符号群的同态核: {kernel_S3_to_sign}")