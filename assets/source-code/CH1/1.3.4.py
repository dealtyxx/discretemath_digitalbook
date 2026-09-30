import random
from math import gcd
from sympy import isprime, mod_inverse
def generate_large_prime(keysize):    #生成一个大素数
    while True:
        num = random.getrandbits(keysize)
        num |= (1 << keysize - 1) | 1     #保证位长足够且为奇数
        if isprime(num):
            return num
def generate_keys(keysize):   #生成RSA密钥
    p = generate_large_prime(keysize)    #选择大素数p和q
    q = generate_large_prime(keysize)
    while q == p:    #排除p=q，否则ϕ(n)公式失效
        q = generate_large_prime(keysize)
    n = p * q   #计算n=p*q
    phi_n = (p - 1) * (q - 1)    #计算欧拉函数ϕ(n)=(p−1)*(q−1)
    e = 65537    #选择常用的公钥指数e
    if gcd(e, phi_n) != 1:    #确保e与ϕ(n)互质，不互质则重新生成
        return generate_keys(keysize)
    d = mod_inverse(e, phi_n)    #计算私钥d
    return ((n, e), (n, d))    #返回公钥和私钥
def encrypt(public_key, plaintext):   #加密函数
    n, e = public_key
    cipher = pow(plaintext, e, n)
    return cipher
def decrypt(private_key, ciphertext):    #解密函数
    n, d = private_key
    plain = pow(ciphertext, d, n)
    return plain
keysize = 1024    #密钥大小
public_key, private_key = generate_keys(keysize)    #生成密钥
plaintext = 12345    #明文消息
ciphertext = encrypt(public_key, plaintext)    #加密
print("密文:", ciphertext)
decrypted = decrypt(private_key, ciphertext)    #解密
print("解密后的明文:", decrypted)