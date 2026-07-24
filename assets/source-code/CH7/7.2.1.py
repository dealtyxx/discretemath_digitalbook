from math import comb, factorial
cycles_k3_with_labels = factorial(3)     #3个顶点的所有排列数
print(cycles_k3_with_labels)
cycles_length_3_k4 = comb(4, 3) * factorial(3)
cycles_length_4_k4 = factorial(4)       #长度为4的圈的排列数
total_cycles_k4 = cycles_length_3_k4 + cycles_length_4_k4      #总圈数
print(total_cycles_k4)