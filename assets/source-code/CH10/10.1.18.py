def check_commutative(group, operation):
    for a in group:
        for b in group:
            if operation(a, b) != operation(b, a):
                return False
    return True
def generate_cyclic_group(g, n):
    return [g * i % n for i in range(n)]
n = 8                        #验证一个阶为8的循环群是否是交换群
G = generate_cyclic_group(1, n)
operation = lambda x, y: (x + y) % n
is_commutative = check_commutative(G, operation)
print(f"模 {n} 整数加法群是否是交换群: {is_commutative}")