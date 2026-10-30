import networkx as nx
def hierholzer(graph):      #确保图非空且至少有一个节点
    if not graph.is_directed() or graph.is_multigraph():
        raise ValueError("此实现面向不含重边的有向图")
    if len(graph.nodes) == 0:
        return "Empty graph."
    active = [v for v in graph if graph.degree(v) > 0]
    if not active:
        return [next(iter(graph))]
    differences = {v: graph.out_degree(v) - graph.in_degree(v) for v in active}
    starts = [v for v in active if differences[v] == 1]
    ends = [v for v in active if differences[v] == -1]
    balanced = all(d == 0 for d in differences.values())
    open_trail = len(starts) == len(ends) == 1 and all(abs(d) <= 1 for d in differences.values())
    if not (balanced or open_trail) or not nx.is_weakly_connected(graph.subgraph(active)):
        raise ValueError("有向欧拉通路要求有边部分弱连通，且度数差满足回路或开放通路条件")
    u = starts[0] if starts else active[0]    #开放通路必须从出度比入度大1的顶点开始
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
