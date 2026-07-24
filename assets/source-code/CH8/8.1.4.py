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

def has_subgraph_k33(graph):        #是否形成K3,3
    nodes = list(graph.keys())
    n = len(nodes)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                for l in range(k + 1, n):
                    for m in range(l + 1, n):
                        for o in range(m + 1, n):
                            #检查是否每个节点都与其他分区的节点相连
                            partition1 = {nodes[i], nodes[j], nodes[k]}
                            partition2 = {nodes[l], nodes[m], nodes[o]}
                            if all((node in graph[other]) or (other in graph[node])
                                   for node in partition1 for other in partition2):
                                return True
    return False
def is_planar(graph):
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