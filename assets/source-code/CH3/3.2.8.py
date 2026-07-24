def is_symmetric(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(n):     #每个矩阵的元素是否在其对称位置上有相同的值
            if matrix[i][j] != matrix[j][i]:
                return False
    return True
matrix_R = [     #关系R的矩阵
    [1, 1, 0, 0, 0, 0],
    [1, 0, 1, 0, 0, 0],
    [0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 1]]
is_symmetric_R = is_symmetric(matrix_R)     #检查是否具有对称性
print(is_symmetric_R)