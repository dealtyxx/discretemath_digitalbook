C = {1, 2, 3, 4, 5, 6, 7, 8, 9}
def equivalence_classes_T(C):
    classes = {}
    for x in C:
        class_key = x % 3
        if class_key not in classes:
            classes[class_key] = set()
        classes[class_key].add(x)
    return list(classes.values())
quotient_set_T = equivalence_classes_T(C)
print("集合C关于关系T的商集:", quotient_set_T)