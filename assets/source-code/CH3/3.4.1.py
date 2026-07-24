activities_organizers = {    #示例数据
    '环保': '绿色协会',
    '助学': '教育基金会',
    '敬老': '慈善组织'
}
residents_activities = {
    '张三': ['环保', '助学'],
    '李四': ['环保'],
    '王五': ['助学', '敬老']
}
def find_organizer(activity):    #通过活动找组织者（逆运算）
    return activities_organizers.get(activity, "未知组织")
def find_participants(activity):    #通过活动找参与居民（逆运算）
    return [resident for resident, acts in residents_activities.items() if activity in acts]
#通过组织者找参与所有相关活动的居民（复合运算）
def find_participants_by_organizer(organizer):
    related_activities = [act for act, org in activities_organizers.items() if org == organizer]
    participants = set()
    for act in related_activities:
        participants.update(find_participants(act))
    return participants
print("环保活动的组织者是：", find_organizer('环保'))
print("参与环保活动的居民有：", find_participants('环保'))
print("由教育基金会组织的活动的参与居民有：", find_participants_by_organizer('教育基金会'))