def partition_to_relation(partition):
    relation = set()
    for subset in partition:
        for element in subset:
            for other_element in subset:
                relation.add((element, other_element))
    return relation
partition_A = [{1, 2}, {3, 4}]
relation_R = partition_to_relation(partition_A)
print(relation_R)