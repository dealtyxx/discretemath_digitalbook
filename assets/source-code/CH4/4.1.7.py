P = {'a', 'b', 'c', 'd', 'e'}     #偏序集P
poset_relations = {('a', 'b'), ('b', 'c'), ('c', 'd'), ('d', 'e'), ('a', 'd'), ('b', 'e')}     #偏序关系
def find_predecessors_and_successors(P, relations):    #找出所有元素的前驱和后继
    predecessors = {x: set() for x in P}
    successors = {x: set() for x in P}
    for x, y in relations:
        successors[x].add(y)
        predecessors[y].add(x)
    return predecessors, successors
predecessors, successors = find_predecessors_and_successors(P, poset_relations)
def find_extreme_elements(P, predecessors, successors):     #找出极小元和极大元
    mini_elements = {x for x in P if not predecessors[x]}
    max_elements = {x for x in P if not successors[x]}
    return mini_elements, max_elements
mini_elements, max_elements = find_extreme_elements(P, predecessors, successors)
def find_mini_max_elements(mini_elements, max_elements):  #找出最小元和最大元
    mini_element = None
    max_element = None
    if len(mini_elements) == 1:
        mini_element = next(iter(mini_elements))
    if len(max_elements) == 1:
        max_element = next(iter(max_elements))
    return mini_element, max_element
mini_element, max_element = find_mini_max_elements(mini_elements, max_elements)
print("极小元:", mini_elements)
print("极大元:", max_elements)
print("最小元:", mini_element)
print("最大元:", max_element)