A = {'a', 'b', 'c', 'd', 'e'}
R1 = {('a', 'b'), ('b', 'c'), ('c', 'd')}
R2 = {('a', 'b'), ('b', 'a'), ('c', 'd'), ('d', 'e')}
def domain(relation):
    return {pair[0] for pair in relation}
def range_set(relation):
    return {pair[1] for pair in relation}
def field(relation):
    return domain(relation).union(range_set(relation))
dom_R1 = domain(R1)      #计算R1
ran_R1 = range_set(R1)
fld_R1 = field(R1)
dom_R2 = domain(R2)      #计算R2
ran_R2 = range_set(R2)
fld_R2 = field(R2)
print("R1:")
print("定义域 dom(R1):", dom_R1)
print("值域 ran(R1):", ran_R1)
print("域 fld(R1):", fld_R1)
print("\nR2:")
print("定义域 dom(R2):", dom_R2)
print("值域 ran(R2):", ran_R2)
print("域 fld(R2):", fld_R2)