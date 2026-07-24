truth_values = [True, False]     #定义命题变元的可能取值
for P in truth_values:     #遍历命题变元的所有取值组合
    for Q in truth_values:
        for R in truth_values:
            P_and_Q = P and Q     #计算P∧Q
            P_and_Q_implies_R = not P_and_Q or R     #计算P∧Q→R
            print(f"P={P}, Q={Q}, R={R},"
                  f" P ∧ Q={P_and_Q}, P ∧ Q → R={P_and_Q_implies_R}")