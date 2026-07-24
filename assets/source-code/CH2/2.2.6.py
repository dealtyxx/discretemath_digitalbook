A = {1, 2, 3}    #示例集合A, B, C和全集U
B = {3, 4, 5}
C = {5, 6, 7}
U = {1, 2, 3, 4, 5, 6, 7}
A_intersect_not_A = A & (U - A)    #计算各部分
B_intersect_not_B = B & (U - B)    #A∩~A和B∩~B都是空集
C_union_not_C = C | (U - C)       #C∪~C是全集U
A_intersect_B = A & B            #A∩B∩~(A∪B)是空集
not_A_union_B = U - (A | B)
A_intersect_B_intersect_not_A_union_B = A_intersect_B & not_A_union_B
result = A_intersect_not_A | B_intersect_not_B | C_union_not_C | A_intersect_B_intersect_not_A_union_B    #计算最终表达式
print(result)