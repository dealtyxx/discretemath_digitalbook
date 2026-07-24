def is_function(A, B, R):     #一个函数来检查一个关系是否是一个函数
    for a in A:     #检查每个A中的元素是否在R中有唯一的对应
        found = False
        for r in R:
            if r[0] == a:
                if found:     #若已经找到对应关系，则存在多个对应关系
                    return False
                found = True
        if not found:      #若没有找到对应关系，则A中的某些元素没有对应
            return False
    return True
A = {1, 2, 3}
B = {'a', 'b', 'c'}
R1 = {(1, 'a'), (2, 'b'), (3, 'c')}
R2 = {(1, 'a'), (2, 'a'), (3, 'b'),(3, 'c')}
R3 = {(1, 'a'), (2, 'b')}
is_function_1 = is_function(A, B, R1)       #检查关系是否是函数
is_function_2 = is_function(A, B, R2)
is_function_3 = is_function(A, B, R3)
print(is_function_1, is_function_2, is_function_3)