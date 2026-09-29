#文字用(谓词, 个体, 真值)表示，("I","子路",False)即¬I(子路)
rules = [
    (("S", True), ("R", True)),      #∀x(S(x)→R(x))：孔子的学生都尊礼
    (("R", True), ("I", False)),     #∀x(R(x)→¬I(x))：尊礼者不侮君
]
facts = {("S", "子路", True), ("I", "子路", True)}    #子路是学生S(z)，且侮君I(z)
derived = True
while derived:
    derived = False
    for (A, a), (B, b) in rules:
        for (p, c, v) in list(facts):
            if (p, v) == (A, a) and (B, c, b) not in facts:     #US后用蕴含消去
                facts.add((B, c, b))
                print(f"由 {'' if a else '¬'}{A}({c}) 推出 {'' if b else '¬'}{B}({c})")
                derived = True
conflicts = [(p, c) for (p, c, v) in facts if v and (p, c, False) in facts]
for p, c in conflicts:                   #同时出现P(c)与¬P(c)
    print(f"矛盾：{p}({c})∧¬{p}({c})，前提不能同时成立")
