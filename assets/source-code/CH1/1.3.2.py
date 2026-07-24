a = 1664525    #定义线性同余生成器的参数
c = 1013904223
m = 2**32
seed = 12345    #初始种子
def linear_congruential_generator(a, c, m, seed, n):    #生成随机数序列的函数
    random_numbers = []
    x = seed
    for _ in range(n):
        x = (a * x + c) % m
        random_numbers.append(x)
    return random_numbers
n_numbers = 5    #生成序列的前5个元素
sequence = linear_congruential_generator(a, c, m, seed, n_numbers)
print(sequence)