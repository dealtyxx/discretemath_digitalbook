import numpy as np
def transform(x, y, theta, s):     #定义变换函数
    new_x = s * (x * np.cos(np.radians(theta)) - y * np.sin(np.radians(theta)))
    new_y = s * (x * np.sin(np.radians(theta)) + y * np.cos(np.radians(theta)))
    return new_x, new_y
def inverse_transform(x, y, theta, s):     #定义逆变换函数
    new_x = (x * np.cos(np.radians(-theta)) - y * np.sin(np.radians(-theta))) / s
    new_y = (x * np.sin(np.radians(-theta)) + y * np.cos(np.radians(-theta))) / s
    return new_x, new_y
theta = 45    #旋转角度
s = 2     #缩放因子
original_coords = (1, 2)     #原始坐标
transformed_coords = transform(*original_coords, theta, s)      #变换
print("变换后的坐标:", transformed_coords)
restored_coords = inverse_transform(*transformed_coords, theta, s)      #逆变换
print("恢复后的原始坐标:", restored_coords)