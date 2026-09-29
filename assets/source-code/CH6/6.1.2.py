D = [1, 2, 3, 4, 5]        #有限个体域D={a1,a2,...,an}
def P(x):                  #P(x)：x是正数
    return x > 0
def Q(x):                  #Q(x)：x是偶数
    return x % 2 == 0
forall_P = True            #∀xP(x)=P(a1)∧P(a2)∧...∧P(an)
for x in D:
    forall_P = forall_P and P(x)
exists_Q = False           #∃xQ(x)=Q(a1)∨Q(a2)∨...∨Q(an)
for x in D:
    exists_Q = exists_Q or Q(x)
print(" ∧ ".join(f"P({x})" for x in D), "=", forall_P)
print(" ∨ ".join(f"Q({x})" for x in D), "=", exists_Q)
print(all(P(x) for x in D), any(Q(x) for x in D))    #内置函数all与any分别对应∀与∃
print(all(Q(x) for x in D))                          #∀xQ(x)为假
print([x for x in D if not Q(x)])                    #使Q(x)为假的个体，即反例
print(all(P(x) for x in []), any(Q(x) for x in []))  #个体域为空时的约定，故要求个体域非空
