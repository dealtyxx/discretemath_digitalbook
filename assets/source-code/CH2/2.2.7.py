U = set(range(10))     #全集示例
A = {1, 2, 3}
B = {4, 5, 6}
C = {7, 8, 9}
result = (U - (A | (U - A))) & (B | (U - B)) & (U - (C & (U - C)))    #计算表达式
print(result)