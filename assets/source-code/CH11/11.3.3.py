from collections import defaultdict
from itertools import combinations
class FormalContext:
    def __init__(self, objects, attributes, data):
        self.objects = objects
        self.attributes = attributes
        self.data = data
    def get_intent(self, objects):
        intent = set(self.attributes)
        for obj in objects:
            intent &= set(attr for attr, val in self.data[obj].items() if val)
        return intent
    def get_extent(self, attributes):
        extent = set(self.objects)
        for attr in attributes:
            extent &= set(obj for obj in self.objects if self.data[obj][attr])
        return extent
    def get_formal_concepts(self):
        formal_concepts = []
        for i in range(len(self.objects) + 1):
            for objs in combinations(self.objects, i):
                intent = self.get_intent(set(objs))    #闭包：X'=Y，再取Y'=X''作为外延
                extent = self.get_extent(intent)
                if (extent, intent) not in formal_concepts:
                    formal_concepts.append((extent, intent))
        return formal_concepts
    def generate_concept_lattice(self, formal_concepts):
        lattice = defaultdict(list)
        for extent, intent in formal_concepts:
            for sub_extent, sub_intent in formal_concepts:
                if extent != sub_extent and extent <= sub_extent:
                    lattice[(tuple(extent), tuple(intent))].append((tuple(sub_extent), tuple(sub_intent)))
        return lattice
objects = ['P1', 'P2', 'P3', 'P4']               #示例数据
attributes = ['高质量', '低价格', '漂亮外观']
data = {
    'P1': {'高质量': 1, '低价格': 0, '漂亮外观': 1},
    'P2': {'高质量': 1, '低价格': 1, '漂亮外观': 0},
    'P3': {'高质量': 0, '低价格': 1, '漂亮外观': 1},
    'P4': {'高质量': 0, '低价格': 0, '漂亮外观': 1}}
#构建形式背景和形式概念
context = FormalContext(objects, attributes, data)
formal_concepts = context.get_formal_concepts()
concept_lattice = context.generate_concept_lattice(formal_concepts)
print("Formal Concepts:")
for extent, intent in formal_concepts:
    print(f"Extent: {extent}, Intent: {intent}")
print("\nConcept Lattice:")
for parent, children in concept_lattice.items():
    print(f"Parent: {parent}, Children: {children}")