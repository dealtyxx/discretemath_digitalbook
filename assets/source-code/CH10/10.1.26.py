def cycle_to_transpositions(cycle):               #轮换转换成一系列对换乘积
    transpositions = []
    first_element = cycle[0]
    for i in range(len(cycle) - 1, 0, -1):
        transpositions.append((first_element, cycle[i]))
    return transpositions
def decompose_permutation_to_transpositions(cycles):    #将多个轮换分解成对换
    all_transpositions = []
    for cycle in cycles:
        transpositions = cycle_to_transpositions(cycle)
        all_transpositions.extend(transpositions)
        print(f"Cycle {cycle} decomposes to transpositions: {transpositions}")
    return all_transpositions
cycles = [(1, 4, 7), (2, 6), (3, 5, 8, 9)]              #置换轮换
all_transpositions = decompose_permutation_to_transpositions(cycles)
print("All transpositions from the given permutation:", all_transpositions)