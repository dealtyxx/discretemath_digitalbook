import networkx as nx
def is_bridge(graph, u, v):     #检查边是否是割边
    original_components = nx.number_connected_components(graph)
    graph.remove_edge(u, v)
    new_components = nx.number_connected_components(graph)
    graph.add_edge(u, v)     #恢复边
    return new_components > original_components
def fleury(graph):
    if len(graph.nodes) == 0:     #确保图非空且至少有一个节点
        return "Empty graph."
    u = next(iter(graph.nodes))     #找到一个起始节点
    for v in graph.nodes:
        if graph.degree[v] % 2 != 0:
            u = v
            break
    path = [u]
    while graph.number_of_edges() > 0:
        for v in list(graph.neighbors(u)):
            if not is_bridge(graph, u, v) or graph.degree[u] == 1:
                path.append(v)
                graph.remove_edge(u, v)
                u = v
                break
    return path
undirected_graph = nx.Graph()
undirected_graph.add_edges_from([('A', 'B'), ('B', 'C'), ('C', 'D'), ('D', 'A'), ('A', 'C')])
print(fleury(undirected_graph.copy()))     #测试Fleury算法