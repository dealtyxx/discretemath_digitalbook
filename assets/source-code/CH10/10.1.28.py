def find_fixed_points(permutation):
    fixed_points = []
    for i, value in enumerate(permutation, start=1):
        if value == i:
            fixed_points.append(i)
    return fixed_points
perm1 = [3, 1, 2]
perm2 = [2, 1, 4, 3]
perm3 = [2, 1, 3, 4]
fixed_points1 = find_fixed_points(perm1)          #找出置换的所有不动点
fixed_points2 = find_fixed_points(perm2)
fixed_points3 = find_fixed_points(perm3)
print(f"置换 {perm1} 的不动点: {fixed_points1}")
print(f"置换 {perm2} 的不动点: {fixed_points2}")
print(f"置换 {perm3} 的不动点: {fixed_points3}")