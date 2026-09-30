PRIM = 0x11D                           #GF(2^8)的本原多项式x^8+x^4+x^3+x^2+1
def gf_mul(a, b):                      #GF(2^8)乘法：移位异或并模PRIM约化
    p = 0
    for _ in range(8):
        if b & 1: p ^= a
        hi = a & 0x80
        a = (a << 1) & 0xFF
        if hi: a ^= PRIM & 0xFF
        b >>= 1
    return p
def poly_mul(p, q):                    #GF(2^8)上多项式乘法（加法即异或）
    out = [0] * (len(p) + len(q) - 1)
    for i, x in enumerate(p):
        for j, y in enumerate(q): out[i + j] ^= gf_mul(x, y)
    return out
class ReedSolomon:
    def __init__(self, n, k):
        self.n = n                     #码字长度
        self.k = k                     #信息长度
        self.field = self.generate_galois_field()
        self.generator_poly = self.generate_generator_poly()
    def generate_galois_field(self):       #生成有限域GF(2^8)的乘法循环群：field[i]=α^i（α=2）
        field = [1]
        for i in range(254):
            field.append(gf_mul(field[-1], 2))
        return field
    def generate_generator_poly(self):     #生成多项式g(x)=∏(x-α^i)，i=0..n-k-1（特征2中减即加）
        g = [1]
        for i in range(self.n - self.k):
            g = poly_mul(g, [1, self.field[i]])
        return g
    def encode(self, message):             #系统码：余式r(x)=m(x)x^(n-k) mod g(x)，码字=m(x)x^(n-k)+r(x)
        rem = list(message) + [0] * (self.n - self.k)
        for i in range(len(message)):      #GF(2^8)上的多项式长除法（g首项系数为1）
            coef = rem[i]
            if coef != 0:
                for j in range(1, len(self.generator_poly)):
                    rem[i + j] ^= gf_mul(self.generator_poly[j], coef)
        return list(message) + rem[len(message):]
    def decode(self, codeword):
        #简单的误差检测：伴随式S_i=c(α^i)全为0说明无错（示例中未实现复杂的纠错算法）
        syndromes = []
        for i in range(self.n - self.k):
            s = 0
            for c in codeword: s = gf_mul(s, self.field[i]) ^ c
            syndromes.append(s)
        print(f"No error detected: {not any(syndromes)}")
        return codeword[:self.k]
if __name__ == "__main__":     #使用Reed-Solomon码进行编码和解码
    rs = ReedSolomon(n=255, k=223)
    message = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]    #示例消息
    encoded_message = rs.encode(message)
    print(f"Encoded message: {encoded_message}")
    decoded_message = rs.decode(encoded_message)
    print(f"Decoded message: {decoded_message[:len(message)]}")