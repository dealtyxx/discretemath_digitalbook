import networkx as nx
#创建加权图
#使用有向图表示道路方向可能不同
G = nx.DiGraph()
G.add_weighted_edges_from([
    ('Rescue Center', 'A', 2),
    ('A', 'B', 1),
    ('A', 'D', 4),
    ('B', 'C', 2),
    ('B', 'D', 2),
    ('C', 'D', 3),
    ('C', 'Rescue Center', 7),
    ('D', 'Rescue Center', 1)])
#救援中心到所有小区的最短路径和距离
rescue_center = 'Rescue Center'
shortest_paths = nx.single_source_dijkstra(G, source=rescue_center)
print("Shortest paths from Rescue Center to all areas:")
for target in G.nodes():
    if target != rescue_center:
        path = shortest_paths[1][target]
        cost = shortest_paths[0][target]
        print(f"Path to {target}: {path}, Time: {cost}")