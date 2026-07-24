def find_zero_divisors(modulus):
    zero_divisors = set()
    for a in range(1, modulus):
        for b in range(1, modulus):
            if (a * b) % modulus == 0:
                zero_divisors.add(a)
                zero_divisors.add(b)
    return zero_divisors
modulus = 10
zero_divisors = find_zero_divisors(modulus)
print(f"The zero divisors in Z{modulus} are: {sorted(zero_divisors)}")