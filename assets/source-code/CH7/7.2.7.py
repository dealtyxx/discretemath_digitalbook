import numpy as np
np.random.seed(0)      #用于可重现性
A = np.random.randint(0, 2, (4, 4))
A_squared = np.linalg.matrix_power(A, 2)    #计算A的幂次
A_cubed = np.linalg.matrix_power(A, 3)
A_quartic = np.linalg.matrix_power(A, 4)
print(A_squared)
print(A_cubed)
print(A_quartic)