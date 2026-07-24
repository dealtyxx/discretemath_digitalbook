import networkx as nx
def hierholzer(graph):      #确保图非空且至少有一个节点
    if len(graph.nodes) == 0:
        return "Empty graph."
    u = next(iter(graph.nodes))    #找到一个起始节点
    for v in graph.nodes:
        if graph.out_degree(v) > 0:
            u = v
            break
    stack = [u]
    path = []
    while stack:
        u = stack[-1]
        if graph.out_degree(u) == 0:
            path.append(u)
            stack.pop()
        else:
            v = next(graph.neighbors(u))
            stack.append(v)
            graph.remove_edge(u, v)
    return path[::-1]    #返回逆序路径
directed_graph = nx.DiGraph()
directed_graph.add_edges_from([('A', 'B'), ('B', 'C'), ('C', 'D'), ('D', 'A'), ('A', 'C'), ('C', 'A')])
print(hierholzer(directed_graph.copy()))    #测试Hierholzer算法