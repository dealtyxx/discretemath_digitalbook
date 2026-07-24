def is_irreflexive(matrix):
    n = len(matrix)
    for i in range(n):
        if matrix[i][i] == 1:    #检查每个矩阵的对角线元素是否全部为0
            return False
    return True
matrix_U = [    #关系U的矩阵
    [0, 1, 0],[0, 0, 1],[0, 0, 0]
]
is_irreflexive_U = is_irreflexive(matrix_U)   #检查是否具有反自反性
print(is_irreflexive_U)