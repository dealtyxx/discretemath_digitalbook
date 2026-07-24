import networkx as nx
import matplotlib.pyplot as plt

# 设置字体以支持中文显示
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 创建加权无向图
G = nx.Graph()
nodes = ['地面基站1', '地面基站2', '卫星1', '空间站', '卫星2']
G.add_nodes_from(nodes)

# 添加边及其权重
edges = [
    ('地面基站1', '卫星1', 5),
    ('地面基站1', '空间站', 9),
    ('地面基站2', '卫星2', 6),
    ('卫星1', '空间站', 7),
    ('卫星1', '卫星2', 8),
    ('空间站', '卫星2', 4)
]
G.add_weighted_edges_from(edges)

# 使用Kruskal算法生成最小生成树
mst = nx.minimum_spanning_tree(G, algorithm='kruskal')

# 绘制最小生成树
pos = nx.spring_layout(mst)
plt.figure(figsize=(10, 7))
nx.draw(mst, pos, with_labels=True, node_size=2000, node_color='skyblue', edge_color='black')

# 添加边的权重标签
edges = nx.get_edge_attributes(mst, 'weight')
nx.draw_networkx_edge_labels(mst, pos, edge_labels=edges)

plt.title("航天通信网络的最小生成树")
plt.show()
