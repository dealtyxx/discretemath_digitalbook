import networkx as nx
import matplotlib.pyplot as plt

# 设置字体以支持中文显示
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 创建有向图
G = nx.DiGraph()

# 添加节点
offices = ["县令", "太守", "尚书", "丞相"]
G.add_nodes_from(offices)

# 添加边（等级关系）
edges = [("县令", "太守"), ("太守", "尚书"), ("尚书", "丞相")]
G.add_edges_from(edges)

# 绘制图形
plt.figure(figsize=(10, 5))
nx.draw(G, with_labels=True, node_size=500, node_color="skyblue", font_size=20, arrows=True)
plt.title("中国古代官职等级系统")
plt.show()
