party_members = {'张三', '李四', '王五'}    #积极分子名单
attended_residents = {'张三', '王五', '赵六', '孙七'}    #参与清洁活动的居民名单
P = set(party_members)
A = set(attended_residents)
active_party_members = P.intersection(A)
total_participation = P.union(A)    #总参与人数
party_member_contribution = len(active_party_members) / len(A) * 100    #贡献率
print(f"实际参与活动的积极分子有：{active_party_members}")
print(f"活动的总参与人数为：{len(total_participation)}")
print(f"积极分子对活动参与度的贡献率为：{party_member_contribution:.2f}%")