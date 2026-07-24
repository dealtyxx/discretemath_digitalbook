def is_refinement(partition1, partition2):
    for subset2 in partition2:
        if not any(subset2.issubset(subset1) for subset1 in partition1):
            return False
    return True
P1 = [{'a', 'b', 'c'}, {'d', 'e'}]
P2 = [{'a', 'b'}, {'c'}, {'d', 'e'}]
is_P2_refinement_of_P1 = is_refinement(P1, P2)
print(is_P2_refinement_of_P1)