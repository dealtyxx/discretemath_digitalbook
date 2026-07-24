import networkx as nx
G1 = nx.Graph()      #定义图G1
G1.add_edges_from([(1, 2), (2, 3)])
#获取图G1的邻接矩阵
adj_matrix_G1 = nx.to_numpy_array(G1, nodelist=[1, 2, 3])
print("无向图G1的邻接矩阵为：")
print(adj_matrix_G1)
G2 = nx.Graph()    #定义图G2
G2.add_edges_from([(1, 2), (2, 3), (3, 3)])
#获取图G2的邻接矩阵
adj_matrix_G2 = nx.to_numpy_array(G2, nodelist=[1, 2, 3])
print("无向图G2的邻接矩阵为：")
print(adj_matrix_G2)