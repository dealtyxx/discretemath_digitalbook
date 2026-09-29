students = ["王芳", "刘洋", "赵磊"]
courses = ["离散数学", "数据结构", "操作系统"]
sports = ["篮球", "羽毛球"]             #y的取值范围：体育活动
cultures = ["合唱团", "话剧社"]         #z的取值范围：文化活动
join = {("王芳", "篮球"), ("赵磊", "羽毛球"), ("刘洋", "合唱团")}
takes = {("王芳", "离散数学"), ("刘洋", "数据结构"), ("赵磊", "操作系统"), ("赵磊", "离散数学")}
T = lambda x, y: (x, y) in join        #T(x,y)：x参加体育活动y
C = lambda x, z: (x, z) in join        #C(x,z)：x参加文化活动z
L = lambda x, y: (x, y) in takes       #L(x,y)：学生x选修课程y
#例6.1.4 ∀x(S(x)→(∃yT(x,y)∨∃zC(x,z)))，x取遍全体学生
print(all(any(T(x, y) for y in sports) or any(C(x, z) for z in cultures) for x in students))
#每个学生至少选一门课：∀x∃yL(x,y)
print(all(any(L(x, y) for y in courses) for x in students))
#每门课至少有一人选：∀y∃xL(x,y)
print(all(any(L(x, y) for x in students) for y in courses))
#有学生选了所有课：∃x∀yL(x,y)，交换量词次序后含义不同
print(any(all(L(x, y) for y in courses) for x in students))
