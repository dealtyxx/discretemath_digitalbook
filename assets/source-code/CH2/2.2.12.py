# 定义集合与子集集合
A = {1, 2, 3, 4, 5}
S = [{1, 2}, {2, 3, 4}, {4, 5}]
B = {'a', 'b', 'c', 'd', 'e'}
T = [{'a', 'b'}, {'c'}, {'d', 'e'}]
C = {1, 2, 3}
U = [{1, 2}, {2, 3}]

# 检查是否为覆盖
def is_cover(base_set, subset_collection):
    union_set = set().union(*subset_collection)
    return union_set == base_set
# 检查是否为完全覆盖（覆盖 + 无交集 + 无包含关系）
def is_exact_cover_new(base_set, subset_c):
    if not is_cover(base_set, subset_c):
        return False
    # 检查子集间是否有交集
    for i in range(len(subset_c)):
        for j in range(i + 1, len(subset_c)):
            if subset_c[i] & subset_c[j]:  # 有交集
                return False
    return True
is_cover_A = is_cover(A, S)
is_exact_cover_A = is_exact_cover_new(A, S)
is_cover_B = is_cover(B, T)
is_exact_cover_B = is_exact_cover_new(B, T)
is_cover_C = is_cover(C, U)
is_exact_cover_C = is_exact_cover_new(C, U)
print("集合S是否覆盖A：", is_cover_A)
print("集合S是否完全覆盖A：", is_exact_cover_A)
print("集合T是否覆盖B：", is_cover_B)
print("集合T是否完全覆盖B：", is_exact_cover_B)

print("集合U是否覆盖C：", is_cover_C)
print("集合U是否完全覆盖C：", is_exact_cover_C)