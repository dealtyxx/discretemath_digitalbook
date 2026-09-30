from itertools import product
A = {'a', 'b'}
B = {0, 1, 2}
all_functions = list(product(B, repeat=len(A)))     #生成所有可能的函数
for idx, function in enumerate(all_functions, start=1):   #输出
    function_dict = {a: b for a, b in zip(A, function)}
    print(f"f_{idx} =", function_dict)
def count_mappings(m, n):
    return n ** m
m = 3     #集合A的元素个数
n = 4     #集合B的元素个数
print(f"从集合 A 到集合 B 的所有可能映射的数目: {count_mappings(m, n)}")