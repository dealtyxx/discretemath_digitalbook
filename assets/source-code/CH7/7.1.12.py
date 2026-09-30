s1 = [4, 3, 3, 3, 2]
s2 = [5, 4, 3, 2, 2, 1]
s3 = [3,3,2,2,2]
s4 = [6,4,4,2,2,1,1]
def is_graphical(s):
    return sum(s) % 2 == 0
is_g1 = is_graphical(s1)
is_g2 = is_graphical(s2)
is_g3 = is_graphical(s3)
is_g4 = is_graphical(s4)
print(is_g1,is_g2,is_g3,is_g4)