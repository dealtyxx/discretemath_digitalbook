def is_hamiltonian(graph):
    n = len(graph)    #图中的节点数
    path = [-1] * n
    path[0] = 0       #从第0个节点开始，尝试所有的路径
    if not hamiltonian_cycle_util(graph, path, 1):    #找不到哈密顿回路，则返回False
        print("No Hamiltonian cycle found")
        return False
    else:
        print("Hamiltonian cycle found:", path)
        return True
def hamiltonian_cycle_util(graph, path, pos):
    #若所有节点都在路径中，只需要检查最后一个节点是否与第一个节点相连
    if pos == len(graph):
        if graph[path[pos - 1]][path[0]] == 1:
            return True
        else:
            return False
    for v in range(1, len(graph)):      #尝试不同的节点作为路径的下一个节点
        if is_safe(v, graph, path, pos):
            path[pos] = v
            if hamiltonian_cycle_util(graph, path, pos + 1):
                return True
            path[pos] = -1          #若添加v到路径中不构成解，则删除它（回溯）
    return False
def is_safe(v, graph, path, pos):
    if graph[path[pos - 1]][v] == 0:    #检查这个节点是否与前一个节点相邻
        return False
    for vertex in path:               #检查节点是否已经在路径中
        if vertex == v:
            return False
    return True
graph = [[0, 1, 1, 1, 0, 0],             #图的邻接矩阵表示
         [1, 0, 1, 0, 1, 0],
         [1, 1, 0, 1, 1, 0],
         [1, 0, 1, 0, 1, 1],
         [0, 1, 1, 1, 0, 1],
         [0, 0, 0, 1, 1, 0]]
is_hamiltonian(graph)