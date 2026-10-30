def get_formula_depth(formula):
    """原子命题深度为0；按¬、∧、∨、→、↔的优先级解析，→右结合。"""
    if not isinstance(formula, str):
        raise ValueError("公式必须是字符串")
    tokens = ''.join(formula.split())
    index = 0

    def unary():
        nonlocal index
        if index >= len(tokens):
            raise ValueError("公式不完整")
        token = tokens[index]
        index += 1
        if token == '¬':
            return 1 + unary()
        if token == '(':
            depth = equivalence()
            if index >= len(tokens) or tokens[index] != ')':
                raise ValueError("括号不匹配")
            index += 1
            return depth
        if 'A' <= token <= 'Z':
            return 0
        raise ValueError("应输入命题变元、否定或左括号")

    def conjunction():
        nonlocal index
        depth = unary()
        while index < len(tokens) and tokens[index] == '∧':
            index += 1
            depth = 1 + max(depth, unary())
        return depth

    def disjunction():
        nonlocal index
        depth = conjunction()
        while index < len(tokens) and tokens[index] == '∨':
            index += 1
            depth = 1 + max(depth, conjunction())
        return depth

    def implication():
        nonlocal index
        depth = disjunction()
        if index < len(tokens) and tokens[index] == '→':
            index += 1
            depth = 1 + max(depth, implication())
        return depth

    def equivalence():
        nonlocal index
        depth = implication()
        while index < len(tokens) and tokens[index] == '↔':
            index += 1
            depth = 1 + max(depth, implication())
        return depth

    result = equivalence()
    if index != len(tokens):
        raise ValueError("存在多余字符或缺少联结词")
    return result

formula1 = "(¬P∧Q)→R"
formula2 = "(¬(P→¬Q))∧((R∨S)↔¬P)"
depth1 = get_formula_depth(formula1)
depth2 = get_formula_depth(formula2)
print(f'公式 "{formula1}" 的层数为: {depth1}')
print(f'公式 "{formula2}" 的层数为: {depth2}')
