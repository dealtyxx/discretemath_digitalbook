S = {1, 2, 3}    #定义集合S和关系R
R = {(1, 1), (2, 2), (3, 3), (1, 2), (2, 1), (2, 3), (3, 2)}
reflexive = all((x, x) in R for x in S)    #检查自反性
symmetric = all((y, x) in R for x, y in R if (x, y) in R)    #检查对称性
print(reflexive, symmetric)