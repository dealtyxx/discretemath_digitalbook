def max_nodes_in_binary_tree(depth):
    return 2 ** (depth + 1) - 1
depths = [3, 4, 5, 6]          #不同的树深度
results = [max_nodes_in_binary_tree(depth) for depth in depths]
print(results)