def logical_and(a, b):                 #定义运算
    return a and b
def addition(x, y):
    return x + y
def operation_on_DE(pair1, pair2):      #定义D×E上的运算
    d1, e1 = pair1
    d2, e2 = pair2
    return (logical_and(d1, d2), addition(e1, e2))
pair1 = (0, -0.5)                      #打印结果示例
pair2 = (1, 0.75)
result = operation_on_DE(pair1, pair2)
print(f"{pair1} * {pair2} = {result}")
D = {0, 1}                          #定义集合D和E的取值范围
E = [-1 + 0.5 * i for i in range(5)]       #生成从−1到1的一些示例值
DE = [(d, e) for d in D for e in E]        #笛卡尔积D×E
print("\n集合 D × E 的所有元素和运算示例:")
for pair1 in DE:
    for pair2 in DE:
        result = operation_on_DE(pair1, pair2)
        print(f"{pair1} * {pair2} = {result}")