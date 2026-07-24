def apply_permutation(perm, x):
    if x in perm:
        return perm[x]
    return x
def compose_permutations(sigma, tau, n):    #计算两个置换的复合
    sigma_map = {sigma[i]: sigma[(i + 1) % len(sigma)] for i in range(len(sigma))}
    tau_map = {tau[i]: tau[(i + 1) % len(tau)] for i in range(len(tau))}
    composition = {}
    for x in range(1, n + 1):
        moved = apply_permutation(tau_map, x)
        final_position = apply_permutation(sigma_map, moved)
        if final_position != x:
            composition[x] = final_position
    return composition
sigma = [1, 2, 3]
tau = [2, 3]
n = 3
composed = compose_permutations(sigma, tau, n)
composed2 = compose_permutations(tau, sigma, n)
print(f"The composition of tau and sigma is: {composed}")
print(f"The composition of sigma and tau is: {composed2}")