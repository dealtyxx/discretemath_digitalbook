Z = list(range(-10, 11))       #整数加法群Z和子群4Z，取一部分整数进行展示
H = {4 * i for i in range(-10, 11)}
cosets = {i % 4 for i in Z}     #计算Z/4Z
print("商群 Z/4Z 的陪集表示为:", cosets)