import heapq
class Node:
    def __init__(self, value, weight):
        self.value = value
        self.weight = weight
        self.left = None
        self.right = None
    def __lt__(self, other):
        return self.weight < other.weight
def build_huffman_tree(elements):
    priority_queue = [Node(value, weight) for value, weight in elements]
    heapq.heapify(priority_queue)
    while len(priority_queue) > 1:
        left = heapq.heappop(priority_queue)
        right = heapq.heappop(priority_queue)
        #合并两个节点为一个新节点，其权重为两个节点权重之和
        merged = Node(None, left.weight + right.weight)
        merged.left = left
        merged.right = right
        heapq.heappush(priority_queue, merged)
    return priority_queue[0]
def print_huffman_tree(node, prefix=''):
    if node is not None:
        if node.value is not None:
            print(f"Value: {node.value}, Weight: {node.weight}, Code: {prefix}")
        print_huffman_tree(node.left, prefix + '0')
        print_huffman_tree(node.right, prefix + '1')
elements = [(2, 2), (2, 2), (2, 2), (3, 3), (4, 4), (6, 6), (6, 6), (7, 7), (9, 9), (12, 12), (13, 13)]
root = build_huffman_tree(elements)        #构建哈夫曼树
print_huffman_tree(root)