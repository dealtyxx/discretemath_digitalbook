class DistributiveLattice:
    def __init__(self, elements, meet, join):
        self.elements = elements
        self.meet = meet
        self.join = join
    def is_distributive(self):
        return all(
            self.meet(a, self.join(b, c)) == self.join(self.meet(a, b), self.meet(a, c)) and
            self.join(a, self.meet(b, c)) == self.meet(self.join(a, b), self.join(a, c))
            for a in self.elements for b in self.elements for c in self.elements
        )
#定义集合S={a,b}的幂集P(S)
elements = [frozenset(), frozenset({'a'}), frozenset({'b'}), frozenset({'a', 'b'})]
def meet(x, y):                                   #定义交和并运算
    return x & y
def join(x, y):
    return x | y
lattice = DistributiveLattice(elements, meet, join)       #幂集的格实例
print("Is distributive lattice:", lattice.is_distributive())    #验证是否是分配格