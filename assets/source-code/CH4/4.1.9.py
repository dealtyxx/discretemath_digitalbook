Z10 = list(range(10))
sorted_Z10 = sorted(Z10)     #对Z进行排序
min_element = min(Z10)     #找出最小和最大的元素
max_element = max(Z10)
less_than_five = [x for x in Z10 if x < 5]     #找出所有小于5的元素并排序
print("可能的排列:", sorted_Z10)
print("最小元素:", min_element, "最大元素:", max_element)
print("小于5的元素:", less_than_five)