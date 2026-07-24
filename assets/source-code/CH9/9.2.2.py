A = {0, 1}    #定义集合A和B
B = {'a', 'b'}
C = [(a, b) for a in A for b in B]      #笛卡尔积A×B
def operation_on_A(x, y):          #定义运算⊙和○
    return x + y                  #加法
def operation_on_B(x, y):
    return x + y                  #字符串连接
def operation_on_C(pair1, pair2):    #定义A×B上的运算
    a1, b1 = pair1
    a2, b2 = pair2
    return (operation_on_A(a1, a2), operation_on_B(b1, b2))
pair1 = (0, 'a')                    #计算(0, 'a')和(1, 'b')的结果
pair2 = (1, 'b')
result = operation_on_C(pair1, pair2)
print(f"{pair1} * {pair2} = {result}")
print("集合 A × B 的所有元素:")    #输出A×B中所有元素和运算结果示例
for pair in C:
    print(pair)
print("\n运算示例:")
for pair1 in C:
    for pair2 in C:
        result = operation_on_C(pair1, pair2)
        print(f"{pair1} * {pair2} = {result}")