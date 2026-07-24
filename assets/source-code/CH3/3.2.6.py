def is_reflexive(matrix):
    n = len(matrix)
    for i in range(n):
        if matrix[i][i] != 1:    #检查每个矩阵的对角线元素是否全部为1
            return False
    return True
matrix_R = [    #关系R的矩阵
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
]
is_reflexive_R = is_reflexive(matrix_R)    #检查是否具有自反性
print(is_reflexive_R)