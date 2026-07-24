import networkx as nx
import matplotlib.pyplot as plt
A = {1, 2, 3, 4, 5}
R = {(1, 2), (1, 3), (1, 4), (1, 5), (2, 3), (2, 4), (2, 5), (3, 4), (3, 5)}
G = nx.DiGraph()
G.add_edges_from(R)
pos = nx.spring_layout(G)
nx.draw_networkx(G, pos, with_labels=True, arrows=True)
plt.show()