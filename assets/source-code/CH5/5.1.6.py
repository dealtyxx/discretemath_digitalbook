def or_operator(p, q):     #构建∨联结词
    return not (not p and not q)
def if_then_operator(p, q):    #构建→联结词
    return not (p and not q)
def if_and_only_if_operator(p, q):    #构建↔联结词
    return (not (p and not q)) and (not (q and not p))
p= True    #测试示例
q= False
result_or = or_operator(p, q)            #∨联结词测试
print("p ∨ q =", result_or)             #输出
result_if_then = if_then_operator(p, q)    #→联结词测试
print("p → q =", result_if_then)         #输出
result_if_and_only_if = if_and_only_if_operator(p, q)     #↔联结词测试
print("p ↔ q =", result_if_and_only_if)    #输出