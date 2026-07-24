import networkx as nx
import matplotlib.pyplot as plt
G = nx.Graph()                             #创建一个空图
nodes = ["A", "B", "C", "D", "E"]              #添加节点
G.add_nodes_from(nodes)
#添加边，避免产生K5或K3,3的非平面结构
edges = [("A", "B"), ("A", "C"), ("A", "D"), ("B", "C"), ("C", "D"), ("D", "E")]
G.add_edges_from(edges)
is_planar, embedding = nx.check_planarity(G)    #检查图是否为平面图
print(f"该图是平面图: {is_planar}")
pos = nx.spring_layout(G)                    #使用Spring布局
nx.draw(G, pos, with_labels=True, node_size=700, node_color="lightblue", edge_color="gray")
plt.title("智慧城市交通网络示意图")
plt.show()