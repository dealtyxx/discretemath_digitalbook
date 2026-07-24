def is_antisymmetric(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(n):
            if i != j and matrix[i][j] == 1 and matrix[j][i] == 1:
                return False
    return True
matrix_U = [    #关系U的矩阵
    [0, 1, 0],
    [0, 0, 1],
    [0, 0, 1]]
is_antisymmetric_U = is_antisymmetric(matrix_U)    #检查反对称性
print(is_antisymmetric_U)