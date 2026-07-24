G = [(),(1, 2),(1, 3),(2, 3),(1, 2, 3),(1, 3, 2)]    #定义群元素
H = [(),(1, 2)]
order_G = len(G)                        #计算群的阶和子群的阶
order_H = len(H)
number_of_cosets = order_G // order_H      #计算陪集的个数
print(f"陪集的个数: {number_of_cosets}")