import matplotlib.pyplot as plt
import numpy as np
num_stars = 1000     #天体的数量
obs_radius = 1     #可观测宇宙的半径
#生成星星的位置
np.random.seed(0)     #为了结果的可重复性
stars_x = np.random.uniform(-1.5, 1.5, num_stars)
stars_y = np.random.uniform(-1.5, 1.5, num_stars)
plt.figure(figsize=(8, 8))    #绘制所有天体
plt.scatter(stars_x, stars_y, s=1, color='k', label='Stars in the Universe')
circle = plt.Circle((0, 0), obs_radius, color='r', fill=False, linewidth=2, label='Observable Universe')      #绘制可观测宇宙的边界
plt.gca().add_patch(circle)
plt.xlim(-1.5, 1.5)
plt.ylim(-1.5, 1.5)
plt.legend()
plt.title('A Simplified Model of the Observable Universe')
plt.xlabel('Distance from Earth')
plt.ylabel('Distance from Earth')
plt.gca().set_aspect('equal', adjustable='box')
plt.show()