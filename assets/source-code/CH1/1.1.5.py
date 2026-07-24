def calculate_min_cities_with_extra_snacks(num_snacks, num_cities):
    #若小吃的数量不多于城市的数量，则不可能有城市获得超过一种小吃。
    if num_snacks <= num_cities:
        return 0
    #计算至少会有多少个城市获得超过一种小吃。
    extra_snacks = num_snacks - num_cities
    min_cities_with_extra = min(extra_snacks, num_cities)
    return min_cities_with_extra
num_snacks = 20    #小吃总数
num_cities = 14    #城市总数
print(calculate_min_cities_with_extra_snacks(num_snacks, num_cities))