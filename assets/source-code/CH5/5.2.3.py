truth_values = [True, False]      #定义命题变元的可能取值
for P in truth_values:        #遍历命题变元的所有取值组合
    for Q in truth_values:
        Q_implies_P = not Q or P    #计算Q→P
        P_implies_Q_implies_P = not P or Q_implies_P    #计算P→(Q→P)
        print(f"P={P}, Q={Q}, "    #打印结果
              f"Q → P={Q_implies_P}, P → (Q → P)={P_implies_Q_implies_P}")