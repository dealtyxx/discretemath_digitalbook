def homomorphism_kernel_Z_to_Z3():
    def phi(a):
        return a % 3
    kernel = [a for a in range(-10, 11) if phi(a) == 0]    #核
    return kernel
kernel_Z_to_Z3 = homomorphism_kernel_Z_to_Z3()
print(f"从Z到Z_3的同态核: {kernel_Z_to_Z3}")