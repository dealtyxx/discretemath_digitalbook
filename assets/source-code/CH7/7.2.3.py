import networkx as nx
G1 = nx.Graph()     #定义无向图G1
G1.add_edges_from([('A', 'B'), ('B', 'C'), ('C', 'D'), ('D', 'E'), ('E', 'A')])
vertex_connectivity_G1 = nx.node_connectivity(G1)    #图G1点连通度
print(f"无向图G1的点连通度: {vertex_connectivity_G1}")
G2 = nx.Graph()    #定义无向图G2
G2.add_edges_from([('A', 'B'), ('B', 'C'), ('C', 'D'), ('D', 'E'), ('E', 'A'), ('B', 'E')])
edge_connectivity_G2 = nx.edge_connectivity(G2)    #图G2边连通度
print(f"无向图G2的边连通度: {edge_connectivity_G2}")