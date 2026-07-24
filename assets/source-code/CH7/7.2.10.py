def floyd_warshall(weights):
    V = len(weights)
    dist_matrix = [[float('inf') if i != j and weights[i][j] == 0 else weights[i][j] for j in range(V)] for i in range(V)]
    for k in range(V):
        for i in range(V):
            for j in range(V):
                dist_matrix[i][j] = min(dist_matrix[i][j], dist_matrix[i][k] + dist_matrix[k][j])
    return dist_matrix
weights = [
    [0, 2, 4, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 2],
    [0, -3, 0, 0]]
distances = floyd_warshall(weights)
print("The shortest path matrix is:")
for row in distances:
    print(row)