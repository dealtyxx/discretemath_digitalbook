def is_injective(mapping):
    values = list(mapping.values())
    return len(values) == len(set(values))
mapping1 = {1: 'a', 2: 'b', 3: 'c', 4: 'd'}  #函数①
mapping2 = {1: 'a', 2: 'a', 3: 'b', 4: 'c'}  #函数②
is_injective_mapping1 = is_injective(mapping1)     #检查函数是否是单射
is_injective_mapping2 = is_injective(mapping2)
print(is_injective_mapping1, is_injective_mapping2)