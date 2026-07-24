import numpy as np
operation_table = {                                     #运算表
    'a': {'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd'},
    'b': {'a': 'b', 'b': 'a', 'c': 'd', 'd': 'c'},
    'c': {'a': 'c', 'b': 'd', 'c': 'b', 'd': 'a'},
    'd': {'a': 'd', 'b': 'c', 'c': 'a', 'd': 'b'}}
def is_cyclic_group(group_elements, operation_table):         #是否为循环群
    def generate_from(element):
        generated = {element}
        current = element
        while True:
            current = operation_table[current][element]
            if current in generated:
                break
            generated.add(current)
        return generated
    for element in group_elements:
        if len(generate_from(element)) == len(group_elements):
            return True
    return False
group_elements = ['a', 'b', 'c', 'd']                            #群元素
is_cyclic = is_cyclic_group(group_elements, operation_table)    #是否为循环群
print(is_cyclic)