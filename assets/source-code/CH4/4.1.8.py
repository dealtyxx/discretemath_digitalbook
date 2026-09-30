import networkx as nx
import itertools
P_relations = [('a', 'b'), ('a', 'c'), ('b', 'd'), ('c', 'e'), ('d', 'f'), ('e', 'f')]     #偏序关系
G = nx.DiGraph()     #创建有向图
G.add_edges_from(P_relations)
def is_antichain(subset, graph):
    for pair in itertools.combinations(subset, 2):
        if nx.has_path(graph, pair[0], pair[1]) or nx.has_path(graph, pair[1], pair[0]):
            return False
    return True
def find_longest_antichain(relations):
    G = nx.DiGraph()
    G.add_edges_from(relations)
    elements = list(G.nodes())
    max_antichain = []
    for r in range(len(elements), 0, -1):
        for subset in itertools.combinations(elements, r):
            if is_antichain(subset, G) and len(subset) > len(max_antichain):
                max_antichain = subset
                break
        if max_antichain:
            break
    return max_antichain
all_paths = []     #寻找最长链
for node in G:
    for target in G:
        paths = list(nx.all_simple_paths(G, source=node, target=target))
        all_paths.extend(paths)
max_length = max(len(p) for p in all_paths)
longest_chains = [p for p in all_paths if len(p) == max_length]
longest_antichain = find_longest_antichain(P_relations)
print("所有最长链:", longest_chains)
print("最长反链:", longest_antichain)