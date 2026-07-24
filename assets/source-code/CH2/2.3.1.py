A = {1, 2, 3, 4, 5}
B = {3, 4, 5, 6, 7}
C = {5, 6, 7, 8, 9}
AB_intersection = A.intersection(B)
ABC_union = A.union(B, C)
A_diff_BC = A.difference(B.union(C))
print("同时参与赏月和吃月饼的人群:", AB_intersection)
print("参与至少一种活动的所有人群:", ABC_union)
print("只参与赏月但不吃月饼也不提灯笼的人群:", A_diff_BC)