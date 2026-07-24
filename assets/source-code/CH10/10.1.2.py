def check_properties():
    def check_identity():                          #(1)
        a = 5
        return (0 + a == a) and (a + 0 == a)
    def check_inverse(a):                          #(2)
        return a + (-a) == 0
    def check_cancellation(a, b, c):                  #(3)
        return (a + b == a + c) and (b + a == c + a)
    def check_exponentiation_distributive(a, m, n):      #(4)
        return a * (m + n) == a * m + a * n
    def check_exponentiation_associative(a, m, n):      #(5)
        return (a * m) * n == a * (m * n)
    def check_inverse_exponentiation(a, n):            #(6)
        return (-a) * n == -(a * n)
    results = {
        "identity": check_identity(),
        "inverse_of_5": check_inverse(5),
        "cancellation": check_cancellation(3, 1, 1),  # Example: 3 + b = 3 + c
        "exponentiation_distributive": check_exponentiation_distributive(2, 3, 4),
        "exponentiation_associative": check_exponentiation_associative(3, 2, 3),
        "inverse_exponentiation": check_inverse_exponentiation(4, 2)}
    return results
properties_results = check_properties()
for prop, result in properties_results.items():
    print(f"{prop}: {result}")