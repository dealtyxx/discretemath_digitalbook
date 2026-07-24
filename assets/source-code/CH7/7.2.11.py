import numpy as np
vertices = ['A', 'B', 'C', 'D', 'E']    #定义图的顶点和边
edges = [('A', 'B', -1), ('A', 'C', 4), ('B', 'C', 3), ('B', 'D', 2), ('B', 'E', 2), ('D', 'C', 5), ('D', 'B', 1)]
num_vertices = len(vertices)    #初始化距离矩阵和前驱节点矩阵
distance_matrix = np.full((num_vertices, num_vertices), np.inf)
np.fill_diagonal(distance_matrix, 0)
predecessor_matrix = np.full((num_vertices, num_vertices), None)
vertex_index = {vertex: index for index, vertex in enumerate(vertices)}
for edge in edges:
    start, end, weight = edge
    distance_matrix[vertex_index[start], vertex_index[end]] = weight
    predecessor_matrix[vertex_index[start], vertex_index[end]] = vertex_index[start]
for k in range(num_vertices):    #Floyd−Warshall算法实现
    for i in range(num_vertices):
        for j in range(num_vertices):
            if distance_matrix[i, j] > distance_matrix[i, k] + distance_matrix[k, j]:
                distance_matrix[i, j] = distance_matrix[i, k] + distance_matrix[k, j]
                predecessor_matrix[i, j] = predecessor_matrix[k, j]
print(distance_matrix)
print(predecessor_matrix)