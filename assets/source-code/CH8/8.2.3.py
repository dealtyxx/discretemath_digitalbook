import networkx as nx
def get_mst_edges_and_nodes():
    G = nx.Graph()
    G.add_weighted_edges_from([
        ("A", "B", 2), ("A", "C", 3), ("A", "G", 2),
        ("B", "C", 4), ("B", "D", 2), ("C", "D", 1),
        ("C", "E", 3), ("D", "E", 4), ("D", "F", 5),
        ("E", "F", 2), ("E", "G", 3), ("F", "G", 4)])
    MST = nx.minimum_spanning_tree(G, algorithm='prim')
    mst_edges = MST.edges(data=True)    #获取最小生成树的边和节点
    mst_nodes = MST.nodes()
    return mst_edges, mst_nodes
mst_edges, mst_nodes = get_mst_edges_and_nodes()
print(mst_edges, mst_nodes)