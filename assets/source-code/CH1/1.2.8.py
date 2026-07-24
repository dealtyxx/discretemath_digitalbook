def euclidean_algorithm(a, b):
    a = abs(a)
    b = abs(b)
    while b != 0:
        remainder = a % b
        a = b
        b = remainder
    return a
num1 = -48
num2 = 18
gcd = euclidean_algorithm(num1, num2)    #计算最大公因数
print(f"{abs(num1)} 和 {abs(num2)} 的最大公因数是 {gcd}")