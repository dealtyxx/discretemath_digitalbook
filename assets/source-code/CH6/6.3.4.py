def conj(preds, c):                        #把谓词列表写成合取式，多于一项时加括号
    text = "∧".join(f"{p}({c})" for p in preds)
    return f"({text})" if len(preds) > 1 else text
def prove(universal, existential, goal):
    lines = []
    def add(text, reason):                  #记录并输出推证的每一步
        lines.append(text)
        print(f"({len(lines)}) {text:<28}{reason}")
    for A, Bs in universal:
        add(f"∀x({A}(x)→{conj(Bs, 'x')})", "前提")
    for As in existential:
        add(f"∃x({'∧'.join(a + '(x)' for a in As)})", "前提")
    facts, consts = set(), []
    for As in existential:                  #ES：每个存在前提引入一个新的个体常元
        c = f"c{len(consts) + 1}"
        consts.append(c)
        add("∧".join(f"{a}({c})" for a in As), "存在量词消去ES")
        facts |= {(a, c) for a in As}
    changed = True
    while changed:
        changed = False
        for A, Bs in universal:
            for c in consts:                #US：全称前提实例化到已引入的常元
                if (A, c) in facts and not all((b, c) in facts for b in Bs):
                    add(f"{A}({c})→{conj(Bs, c)}", "全称量词消去US")
                    add("∧".join(f"{b}({c})" for b in Bs), "蕴含消去")
                    facts |= {(b, c) for b in Bs}
                    changed = True
    for c in consts:
        if all((g, c) in facts for g in goal):
            add("∧".join(f"{g}({c})" for g in goal), "合取引入")
            add(f"∃x({'∧'.join(g + '(x)' for g in goal)})", "存在量词产生EG")
            return True
    print("未能推出结论")
    return False
#例6.3.5 书法家论证：F书法家 A艺术家 B有良好审美 Y年轻人
prove([("F", ["A", "B"])], [["F", "Y"]], ["F", "Y", "A", "B"])
print()
#有理数都是实数，有些有理数是整数，所以有些实数是整数：Q有理数 R实数 I整数
prove([("Q", ["R"])], [["Q", "I"]], ["R", "I"])
