digits = [1, 2, 3, 4, 5, 6, 7]    #原始数字序列和加权因数
weights = [2, 1, 2, 1, 2, 1, 2]
#应用加权因数并计算总和
weighted_sum = sum(d * w for d, w in zip(digits, weights))
check_digit = weighted_sum % 10    #计算模10的余数作为校验码
digits.append(check_digit)    #将校验码附加到原始序列
print("原始序列加上校验码：", digits)