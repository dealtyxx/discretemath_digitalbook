def edges_in_k_regular_graph(n, K):
    return n * K // 2
edges_k_regular1 = edges_in_k_regular_graph(10, 4)
edges_k_regular2 = edges_in_k_regular_graph(8, 3)
print(edges_k_regular1, edges_k_regular2)