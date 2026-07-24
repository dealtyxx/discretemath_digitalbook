from sympy import mod_inverse
class HomomorphicEncryption:
    def __init__(self, n, m, k):
        self.n = n                      #明文环的模数
        self.m = m                     #密文环的模数
        self.k = k                      #密钥
        self.k_inv = mod_inverse(k, m)    #计算密钥的逆元
    def encrypt(self, message):
        return (message * self.k) % self.m
    def decrypt(self, ciphertext):
        return (ciphertext * self.k_inv) % self.m
    def add(self, ciphertext1, ciphertext2):
        return (ciphertext1 + ciphertext2) % self.m
if __name__ == "__main__":              #使用同态加密进行加密和解密
    n = 10                            #明文环的模数（示例值）
    m = 17                           #密文环的模数（示例值）
    k = 3                             #密钥（与m互素）
    he = HomomorphicEncryption(n, m, k)
    message1 = 7
    message2 = 4
    ciphertext1 = he.encrypt(message1)
    ciphertext2 = he.encrypt(message2)
    print(f"Ciphertext1: {ciphertext1}")
    print(f"Ciphertext2: {ciphertext2}")
    encrypted_sum = he.add(ciphertext1, ciphertext2)
    decrypted_sum = he.decrypt(encrypted_sum)
    print(f"Encrypted Sum: {encrypted_sum}")
    print(f"Decrypted Sum: {decrypted_sum}")