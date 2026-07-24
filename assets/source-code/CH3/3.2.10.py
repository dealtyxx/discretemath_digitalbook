def is_transitive(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(n):
            if matrix[i][j] == 1:
                for k in range(n):
                    if matrix[j][k] == 1 and matrix[i][k] != 1:
                        return False
    return True
matrix_T = [     #关系T的矩阵
    [0, 1, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 0]]
is_transitive_T = is_transitive(matrix_T)     #检查传递性
print(is_transitive_T)