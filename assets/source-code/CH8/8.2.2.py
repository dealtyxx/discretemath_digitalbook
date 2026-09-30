def dfs(graph, current, end, path=None, visited=None):
    if path is None: path = []
    if visited is None: visited = set()
    path.append(current)             #添加当前节点到路径中
    if current == end:                #若当前节点是目标节点
        return path                 #返回路径
    visited.add(current)              #标记当前节点为已访问
    for neighbor in graph[current]:     #遍历当前节点的所有邻居
        if neighbor not in visited:     #若邻居未被访问
            result = dfs(graph, neighbor, end, path, visited)    #递归访问邻居
            if result:               #若找到目标节点
                return result        #返回路径
    path.pop()                      #若当前分支未找到目标，回溯
    return None                     #若整个图遍历完未找到目标节点，返回None
graph = {                           #示例图（邻接表表示）
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []}
start_node = 'A'
end_node = 'F'
path = dfs(graph, start_node, end_node)
print(f"Path from {start_node} to {end_node}: {path}")