import networkx as nx
G = nx.Graph()   #创建图
G.add_edges_from([       #假设添加的边代表古城中修复工作需要经过的路径
    ('A', 'B'), ('B', 'C'), ('C', 'D'), ('D', 'A'),
    ('A', 'E'), ('B', 'F'), ('C', 'G'), ('D', 'H'),
    ('E', 'F'), ('F', 'G'), ('G', 'H'), ('H', 'E')
])
if nx.is_eulerian(G):       #判断图G是否是欧拉图并找到欧拉回路
    print("该图是欧拉图。")
    print("一个可能的欧拉回路是：")
    print(list(nx.eulerian_circuit(G)))
else:
    print("该图不是欧拉图，需要重新规划修复路径。")