from itertools import combinations
def powerset(S):           #生成集合S的幂集
    ps = []
    for i in range(len(S)+1):
        ps.extend(list(combinations(S, i)))
    return [set(x) for x in ps]
def is_sublattice(L, sub):    #检查一个子集是否为子格
    for a in sub:
        for b in sub:
            if (a | b) not in sub or (a & b) not in sub:
                return False
    return True
S = {'a', 'b', 'c'}
L = powerset(S)
sub = [{'a', 'b'}, {'a'}, {'b'}, set()]
is_sub = is_sublattice(L, sub)
print(f"The subset {sub} forms a sublattice: {is_sub}")