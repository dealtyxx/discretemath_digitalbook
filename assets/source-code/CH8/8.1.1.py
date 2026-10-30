import networkx as nx
def is_bridge(graph, u, v):     #检查边是否是割边
    original_components = nx.number_connected_components(graph)
    attributes = dict(graph.get_edge_data(u, v))
    graph.remove_edge(u, v)
    new_components = nx.number_connected_components(graph)
    graph.add_edge(u, v, **attributes)     #恢复边及其原有属性
    return new_components > original_components
def fleury(graph):
    if graph.is_directed() or graph.is_multigraph():
        raise ValueError("此实现面向无向简单图")
    if len(graph.nodes) == 0:     #确保图非空且至少有一个节点
        return "Empty graph."
    active = [v for v in graph if graph.degree[v] > 0]
    if not active:
        return [next(iter(graph))]    #零边图的平凡通路
    odd = [v for v in active if graph.degree[v] % 2]
    if len(odd) not in (0, 2) or not nx.is_connected(graph.subgraph(active)):
        raise ValueError("欧拉通路要求有边顶点连通，且奇度顶点为0个或2个")
    u = odd[0] if odd else active[0]    #忽略孤立点；开放通路从奇度顶点开始
    path = [u]
    while graph.number_of_edges() > 0:
        for v in list(graph.neighbors(u)):
            if not is_bridge(graph, u, v) or graph.degree[u] == 1:
                path.append(v)
                graph.remove_edge(u, v)
                u = v
                break
        else:
            raise ValueError("无法继续通路；请检查输入图是否满足欧拉条件")
    return path
undirected_graph = nx.Graph()
undirected_graph.add_edges_from([('A', 'B'), ('B', 'C'), ('C', 'D'), ('D', 'A'), ('A', 'C')])
print(fleury(undirected_graph.copy()))     #测试Fleury算法
