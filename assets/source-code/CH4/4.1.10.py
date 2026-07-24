def generate_W(n):    #生成集合W的函数
    return [2**i - 1 for i in range(1, n+1)]
W_first_five = generate_W(10)    #生成集合W的前十个元素
print("集合W的前五个元素:", W_first_five)
W_less_than_32 = [x for x in generate_W(10) if x < 64]    #W中小于64的所有元素
print("集合W中小于64的所有元素:", W_less_than_32)