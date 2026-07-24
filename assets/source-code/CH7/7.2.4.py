import networkx as nx
G1 = nx.DiGraph([(1, 2), (2, 3), (3, 1), (4, 2)])       #有向图
G2 = nx.DiGraph([(1, 2), (2, 3), (3, 4), (4, 1)])
G3 = nx.DiGraph([(1, 2), (2, 1), (3, 4), (4, 3)])
def analyze_graph(G):       #定义函数来分析图
    return {
        "强连通": nx.is_strongly_connected(G),
        "弱连通": nx.is_weakly_connected(G),
        "单向连通": nx.is_semiconnected(G)
    }
results_G1 = analyze_graph(G1)        #分析图
results_G2 = analyze_graph(G2)
results_G3 = analyze_graph(G3)
print(f"有向图G1分析结果: {results_G1}")
print(f"有向图G2分析结果: {results_G2}")
print(f"有向图G3分析结果: {results_G3}")