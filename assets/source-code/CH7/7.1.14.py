def edges_in_complete_graph(n):
    return n * (n - 1) // 2
edges_complete_graph = edges_in_complete_graph(7)
print(edges_complete_graph)     #7个顶点的完全图