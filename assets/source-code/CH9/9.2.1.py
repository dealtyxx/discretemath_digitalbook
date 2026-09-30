def is_closed_under_addition(set_A):
    for a in set_A:
        for b in set_A:
            if (a + b) % 2 != 0:            #结果不是偶数，即不属于偶数集2Z
                return False
    return True
def is_closed_under_multiplication(set_A):
    for a in set_A:
        for b in set_A:
            if (a * b) % 2 != 0:            #结果不是偶数，即不属于偶数集2Z
                return False
    return True
A = {x for x in range(0, 100, 2)}             #用前50个偶数抽样测试偶数集2Z
add_closed = is_closed_under_addition(A)     #检查封闭性
mul_closed = is_closed_under_multiplication(A)
print(f"偶数集在加法下是否封闭（用A抽样验证）: {add_closed}")
print(f"偶数集在乘法下是否封闭（用A抽样验证）: {mul_closed}")