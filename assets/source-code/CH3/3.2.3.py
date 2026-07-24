R = {(1, 2), (2, 3), (3, 4)}    #关系R和S
S = {(2, 1), (3, 2), (4, 3)}
def composite_relation(R, S):    #计算复合关系RS
    RS = set()
    for (a, b) in R:
        for (c, d) in S:
            if b == c:
                RS.add((a, d))
    return RS
RS = composite_relation(R, S)     #计算复合关系RS
print("复合关系RS:", RS)