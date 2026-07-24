import networkx as nx
import matplotlib.pyplot as plt

# 设置字体以支持中文显示
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 创建加权连通图
G = nx.Graph()
nodes = ['岳麓书院', '湖南省博物馆', '韶山', '凤凰古城', '张家界']
G.add_nodes_from(nodes)

# 添加加权边
edges = [('岳麓书院', '湖南省博物馆', 10),
         ('岳麓书院', '韶山', 30),
         ('湖南省博物馆', '凤凰古城', 20),
         ('韶山', '凤凰古城', 25),
         ('凤凰古城', '张家界', 15),
         ('韶山', '张家界', 40)]
G.add_weighted_edges_from(edges)

# 使用普里姆算法生成最小生成树
mst = nx.minimum_spanning_tree(G, algorithm='prim')

# 绘制最小生成树
pos = nx.spring_layout(mst)
plt.figure(figsize=(10, 7))
nx.draw(mst, pos, with_labels=True, node_size=2000, node_color='lightblue', font_weight='bold', font_size=12)

# 添加边的权重标签
edges = nx.get_edge_attributes(mst, 'weight')
nx.draw_networkx_edge_labels(mst, pos, edge_labels=edges)

plt.title("湖南省文化遗产数字化连接项目的最小生成树")
plt.show()
