heritages = {     #遗迹的示例属性
    '长城': {'unique': True, 'in_danger': True, 'unesco_heritage': True},
    '兵马俑': {'unique': True, 'in_danger': False, 'unesco_heritage': True},
    '紫禁城': {'unique': False, 'in_danger': False, 'unesco_heritage': True},
}
def should_protect(name, properties):       #逻辑推理判断函数
    if properties['unique'] and properties['in_danger']:
        return True
    if properties['unesco_heritage']:
        return True
    return False
for heritage, properties in heritages.items():     #应用逻辑推理
    if should_protect(heritage, properties):
        print(f"{heritage}应该优先保护.")