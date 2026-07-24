class BooleanLogic:
    def __init__(self, value):
        if value not in (0, 1):
            raise ValueError("Value must be 0 or 1")
        self.value = value
    def __or__(self, other):
        return BooleanLogic(self.value or other.value)
    def __and__(self, other):
        return BooleanLogic(self.value and other.value)
    def __invert__(self):
        return BooleanLogic(1 - self.value)
    def __eq__(self, other):
        return self.value == other.value
    def __repr__(self):
        return str(self.value)
a = BooleanLogic(1)
b = BooleanLogic(0)
print(a | b)
print(a & b)
print(~a)
print(~b)