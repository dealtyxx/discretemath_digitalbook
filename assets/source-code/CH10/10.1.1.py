import itertools
S = {1, 2, 3}          #定义集合S
def operation(a, b):     #定义二元运算⊙为模4的乘法
    return (a * b) % 4
def is_closed(S):      #验证封闭性
    for a in S:
        for b in S:
            if operation(a, b) not in S:
                return False
    return True
def is_associative(S):    #验证结合性
    for a, b, c in itertools.product(S, repeat=3):
        if operation(operation(a, b), c) != operation(a, operation(b, c)):
            return False
    return True
def find_identity(S):    #验证单位元
    for e in S:
        if all(operation(e, a) == a and operation(a, e) == a for a in S):
            return e
    return None
is_semigroup = is_closed(S) and is_associative(S)    #检查S是否构成半群
#查找单位元并检查是否构成独异点
identity_element = find_identity(S)
is_monoid = is_semigroup and identity_element is not None
print("S是否构成半群:", is_semigroup)
print("S是否构成独异点:", is_monoid)
if is_monoid:
    print("单位元为:", identity_element)