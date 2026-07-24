def f(x):     #求函数（1）的逆函数
    return 2 * x
def f_inverse(y):
    return y / 2
x_values = [1, 2, 3, 4, 5]
print("f(x) = 2x 的逆函数 f_inverse(y) = y / 2:")
for x in x_values:
    y = f(x)
    x_inv = f_inverse(y)
    print(f"f({x}) = {y}, f_inverse({y}) = {x_inv}")
def f_discrete(x):     #求函数（2）的逆函数
    mapping = {1: 'a', 2: 'b', 3: 'c'}
    return mapping.get(x)
def f_discrete_inverse(y):
    inverse_mapping = {'a': 1, 'b': 2, 'c': 3}
    return inverse_mapping.get(y)
A = [1, 2, 3]
B = ['a', 'b', 'c']
print("\nf(1)=a, f(2)=b, f(3)=c 的逆函数:")
for a in A:
    b = f_discrete(a)
    a_inv = f_discrete_inverse(b)
    print(f"f({a}) = {b}, f_inverse({b}) = {a_inv}")