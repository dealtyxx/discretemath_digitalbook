import itertools
B = {frozenset({1}), frozenset({2, 3})}    #定义集合C
for r in range(len(B)+1):    #遍历从0到集合C长度的所有数值
    for subset in itertools.combinations(B, r):
        print({tuple(element) for element in subset})