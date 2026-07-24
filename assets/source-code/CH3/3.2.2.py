def inverse_relation(relation):
    return {(b, a) for (a, b) in relation}
def relation_to_matrix(relation, elements):
    matrix = [[0 for _ in elements] for _ in elements]
    element_indices = {element: i for i, element in enumerate(elements)}
    for (a, b) in relation:
        i, j = element_indices[a], element_indices[b]
        matrix[i][j] = 1
    return matrix
A = {1, 2, 3}    #集合A和关系R
R = {(1, 2), (2, 3), (3, 1)}
R_inverse = inverse_relation(R)    #计算关系R−1
matrix_R = relation_to_matrix(R, A)    #关系R的矩阵表示
matrix_R_inverse = relation_to_matrix(R_inverse, A)    #关系R−1的矩阵表示
print(R_inverse), print(matrix_R), print(matrix_R_inverse)