class ModuloRing:
    def __init__(self, n):
        self.n = n
    def add(self, a, b):
        return (a + b) % self.n
    def multiply(self, a, b):
        return (a * b) % self.n
ring = ModuloRing(5)    #示例：Z/5Z
a, b = 2, 3    #测试加法
add_result = ring.add(a, b)
print(f"({a} + {b}) mod 5 = {add_result}")
multiply_result = ring.multiply(a, b)    #测试乘法
print(f"({a} * {b}) mod 5 = {multiply_result}")