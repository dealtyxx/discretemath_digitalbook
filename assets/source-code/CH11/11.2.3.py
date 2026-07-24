from itertools import combinations
def powerset(S):                 #生成集合S的幂集
    ps = []
    for i in range(len(S)+1):
        ps.extend(list(combinations(S, i)))
    return [set(x) for x in ps]
def check_lattice_powerset(S):    #检查上确界（并集）和下确界（交集）
    ps = powerset(S)
    for a in ps:
        for b in ps:
            union = a | b
            intersection = a & b
            if union not in ps or intersection not in ps:
                return False
    return True
S = { 'a', 'b' }
is_lattice_powerset = check_lattice_powerset(S)
print(f"P(S) forms a lattice: {is_lattice_powerset}")