def calculate_order(n, element):
    sum = 0
    for i in range(1, n + 1):
        sum = (sum + element) % n
        if sum == 0:
            return i
    return None
group_order_6 = 6    #整数模6加法群
element_order_2 = calculate_order(group_order_6, 2)
group_order_7 = 7    #整数模7加法群
element_order_3 = calculate_order(group_order_7, 3)
print(group_order_6, element_order_2, group_order_7, element_order_3)