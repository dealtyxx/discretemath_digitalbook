class KleinGroup:
    def __init__(self):
        self.elements = ['e', 'a', 'b', 'c']
        self.operation_table = {
            ('e', 'e'): 'e', ('e', 'a'): 'a', ('e', 'b'): 'b', ('e', 'c'): 'c',
            ('a', 'e'): 'a', ('a', 'a'): 'e', ('a', 'b'): 'c', ('a', 'c'): 'b',
            ('b', 'e'): 'b', ('b', 'a'): 'c', ('b', 'b'): 'e', ('b', 'c'): 'a',
            ('c', 'e'): 'c', ('c', 'a'): 'b', ('c', 'b'): 'a', ('c', 'c'): 'e'}
    def operate(self, x, y):
        return self.operation_table[(x, y)]
    def is_group(self):
        for x in self.elements:             #检查封闭性
            for y in self.elements:
                if self.operate(x, y) not in self.elements:
                    return False
        for x in self.elements:             #检查结合律
            for y in self.elements:
                for z in self.elements:
                    if self.operate(self.operate(x, y), z) != self.operate(x, self.operate(y, z)):
                        return False
        for x in self.elements:             #检查单位元
            if self.operate('e', x) != x or self.operate(x, 'e') != x:
                return False
        for x in self.elements:             #检查可逆元
            if self.operate(x, x) != 'e':
                return False
        return True
klein_group = KleinGroup()
print("Klein对于*运算是群吗?", klein_group.is_group())