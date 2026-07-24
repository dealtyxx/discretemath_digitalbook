import random
class CyclicGroup:
    def __init__(self, p):
        self.p = p                        #群的阶，即素数
        self.generator = self.find_generator()
        self.generated_keys = set()
    def find_generator(self):
        for g in range(2, self.p):
            if self.is_generator(g):
                return g
        raise ValueError("No generator found")
    def is_generator(self, g):
        elements = set()
        for i in range(self.p - 1):
            elements.add(pow(g, i, self.p))
        return len(elements) == self.p - 1
    def generate_key(self):
        while True:
            k = random.randint(1, self.p - 1)
            key = pow(self.generator, k, self.p)
            if key not in self.generated_keys:
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