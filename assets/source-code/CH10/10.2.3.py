from sympy.combinatorics import Permutation, PermutationGroup
G = PermutationGroup([Permutation([1, 0, 2]), Permutation([2, 1, 0])])    #对称群S3
H = PermutationGroup([Permutation([1, 0, 2])])    #子群H
def left_coset(group, subgroup):                 #陪集生成函数
    cosets = []
    for g in group.generate():
        coset = [g * h for h in subgroup.generate()]
        if not any(set(coset) == set(existing) for existing in cosets):
            cosets.append(coset)
    return cosets
cosets = left_coset(G, H)                     #获取G中H的陪集
def encrypt(message, cosets):                  #加密函数
    return cosets[message % len(cosets)][0]     #消息是0到5的整数
def decrypt(cipher, cosets):    #解密函数
    for i, coset in enumerate(cosets):
        if cipher in coset:
            return i
    return None
message = 3                                #示例消息
cipher = encrypt(message, cosets)               #加密过程
print(f"Original message: {message}")
print(f"Encrypted message: {cipher}")
decrypted_message = decrypt(cipher, cosets)      #解密过程
print(f"Decrypted message: {decrypted_message}")