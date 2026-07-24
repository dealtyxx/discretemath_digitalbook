from itertools import permutations
def find_permutations(multiset):
    s = ''.join([char * count for char, count in multiset.items()])    #转换为字符串
    perms = set(permutations(s))    #找出所有可能的排列，然后使用set去重
    return [''.join(p) for p in perms]    #将排列元组转换回字符串
multiset = {'A': 2, 'B': 3}    #多重集S={2×A, 3×B}
permutations = find_permutations(multiset)   #获取排列
print(f"Number of permutations: {len(permutations)}")
print("Permutations:", permutations)