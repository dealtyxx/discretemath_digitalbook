ancestor_relations = {    #直接祖先关系示例数据
    '祖父': ['父亲'],
    '父亲': ['我'],
    '曾祖父': ['祖父'],
    #可以扩展更多关系
}
#深度优先搜索计算传递闭包，找出所有祖先
def find_ancestors(member, relations, ancestors=None):
    if ancestors is None:
        ancestors = set()
    for ancestor, descendants in relations.items():
        if member in descendants:
            ancestors.add(ancestor)
            find_ancestors(ancestor, relations, ancestors)
    return ancestors
member = '我'
ancestors = find_ancestors(member, ancestor_relations)
print(f"{member}的所有祖先是：{ancestors}")