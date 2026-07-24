S = [0, 1]
def check_lattice_boolean(S):
    for a in S:
        for b in S:
            join = max(a, b)     #并集
            meet = min(a, b)    #交集
            if join not in S or meet not in S:
                return False
    return True
is_lattice_boolean = check_lattice_boolean(S)
print(f"{{0, 1}} forms a lattice under Boolean algebra: {is_lattice_boolean}")