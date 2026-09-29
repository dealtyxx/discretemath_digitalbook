D = [      #个体域：校园中的个体
    {"name": "王芳", "person": True, "student": True, "study": True, "eco": False},
    {"name": "刘洋", "person": True, "student": True, "study": True, "eco": True},
    {"name": "陈老师", "person": True, "student": False, "study": False, "eco": True},
    {"name": "校园猫", "person": False, "student": False, "study": False, "eco": False},
]
P = lambda x: x["person"]      #P(x)：x是人
S = lambda x: x["student"]     #S(x)：x是学生
E = lambda x: x["study"]       #E(x)：x努力学习
C = lambda x: x["eco"]         #C(x)：x对环保有贡献
implies = lambda p, q: (not p) or q     #蕴含p→q
#所有学生都应努力学习：∀x(S(x)→E(x))
print(all(implies(S(x), E(x)) for x in D))
#错误写法∀x(S(x)∧E(x))：断言个体域中人人都是学生且努力学习
print(all(S(x) and E(x) for x in D))
#有些人对环保有贡献：∃x(P(x)∧C(x))
print(any(P(x) and C(x) for x in D))
#错误写法∃x(P(x)→C(x))：即使没有人对环保有贡献，只要存在非人个体就为真
nobody = lambda x: False
print(any(implies(P(x), nobody(x)) for x in D))
