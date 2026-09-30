import numpy as np
def relation_to_matrix(relation, elements):
    matrix = np.zeros((len(elements), len(elements)), dtype=int)
    element_indices = {element: i for i, element in enumerate(elements)}
    for (a, b) in relation:
        i, j = element_indices[a], element_indices[b]
        matrix[i][j] = 1
    return matrix
def matrix_power(matrix, power):
    result = np.linalg.matrix_power(matrix, power)
    result[result > 0] = 1  # Convert any non−zero entries to 1
    return result
B = ['a', 'b', 'c']
S = {('a', 'b'), ('b', 'c'), ('c', 'a')}
matrix_S = relation_to_matrix(S, B)    #将关系S转换为矩阵表示
S2 = matrix_power(matrix_S, 2)    #计算S2
S3 = matrix_power(matrix_S, 3)    #计算S3
print(S2), print(S3)