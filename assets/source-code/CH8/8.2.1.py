from collections import deque
def bfs(graph, start, end):
    visited = set()                      #用于记录访问过的节点
    queue = deque([(start, [start])])        #使用队列存储（当前节点，路径）
    while queue:
        current, path = queue.popleft()     #获取当前节点及路径
        if current == end:               #找到目标
            return path
        for neighbor in graph[current]:
            if neighbor not in visited:     #若邻居节点未被访问
                visited.add(neighbor)    #标记为已访问
                queue.append((neighbor, path + [neighbor]))
    return None                        #若无法到达，返回None
graph = {                              #示例图（邻接表表示）
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []}
start_node = 'A'
end_node = 'F'
path = bfs(graph, start_node, end_node)
print(f"Path from {start_node} to {end_node}: {path}")