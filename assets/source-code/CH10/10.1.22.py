def inverse_permutation(perm):       #求置换的逆
    inv_perm = {perm[i]: perm[i - 1] for i in range(len(perm))}
    return inv_perm
perm = [1, 2, 3, 4]
inverse = inverse_permutation(perm)
print(f"The inverse of the permutation is: {inverse}")