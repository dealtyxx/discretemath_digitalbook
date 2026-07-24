researchers = {'张三', '李四', '王五', '赵六', '孙七'}    #科研团队成员列表
developers = {'王五', '孙七', '周八'}    #开发人员列表
tested_researchers = {'张三', '王五'}    #已参与测试的人员列表
R = set(researchers)
D = set(developers)
T = set(tested_researchers)
untested_researchers = R - T    #计算未参与测试的科研人员群体
developer_impact = D & R     #分析开发人员覆盖的科研人员群体
untested_uncovered_researchers = R - (D | T)     #优化查询未被覆盖的科研人员
print("未参与测试的科研人员群体:", untested_researchers)
print("开发人员覆盖的科研人员群体:", developer_impact)
print("未被覆盖的未参与测试的科研人员群体:", untested_uncovered_researchers)