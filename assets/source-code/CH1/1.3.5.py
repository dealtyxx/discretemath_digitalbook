from math import gcd
from functools import reduce
def find_gcd(list):
    x = reduce(gcd, list)
    return x
def allocate_resources(resources, students_per_class):
    #计算所有班级学生数的最大公约数，作为分配的基本单位
    gcd_students = find_gcd(students_per_class)
    total_units = sum(students_per_class) // gcd_students
    resource_per_unit = resources // total_units
    #分配资源
    allocation = [students // gcd_students * resource_per_unit for students in students_per_class]
    return allocation
resources = 100    #总资源数量
students_per_class = [30, 20, 50]    #各班级学生数量
allocation = allocate_resources(resources, students_per_class)    #资源分配
print(f'Resource allocation: {allocation}')