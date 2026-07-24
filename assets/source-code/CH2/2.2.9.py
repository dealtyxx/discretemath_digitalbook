A = {'a', 'b', 'c', 'd', 'e'}
A1 = [{'a', 'b', 'c'}, {'d'}]
A2 = [{'a', 'b', 'c'}, {'d', 'e'}]
A3 = [{'a', 'b'}, {'c'}, {'d', 'e'}]
A4 = [set(), {'a'}, {'b'}, {'c'}, {'d'}, {'e'}]
A5 = [set(['a', frozenset({'a'})]), {'b', 'c', 'd', 'e'}]    #用frozenset来构造A5中元素{a}

def is_partition(subsets, original_set):
    if any(len(subset) == 0 for subset in subsets):     #所有子集都非空
        return False
    for i in range(len(subsets)):                   #子集之间不相交
        for j in range(i + 1, len(subsets)):
            if subsets[i].intersection(subsets[j]):
                return False
    all_elements = set().union(*subsets)            #所有子集元素∈原集合
    if not all_elements.issubset(original_set):
        return False
    if all_elements != original_set:                #子集并集为原集合
        return False
    return True
results = {
    "A1": is_partition(A1, A),
    "A2": is_partition(A2, A),
    "A3": is_partition(A3, A),
    "A4": is_partition(A4, A),
    "A5": is_partition(A5, A)
}
print(results)