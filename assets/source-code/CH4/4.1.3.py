B = {'a', 'b', 'c', 'd', 'e', 'f'}     #定义集合B和等价关系S
alphabet_position = lambda x: ord(x) - ord('a') + 1     #字母表位置
def equivalence_classes_S(B):    #根据等价关系S划分集合B
    classes = {}
    for x in B:
        class_key = alphabet_position(x) % 3
        if class_key not in classes:
            classes[class_key] = set()
        classes[class_key].add(x)
    return list(classes.values())
quotient_set_S = equivalence_classes_S(B)     #计算集合B关于关系S的商集
print("集合B关于关系S的商集:", quotient_set_S)