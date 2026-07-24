non_leaf_nodes_1 = 10
leaf_nodes_1 = non_leaf_nodes_1 + 1
total_nodes_1 = 2 * leaf_nodes_1 - 1
leaf_nodes_2 = 5
total_nodes_2 = 2 * leaf_nodes_2 - 1
leaf_nodes_3 = 2 ** 2
total_nodes_3 = 2 * leaf_nodes_3 - 1
answers = {
    "1": {"Leaf Nodes": leaf_nodes_1, "Total Nodes": total_nodes_1},
    "2": {"Total Nodes": total_nodes_2},
    "3": {"Leaf Nodes": leaf_nodes_3, "Total Nodes": total_nodes_3}
}
print(answers)