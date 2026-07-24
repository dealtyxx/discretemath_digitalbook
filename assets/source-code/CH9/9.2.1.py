def is_closed_under_addition(set_A):
    for a in set_A:
        for b in set_A:
            if (a + b) % 2 != 0:            #不是偶数
                return False
    return True
def is_closed_under_multiplication(set_A):
    for a in set_A:
        for b in set_A:
            if (a * b) % 2 != 0:            #不是偶数
                return False
    return True
A = {x for x in range(0, 100, 2)}             #使用前50个偶数来测试
add_closed = is_closed_under_addition(A)     #检查封闭性
mul_closed = is_closed_under_multiplication(A)
print(f"集合A在加法下是否封闭: {add_closed}")
print(f"集合A在乘法下是否封闭: {mul_closed}")