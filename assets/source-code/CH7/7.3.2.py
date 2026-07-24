import networkx as nx
import matplotlib.pyplot as plt
bike_paths = nx.Graph()    #创建自行车道网络图
bike_paths.add_edges_from([('A', 'B'), ('B', 'C'), ('C', 'D'), ('E', 'F')])
car_paths = nx.Graph()    #创建汽车道网络图
car_paths.add_edges_from([('A', 'B'), ('D', 'E'), ('C', 'F'), ('B', 'D')])
intersection = nx.intersection(bike_paths, car_paths)    #自行车道和汽车道共用的路段
#整个城市的交通网络，需为每个图指定不同的名称以区分节点
union = nx.union(bike_paths, car_paths, rename=('bike−', 'car−'))
plt.figure(figsize=(12, 6))
plt.subplot(1, 2, 1)
nx.draw(intersection, with_labels=True, node_color='lightgreen', edge_color='green', node_size=50)
plt.title("Intersection (Shared Paths)")
plt.subplot(1, 2, 2)
nx.draw(union, with_labels=True, node_color='lightblue', edge_color='blue', node_size=50)
plt.title("Union (Complete Network)")
plt.show()