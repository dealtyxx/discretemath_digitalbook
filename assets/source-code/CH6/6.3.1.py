rules = [("M", "D")]                     #前提∀x(M(x)→D(x))：所有人都会死
facts = {("M", "苏格拉底"), ("M", "孔子")}   #前提M(s)：苏格拉底是人
individuals = sorted({c for _, c in facts})
step = 1
changed = True
while changed:                           #反复应用规则，直到不再产生新事实
    changed = False
    for A, B in rules:
        for c in individuals:            #US：把全称公式实例化到个体常元c
            if (A, c) in facts and (B, c) not in facts:
                print(f"{step}. {A}({c})→{B}({c})  全称量词消去US")
                print(f"{step + 1}. {B}({c})  蕴含消去")
                facts.add((B, c))
                step += 2
                changed = True
print("D(苏格拉底)：", ("D", "苏格拉底") in facts)
