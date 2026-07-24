A = [1, 2, 3, 4, 5]  # 集合A和二元关系R
R = [(1, 2), (2, 3), (3, 4), (4, 5)]
n = len(A)  # 获取集合A基数

# 初始化关系矩阵MR为n×n的零矩阵
M_R = [[0] * n for _ in range(n)]

# 遍历每个元素
for i in range(n):
    for j in range(n):
        if (A[i], A[j]) in R:  # 检查元素(A[i], A[j])是否在关系R中
            M_R[i][j] = 1  # 若在关系R中，则将对应的矩阵元素设置为1

# 打印矩阵MR
for row in M_R:
    print(row)
