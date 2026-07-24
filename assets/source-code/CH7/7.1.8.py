out_degrees_3 = [2, 1, 1]     #A,B,C的出度
in_degree_A_3 = 1
total_out_degrees_3 = sum(out_degrees_3)
total_in_degrees_3 = total_out_degrees_3    #因为总入度等于总出度
in_degrees_B_C_3 = total_in_degrees_3 - in_degree_A_3
print(in_degrees_B_C_3)