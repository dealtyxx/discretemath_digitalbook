A1 = {1, 2, 3, 4}
B1 = {'a', 'b', 'c'}
R1 = {(1, 'a'), (2, 'b'), (3, 'c'), (4, 'a'), (1, 'b')}
is_relation_1 = all(a in A1 and b in B1 for a, b in R1)    #检查关系是否从A到B
print(is_relation_1)