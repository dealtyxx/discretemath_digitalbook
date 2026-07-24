def hash_function(s, p, a):
    n = len(s)
    hash_value = 0
    for i in range(n):
        hash_value += ord(s[i]) * a**(n-i-1)
    hash_value = hash_value % p
    return hash_value
p = 997    #一个大素数
a = 31    #一个较小的素数
s = "Hello, world!"    #示例字符串
hash_value = hash_function(s, p, a)
print(f"Hash value of '{s}': {hash_value}")