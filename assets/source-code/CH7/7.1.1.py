import networkx as nx
G_with_self_loop = nx.Graph()
G_with_self_loop.add_edges_from([('A', 'A'), ('A', 'B'), ('B', 'C'), ('C', 'D'), ('D', 'A')])
#检查是否有自环
contains_self_loop = any(u == v for u, v in G_with_self_loop.edges())
if contains_self_loop:
    print("Graph contains self−loop")
else:
    print("Graph does not contain self−loop")