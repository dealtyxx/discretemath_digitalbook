def homomorphism_kernel_Z_to_Zn(n):
    def phi(a):
        return a % n
    kernel = [a for a in range(-n * 2, n * 2 + 1) if phi(a) == 0]    #核
    return kernel
kernel_Z_to_Z5 = homomorphism_kernel_Z_to_Zn(5)    #验证从Z到Z5的同态核
print(f"从Z到Z_5的同态核: {kernel_Z_to_Z5}")