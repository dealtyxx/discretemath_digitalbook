import numpy as np
import itertools
class LinearCode:
    def __init__(self, p, G):
        self.p = p    #素数p
        self.G = np.array(G)             #生成矩阵
    def encode(self, u):                  #对信息向量u进行编码，生成码字c
        u = np.array(u) % self.p
        c = np.dot(u, self.G) % self.p
        return c
    def hamming_weight(self, vector):     #计算向量的汉明重量
        return np.sum(vector != 0)
    def minimum_distance(self):          #计算线性码的最小距离
        m, n = self.G.shape
        min_distance = n
        for u in itertools.product(range(self.p), repeat=m):    #枚举Z_p^m中全部非零信息向量
            if not any(u):
                continue
            c = self.encode(u)
            weight = self.hamming_weight(c)
            if 0 < weight < min_distance:
                min_distance = weight
        return min_distance
p = 7                                 #模7的整数环上的线性码
G = [[1, 0, 3],
    [2, 1, 6]]
linear_code = LinearCode(p, G)
u = [1, 2]                              #对信息向量进行编码
encoded_message = linear_code.encode(u)
print(f"Encoded message: {encoded_message}")
min_distance = linear_code.minimum_distance()    #计算线性码的最小距离
print(f"Minimum distance: {min_distance}")