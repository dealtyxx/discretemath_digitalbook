class BooleanAlgebra:
    def __init__(self, elements, and_op, or_op, not_op):
        self.elements = elements
        self.and_op = and_op
        self.or_op = or_op
        self.not_op = not_op
    def is_boolean_algebra(self):
        for a in self.elements:
            for b in self.elements:
                for c in self.elements:
                    if not (self.and_op(a, b) == self.and_op(b, a) and
                            self.or_op(a, b) == self.or_op(b, a) and
                            self.and_op(a, self.and_op(b, c)) == self.and_op(self.and_op(a, b), c) and
                            self.or_op(a, self.or_op(b, c)) == self.or_op(self.or_op(a, b), c) and
                            self.and_op(a, self.or_op(b, c)) == self.or_op(self.and_op(a, b), self.and_op(a, c)) and
                            self.or_op(a, self.and_op(b, c)) == self.and_op(self.or_op(a, b), self.or_op(a, c))):
                        return False
            if not (self.and_op(a, self.not_op(a)) == 0 and self.or_op(a, self.not_op(a)) == 1):
                return False
        return True
elements = [0, 1]               #定义布尔代数{0, 1}
def and_op(x, y):               #定义与、或和非运算
    return x & y
def or_op(x, y):
    return x | y
def not_op(x):
    return 1 - x
boolean_algebra = BooleanAlgebra(elements, and_op, or_op, not_op)
print("Is Boolean Algebra:", boolean_algebra.is_boolean_algebra())