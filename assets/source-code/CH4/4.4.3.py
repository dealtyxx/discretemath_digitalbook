import numpy as np
import matplotlib.pyplot as plt

# 设置字体以支持中文显示
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 定义函数 f 和 g
def f(x):
    return 2 * x + 3

def g(x):
    return (x - 3) / 2

# 生成 x 的取值范围
x_values = np.linspace(-10, 10, 400)

# 计算函数 f 和 g 的值
f_values = f(x_values)
g_values = g(x_values)

# 绘制函数图像
plt.figure(figsize=(12, 6))
plt.plot(x_values, f_values, label="城市到农村 f(x) = 2x + 3")
plt.plot(x_values, g_values, label="农村到城市 g(x) = (x − 3) / 2")
plt.xlabel("时间（天）")
plt.ylabel("人口流动（万人）")
plt.title("春节人口流动模式")
plt.legend()
plt.grid(True)
plt.show()

# 复合运算分析
x_example = 5
composite_fg = f(g(x_example))
composite_gf = g(f(x_example))
print(f"节后返回城市再返乡的人口数（f(g(5))）: {composite_fg}万人")
print(f"节前返乡再返回城市的人口数（g(f(5))）: {composite_gf}万人")
