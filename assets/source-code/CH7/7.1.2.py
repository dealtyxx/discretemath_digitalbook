import networkx as nx
G2 = nx.Graph()      #定义图
G2.add_nodes_from([1, 2, 3, 4, 5, 6])
G2.add_edges_from([(1, 2), (2, 3), (3, 4), (4, 5)])
#寻找孤立点
isolated_nodes = [node for node in G2.nodes if G2.degree(node) == 0]
print("孤立点:", isolated_nodes)