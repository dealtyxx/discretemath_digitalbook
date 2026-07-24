A = {'a', 'b'}    #定义三个集合A, B, C
B = {1, 2}
C = {'X', 'Y'}
R_full = {(a, b, c) for a in A for b in B for c in C}    #所有可能的三元关系R