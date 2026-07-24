heritages = {     #定义遗迹的示例属性
    '长城': {
        'unique': True, 'in_danger': True, 'historical_value': 'high',
        'cultural_influence': 'high', 'economic_condition': 'good',
        'protection_cost': 'low', 'potential_benefit': 'high'
    },
    '兵马俑': {
            'unique': True, 'in_danger': False, 'historical_value': 'high',
            'cultural_influence': 'high', 'economic_condition': 'good',
            'protection_cost': 'low', 'potential_benefit': 'high'
        },
    '紫禁城': {
            'unique': False, 'in_danger': False, 'historical_value': 'high',
            'cultural_influence': 'high', 'economic_condition': 'bad',
            'protection_cost': 'high', 'potential_benefit': 'high'
        }
}
def recommend_for_protection(name, properties):      #逻辑判断函数
    unique_and_danger = properties['unique'] and properties['in_danger']
    high_value_and_influence = properties['historical_value'] == 'high' and properties['cultural_influence'] == 'high'
    economic_and_cost_benefit = (properties['economic_condition'] == 'good' and
                                 properties['protection_cost'] == 'low' and
                                 properties['potential_benefit'] == 'high')
    if unique_and_danger or high_value_and_influence or economic_and_cost_benefit:
        return True
    return False
for heritage, properties in heritages.items():   #应用逻辑判断
    if recommend_for_protection(heritage, properties):
        print(f"{heritage} 建议优先保护.")