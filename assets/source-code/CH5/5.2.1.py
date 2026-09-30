import re
def get_formula_depth(formula):
    formula = formula.replace(' ', '')       #去掉公式中的空格
    operators = ['↔', '→', '∨', '∧', '¬']    #逻辑联结词的优先级
    def parse(formula):
        if len(formula) == 0:
            return 0
        while formula[0] == '(' and formula[-1] == ')':    #处理括号中的内容
            inner_formula = formula[1:-1]
            if valid_parentheses(inner_formula):
                formula = inner_formula
            else:
                break
        if re.match(r'^[A-Z]$', formula):     #若是单个命题变元，返回0层
            return 0
        max_depth = 0
        for op in operators:
            parts = split_formula(formula, op)
            if parts:
                depth = 1 + max(parse(part) for part in parts)
                max_depth = max(max_depth, depth)
        return max_depth
    def valid_parentheses(formula):
        stack = []
        for char in formula:
            if char == '(':
                stack.append(char)
            elif char == ')':
                if stack:
                    stack.pop()
                else:
                    return False
        return len(stack) == 0
    def split_formula(formula, op):
        if op == '¬':
            if formula[0] == '¬':
                return [formula[1:]]
            return None
        parentheses = 0
        parts = []
        current = []
        for char in formula:
            if char == '(':
                parentheses += 1
            elif char == ')':
                parentheses -= 1
            elif char == op and parentheses == 0:
                parts.append(''.join(current))
                current = []
                continue
            current.append(char)
        if current:
            parts.append(''.join(current))
        return parts if len(parts) > 1 else None
    return parse(formula)
formula1 = "(¬P∧Q)→R"
formula2 = "(¬(P→¬Q))∧((R∨S)↔¬P)"
depth1 = get_formula_depth(formula1)
depth2 = get_formula_depth(formula2)
print(f'公式 "{formula1}" 的层数为: {depth1}')
print(f'公式 "{formula2}" 的层数为: {depth2}')