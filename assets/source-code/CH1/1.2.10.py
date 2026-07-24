def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
def lcm(a, b):
    if a == 0 or b == 0:    #当其中一个数为0时，它们的lcm为0
        return 0
    return abs(a * b) //gcd(a, b)
num1 = 12
num2 = 15
lcm_result = lcm(num1, num2)    #计算最小公倍数
print(f"{num1} 和 {num2} 的最小公倍数是 {lcm_result}")