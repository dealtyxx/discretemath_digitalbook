def check_commutative_Z2(a1, b1, a2, b2):
    return (a1 + a2, b1 + b2) == (a2 + a1, b2 + b1)
a1, b1, a2, b2 = 1, 2, 3, 4    #验证二元组加法群是否是交换群
is_commutative = check_commutative_Z2(a1, b1, a2, b2)
print(f"二元组加法群: (a1, b1) + (a2, b2) = (a2, b2) + (a1, b1) -> ({a1}, {b1}) + ({a2}, {b2}) = ({a2}, {b2}) + ({a1}, {b1}) -> {is_commutative}")