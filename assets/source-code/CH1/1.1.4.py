from itertools import combinations
def find_combinations(multiset, r):
    elements = [char for char, count in multiset.items() for _ in range(count)]
    combs = set(combinations(elements, r))    #找出所有可能的组合，并去重
    return [''.join(c) for c in combs]    #将组合元组转换回字符串
multiset = {'A': 3, 'B': 2, 'C': 1}
combinations = find_combinations(multiset, 3)    #获取组合
print(f"Number of combinations: {len(combinations)}")
print("Combinations:", combinations)