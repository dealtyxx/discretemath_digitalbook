def absorption_law(A, B):
    A_and_B = A and B
    addition_absorption = (A or A_and_B) == A         #验证加法吸收律
    A_or_B = A or B   # 计算A与B的逻辑或
    multiplication_absorption = (A and A_or_B) == A    #验证乘法吸收律
    return addition_absorption, multiplication_absorption
A = True
B = False
result = absorption_law(A, B)
print(f"加法吸收律验证结果：{result[0]}")
print(f"乘法吸收律验证结果：{result[1]}")