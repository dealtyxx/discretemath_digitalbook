students = [
    {"name": "李明", "major": "计算机科学", "interests": ["人工智能", "数据科学"], "abilities": ["编码", "数学"]},
    {"name": "张梅梅", "major": "电气工程", "interests": ["机器人", "可再生能源"], "abilities": ["集成电路设计", "数学"]},
    # 更多学生...
]
nation_needs = ["计算机科学", "电气工程", "可再生能源"]
career_paths = {
    ("计算机科学", "人工智能", "编码"): "人工智能研究员",
    ("电气工程", "机器人", "集成电路设计"): "机器人研发工程师",
    # 更多职业路径...
}
def match(major, interests, abilities):
    for need in nation_needs:
        if major == need:
            for interest in interests:
                for ability in abilities:
                    key = (major, interest, ability)
                    if key in career_paths:
                        return career_paths[key]
    return None
def recommend_careers(students):
    recommendations = {}
    for student in students:
        path = match(student['major'], student['interests'], student['abilities'])
        if path:
            recommendations[student['name']] = path
    return recommendations
recommendations = recommend_careers(students)     #运行推荐系统
for name, path in recommendations.items():
    print(f"{name}，建议从事的职业：{path}.")