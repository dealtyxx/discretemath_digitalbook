D = ["a", "b", "c"]          #有限个体域D={a,b,c}
def forall(body):            #∀x A(x) 展开为 A(a)∧A(b)∧A(c)
    return "(" + " ∧ ".join(body(x) for x in D) + ")"
def exists(body):            #∃x A(x) 展开为 A(a)∨A(b)∨A(c)
    return "(" + " ∨ ".join(body(x) for x in D) + ")"
print("∀xP(x) =", forall(lambda x: f"P({x})"))
print("∃x¬Q(x) =", exists(lambda x: f"¬Q({x})"))
print("∀x(P(x)→Q(x)) =", forall(lambda x: f"(P({x})→Q({x}))"))
print("∀x∃yR(x,y) =", forall(lambda x: exists(lambda y: f"R({x},{y})")))       #由外向内逐层消去
print("∃x∀yR(x,y) =", exists(lambda x: forall(lambda y: f"R({x},{y})")))
print("∀xP(x)∨∃yQ(y) =", forall(lambda x: f"P({x})"), "∨", exists(lambda y: f"Q({y})"))
