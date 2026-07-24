import networkx as nx
#创建城市交通网络图
G = nx.DiGraph()
G.add_weighted_edges_from([
    ('A', 'B', 10), ('A', 'C', 15),
    ('B', 'D', 12), ('B', 'F', 15),
    ('C', 'E', 10), ('D', 'E', 2),
    ('D', 'G', 1),  ('E', 'G', 5),
    ('F', 'G', 5)
])
#计算并打印所有节点到节点G的最短路径
for node in G.nodes:
    if node != 'G':
        path = nx.shortest_path(G, source=node, target='G', weight='weight')
        length = nx.shortest_path_length(G, source=node, target='G', weight='weight')
        print(f"最短路径从 {node} 到 G: {path}, 路径长度: {length}")