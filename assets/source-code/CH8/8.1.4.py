from itertools import combinations
def has_subgraph_k5(graph):       #是否形成K5
    nodes = list(graph.keys())
    n = len(nodes)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                for l in range(k + 1, n):
                    for m in range(l + 1, n):
                        #检查是否每个节点都与其他节点相连
                        if all(other in graph[node] for node in (nodes[i], nodes[j], nodes[k], nodes[l], nodes[m])
                               for other in (nodes[i], nodes[j], nodes[k], nodes[l], nodes[m]) if node != other):
                            return True
    return False

def has_subgraph_k33(graph):        #是否含K3,3子图（只查子图本身，不查与K3,3同胚的细分图）
    nodes = list(graph.keys())
    n = len(nodes)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                for l in range(k + 1, n):
                    for m in range(l + 1, n):
                        for o in range(m + 1, n):
                            six = (nodes[i], nodes[j], nodes[k], nodes[l], nodes[m], nodes[o])
                            for p1 in combinations(six, 3):    #遍历全部C(6,3)种3+3划分
                                #检查是否每个节点都与其他分区的节点相连
                                partition1 = set(p1)
                                partition2 = set(six) - partition1
                                if all((node in graph[other]) or (other in graph[node])
                                       for node in partition1 for other in partition2):
                                    return True
    return False
def is_planar(graph):    #注意：只检测是否含K5/K3,3子图（必要条件），不检测同胚子图，严格判定可用nx.check_planarity
    return not (has_subgraph_k5(graph) or has_subgraph_k33(graph))
graph_example_2 = {    #示例图
    'A': ['B', 'C', 'D', 'E'],
    'B': ['A', 'C', 'D', 'E'],
    'C': ['A', 'B', 'D', 'E'],
    'D': ['A', 'B', 'C', 'E'],
    'E': ['A', 'B', 'C', 'D'],
    'F': ['A', 'B']}
is_planar_result_k5 = is_planar(graph_example_2)
print(is_planar_result_k5)