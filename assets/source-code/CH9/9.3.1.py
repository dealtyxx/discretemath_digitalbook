import numpy as np
scores = np.array([80, 90, 85, 92, 88])         #假设有5位学生的劳动知识测试得分
def standardize_scores(scores):               #计算标准化分数
    mean_score = np.mean(scores)
    std_deviation = np.std(scores)
    standardized_scores = (scores - mean_score) / std_deviation
    return standardized_scores
standardized_scores = standardize_scores(scores)
print("标准化分数：", standardized_scores)
#假设活动频率和社会服务参与度的权重分别为0.6和0.4
weights = np.array([0.6, 0.4])
activity_frequency = np.array([4, 5, 3, 4, 5])       #活动频率
service_participation = np.array([3, 4, 4, 5, 4])     #社会服务参与度
def weighted_average(weights, *args):           #计算加权平均分
    weighted_scores = np.dot(np.vstack(args).T, weights)
    return weighted_scores
weighted_avg_scores = weighted_average(weights, activity_frequency,
service_participation)
print("加权平均分：", weighted_avg_scores)
#综合评分考虑标准化的知识测试得分和加权平均分，权重假设为0.5和0.5
final_weights = np.array([0.5, 0.5])
#计算综合评分
final_scores = weighted_average(final_weights, standardized_scores, weighted_avg_scores)
print("综合评分：", final_scores)