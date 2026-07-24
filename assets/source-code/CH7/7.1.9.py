degrees_4 = [2, 4, 5, 1, 3]
#计算奇数度顶点的数量
odd_degrees_4 = len([deg for deg in degrees_4 if deg % 2 != 0])
print(odd_degrees_4)