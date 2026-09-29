D = ["张伟", "李娜", "王五", "小白"]       #个体域D，小白是一只猫
a = "王五"                                #个体常元a代表王五
people = {"张伟", "李娜", "王五"}
age = {"张伟": 20, "李娜": 22, "王五": 19, "小白": 3}
gifts = {("张伟", "李娜", "书")}
projects = {"离散数学课程设计": {"张伟", "李娜"}}
def P(x):             #一元谓词P(x)：x是一个人
    return x in people
def R(x, y):          #二元谓词R(x,y)：x比y大
    return age[x] > age[y]
def S(x, y, z):       #三元谓词S(x,y,z)：x给y送了z
    return (x, y, z) in gifts
def C(x, y):          #二元谓词C(x,y)：x和y共同参与项目
    return any(x in members and y in members for members in projects.values())
print(P(a), P("小白"))             #个体常元代入谓词得到命题
print(R("李娜", "张伟"))
print(S("张伟", "李娜", "书"))
print(C("张伟", "李娜"))           #例6.1.2 C(ZW,LN)
for x in D:                        #个体变元x遍历个体域
    print(f"P({x}) = {P(x)}")
