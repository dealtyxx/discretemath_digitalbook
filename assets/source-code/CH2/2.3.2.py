A = {'芍药', '牡丹', '茶花', '桂花'}
B = {'松', '竹', '梅', '桂花'}
C = {'竹', '黄竹', '苦竹'}
D = {'莲', '荷', '水仙'}
AB_intersection = A.intersection(B)    #同时是花卉和树木类植物的种类
C_unique = C.difference(A.union(B, D))    #园中独有的竹类植物种类
print("同时是花卉和树木类植物的种类:", AB_intersection)
print("园中独有的竹类植物种类:", C_unique)
AB = A.intersection(B)    #至少属于上述三类中的两类的植物种类
AC = A.intersection(C)
AD = A.intersection(D)
ABCD_union = AB.union(AC, AD)
print("(A∩B)∪(A∩C)∪(A∩D):", ABCD_union)
BA = B.intersection(A)
BC = B.intersection(C)
BD = B.intersection(D)
BACD_union = BA.union(BC, BD)
print("(B∩A)∪(B∩C)∪(B∩D):", BACD_union)
CA = C.intersection(A)
CB = C.intersection(B)
CD = C.intersection(D)
CABD_union = CA.union(CB, CD)
print("(C∩A)∪(C∩B)∪(C∩D):", CABD_union)
DA = D.intersection(A)
DB = D.intersection(B)
DC = D.intersection(C)
DABC_union = DA.union(DB, DC)
print("(D∩A)∪(D∩B)∪(D∩C):", DABC_union)