def linear_congruence(a, b, m):
    solutions = []
    for x in range(m):
        if (a * x) % m == b:
            solutions.append(x)
    return solutions
a = 3    #解3x=4 mod 7
b = 4
m = 7
solutions = linear_congruence(a, b, m)
print(f"Solutions of {a}x = {b} (mod {m}): {solutions}")