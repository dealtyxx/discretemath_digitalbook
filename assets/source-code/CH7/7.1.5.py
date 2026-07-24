import networkx as nx
G_complex = nx.Graph()
G_complex.add_nodes_from([1, 2, 3, 4, 5, 6])
G_complex.add_edges_from([(1, 2), (1, 3), (2, 4), (3, 4), (4, 5), (5, 6)])
neighborhood_of_4 = list(G_complex.neighbors(4))
print("顶点4的邻域:", neighborhood_of_4)
closed_neighborhood_of_5 = list(G_complex.neighbors(5)) + [5]
print("顶点5的闭邻域:", closed_neighborhood_of_5)