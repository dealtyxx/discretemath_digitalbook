import numpy as np
A = np.array([[0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1], [1, 0, 0, 0]])
I = np.eye(4)
A_squared = np.linalg.matrix_power(A, 2)      #计算A的幂次
A_cubed = np.linalg.matrix_power(A, 3)
A_quartic = np.linalg.matrix_power(A, 4)
#重新计算可达矩阵R，包括单位矩阵I
reachable_matrix_corrected = I + A + A_squared + A_cubed + A_quartic
reachable_matrix_corrected = (reachable_matrix_corrected > 0).astype(int)
print(reachable_matrix_corrected)