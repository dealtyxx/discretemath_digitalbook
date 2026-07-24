import networkx as nx
G3 = nx.MultiGraph()    #定义多重图
G3.add_nodes_from([1, 2, 3, 4])
G3.add_edges_from([(1, 2), (2, 3), (2, 3), (3, 4)])
parallel_edges = [(u, v) for u, v, k in G3.edges(keys=True) if G3.number_of_edges(u, v) > 1]    #寻找平行边
print("平行边:", parallel_edges)