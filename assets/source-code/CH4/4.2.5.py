def is_surjective(mapping, B):
    values = set(mapping.values())
    return values == set(B)
mapping1 = {1: 'a', 2: 'b', 3: 'b'}
mapping2 = {1: 'a', 2: 'a', 3: 'a'}
B = {'a', 'b'}
is_surjective_mapping1 = is_surjective(mapping1, B)
is_surjective_mapping2 = is_surjective(mapping2, B)
print(is_surjective_mapping1, is_surjective_mapping2)