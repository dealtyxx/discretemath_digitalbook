#示例数据：职业关系图，0表示无直接关系，1表示有直接发展关系
jobs = ["学生", "实习", "初级职位", "中级职位", "高级职位"]
relations = [
    [0, 1, 0, 0, 0],     #学生−>实习
    [0, 0, 1, 0, 0],     #实习−>初级职位
    [0, 0, 0, 1, 0],     #初级职位−>中级职位
    [0, 0, 0, 0, 1],     #中级职位−>高级职位
    [0, 0, 0, 0, 0]     #高级职位
]
def floyd_warshall(closure):     #Floyd−Warshall算法（详见本书7.2.3）
    n = len(closure)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                closure[i][j] = closure[i][j] or (closure[i][k] and closure[k][j])
    return closure
closure = floyd_warshall(relations)    #计算传递闭包
print("职业发展路径传递闭包：")    #输出传递闭包结果
for i in range(len(jobs)):
    print(f"从{jobs[i]}可以发展到：", end=' ')
    for j in range(len(jobs)):
        if closure[i][j]:
            print(jobs[j], end=', ')
    print('\n')