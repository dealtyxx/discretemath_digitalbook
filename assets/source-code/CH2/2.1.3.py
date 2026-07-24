import itertools
A = {2, 'a', (3, 4)}    #将内部集合转换为元组
for r in range(len(A)+1):    #直接在循环中生成并打印B的每个子集
    for subset in itertools.combinations(A, r):
        print(set(subset))