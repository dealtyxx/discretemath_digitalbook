import numpy as np
A = np.array([[0, 1], [1, 0]])        #邻接矩阵A和B
B = np.array([[0, 0], [0, 1]])
A_squared = np.matmul(A, A)      #矩阵乘法
A_sum = A + B   #矩阵加法
print(A_squared)
print(A_sum)