in_out_degrees_5 = [2, 2, 1, 1]          #四个顶点的入度和出度之和
edges_5 = sum(in_out_degrees_5) // 2    #因为每条边被计算了两次
print(edges_5)