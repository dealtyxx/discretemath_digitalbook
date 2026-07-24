def generate_cyclic_group(g, n):
    return [g * i % n for i in range(n)]
def find_subgroups(n):
    subgroups = []
    for d in range(1, n + 1):
        if n % d == 0:
            subgroups.append(generate_cyclic_group(d, n))
    return subgroups
def is_cyclic_subgroup(subgroup):
    g = subgroup[1]                #除了0以外的第一个元素
    n = len(subgroup)
    return sorted(subgroup) == sorted(generate_cyclic_group(g, n))
#验证一个阶为12的循环群的子群是否也是循环群
n = 12
G = generate_cyclic_group(1, n)
subgroups = find_subgroups(n)
for subgroup in subgroups:
    print(f"子群: {subgroup}")
    is_cyclic = is_cyclic_subgroup(subgroup)
    generator = subgroup[1] if is_cyclic else None
    print(f"是否是循环群: {is_cyclic}, 生成元: {generator}")