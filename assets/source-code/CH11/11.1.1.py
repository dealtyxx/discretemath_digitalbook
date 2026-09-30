class ModuloRing:
    def __init__(self, value, n):
        self.value = value % n
        self.n = n
    def __add__(self, other):
        if self.n != other.n:
            raise ValueError("Cannot add elements from different rings")
        return ModuloRing(self.value + other.value, self.n)
    def __mul__(self, other):
        if self.n != other.n:
            raise ValueError("Cannot multiply elements from different rings")
        return ModuloRing(self.value * other.value, self.n)
    def __eq__(self, other):
        return self.value == other.value and self.n == other.n
    def __repr__(self):
        return f"{self.value} (mod {self.n})"
#创建整数模5的同余类环
n = 5
elements = [ModuloRing(i, n) for i in range(n)]
#验证加法和乘法封闭性
add_closure = all((a + b).value in range(n) for a in elements for b in elements)
mul_closure = all((a * b).value in range(n) for a in elements for b in elements)
#验证加法和乘法结合性
add_associative = all((a + (b + c)) == ((a + b) + c) for a in elements for b in elements for c in elements)
mul_associative = all((a * (b * c)) == ((a * b) * c) for a in elements for b in elements for c in elements)
#验证分配律
distributive = all((a * (b + c)) == (a * b + a * c) for a in elements for b in elements for c in elements)
#验证存在加法单位元和乘法单位元
add_identity = any((a + e) == a and (e + a) == a for a in elements for e in elements if e.value == 0)
mul_identity = any((a * e) == a and (e * a) == a for a in elements for e in elements if e.value == 1)
#验证存在加法逆元
add_inverses = all(any((a + b).value == 0 for b in elements) for a in elements)
#验证存在乘法逆元
mul_inverses = all(any((a * b).value == 1 for b in elements if b.value != 0) for a in elements if a.value != 0)
print(
    f"Z{n} 的元素: {elements}\n"
    f"加法封闭性: {add_closure}\n"
    f"乘法封闭性: {mul_closure}\n"
    f"加法结合性: {add_associative}\n"
    f"乘法结合性: {mul_associative}\n"
    f"分配律: {distributive}\n"
    f"存在加法单位元: {add_identity}\n"
    f"存在乘法单位元: {mul_identity}\n"
    f"存在加法逆元: {add_inverses}\n"
    f"存在乘法逆元: {mul_inverses}")