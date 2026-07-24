from math import gcd
def lcm(x, y):
    return x * y // gcd(x, y)
def is_lattice_homomorphism(A, B, h, op, use_frozenset=False):
    for x in A:
        for y in A:
            if use_frozenset:
                if h[frozenset(op(frozenset(x), frozenset(y)))] != op(h[frozenset(x)], h[frozenset(y)]):
                    return False
            else:
                if h[op(x, y)] != op(h[x], h[y]):
                    return False
    return True
P_A = [set(), {'a'}, {'b'}, {'a', 'b'}]            #幂集映射
P_B = [set(), {1}, {2}, {1, 2}]
h_P = {
    frozenset(): frozenset(),
    frozenset({'a'}): frozenset({1}),
    frozenset({'b'}): frozenset({2}),
    frozenset({'a', 'b'}): frozenset({1, 2})}
def intersection(x, y):
    return x & y
def union(x, y):
    return x | y
#验证幂集映射
print(is_lattice_homomorphism(P_A, P_B, h_P, intersection, use_frozenset=True))
print(is_lattice_homomorphism(P_A, P_B, h_P, union, use_frozenset=True))
A_nums = [1, 2, 4, 8]                     #验证整除关系映射
B_nums = [1, 2]
h_A = {1: 1, 2: 2, 4: 2, 8: 2}
print(is_lattice_homomorphism(A_nums, B_nums, h_A, gcd))
print(is_lattice_homomorphism(A_nums, B_nums, h_A, lcm))