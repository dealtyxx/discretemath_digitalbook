F = ['f0', 'f1', 'f2', 'f3']       #定义集合F和Z4
Z4 = [0, 1, 2, 3]
def operation_o(fi, fj):         #定义F上的运算*(表9.9)
    index_i = F.index(fi)
    index_j = F.index(fj)
    result_index = (index_i + index_j) % 4
    return F[result_index]
def operation_add4(zi, zj):      #定义Z4上的运算+4(表9.10)
    return (zi + zj) % 4
def mapping_f_to_z4(f):        #定义从F到Z4的映射
    return F.index(f)
def verify_homomorphism():    #验证同态映射性质
    for fi in F:
        for fj in F:
            lhs = mapping_f_to_z4(operation_o(fi, fj))
            rhs = operation_add4(mapping_f_to_z4(fi), mapping_f_to_z4(fj))
            if lhs != rhs:
                return False, fi, fj, lhs, rhs
    return True, None, None, None, None
is_homomorphism, fi, fj, lhs, rhs = verify_homomorphism()
if is_homomorphism:
    print("<F, *> 和 <Z4, +4> 是同态映射。")
else:
    print(f"<F, *> 和 <Z4, +4> 不是同态映射。对于 {fi} * {fj}，lhs: {lhs}, rhs: {rhs}。")
print("\n表 9.9 (F上的运算 *):")
print("\t" + "\t".join(F))
for fi in F:
    row = [operation_o(fi, fj) for fj in F]
    print(f"{fi}\t" + "\t".join(row))
print("\n表 9.10 (Z4上的运算 +4):")
print("\t" + "\t".join(str(z) for z in Z4))
for zi in Z4:
    row = [operation_add4(zi, zj) for zj in Z4]
    print(f"{zi}\t" + "\t".join(str(z) for z in row))