import math
total_people = 200
winners = 30
lottery_combinations = math.comb(total_people, winners)
print("抽奖活动的不同获奖组合数：", lottery_combinations)
committee_members = 15
selected_members = 5
committee_combinations = math.comb(committee_members, selected_members)
print("选择委员会成员的不同组合数：", committee_combinations)