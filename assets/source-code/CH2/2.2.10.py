def cross_partition(partition1, partition2):
    result = set()
    for subset1 in partition1:
        for subset2 in partition2:
            intersection = subset1.intersection(subset2)
            if intersection:
                result.add(frozenset(intersection))
    return result
# ---------- 示例（1）：字符集 ----------
A = {'a', 'b', 'c', 'd', 'e'}
A2 = [{'a', 'b', 'c'}, {'d', 'e'}]
A3 = [{'a', 'b'}, {'c'}, {'d', 'e'}]
cross_part1 = cross_partition(A2, A3)
print("交叉划分（字符集）:")
print([set(s) for s in cross_part1])
# ---------- 示例（2）：数字集 ----------
P1 = [{1, 2}, {3, 4}]
P2 = [{1, 3}, {2, 4}]
cross_part2 = cross_partition(P1, P2)
print("交叉划分（数字集）:")
print([set(s) for s in cross_part2])