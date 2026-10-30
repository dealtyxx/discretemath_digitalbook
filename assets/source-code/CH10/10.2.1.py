import secrets
from sympy import isprime
class CyclicGroup:
    def __init__(self, p):
        if type(p) is not int or not isprime(p):
            raise ValueError("模数p必须是素数；非零剩余类乘法群的阶为p-1")
        self.p = p                        #模数为素数；群的阶为p-1
        self.generator = self.find_generator()
        self.generated_keys = set()
    def find_generator(self):
        for g in range(1, self.p):        #p=2时，1生成平凡群
            if self.is_generator(g):
                return g
        raise ValueError("No generator found")
    def is_generator(self, g):
        elements = set()
        for i in range(self.p - 1):
            elements.add(pow(g, i, self.p))
        return len(elements) == self.p - 1
    def generate_key(self):
        available = [k for k in range(1, self.p)
                     if pow(self.generator, k, self.p) not in self.generated_keys]
        if not available:
            raise ValueError("本教学群的全部p-1个密钥已用尽")
        k = secrets.choice(available)     #在尚未使用的指数中选择
        key = pow(self.generator, k, self.p)
        self.generated_keys.add(key)
        return key
#实际应用示例
if __name__ == "__main__":
    p = 23                                         #选择一个适当的素数
    cyclic_group = CyclicGroup(p)
    keys = [cyclic_group.generate_key() for _ in range(10)]
    print("Generated keys:", keys)
    assert len(keys) == len(set(keys)), "Keys are not unique!"    #验证密钥唯一性
    print("All generated keys are unique.")
