def apply_permutation(permutation, element):
    for cycle in permutation:
        if element in cycle:
            idx = cycle.index(element)
            return cycle[(idx + 1) % len(cycle)]
    return element
def compose_permutations(sigma, tau, elements):
    result = {}
    for element in elements:
        after_tau = apply_permutation(tau, element)
        after_sigma = apply_permutation(sigma, after_tau)
        result[element] = after_sigma
    return result
sigma = [(1, 2, 3)]       #定义轮换
tau = [(2, 3, 4)]
elements = [1, 2, 3, 4]    #群的元素
sigma_tau = compose_permutations(sigma, tau, elements)
tau_sigma = compose_permutations(tau, sigma, elements)
print(sigma_tau)
print(tau_sigma)