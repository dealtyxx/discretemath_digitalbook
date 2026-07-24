class SharedResourceSystem:
    def __init__(self):                         #存储资源名称及其可用数量
        self.resources = {}
    def add_resource(self, name, quantity):
        #添加或更新资源
        self.resources[name] = self.resources.get(name, 0) + quantity
    def distribute_resources(self, *allocations):    #分配资源给不同的用户或活动
        for name, quantity in allocations:
            if name in self.resources and self.resources[name] >= quantity:
                self.resources[name] -= quantity
                print(f"资源 {name} 分配了 {quantity} 单位。")
            else:
                print(f"资源 {name} 不足，无法分配 {quantity} 单位。")
    def show_resources(self):                  #显示当前资源状态
        print("当前资源状态：")
        for name, quantity in self.resources.items():
            print(f"{name}: {quantity} 单位")
system = SharedResourceSystem()
system.add_resource('共享汽车', 10)
system.add_resource('共享自行车', 20)
system.add_resource('共享工作空间', 5)
#分配资源
system.distribute_resources(('共享汽车', 2), ('共享自行车', 5), ('共享工作空间', 1))
system.show_resources()