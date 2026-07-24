import networkx as nx
import matplotlib.pyplot as plt
from networkx.algorithms.components.connected import connected_components

# 设置字体以支持中文显示
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 构建社会网络图
G = nx.Graph()
edges = [("张伟", "李明"), ("李明", "刘洋"), ("刘洋", "王强"), ("王强", "张伟"),
         ("王娟", "张燕"), ("张燕", "李娜"), ("李娜", "王娟"),
         ("赵伟国", "周明德"), ("周明德", "邓志强"), ("邓志强", "赵伟国")]
G.add_edges_from(edges)

# 使用等价关系找到不同的社区
communities = list(connected_components(G))
for i, community in enumerate(communities):
    print(f"社区 {i+1}: {community}")

# 可视化
pos = nx.spring_layout(G)  # 节点布局
nx.draw_networkx_nodes(G, pos, node_size=500)  # 绘制节点
nx.draw_networkx_edges(G, pos, alpha=1)  # 绘制边
nx.draw_networkx_labels(G, pos)  # 绘制标签

plt.title('社会网络中的群体划分')
plt.show()
