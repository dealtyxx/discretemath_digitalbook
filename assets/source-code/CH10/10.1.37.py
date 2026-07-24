def phi(n):                     #定义同态映射φ:Z→Z6
    return n % 6
def kernel_phi():                 #计算同态映射φ的核
    kernel = [n for n in range(-100, 101) if phi(n) == 0]
    return kernel
Z = list(range(-100, 101))         #定义Z和Z6
Z6 = list(range(6))
image_phi = {phi(n) for n in Z}    #计算同态映射的像
kernel = kernel_phi()    #输出同态映射的核和像
print(f"同态映射 φ 的核: {kernel[:10]}...")     #仅显示前10个元素
print(f"同态映射 φ 的像: {image_phi}")
def coset_representatives(n):          #验证同态基本定理：Z/6Z是否同构于Z6
    return [i for i in range(n)]
cosets = [coset_representatives(6)]
print("\n商群 Z/6Z 的陪集:")
for i in range(6):
    coset = [(i + 6 * k) for k in range(-3, 4)]
    print(f"{i} + 6Z: {coset}")
Z6 = list(range(6))                    #验证Z/6Z与Z6是否同构
Z_mod_6 = [n % 6 for n in range(-18, 19)]
print("\nZ/6Z 是否同构于 Z6:")
print(f"Z6: {Z6}")
print(f"Z/6Z: {Z_mod_6[:6]}")          #仅显示前6个元素
print("同构" if Z_mod_6[:6] == Z6 else "不同构")