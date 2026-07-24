def relation_to_partition(relation):
    partition = []
    for a, b in relation:
        #查找a和b所属的子集
        a_subset = next((subset for subset in partition if a in subset), None)
        b_subset = next((subset for subset in partition if b in subset), None)
        if a_subset and b_subset:
            if a_subset != b_subset:
                a_subset.update(b_subset)     #合并两个子集
                partition.remove(b_subset)
        elif a_subset:         #只有a在某个子集中
            a_subset.add(b)
        elif b_subset:         #只有b在某个子集中
            b_subset.add(a)
        else:   #若a和b都不在现有的任何子集中，则创建新的子集
            partition.append({a, b})
    return [subset for subset in partition if subset]      #移除空的子集
# 定义集合B及其等价关系
relation_S = {('a', 'a'), ('b', 'b'), ('c', 'c'), ('d', 'd'), ('a', 'b'), ('b', 'a'), ('a', 'c'), ('c', 'a'),
              ('c', 'b'), ('b', 'c')}
partition_B = relation_to_partition(relation_S)     #将等价关系转换为划分
print(partition_B)