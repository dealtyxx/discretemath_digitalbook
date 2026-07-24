import networkx as nx
G = nx.Graph()      #定义图G
G.add_edges_from([(1, 2), (2, 3), (3, 1), (4, 5), (5, 6), (6, 4), (7, 8)])
is_connected = nx.is_connected(G)     #判断图G是否连通
print(f"图G是否连通: {is_connected}")
#找出所有连通分量
connected_components = list(nx.connected_components(G))
print(f"图G的所有连通分量: {connected_components}")
#找出最大连通子图
largest_component = max(connected_components, key=len)
print(f"图G的最大连通子图: {largest_component}")
#输出最大连通子图的大小
largest_component_size = len(largest_component)
print(f"图G中最大连通子图的大小: {largest_component_size}")
#找出所有与最大连通子图大小相同的子图
largest_components = [component for component in connected_components if len(component) == largest_component_size]
print(f"图G中所有最大连通子图: {largest_components}")