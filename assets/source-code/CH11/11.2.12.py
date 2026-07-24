class PowerSet:
    def __init__(self, universe, elements):
        self.universe = universe
        if not all(elem in universe for elem in elements):
            raise ValueError("All elements must be in the universe")
        self.elements = set(elements)
    def __or__(self, other):
        return PowerSet(self.universe, self.elements | other.elements)
    def __and__(self, other):
        return PowerSet(self.universe, self.elements & other.elements)
    def __invert__(self):
        return PowerSet(self.universe, self.universe - self.elements)
    def __eq__(self, other):
        return self.elements == other.elements
    def __repr__(self):
        return str(self.elements)
universe = {1, 2, 3, 4}
a = PowerSet(universe, {1, 2})
b = PowerSet(universe, {2, 3})
print(a | b)
print(a & b)
print(~a)
print(~b)