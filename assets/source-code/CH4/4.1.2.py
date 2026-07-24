A = {1, 2, 3, 4, 5, 6}     #定义集合A和等价关系R
def equivalence_classes_R(A):     #根据等价关系R划分集合A
    odd_class = {x for x in A if x % 2 != 0}
    even_class = {x for x in A if x % 2 == 0}
    return [odd_class, even_class]
quotient_set_R = equivalence_classes_R(A)    #计算集合A关于关系R的商集
print("集合A关于关系R的商集:", quotient_set_R)