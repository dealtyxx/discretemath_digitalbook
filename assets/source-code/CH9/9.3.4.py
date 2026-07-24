import numpy as np
#定义同态映射：实际生产配比问题映射到线性代数问题
#实际问题：生产某产品需要优化两种原材料的配比，以最小化成本并满足质量标准
#数学模型：2x + 3y≤ 20 (质量约束), x + y = 10 (产量约束), minimize z = 5x + 4y (成本函数)
#线性方程组的系数矩阵和常数项向量
A = np.array([[2, 3], [1, 1]])
b = np.array([20, 10])
#成本函数的系数
c = np.array([5, 4])
#求解线性方程组找到最优配比方案
optimal_solution = np.linalg.solve(A, b)
#计算最优方案下的成本
optimal_cost = np.dot(c, optimal_solution)
print("最优配比方案:", optimal_solution)
print("最优成本:", optimal_cost)