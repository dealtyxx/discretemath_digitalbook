import itertools
from itertools import product
numbers = [1, 2, 3, 4]
permutations = itertools.permutations(numbers, 3)
print("所有数字排列（选取3个）：")
for p in permutations:
    print(p)
athletes = [1, 2, 3, 4]    #代表四个运动员
rankings = itertools.permutations(athletes)
print("所有可能的获奖者排名组合：")
for r in rankings:
    print(r)
attendees = range(1, 6)    #5位与会者
seating_arrangements = itertools.permutations(attendees)
print("所有可能的座位安排：")
for arrangement in seating_arrangements:
    print(arrangement)
combinations = product(range(10), repeat=4)
print("所有可能的四位数字组合：")
for c in combinations:
    print(''.join(map(str, c)))