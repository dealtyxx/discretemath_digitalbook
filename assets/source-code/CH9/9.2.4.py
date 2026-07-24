Z2 = [0, 1]                          #定义Z2和Z3的集合
Z3 = [0, 1, 2]
def add_mod_2(a, b):                  #定义运算+2和+3
    return (a + b) % 2
def add_mod_3(a, b):
    return (a + b) % 3
Z2Z3 = [(a, b) for a in Z2 for b in Z3]     #笛卡尔积Z2×Z3
def operation(pair1, pair2):              #定义Z2和Z3上的运算
    i1, i2 = pair1
    j1, j2 = pair2
    return (add_mod_2(i1, j1), add_mod_3(i2, j2))
operation_table = {}                   #生成运算表
for pair1 in Z2Z3:
    operation_table[pair1] = {}
    for pair2 in Z2Z3:
        operation_table[pair1][pair2] = operation(pair1, pair2)
print("运算表:")                      #打印运算表
header = "\t" + "\t".join(str(pair) for pair in Z2Z3)
print(header)
for pair1 in Z2Z3:
    row = str(pair1)
    for pair2 in Z2Z3:
        row += "\t" + str(operation_table[pair1][pair2])
    print(row)