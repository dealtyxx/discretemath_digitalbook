a = 1 + 2j
b = 3 - 4j
result = a * b
print(f"a · b = {result}")
#验证结果是否在Z[i]中
if result.real.is_integer() and result.imag.is_integer():
    print("The result is in the Gaussian integer ring Z[i].")
else:
    print("The result is not in the Gaussian integer ring Z[i].")
a = 3
b = 5
modulus = 7
result_mod = (a * b) % modulus
print(f"a · b in Z7 = {result_mod}")