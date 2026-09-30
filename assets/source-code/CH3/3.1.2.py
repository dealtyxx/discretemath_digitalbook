from itertools import product, chain
A = {'x', 'y'}
P_A = set()    #计算幂集P(A)
for i in range(len(A) + 1):
    for subset in product(A, repeat=i):
        P_A.add(frozenset(subset))
cartesian_product = set(product(A, P_A))    #计算笛卡儿积A×P(A)
print(cartesian_product)