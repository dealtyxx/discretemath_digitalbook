from itertools import product
#定义集合
E = {'a', 'b', 'c'}
F = {1, 2}
G = {0, 1, 2, 3, 4, 5}
H = {1, 2, 3, 4, 5}
I = {2, 3, 4, 6}
universal_relation_EF = set(product(E, F))    #E×F上的全域关系
identity_relation_G = {(g, g) for g in G}    #题G上的恒等关系
leq_relation_H = {(h1, h2) for h1 in H for h2 in H if h1 <= h2}    #H上的关系
div_relation_I = {(i1, i2) for i1 in I for i2 in I if i2 % i1 == 0}    #I上的关系
print(universal_relation_EF)
print(identity_relation_G)
print(leq_relation_H)
print(div_relation_I)