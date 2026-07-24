def f(x):
    return 2 * x
def image_set(A, f):
    return {f(x) for x in A}
def preimage_set(B, f):
    A = {x for x in range(1, 6)}   #A={1, 2, 3, 4, 5}
    return {x for x in A if f(x) in B}
A = {1, 2, 3, 4, 5}
B = {2, 4, 6, 8, 10}
A1 = {1, 3, 5}
B1 = {4, 8}
image_of_A1 = image_set(A1, f)     #计算像集合和原像集合
preimage_of_B1 = preimage_set(B1, f)
print(f"集合 A1 的像集合: {image_of_A1}")
print(f"集合 B1 的原像集合: {preimage_of_B1}")