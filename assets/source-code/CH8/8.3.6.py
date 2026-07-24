class TreeNode:
    def __init__(self, name, data=None):
        self.name = name
        self.data = data
        self.children = []
    def add_child(self, child):
        self.children.append(child)
def dfs(node, depth=0):
    print("  " * depth + f"访问 {node.name}: 数据 {node.data}")
    for child in node.children:
        dfs(child, depth + 1)
def bfs(root):
    queue = [(root, 0)]
    while queue:
        node, depth = queue.pop(0)
        print("  " * depth + f"访问 {node.name}: 数据 {node.data}")
        for child in node.children:
            queue.append((child, depth + 1))
root = TreeNode("智能农业监测系统")
main_area = TreeNode("主要农业区")
sub_area1 = TreeNode("子区域1")
sub_area2 = TreeNode("子区域2")
subsub_area1 = TreeNode("子子区域1")
sensor1 = TreeNode("传感器1", {"温度": "22°C"})
sensor2 = TreeNode("传感器2", {"湿度": "45%"})
sensor3 = TreeNode("传感器3", {"光照": "300lux"})
sensor4 = TreeNode("传感器4", {"土壤湿度": "25%"})
sensor5 = TreeNode("传感器5", {"PH值": "6.5"})
root.add_child(main_area)
main_area.add_child(sub_area1)
main_area.add_child(sub_area2)
sub_area1.add_child(subsub_area1)
sub_area1.add_child(sensor1)
sub_area2.add_child(sensor2)
subsub_area1.add_child(sensor3)
subsub_area1.add_child(sensor4)
sub_area2.add_child(sensor5)
print("执行深度优先遍历 (DFS):")        #执行深度优先遍历
dfs(root)
print("\n执行广度优先遍历 (BFS):")      #执行广度优先遍历
bfs(root)