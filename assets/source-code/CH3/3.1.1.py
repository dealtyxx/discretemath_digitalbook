from itertools import product
A1 = {1, 2}
B1 = {'a', 'b'}
A2 = {1, 2}
B2 = set()      #空集
A3 = {'x', 'y'}
A4 = {1}
B4 = {'x', 'y'}
C4 = {True, False}
cartesian_product_1 = set(product(A1, B1))     #计算集合的笛卡尔积
cartesian_product_2 = set(product(A2, B2))
cartesian_product_3 = set(product(A3, A3))
cartesian_product_4 = set(product(A4, B4, C4))
print(cartesian_product_1)
print(cartesian_product_2)
print(cartesian_product_3)
print(cartesian_product_4)