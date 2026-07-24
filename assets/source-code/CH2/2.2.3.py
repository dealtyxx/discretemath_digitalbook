A = {1, 2, 3, 4}    #定义集合
B = {2, 4, 5, 6}
C = {1, 2, 6, 7}
result = (A.intersection(B)).symmetric_difference(C)    #计算(A∩B)⊕C
print(result)