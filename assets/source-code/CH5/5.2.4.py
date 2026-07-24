truth_values = [True, False]     #定义命题变元的可能取值
for P in truth_values:      #遍历命题变元的所有取值组合
    for Q in truth_values:
        for R in truth_values:
            not_P = not P    #计算¬P的值
            result = P and Q and R and not_P     #计算P∧Q∧R∧¬P
            #打印结果
            print(f"P={P}, Q={Q}, R={R}, "
                  f"¬P={not_P}, P ∧ Q ∧ R ∧ ¬P={result}")