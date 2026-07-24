import networkx as nx
B = nx.Graph()                                  #创建二部图
volunteers = ['v1', 'v2', 'v3', 'v4']                     #添加志愿者
projects = ['p1', 'p2', 'p3']    #添加项目
B.add_nodes_from(volunteers, bipartite=0)           #将志愿者加入图的一边
B.add_nodes_from(projects, bipartite=1)             #将项目加入图的另一边
edges = [('v1', 'p1'), ('v1', 'p2'), ('v2', 'p2'),            #添加潜在的匹配边
         ('v3', 'p1'), ('v3', 'p3'), ('v4', 'p3')]
B.add_edges_from(edges)
max_match = nx.bipartite.maximum_matching(B)     #计算最大匹配
print("最大匹配是：")
for key, value in max_match.items():
    if key in volunteers:
        print(f"{key} −> {value}")