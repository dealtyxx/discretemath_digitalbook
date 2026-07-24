import networkx as nx
G_exercise = nx.Graph()
G_exercise.add_edges_from([(1, 2), (2, 3), (3, 1), (4, 5), (5, 6), (6, 4), (2, 4), (3, 5)])
degrees = dict(G_exercise.degree())      #计算每个顶点的度
odd_degree_count = sum(1 for degree in degrees.values() if degree % 2 != 0)
print(odd_degree_count)