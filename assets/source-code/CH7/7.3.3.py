import networkx as nx
import matplotlib.pyplot as plt
# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False
G = nx.Graph()
G.add_edges_from([('1', '2'), ('1', '3'), ('2', '4'), ('3', '4'), ('3', '5')])
adjacency_matrix = nx.adjacency_matrix(G).todense()    #邻接矩阵
print("邻接矩阵:\n", adjacency_matrix)
incidence_matrix = nx.incidence_matrix(G).todense()    #关联矩阵
print("\n关联矩阵:\n", incidence_matrix)
pos = nx.spring_layout(G)     #可视化图
nx.draw(G, pos, with_labels=True, node_size=700, node_color='skyblue')
plt.title("制造网络")
plt.show()