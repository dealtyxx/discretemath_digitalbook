def is_injective(mapping):
    return len(set(mapping.values())) == len(mapping)
def is_surjective(mapping, B):
    return set(mapping.values()) == set(B)
def is_bijective(mapping, B):
    return is_injective(mapping) and is_surjective(mapping, B)
mapping1 = {1: 'a', 2: 'b', 3: 'c'}
mapping2 = {1: 'a', 2: 'a', 3: 'b'}
B = {'a', 'b', 'c'}
is_bijective_mapping1 = is_bijective(mapping1, B)
is_bijective_mapping2 = is_bijective(mapping2, B)
print(is_bijective_mapping1, is_bijective_mapping2)