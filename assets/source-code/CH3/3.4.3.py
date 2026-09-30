person_to_works = {     #示例数据准备
    '柳宗元': ['小石潭记'],
    '范仲淹': ['岳阳楼记']}
works_to_places = {
    '小石潭记': ['石潭'],
    '岳阳楼记': ['岳阳楼']}
def find_works_by_person(person):     #查询功能实现
    return person_to_works.get(person, [])
def find_places_by_work(work):
    return works_to_places.get(work, [])
def find_places_by_person(person):
    works = find_works_by_person(person)
    places = set()
    for work in works:
        places.update(find_places_by_work(work))
    return places
person = '柳宗元'    #测试查询功能
print(f"{person}的作品包括：{find_works_by_person(person)}")
work = '小石潭记'
print(f"{work}描述的地理景点包括：{find_places_by_work(work)}")
print(f"通过作品间接关联的地理景点包括：{find_places_by_person(person)}")