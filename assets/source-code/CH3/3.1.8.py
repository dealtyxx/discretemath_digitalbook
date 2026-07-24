C = ['T1', 'T2', 'T3', 'T4']    #任务集合C
D = ['E1', 'E2', 'E3', 'E4']    #员工集合D
task_allocation = {        #任务分配情况
    'E1': ['T1', 'T2'],
    'E2': ['T2', 'T3'],
    'E3': ['T4'],
    'E4': ['T4']}
allocation_matrix = [[0] * len(C) for _ in range(len(D))]   #初始化分配矩阵为全0矩阵
for i, employee in enumerate(D):
    for j, task in enumerate(C):
        if task in task_allocation[employee]:
            allocation_matrix[i][j] = 1
for row in allocation_matrix:
    print(row)