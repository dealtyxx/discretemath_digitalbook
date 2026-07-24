import numpy as np
def is_subgroup_h():
    def in_H(matrix):
        a = matrix[0, 0]
        b = matrix[0, 1]
        return matrix[1, 0] == 0 and matrix[1, 1] == 1 / a and a != 0
    identity_matrix = np.array([[1, 0], [0, 1]])                #定义单位矩阵
    identity = in_H(identity_matrix)                        #检查单位元
    # 定义H中的矩阵
    a_values = [1, 2, 0.5, -1]                              #任意非零值
    b_values = [0, 1, -1, 2]
    H = [np.array([[a, b], [0, 1 / a]]) for a in a_values for b in b_values]
    closure = all(in_H(np.dot(x, y)) for x in H for y in H)       #检查封闭性
    inverse = all(in_H(np.linalg.inv(matrix)) for matrix in H)    #检查逆元
    return closure, identity, inverse
closure, identity, inverse = is_subgroup_h()
print(f"封闭性: {closure}",f"单位元: {identity}",f"逆元: {inverse}")