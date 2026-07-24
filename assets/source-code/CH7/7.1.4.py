import networkx as nx
G = nx.Graph()
G.add_nodes_from([1, 2, 3, 4])
G.add_edges_from([(1, 2), (2, 3), (3, 4)])
neighborhood_of_2 = list(G.neighbors(2))     #计算邻域
print("顶点2的邻域:", neighborhood_of_2)
closed_neighborhood_of_2 = list(G.neighbors(2)) + [2]    #计算闭邻域
print("顶点2的闭邻域:", closed_neighborhood_of_2)