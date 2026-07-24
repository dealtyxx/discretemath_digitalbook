import numpy as np
R = np.array([[1, 0, 1],     #矩阵R和S
              [0, 1, 0],
              [1, 1, 0]])
S = np.array([[0, 1, 0],
              [0, 0, 1],
              [1, 0, 0]])
R_circ_S = (np.dot(R, S) > 0).astype(int)   #计算矩阵复合RS
print(R_circ_S)