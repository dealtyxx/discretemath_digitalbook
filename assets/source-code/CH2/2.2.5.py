A = {1, 2, 3, 4, 5}    #定义集合
B = {2, 3, 6, 7}
C = {3, 4, 7, 8}
result = (A - B) | (C - A) | (B & C)    #计算(A−B)∪(C−A)∪(B∩C)
print(result)