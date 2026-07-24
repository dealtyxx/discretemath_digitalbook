import networkx as nx
import matplotlib.pyplot as plt
A = {1, 2, 3, 4}    #集合A和关系R
R = {(1, 2), (2, 2), (2, 3), (1, 4)}
G = nx.DiGraph()    #创建有向图
G.add_edges_from(R)    #添加关系边
pos = nx.spring_layout(G)    #绘制图形
nx.draw_networkx(G, pos, with_labels=True, arrows=True)
plt.show()