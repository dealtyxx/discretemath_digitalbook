A = {1, 2, 3, 4}
B = {2, 3, 4, 5}
C = {3, 4, 5, 6}
result = (B - (A & C)) | (A & B & C)   #计算(B−(A∩C))∪(A∩B∩C)
print(result)