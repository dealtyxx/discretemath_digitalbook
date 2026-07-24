import networkx as nx
import matplotlib.pyplot as plt
import heapq
G = nx.Graph()     #定义图
G.add_weighted_edges_from([('A', 'B', 1), ('A', 'C', 3), ('B', 'C', 2), ('B', 'D', 4), ('C', 'D', 1)])
def dijkstra(graph, start):     #Dijkstra算法实现
    distances = {vertex: float('infinity') for vertex in graph.nodes}
    distances[start] = 0
    pq = [(0, start)]
    while pq:
        current_distance, current_vertex = heapq.heappop(pq)
        if current_distance > distances[current_vertex]:
            continue
        for neighbor, data in graph[current_vertex].items():
            distance = current_distance + data['weight']
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    return distances
def visualize_graph(graph, path=None):     #可视化图和路径的函数
    pos = nx.spring_layout(graph)
    nx.draw(graph, pos, with_labels=True, font_weight='bold', node_size=700, node_color="skyblue")
    nx.draw_networkx_edge_labels(graph, pos, edge_labels=nx.get_edge_attributes(graph, 'weight'))
    if path:
        edges = [(path[n], path[n + 1]) for n in range(len(path) - 1)]
        nx.draw_networkx_edges(graph, pos, edgelist=edges, edge_color='red', width=2)
        nx.draw_networkx_nodes(graph, pos, nodelist=path, node_color="red")
    plt.show()
visualize_graph(G)     #可视化图
distances = dijkstra(G, 'A')
print(distances)