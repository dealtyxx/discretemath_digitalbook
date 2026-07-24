U = {1, 2, 3, 4, 5, 6, 7, 8}    #定义全集U和集合A, B
A = {1, 3, 5, 7}
B = {1, 2, 4, 6}
complement = U - (A | B)    #计算~(A∪B)
print(complement)