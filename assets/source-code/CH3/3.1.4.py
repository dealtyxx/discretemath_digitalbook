A2 = {'m', 'n', 'o'}
B2 = {1, 2, 3, 4}
R2 = {('m', 1), ('n', 2), ('o', 3), ('m', 5)}
is_relation_2 = all(a in A2 and b in B2 for a, b in R2)    #检查关系是否从A到B
print(is_relation_2)